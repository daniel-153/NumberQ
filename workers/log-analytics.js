const handlers = {
    fetch: {
        validateRequest: function(request) {
            if (
                request.method !== 'POST' || 
                !request.headers.get('Content-Type').toLowerCase().startsWith('application/json')
            ) throw new Error('Request must be POST with application/json Content-Type');
        },
        validateJson: function(json_body) {
            if (
                !Object.prototype.hasOwnProperty.call(json_body, 'mode_usage_data')
            ) throw new Error('Request missing mode usage data') 
        },
        getHashedIp: async function(request) {
            const ip = (request.headers.get('CF-Connecting-IP') || '').trim();
            if (!ip) throw new Error('CF-Connecting-IP header not found in request');
            const bytes = new TextEncoder().encode(ip);
            const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        },
        validateModeData: function(mode_usage_obj) {
            let entry_count = 0;
            for (const [key, value] of Object.entries(mode_usage_obj)) {
                if (typeof(key) !== 'string' || !Number.isSafeInteger(value) || value < 0) {
                    throw new Error(`Invalid mode usage entry: {'${key}': ${value}}`);
                }

                entry_count++;
            }

            if (entry_count === 0) throw new Error('Mode usage data is empty');
        },
        getCombinedModeData: function(prev_usage_obj, curr_usage_obj) {
            const unique_keys = Array.from(new Set(
                [...Object.keys(curr_usage_obj), ...Object.keys(prev_usage_obj)]
            ));

            const sum_usage_obj = {};
            unique_keys.forEach(key => {
                const prev_count = (Number.isSafeInteger(prev_usage_obj[key]) && prev_usage_obj[key] > 0)? prev_usage_obj[key] : 0;
                const curr_count = (Number.isSafeInteger(curr_usage_obj[key]) && curr_usage_obj[key] > 0)? curr_usage_obj[key] : 0;

                sum_usage_obj[key] = prev_count + curr_count;
            });

            return sum_usage_obj;
        },
        writeUsageEntry: async function(d1_db, user_hash, mode_usage_obj) {
            const existing_entry = await d1_db
                .prepare('SELECT mode_usage FROM daily_logs WHERE user_hash = ?')
                .bind(user_hash)
                .first();

            // merge the stored counts with the new counts if user hash already exists
            if (existing_entry && typeof existing_entry.mode_usage === 'string') {
                const prev_usage_obj = JSON.parse(existing_entry.mode_usage);
                const combined_usage = this.getCombinedModeData(prev_usage_obj, mode_usage_obj);

                await d1_db
                    .prepare('UPDATE daily_logs SET mode_usage = ? WHERE user_hash = ?')
                    .bind(JSON.stringify(combined_usage), user_hash)
                    .run();
            } 
            else { // insert a new record if user_hash is new
                await d1_db
                    .prepare('INSERT INTO daily_logs (user_hash, mode_usage) VALUES (?, ?)')
                    .bind(user_hash, JSON.stringify(mode_usage_obj))
                    .run();
            }
        }
    },
    cron: {
        sumModeEntries: function(mode_json_strs) {
            const mode_objs = mode_json_strs
                .map(json_str => {
                    try { return JSON.parse(json_str); } catch { return null; }
                })
                .filter(Boolean);

            const total_usage = {};
            mode_objs.forEach(mode_usage_obj => {
                for (const [key, value] of Object.entries(mode_usage_obj)) {
                    if (Object.prototype.hasOwnProperty.call(total_usage, key)) {
                        total_usage[key] += value;
                    }
                    else total_usage[key] = value;
                }
            });

            return total_usage;
        },
        rollupDaily: async function(d1_db) {
            const all_entries = await d1_db.prepare('SELECT mode_usage FROM daily_logs').all();
            const mode_json_strs = (all_entries.results || []).map(row => row.mode_usage);
            
            const mode_totals = this.sumModeEntries(mode_json_strs)
            const unique_ips = (await d1_db
                .prepare('SELECT COUNT(DISTINCT user_hash) as count FROM daily_logs')
                .first())?.count || 0; 
            const today = new Date().toISOString().split('T')[0];

            await d1_db
                .prepare(`
                    INSERT INTO yearly_logs (date, unique_ips, mode_totals)
                    VALUES (?, ?, ?)
                    ON CONFLICT(date) DO UPDATE SET
                        unique_ips = excluded.unique_ips,
                        mode_totals = excluded.mode_totals
                `)
                .bind(today, unique_ips, JSON.stringify(mode_totals))
                .run();
            
            // maintain a max of 365 daily summaries (dropping oldest if needed)             
            if (
                ((await d1_db
                .prepare('SELECT COUNT(*) as count FROM yearly_logs')
                .first())?.count || 0) > 365
            ) {
                await d1_db
                    .prepare('DELETE FROM yearly_logs WHERE date = (SELECT MIN(date) FROM yearly_logs)')
                    .run();
            }
            
            await d1_db.prepare('DELETE FROM daily_logs').run();
            
            return mode_totals;
        },
        updateAlltime: async function(d1_db, mode_usage_obj) {
            for (const [mode, value] of Object.entries(mode_usage_obj)) {
                await d1_db
                    .prepare(`
                        INSERT INTO alltime_totals (mode, total)
                        VALUES (?, ?)
                        ON CONFLICT(mode) DO UPDATE SET
                            total = total + excluded.total
                    `)
                    .bind(mode, value)
                    .run();
            }
        }
    }
};

export default {
	// endpoint hits (front-end analytics logs)
    fetch: async function(request, env) {
		try {
            handlers.fetch.validateRequest(request);
            const json_body = await request.json();
            handlers.fetch.validateJson(json_body);

            const user_hash = await handlers.fetch.getHashedIp(request);
            const mode_usage_obj = json_body.mode_usage_data;

            handlers.fetch.validateModeData(mode_usage_obj);
            await handlers.fetch.writeUsageEntry(env.nq_analytics_d1, user_hash, mode_usage_obj);

            return new Response(null, { status: 204 });
		} catch (error) {
            return new Response(error?.message ?? 'Error Processing Request', { status: 400 });
		}
	},

    // cron triggers (intreval db rollups)
	scheduled: async function(event, env) {
		try {
            if (event.cron === '0 9 * * *') { // daily at 9:00 UTC
                const daily_usage = await handlers.cron.rollupDaily(env.nq_analytics_d1);
                await handlers.cron.updateAlltime(env.nq_analytics_d1, daily_usage);
            }
            else throw new Error(`No handler for cron: '${event.cron}'`)
		} catch (error) {
			console.error(`Error in scheduled task handler: ${error?.message}`)
		}
	}
};