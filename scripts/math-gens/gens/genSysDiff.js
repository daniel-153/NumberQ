import * as H from '../helpers/gen-helpers.js';

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
        else if (iy === 0 && jx === 0) return true;
        else return false;     
    },
    getEigens: function(mtrx_2x2, eigen_type) {
        const [ix, jx] = mtrx_2x2[0];
        const [iy, jy] = mtrx_2x2[1];
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
            eigens.vectors = [[-jx * jx, (ix - eigens.values[0]) * jx], [jx, eigens.values[0] - ix - jx]];            
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
    getInitCondMtrx: function(mtrx_2x2, eigen_type) { // get the coef matrix that represents the system to be solved to find C1 and C2 with x(0), y(0) initial conditions
        const eigens = SDH.getEigens(mtrx_2x2, eigen_type);

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
    }
    // search2x2Eigenvals: function(entry_size) {
    //     const rand_matrix_gen = SDH.buildMtrxSupplier(entry_size, 2);
    //     const sorted_by_eigens = {
    //         real_dis: [],
    //         real_rep: [],
    //         complex: []
    //     };

    //     let current_vals;
    //     while (!(current_vals = rand_matrix_gen.next()).done) {
    //         const coef_mtrx = [[current_vals.value[0], current_vals.value[1]],[current_vals.value[2], current_vals.value[3]]];

    //         const classification = SDH.classifyByEigen(coef_mtrx);
    //         if (Object.prototype.hasOwnProperty.call(sorted_by_eigens, classification)) {
    //             sorted_by_eigens[classification].push(coef_mtrx);
    //         }
    //     }

    //     return sorted_by_eigens;
    // }
};
export default function genSysDiff(settings) {
    const mtrx_entry_size = 5;
    
    // search loop to find a matrix with the desired eigenvalues
    const max_attempts = 10_000;
    let current_attempts = 0;
    let mtrx_found = false;
    let coef_mtrx;
    while (!mtrx_found && current_attempts++ < max_attempts) {
        coef_mtrx = SDH.getRandomMtrx(mtrx_entry_size);

        if (
            (settings.force_nz_coefs === 'yes' && coef_mtrx.every(row => row[0]*row[1] !== 0)) &&
            SDH.classifyByEigen(coef_mtrx) === settings.sys_diff_eigenvals
        ) mtrx_found = true;
    }

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
    if (settings.sys_diff_initcond === 'yes') {
        const init_cond_mtrx = SDH.getInitCondMtrx(coef_mtrx, settings.sys_diff_eigenvals);
        const [C1, C2] = (new Array(2)).fill(null).map(_ => H.randInt(-mtrx_entry_size, mtrx_entry_size));

        const var1_0 = init_cond_mtrx[0][0]*C1 + init_cond_mtrx[0][1]*C2;
        const var2_0 = init_cond_mtrx[1][0]*C1 + init_cond_mtrx[1][1]*C2;

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

    if (settings.left_brace === 'yes') question_str = `\\left\\{${question_str}\\right.`

    return {
        question: question_str,
        answer: '0'
    };
}

export const settings_fields = [
    'sys_diff_vars',
    'sys_diff_eigenvals',
    'diff_notation',
    'sys_diff_initcond',
    'func_notation',
    'force_nz_coefs',
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
            force_nz_coefs: 'yes',
            left_brace: 'no'
        };
    },
    random: function() {
        return {
            
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