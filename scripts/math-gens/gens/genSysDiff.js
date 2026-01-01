import * as H from '../helpers/gen-helpers.js';
import * as PH from '../helpers/polynom-helpers.js';

export function validateSettings(form_obj, error_locations) {
    if (form_obj.diff_notation === 'frac') form_obj.func_notation = 'implicit';
}

// const search2x2s = (await import(`${window.location.origin}/scripts/math-gens/gens/genSysDiff.js`)).SDH.search2x2Eigenvals;

export const SDH = { // genSysDiff helpers
    getRandomMtrx: function(entry_size) {
        const r = () => H.randInt(-entry_size, entry_size);

        return [[r(), r()], [r(), r()]];
    },
    // buildMtrxSupplier: function*(entry_size, dimension) {
    //     const possible_entries = H.integerArray(-entry_size, entry_size);
    //     const odometer = (new Array(dimension**2)).fill(0);

    //     while (true) {
    //         yield odometer.map(idx => possible_entries[idx]);

    //         let increment_idx = odometer.length - 1;
    //         let has_rollover = true;
    //         while (has_rollover && increment_idx >= 0) {
    //             const updated_idx = odometer[increment_idx] + 1;
    //             odometer[increment_idx] = updated_idx % possible_entries.length;

    //             has_rollover = (updated_idx >= possible_entries.length);
    //             increment_idx--;
    //         }

    //         if (has_rollover) break; // if the first odometer slot rolls over, generation is complete
    //     }
    // },
    classifyByEigen: function(mtrx_2x2) { // note: only counts integer (lamda=a \pm b) and integer-complex (lamda=a \pm bi) eigenvalues
        const [ix, jx] = mtrx_2x2[0];
        const [iy, jy] = mtrx_2x2[1];

        // QF constants
        const b = (-ix - jy);
        const c = (ix*jy - iy*jx);
        const disc = b**2 - 4 * c;

        if (disc === 0) {
            if (-b % 2 === 0) return 'real_rep';
            else return 'none';
        }
        else if (Number.isSafeInteger(Math.sqrt(Math.abs(disc)))) {
            const sqrt_abs_disc = Math.sqrt(Math.abs(disc));
            
            if (disc > 0 && (-b + sqrt_abs_disc) % 2 === 0) return 'real_dis';
            else if (disc < 0 && -b % 2 === 0 && sqrt_abs_disc % 2 === 0) return 'complex';
            else return 'none';
        }
        else return 'none';
    },
    isDegenerate: function(mtrx_2x2) {
        const [ix, jx] = mtrx_2x2[0];
        const [iy, jy] = mtrx_2x2[1];

        if (ix*iy*jx*jy !== 0) return false;
        else if (ix === 0 && jx === 0) return true;
        else if (iy === 0 && jy === 0) return true;
        else if (iy === 0 || jx === 0) return true;
        else return false;     
    },
    getEigens: function(mtrx_2x2) {
        const [ix, jx] = mtrx_2x2[0];
        const [iy, jy] = mtrx_2x2[1];
        const eigen_type = SDH.classifyByEigen(mtrx_2x2);
        const eigens = {values: null, vectors: null};

        const b = -ix - jy;
        const c = ix*jy - iy*jx;
        const D = b**2 - 4*c;

        // note that only !isDegenerate() cases are handled
        if (eigen_type === 'real_dis') {
            const sqrt_D = Math.sqrt(D);
            eigens.values = [(-b + sqrt_D) / 2, (-b - sqrt_D) / 2];
            eigens.vectors = [[-jx, ix - eigens.values[0]], [-jx, ix - eigens.values[1]]];
        }
        else if (eigen_type === 'real_rep') {
            eigens.values = [-b/2];
            eigens.vectors = [[-jx * jx, (ix - eigens.values[0]) * jx], [jx, eigens.values[0] - ix - jx]]; // v and w          
        }
        else if (eigen_type === 'complex') {
            const sqrt_abs_D = Math.sqrt(Math.abs(D));
            eigens.values = [[-b/2, sqrt_abs_D/2], [-b/2, -sqrt_abs_D/2]];
            eigens.vectors = [
                [[-jx, 0], [ix - eigens.values[0][0], -eigens.values[0][1]]], 
                [[-jx, 0], [ix - eigens.values[1][0], -eigens.values[1][1]]]
            ];
        }

        return eigens;
    },
    getInitCondMtrx: function(eigen_type, eigens) { // get the coef matrix that represents the system to be solved to find C1 and C2 with x(0), y(0) initial conditions
        let coef_mtrx;
        if (eigen_type === 'real_dis' || eigen_type === 'real_rep') {
            coef_mtrx = [
                [eigens.vectors[0][0], eigens.vectors[1][0]], 
                [eigens.vectors[0][1], eigens.vectors[1][1]]
            ];
        }
        else if (eigen_type === 'complex') {
            const p1 = eigens.vectors[0][0][0];
            const p2 = eigens.vectors[0][1][0];
            const q1 = eigens.vectors[0][0][1];
            const q2 = eigens.vectors[0][1][1];

            coef_mtrx = [
                [p1, q1],
                [p2, q2]
            ];
        }

        return coef_mtrx;
    },
    smallestIntScale: function(vect_2d) {
        if (vect_2d[0] < 0 && vect_2d[1] < 0) vect_2d = vect_2d.map(Math.abs);

        if (vect_2d[0] === 0 && vect_2d[1] === 0) return [0, 0];
        else if (vect_2d[0] === 0) return [0, 1];
        else if (vect_2d[1] === 0) return [1, 0];
        else {
            const reduced = PH.simplifyFraction(...vect_2d);

            return [reduced.numer, reduced.denom];
        }
    },
    coef: (int) => Math.abs(int) === 1? String(int).replace('1', '') : String(int)
};
export default function genSysDiff(settings) {
    const mtrx_entry_size = 5;

    // search loop to find a matrix with the desired eigenvalues
    const max_attempts = 10_000;
    let current_attempts = 0;
    let mtrx_found = false;
    let detected_eigen_type;
    let coef_mtrx;
    while (!mtrx_found && current_attempts++ < max_attempts) {
        coef_mtrx = SDH.getRandomMtrx(mtrx_entry_size);

        if (
            (settings.sys_diff_degenerate === 'no'? !SDH.isDegenerate(coef_mtrx) : true) &&
            (detected_eigen_type = SDH.classifyByEigen(coef_mtrx)) === settings.sys_diff_eigenvals
        ) mtrx_found = true;
    }

    const eigens = SDH.getEigens(coef_mtrx, settings.sys_diff_eigenvals);

    // build question string
    let var1, var2;
    if (settings.sys_diff_vars === 'x_y') [var1, var2] = ['x', 'y'];
    else if (settings.sys_diff_vars === 'x1_x2') [var1, var2] = ['x_{1}', 'x_{2}'];
    else if (settings.sys_diff_vars === 'y1_y2') [var1, var2] = ['y_{1}', 'y_{2}'];

    let d_var1, d_var2;
    if (settings.diff_notation === 'frac') [d_var1, d_var2] = [var1, var2].map(v => `\\frac{d${v}}{dt}`);
    else if (settings.diff_notation === 'prime') [d_var1, d_var2] = [var1, var2].map(v => `${v}'`);
    else if (settings.diff_notation === 'dot')[d_var1, d_var2] = [var1, var2].map(v => `\\dot{${v.charAt(0)}}${v.slice(1)}`);

    if (settings.func_notation === 'explicit') [var1, var2, d_var1, d_var2] = [var1, var2, d_var1, d_var2].map(v => `${v}(t)`);

    const [d_var1_rhs, d_var2_rhs] = coef_mtrx.map(row => {
        const [var1_coef, var2_coef] = row.map(var_coef => {
            if (var_coef === 1) return '';
            else if (var_coef === -1) return '-';
            else return String(var_coef + 0);
        });

        if (var1_coef === '0' && var2_coef === '0') return '0';
        else if (var1_coef === '0') return var2_coef + var2;
        else if (var2_coef === '0') return var1_coef + var1;
        else return `${var1_coef + var1}${(var2_coef.charAt(0) === '-')? '' : '+'}${var2_coef + var2}`;
    })

    let question_str;
    let constants = ['C_{1}', 'C_{2}'];
    if (settings.sys_diff_initcond === 'yes') {
        const init_cond_mtrx = SDH.getInitCondMtrx(settings.sys_diff_eigenvals, eigens);
        constants = (new Array(2)).fill(null).map(_ => H.randInt(-mtrx_entry_size, mtrx_entry_size));

        const var1_0 = init_cond_mtrx[0][0]*constants[0] + init_cond_mtrx[0][1]*constants[1];
        const var2_0 = init_cond_mtrx[1][0]*constants[0] + init_cond_mtrx[1][1]*constants[1];

        question_str = `
            \\begin{aligned}
                ${d_var1}&=${d_var1_rhs} \\; & ${var1.replace('(t)', '')}(0)&=${var1_0} \\\\
                ${d_var2}&=${d_var2_rhs} \\; & ${var2.replace('(t)', '')}(0)&=${var2_0}
            \\end{aligned}
        `;
    }
    else if (settings.sys_diff_initcond === 'no') {
        question_str = `
            \\begin{aligned}
                ${d_var1}&=${d_var1_rhs} \\\\
                ${d_var2}&=${d_var2_rhs}
            \\end{aligned}
        `;
    }

    if (settings.left_brace === 'yes') question_str = `\\left\\{${question_str}\\right.`;

    // build answer string
    let var1_rhs, var2_rhs;
    if (detected_eigen_type === 'real_dis') {
        eigens.vectors = eigens.vectors.map(SDH.smallestIntScale);
        
        [var1_rhs, var2_rhs] = (new Array(2)).fill(null).map((_, idx0) => {
            const [et_expr1, et_expr2] = (new Array(2)).fill(null).map((_, idx1) => {
                let exponent = eigens.values[idx1];
                let coef;
                if (typeof(constants[idx1]) === 'number') {
                    coef = constants[idx1] * eigens.vectors[idx1][idx0];
                }
                else if (Math.abs(eigens.vectors[idx1][idx0]) === 1) {
                    coef = `${String(eigens.vectors[idx1][idx0]).replace('1', '')}${constants[idx1]}`;
                }
                else if (eigens.vectors[idx1][idx0] === 0) {
                    coef = 0;
                }
                else coef = `${eigens.vectors[idx1][idx0]}${constants[idx1]}`;
                
                if (coef === 0) return '0';
                else if (exponent === 0) return String(coef);
                else {
                    if (Math.abs(exponent) === 1) exponent = String(exponent).replace('1', '');
                    if (Math.abs(coef) === 1) coef = String(coef).replace('1', '');

                    return `${coef}e^{${exponent}t}`
                } 
            });

            if (et_expr1 === '0' && et_expr2 === '0') return '0';
            else if (et_expr1 === '0') return et_expr2;
            else if (et_expr2 === '0') return et_expr1;
            else return `${et_expr1}${(et_expr2.charAt(0) === '-')? '' : '+'}${et_expr2}`;
        });
    }
    else if (detected_eigen_type === 'real_rep') {
        const vw_entries = [
            eigens.vectors[0][0], eigens.vectors[0][1], 
            eigens.vectors[1][0], eigens.vectors[1][1]
        ].filter(val => val !== 0).map(val => Math.abs(val));
        
        let gcf = vw_entries.length > 0 ? PH.gcfOfArray(vw_entries) : 1;
        const filtered_w_entries = eigens.vectors[1].filter(wi => wi !== 0);
        if (filtered_w_entries.length === 1 && filtered_w_entries[0] < 0) gcf *= -1;

        eigens.vectors = eigens.vectors.map(vect => vect.map(entry => entry / gcf));

        [var1_rhs, var2_rhs] = (new Array(2)).fill(null).map((_, idx0) => {
            const vi = eigens.vectors[0][idx0];
            const wi = eigens.vectors[1][idx0];
            const lambda = SDH.coef(eigens.values[0]);
            const e_lambda_t = lambda === '0' ? '' : `e^{${lambda}t}`;
            const [C1, C2] = constants;

            let term1, term2; // v_{i}C_{1}e^{\lambda t} and C_{2}e^{\lambda t}(w_{i} + v_{i}t)
            if (settings.sys_diff_initcond === 'yes') {
                // form: e^{rt}(A + Bt)
                const A = vi*C1 + wi*C2;
                const B = vi*C2;

                if (A === 0 && B === 0) return '0';
                else if (A === 0) return `${SDH.coef(B)}t${e_lambda_t}`;
                else if (B === 0) {
                    if (e_lambda_t === '') return String(A);
                    else return `${SDH.coef(A)}${e_lambda_t}`;
                }
                else {
                    const A_plus_Bt = `${String(A)}${B > 0? '+' : ''}${SDH.coef(B)}t`;

                    if (e_lambda_t === '') return A_plus_Bt;
                    else return `${e_lambda_t}(${A_plus_Bt})`;
                }
            }
            else if (settings.sys_diff_initcond === 'no') {
                let term1_coef = SDH.coef(vi);
                if (term1_coef === '0') term1 = '0';
                else term1 = `${term1_coef}${C1}${e_lambda_t}`;

                if (wi === 0 && vi === 0) term2 = '0';
                else if (vi === 0) {
                    term2 = `${SDH.coef(wi)}${C2}${e_lambda_t}`;
                }
                else if (wi === 0) {
                    term2 = `${SDH.coef(vi)}${C2}t${e_lambda_t}`;
                }
                else {
                    term2 = `${C2}${e_lambda_t}(${wi}${vi > 0? '+': ''}${SDH.coef(vi)}t)`
                }

                if (term1 === '0' && term2 === '0') return '0'
                else if (term1 === '0') return term2;
                else if (term2 === '0') return term1;
                else return `${term1}${term2.charAt(0) === '-'? '' : '+'}${term2}`
            }   
        });
    }
    else if (detected_eigen_type === 'complex') {        
        const vec_entries = [eigens.vectors[0][0][0], eigens.vectors[0][1][0], eigens.vectors[0][0][1], eigens.vectors[0][1][1]];
        const nz_entries = vec_entries.filter(entry => entry !== 0);
        const unsigned_gcf = nz_entries.length > 0? PH.gcfOfArray(nz_entries.map(Math.abs)) : 1;
        eigens.vectors[0] = eigens.vectors[0].map(complex_entry => complex_entry.map(re_img => re_img / unsigned_gcf));

        const p = vec_entries.slice(0, 2);
        const q = vec_entries.slice(2)
        const [alpha, beta] = eigens.values[0].map(SDH.coef);
        const e_alpha_t = alpha === '0' ? '' : `e^{${alpha}t}`;

        [var1_rhs, var2_rhs] = (new Array(2)).fill(null).map((_, idx0) => {
            if (settings.sys_diff_initcond === 'yes') {
                const [sin_coef, cos_coef] = [-q[idx0]*constants[0] + p[idx0]*constants[1], p[idx0]*constants[0] + q[idx0]*constants[1]].map(SDH.coef);

                if (sin_coef === '0' && cos_coef === '0') return 0;
                else if (sin_coef === '0') return `${cos_coef}${e_alpha_t}\\cos(${beta}t)`;
                else if (cos_coef === '0') return `${sin_coef}${e_alpha_t}\\sin(${beta}t)`;
                else {
                    const sin_plus_cos = `${sin_coef}\\sin(${beta}t)${cos_coef.charAt(0) === '-'? '' : '+'}${cos_coef}\\cos(${beta}t)`;

                    if (e_alpha_t === '') return sin_plus_cos;
                    else return `${e_alpha_t}(${sin_plus_cos})`;
                }
            }
            else if (settings.sys_diff_initcond === 'no') {
                let [cos_sin, sin_cos] = (new Array(2)).fill(null).map((_, idx1) => {
                    const Ci = constants[idx1];
                    const cos_coef = SDH.coef(idx1? q[idx0] : p[idx0]);
                    const sin_coef = SDH.coef(idx1? p[idx0] : -q[idx0]);

                    if (cos_coef === '0' && sin_coef === '0') return '0';
                    else if (cos_coef === '0') return `${sin_coef}${Ci}\\sin(${beta}t)`;
                    else if (sin_coef === '0') return `${cos_coef}${Ci}\\cos(${beta}t)`;
                    else if (idx1 === 0) return `${Ci}(${cos_coef}\\cos(${beta}t)${sin_coef.charAt(0) === '-'? '' : '+'}${sin_coef}\\sin(${beta}t))`;
                    else return `${Ci}(${sin_coef}\\sin(${beta}t)${cos_coef.charAt(0) === '-'? '' : '+'}${cos_coef}\\cos(${beta}t))`;
                });

                if (cos_sin === '0' && sin_cos === '0') return '0';
                else if (cos_sin === '0') {
                    const split_at_const = sin_cos.split(constants[1]);
                    return `${split_at_const[0]}${e_alpha_t}${split_at_const[1]}`;
                }
                else if (sin_cos === '0') {
                    const split_at_const = cos_sin.split(constants[0]);
                    return `${split_at_const[0]}${e_alpha_t}${split_at_const[1]}`;
                }
                else {
                    const inner_expr = `${cos_sin}${sin_cos.charAt(0) === '-'? '' : '+'}${sin_cos}`;

                    if (e_alpha_t === '') return inner_expr;
                    else return `${e_alpha_t}(${inner_expr})`;
                }
            }
        });
    }

    let answer_str = `
        \\begin{aligned}
            ${var1}&=${var1_rhs} \\\\
            ${var2}&=${var2_rhs}
        \\end{aligned}
    `;

    return {
        question: question_str,
        answer: answer_str
    };
}

export const settings_fields = [
    'sys_diff_vars',
    'sys_diff_eigenvals',
    'diff_notation',
    'sys_diff_initcond',
    'func_notation',
    'sys_diff_degenerate',
    'left_brace'
];

export const presets = {
    default: function() {
        return {
            sys_diff_vars: 'x_y',
            sys_diff_eigenvals: 'real_dis',
            diff_notation: 'prime',
            sys_diff_initcond: 'yes',
            func_notation: 'implicit',
            sys_diff_degenerate: 'no',
            left_brace: 'no'
        };
    },
    random: function() {
        return {
            sys_diff_vars: '__random__',
            sys_diff_eigenvals: '__random__',
            diff_notation: '__random__',
            sys_diff_initcond: '__random__',
            func_notation: '__random__',
            sys_diff_degenerate: '__random__'
        };
    },
    // has_topic_presets: true
};

export const size_adjustments = {
    width: 1.3,
    height: 1.3,
    // q_font_size: 1.1,
    // a_font_size: 1.1
};