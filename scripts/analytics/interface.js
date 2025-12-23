(function init() {
    if (window.nq_analytics) return;
    
    window.nq_analytics = new Proxy(
        {
            // private
            entry_log_sent: false,
            final_log_sent: false,
            mode_usage_data: {},
            session_key: `${Date.now()}-${Math.random()}`,
            worker_endpoint: 'insert url',
            buildLogJson: function(log_type) { // helper
                const payload = {
                    mode_usage_data: this.mode_usage_data,
                    log_type: log_type,
                    session_key: this.session_key
                };
                return new Blob([JSON.stringify(payload)], { type: 'application/json' });
            },
            sendEntryLog: function() {
                if (!this.entry_log_sent) {
                    this.entry_log_sent = true;
                    navigator.sendBeacon(this.worker_endpoint, this.buildLogJson('entry'));
                    window.addEventListener('beforeunload', this.sendFinalLog.bind(this));
                }
            },
            sendFinalLog: function() {
                if (!this.final_log_sent) {
                    this.final_log_sent = true;
                    navigator.sendBeacon(this.worker_endpoint, this.buildLogJson('final'));
                }
            },

            // public
            countGeneration: function(mode_name) {
                if (typeof(this.mode_usage_data[mode_name]) !== 'number') {
                    this.mode_usage_data[mode_name] = 0;
                }

                this.mode_usage_data[mode_name]++;

                if (!this.entry_log_sent) this.sendEntryLog();
            },
            getLogStatus: function() {
                return JSON.parse(JSON.stringify({
                    entry_log_sent: this.entry_log_sent,
                    final_log_sent: this.final_log_sent,
                    mode_usage_data: this.mode_usage_data,
                }));
            }
        },
        {
            get: function(analytics_obj, key) {
                const public = ['countGeneration', 'getLogStatus'];

                if (public.includes(key) && Object.prototype.hasOwnProperty.call(analytics_obj, key)) {
                    if (typeof(analytics_obj[key]) === 'function') {
                        return function(...args) {
                            try { // ensure analytics interface never throws
                                return analytics_obj[key].call(analytics_obj, ...args);
                            } catch (error) {
                                console.error(`Failed to call '${key}' on nq_analytics: ${error}`);
                            }
                        };
                    }
                    else return analytics_obj[key];
                }
            },
            set: function(_, key, new_value) {
                console.error(`Cannot set property '${key}' to '${new_value}' on nq_analytics: nq_analytics is read-only.`);
                return false;
            }
        }
    );
})();