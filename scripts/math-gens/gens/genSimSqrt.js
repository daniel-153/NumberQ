import * as H from '../helpers/gen-helpers.js';
import * as PH from '../helpers/polynom-helpers.js';

export function validateSettings(form_obj, error_locations) {}

// write literal \\pm (or a better marker) for every plus sign, then use string processing to individually randomly switch each one to a + or -

// note that radics that aren't in the same group could still simplify (can't assume they won't become ints - so need to check)
// by which I mean, even though you didn't force them into the same group, they could end up being in the same group by random chance


// non_1 also means non negative 1


const SRH = {
    pm: (sign) => (sign === -1)? '-' : '+',
    forms: {
        basic: {
            basic_1: (a) => ({
                prompt_str: `\\sqrt{${a}}`,
                radicand_groups: [[a]],
                ans_num_int: 0,
                ans_num_radics: [[1, a]],
                ans_den: 1
            }),
            basic_2: (a,b) => ({
                prompt_str: `${a}\\sqrt{${b}}`,
                radicand_groups: [[b]],
                ans_num_int: 0,
                ans_num_radics: [[a, b]],
                ans_den: 1,
                non_1: [a],
                allow_neg: true
            }),
            basic_3: (a,b) => ({
                prompt_str: `\\sqrt{${a}} \\cdot \\sqrt{${b}}`,
                radicand_groups: [[a], [b]],
                ans_num_int: 0,
                ans_num_radics: [[1, a*b]],
                ans_den: 1
            }),
            basic_4: (a,b, ...pm) => ({
                pm_count: 1, 
                prompt_str: `\\sqrt{${a}} ${SRH.pm(pm[0])} \\sqrt{${b}}`,
                radicand_groups: [[a, b]],
                ans_num_int: 0,
                ans_num_radics: [[1, a], [pm[0], b]],
                ans_den: 1
            })
        },
        begin: {
            begin_1: (a,b) => ({
                prompt_str: `\\frac{${a}}{\\sqrt{${b}}}`,
                radicand_groups: [[b]],
                ans_num_int: 0,
                ans_num_radics: [[a, b]],
                ans_den: b,
                allow_neg: true
            }),
            begin_2: (a,b) => ({
                prompt_str: `\\frac{\\sqrt{${a}}}{\\sqrt{${b}}}`,
                radicand_groups: [[a], [b]],
                ans_num_int: 0,
                ans_num_radics: [[1, a*b]],
                ans_den: b
            }),
            begin_3: (a,b,c, ...pm) => ({
                pm_count: 2,
                prompt_str: `\\sqrt{a} ${SRH.pm(pm[0])} \\sqrt{b} ${SRH.pm(pm[1])} \\sqrt{c}`,
                radicand_groups: [[a, b, c]],
                ans_num_int: 0,
                ans_num_radics: [[1, a], [pm[0], b], [pm[1], c]],
                ans_den: 1
            }),
            begin_4: (a,b,c) => ({
                prompt_str: `\\frac{${a}\\sqrt{${b}}}{\\sqrt{${c}}}`,
                radicand_groups: [[b], [c]],
                ans_num_int: 0,
                ans_num_radics: [[a, b*c]],
                ans_den: c,
                non_1: [a],
                allow_neg: true
            }),
            begin_5: (a,b,c) => ({
                prompt_str: `\\sqrt{${a}}\\cdot\\sqrt{${b}}\\cdot\\sqrt{${c}}`,
                radicand_groups: [[a], [b], [c]],
                ans_num_int: 0,
                ans_num_radics: [[1, a*b*c]],
                ans_den: 1
            }),
            begin_6: (a,b,c,d, ...pm) => ({
                pm_count: 3,
                prompt_str: `(${a} ${SRH.pm(pm[0])} \\sqrt{${b}}) ${SRH.pm(pm[1])} (${c} ${SRH.pm(pm[2])} \\sqrt{${d}})`,
                radicand_groups: [[b, d]],
                ans_num_int: a + pm[1]*c,
                ans_num_radics: [[pm[0], b], [pm[1]*pm[2], d]],
                ans_den: 1,
                allow_neg: true
            }),
            begin_7: (a,b) => ({
                prompt_str: `\\sqrt{\\frac{${a}}{${b}}}`,
                radicand_groups: [[a], [b]],
                ans_num_int: 0,
                ans_num_radics: [[1, a*b]],
                ans_den: b
            }),
            begin_8: (a,b,c,d) => ({
                prompt_str: `${a}\\sqrt{${b}}\\cdot ${c}\\sqrt{${d}}`,
                radicand_groups: [[b], [d]],
                ans_num_int: 0,
                ans_num_radics: [[a*c, b*d]],
                ans_den: 1,
                non_1: [a, c]
            }),
            begin_9: (a,b,c,d) => ({
                prompt_str: `${a}\\sqrt{${b}} ${SRH.pm(Math.sign(c))} ${Math.abs(c)}\\sqrt{${d}}`,
                radicand_groups: [[b, d]],
                ans_num_int: 0,
                ans_num_radics: [[a, b], [c, d]],
                ans_den: 1,
                non_1: [a, c],
                allow_neg: true
            }),
            begin_10: (a,b,c, ...pm) => ({
                pm_count: 1,
                prompt_str: `${a}(${b} ${SRH.pm(pm[0])} \\sqrt{${c}})`,
                radicand_groups: [[c]],
                ans_num_int: a*b,
                ans_num_radics: [[pm[0]*a, c]],
                ans_den: 1,
                non_1: [a],
                allow_neg: true
            }),
            begin_11: (a,b,c, ...pm) => ({
                pm_count: 1,
                prompt_str: `\\sqrt{${a}}(${b} ${SRH.pm(pm[0])} \\sqrt{${c}})`,
                radicand_groups: [[a, c]],
                ans_num_int: pm[0] * Math.sqrt(a*c),
                ans_num_radics: [[b, a]],
                ans_den: 1,
                allow_neg: true
            }),
        },
        inter: {
            inter_1: (a,b, ...pm) => ({
                pm_count: 1,
                prompt_str: `(${a} ${SRH.pm(pm[0])} \\sqrt{${b}})^{2}`,
                radicand_groups: [[b]],
                ans_num_int: a**2 + b,
                ans_num_radics: [[2*pm[0]*a, b]],
                ans_den: 1,
                allow_neg: true
            }),
            inter_2: (a,b,c) => ({
                prompt_str: `\\frac{\\sqrt{${a}}\\cdot\\sqrt{${b}}}{\\sqrt{${c}}}`,
                radicand_groups: [[a], [b], [c]],
                ans_num_int: 0,
                ans_num_radics: [[1, a*b*c]],
                ans_den: c,
            }),
            inter_3: (a,b,c, ...pm) => ({
                pm_count: 1,
                prompt_str: `\\frac{${a}}{${b} ${SRH.pm(pm[0])} \\sqrt{${c}}}`,
                radicand_groups: [[c]],
                ans_num_int: a*b,
                ans_num_radics: [[-pm[0]*a, c]],
                ans_den: b**2 - c,
                allow_neg: true
            }),
            inter_4: (a,b,c,d, ...pm) => ({
                pm_count: 2,
                prompt_str: `\\frac{${a} ${SRH.pm(pm[0])} \\sqrt{${b}}}{${c} ${SRH.pm(pm[1])} \\sqrt{${d}}}`,
                radicand_groups: [[b, d]],
                ans_num_int: a*c - pm[0]*pm[1]*Math.sqrt(b*d),
                ans_num_radics: [[-pm[1]*a, d], [pm[0]*c, b]],
                ans_den: c**2 - d,
                allow_neg: true
            }),
            inter_5: (a,b,c,d, ...pm) => ({
                pm_count: 2,
                prompt_str: `(${a} ${SRH.pm(pm[0])} \\sqrt{${b}})(${c} ${SRH.pm(pm[1])} \\sqrt{${d}})`,
                radicand_groups: [[b, d]],
                ans_num_int: a*c + pm[0]*pm[1]*Math.sqrt(b*d),
                ans_num_radics: [[pm[1]*a, d], [pm[0]*c, b]],
                ans_den: 1,
                allow_neg: true
            }),
            inter_6: (a,b,c,d, ...pm) => ({
                pm_count: 3,
                prompt_str: `\\sqrt{${a}} ${SRH.pm(pm[0])} \\sqrt{${b}} ${SRH.pm(pm[1])} \\sqrt{${c}} ${SRH.pm(pm[2])} \\sqrt{${d}}`,
                radicand_groups: [[a, b, c, d]],
                ans_num_int: 0,
                ans_num_radics: [[1, a], [pm[0], b], [pm[1], c], [pm[2], d]],
                ans_den: 1,
            }),
            inter_7: (a,b,c) => ({
                prompt_str: `\\frac{${a}}{${b}\\sqrt{${c}}}`,
                radicand_groups: [[c]],
                ans_num_int: 0,
                ans_num_radics: [[a, c]],
                ans_den: b*c,
                non_1: [b],
                allow_neg: true
            }),
            inter_8: (a,b,c,d) => ({
                prompt_str: `\\frac{${a}\\sqrt{${b}}}{${c}\\sqrt{${d}}}`,
                radicand_groups: [[b], [d]],
                ans_num_int: 0,
                ans_num_radics: [[a, b*d]],
                ans_den: c*d,
                non_1: [a, c],
                allow_neg: true
            }),
            inter_9: (a,b,c, ...pm) => ({
                pm_count: 1,
                prompt_str: `\\frac{${a} ${SRH.pm(pm[0])} \\sqrt{${b}}}{\\sqrt{${c}}}`,
                radicand_groups: [[b, c]],
                ans_num_int: pm[0]*Math.sqrt(b*c),
                ans_num_radics: [[a, c]],
                ans_den: 1,
                allow_neg: true
            }),
            inter_10: (a,b,c, ...pm) => ({
                pm_count: 1,
                prompt_str: `\\frac{\\sqrt{${a}}}{${b} ${SRH.pm(pm[0])} \\sqrt{${c}}}`,
                radicand_groups: [[a, c]],
                ans_num_int: -pm[0]*Math.sqrt(a*c),
                ans_num_radics: [[b, a]],
                ans_den: b**2 - c,
                allow_neg: true
            }),
            inter_11: (a,b,c,d,e,f) => ({
                prompt_str: `${a}\\sqrt{${b}} ${SRH.pm(Math.sign(c))} ${Math.abs(c)}\\sqrt{${d}} ${SRH.pm(Math.sign(e))} ${Math.abs(e)}\\sqrt{${f}}`,
                radicand_groups: [[b, d, f]],
                ans_num_int: 0,
                ans_num_radics: [[a, b], [c, d], [e, f]],
                ans_den: 1,
                non_1: [a,c,e],
                allow_neg: true
            }),
            inter_12: (a,b,c, ...pm) => ({
                pm_count: 1,
                prompt_str: `\\frac{${a}}{\\sqrt{${b}} ${SRH.pm(pm[0])} \\sqrt{${c}}}`,
                radicand_groups: [[b, c]],
                ans_num_int: 0,
                ans_num_radics: [[-pm[0]*a, c], [a, b]],
                ans_den: b - c,
                allow_neg: true
            }),
            inter_13: (a,b,c,d, ...pm) => ({
                pm_count: 1,
                prompt_str: `\\frac{${a}}{\\sqrt{${b}}} ${SRH.pm(pm[0])} \\frac{${c}}{\\sqrt{${d}}}`,
                radicand_groups: [[b, d]],
                ans_num_int: 0,
                ans_num_radics: [[a, d], [pm[0]*c, b]],
                ans_den: Math.sqrt(b*d)
            }),
            inter_14: (a,b,c, ...pm) => ({
                pm_count: 1,
                prompt_str: `\\frac{\\sqrt{${a}}}{\\sqrt{${b}} ${SRH.pm(pm[0])} \\sqrt{${c}}}`,
                radicand_groups: [[a, b], [c]],
                ans_num_int: Math.sqrt(a*b),
                ans_num_radics: [[-pm[0], a*c]],
                ans_den: b - c
            }),
            inter_15: (a,b,c,d,e) => ({
                prompt_str: `\\frac{${a}}{${b}\\sqrt{${c}} ${SRH.pm(Math.sign(d))} ${Math.abs(d)}\\sqrt{${e}}}`,
                radicand_groups: [[c, e]],
                ans_num_int: 0,
                ans_num_radics: [[-a*d, e], [a*b, c]],
                ans_den: b**2 * c - d**2 * e,
                non_1: [b,d],
                allow_neg: true
            }),
        }
    }
};
export default function genSimSqrt(settings) {
    // resolve the form
    let form_func;
    const form_level = settings.sim_sqrt_form.split('_')[1];
    if (settings.sim_sqrt_form.includes('all_')) { // randomly resolve an all_level to a particular form
        form_func = SRH.forms[form_level][`${form_level}_${H.randInt(1, Object.values(SRH.forms[form_level]).length)}`];
    }
    else {
        form_func = SRH.forms[form_level][settings.sim_sqrt_form];
    }

    // sort the values to be supplied to the form
    const coef_vals = {};
    let num_base_coefs, num_pm_coefs;
    const pm_count = form_func().pm_count;
    if (!Number.isNaN(pm_count) && pm_count >= 1) {
        num_base_coefs = form_func.length - 1;
        num_pm_coefs = pm_count;
    }
    else {
        num_base_coefs = form_func.length;
        num_pm_coefs = 0;
    }

    const ordered_coef_list = []; // coef val objects in the order in which they need to be supplied (including pm)

    coef_vals.int_coefs = {};
    for (let i = 0; i < num_base_coefs; i++) {
        const coef_key = `int${i}`;
        coef_vals.int_coefs[coef_key] = new Object();
        ordered_coef_list.push(coef_vals.int_coefs[coef_key]);
    }

    coef_vals.pm_coefs = {};
    for (let i = 0; i < num_pm_coefs; i++) {
        const coef_key = `pm${i}`;
        coef_vals.pm_coefs[coef_key] = new Object();
        ordered_coef_list.push(coef_vals.pm_coefs[coef_key]);
    }

    // extract the radicand groups from the int coefs
    const radic_groups = form_func(
        ...Object.values(coef_vals.int_coefs),
        ...Object.values(coef_vals.pm_coefs)
    ).radicand_groups;

    coef_vals.radic_coef_groups = [];
    Object.entries(coef_vals.int_coefs).forEach(int_coef_entry => {
        const [coef_key, coef_val_obj] = int_coef_entry;

        // search the radic groups for the coef obj
        let group_index;
        let coef_obj_found = false;
        for (let i = 0; i < radic_groups.length; i++) {
            for (let j = 0; j < radic_groups[i].length; j++) {
                if (radic_groups[i][j] === coef_val_obj) {
                    coef_obj_found = true;
                    group_index = i;
                    break;
                }
            }

            if (coef_obj_found) break;
        }

        if (coef_obj_found) {
            delete coef_vals.int_coefs[coef_key]; 

            // create the group if it doesn't exist already
            if (!Array.isArray(coef_vals.radic_coef_groups[group_index])) {
                coef_vals.radic_coef_groups[group_index] = [];
            }

            coef_vals.radic_coef_groups[group_index].push(coef_val_obj);
        }
    });

    // now all of the coefs are sorted by int coefs, radic groups, and pm coefs -> next step is to assign values
    const number_size = settings.sim_sqrt_number_size;
    const allow_negatives = settings.sim_sqrt_allow_negatives;
    const valid_vals_call = form_func(...ordered_coef_list);
    const non_1_coefs = valid_vals_call.non_1;
    const form_allows_neg = (valid_vals_call.allow_neg === true);

    let int_coef_range;
    if (number_size === 'small') {
        int_coef_range = [1, 5];
    }
    else if (number_size === 'medium') {
        int_coef_range = [1, 8];
    }
    else if (number_size === 'large') {
        int_coef_range = [1, 11];
    }

    // assign values to all the int coefs
    Object.values(coef_vals.int_coefs).forEach(coef_obj => {
        if (non_1_coefs.includes(coef_obj)) {
            if (allow_negatives && form_allows_neg) {
                coef_obj.value = H.randInt(2, int_coef_range[1]) * (-1)**H.randInt(0, 1);
            }
            else {
                coef_obj.value = H.randInt(2, int_coef_range[1]);
            }
        }
        else {
            if (allow_negatives && form_allows_neg) {
                coef_obj.value = H.randInt(1, int_coef_range[1]) * (-1)**H.randInt(0, 1);
            }
            else {
                coef_obj.value = H.randInt(1, int_coef_range[1]);
            }
        }
    });

    // assign values to all the radic coefs


    










}

export const settings_fields = [
    'sim_sqrt_term_order',
    'sim_sqrt_form',
    'sim_sqrt_allow_negatives',
    'sim_sqrt_frac_rule'
];

export const presets = {
    default: function() {
        return {
            
        };
    },
    random: function() {
        return {
            
        };
    }
};