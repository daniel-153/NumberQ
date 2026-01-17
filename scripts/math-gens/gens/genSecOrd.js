import * as H from '../helpers/gen-helpers.js';
import * as EH from '../helpers/expr-helpers.js';
import * as LH from '../helpers/linalg-helpers.js';

export function validateSettings(form_obj, error_locations) {
    if (form_obj.diff_notation === 'frac') form_obj.func_notation = 'implicit';

    if (form_obj.sec_ord_roots === 'real_rep') form_obj.sec_ord_b_term = 'rand';
}

const SOH = { // genSecOrd helpers
    PolExpTrig: class {        
        constructor(pet_obj = {}) {
            ['degree', 'exp_freq', 'trig_freq'].forEach(field_name => {
                if (
                    Object.prototype.hasOwnProperty.call(pet_obj, field_name) &&
                    pet_obj[field_name] instanceof EH.Int
                ) {
                    this[field_name] = new EH.Int(pet_obj[field_name].value);
                }
                else {
                    this[field_name] = new EH.Int(0);
                }
            })
            
            const build_polynom = () => (new Array(this.degree + 1)).fill(null).map(_ => new EH.Coef([EH.Int, EH.Frac]));
            this.polynom_s = build_polynom();
            this.polynom_c = build_polynom();
        }
    },
    createCharEq: function(type, root_size, allow_b_term = true) {
        const char_eq = {
            coefs: {a: 1, b: null, c: null},
            type: type,
            roots: null
        };

        if (type === 'real_dis') {
            let r1, r2;
            if (allow_b_term) {
                r1 = H.randInt(-root_size, root_size);
                r2 = H.randIntExcept(-root_size, root_size, r1);

                char_eq.coefs.b = -(r1 + r2);
                char_eq.coefs.c = r1*r2;
            }
            else {
                r1 = H.randInt(1, root_size);
                r2 = -r1;
                
                char_eq.coefs.b = 0;
                char_eq.coefs.c = -(r1**2);
            }

            char_eq.roots = [r1, r2];
        }
        else if (type === 'real_rep') {
            const r = H.randInt(-root_size, root_size);
            char_eq.roots = [r];

            char_eq.coefs.b = -2*r
            char_eq.coefs.c = r**2;
        }
        else if (type === 'complex') {
            if (allow_b_term) {
                const lambda = H.randInt(-root_size, root_size);
                const omega = H.randInt(1, root_size);
                char_eq.roots =[[lambda, omega], [lambda, -omega]];

                char_eq.coefs.b = -2*lambda;
                char_eq.coefs.c = lambda**2 + omega**2
            }
            else {
                const omega = H.randInt(1, root_size);
                char_eq.roots = [[0, omega], [0, -omega]];

                char_eq.coefs.b = 0;
                char_eq.coefs.c = omega**2;
            }
        }

        return char_eq;
    },
    homo_sols: {
        real_dis: (roots) => [
            new EH.PolExpTrig({
                exp_freq: new EH.Int(roots[0])
            }),
            new EH.PolExpTrig({
                exp_freq: new EH.Int(roots[1])
            })
        ],
        real_rep: (roots) => [new EH.PolExpTrig({
            exp_freq: new EH.Int(roots[0]),
            degree: new EH.Int(1)
        })],
        complex: (roots) => [new EH.PolExpTrig({
            exp_freq: new EH.Int(roots[0][0]),
            trig_freq: new EH.Int(Math.abs(roots[0][1]))
        })]
    },
    forms: {
        'zero': {
            und_pet_sum: () => [new EH.PolExpTrig()],
            selectPolyCoefs: function(pet_obj) {
                pet_obj.polynom_c[0].value = new EH.Int(0);
            }
        },
        'constant': {
            und_pet_sum: () => [new EH.PolExpTrig()],
            selectPolyCoefs: function(pet_obj) {
                pet_obj.polynom_c[0].value = new EH.Int(H.randIntExcept(-9, 9, 0));
            }
        },
        'et_alone': {
            und_pet_sum: () => new [EH.PolExpTrig({
                exp_freq: new EH.Int(H.randIntExcept(-4, 4, 0))
            })],
            selectPolyCoefs: function(pet_obj) {
                if (H.randInt(0, 1)) {
                    pet_obj.polynom_c[0].value = new EH.Int(1);
                }
                else {
                    pet_obj.polynom_c[0].value = new EH.Int(H.randIntExcept(-3, 3, 0));
                }
            }
        },
        'sin_alone': {
            und_pet_sum: () => new EH.PolExpTrig({
                trig_freq: new EH.Int(H.randInt(1, 3))
            }),
            selectPolyCoefs: function(pet_obj) {
                pet_obj.polynom_c[0].value = new EH.Int(0);
                
                if (H.randInt(0, 1)) {
                    pet_obj.polynom_s[0].value = new EH.Int(1);
                }
                else {
                    pet_obj.polynom_s[0].value = new EH.Int(H.randIntExcept(-3, 3, 0));
                }
            }
        },
        'sin_alone': {
            und_pet_sum: () => new EH.PolExpTrig({
                trig_freq: new EH.Int(H.randInt(1, 3))
            }),
            selectPolyCoefs: function(pet_obj) {
                pet_obj.polynom_s[0].value = new EH.Int(0);
                
                if (H.randInt(0, 1)) {
                    pet_obj.polynom_c[0].value = new EH.Int(1);
                }
                else {
                    pet_obj.polynom_c[0].value = new EH.Int(H.randIntExcept(-3, 3, 0));
                }
            }
        },
        'tn_alone': {
            und_pet_sum: () => new EH.PolExpTrig({
                degree: new EH.Int(H.randInt(1, 2))
            }),
            selectCoefs: function(pet_obj) {
                pet_obj.polynom_c[pet_obj.degree.value].value = new EH.Int(H.randIntExcept(-3, 3, 0));

                for (let i = 0; i < pet_obj.degree.value; i++) {
                    pet_obj.polynom_c[i].value = new EH.Int(0);
                }
            }
        },
        'e_and_sin': {
            und_pet_sum: () => new EH.PolExpTrig({
                exp_freq: new EH.Int(H.randIntExcept(-2, 2, 0)),
                trig_freq: new EH.Int(H.randInt(1, 2))
            }),
            selectCoefs: function(pet_obj) {
                pet_obj.polynom_c[0].value = new EH.Int(0);
                pet_obj.polynom_s[0].value = new EH.Int(1);
            }
        },
        'e_and_sin': {
            und_pet_sum: () => new EH.PolExpTrig({
                exp_freq: new EH.Int(H.randIntExcept(-2, 2, 0)),
                trig_freq: new EH.Int(H.randInt(1, 2))
            }),
            selectCoefs: function(pet_obj) {
                pet_obj.polynom_s[0].value = new EH.Int(0);
                pet_obj.polynom_c[0].value = new EH.Int(1);
            }
        },
        'tn_and_e': {
            und_pet_sum: () => new EH.PolExpTrig({
                exp_freq: new EH.Int(H.randIntExcept(-3, 3, 0)),
                degree: new EH.Int(H.randInt(1, 2))
            }),
            selectCoefs: function(pet_obj) {
                pet_obj.polynom_c[pet_obj.degree.value].value = new EH.Int(1);

                for (let i = 0; i < pet_obj.degree.value; i++) {
                    pet_obj.polynom_c[i].value = new EH.Int(0);
                }
            }
        },
        'tn_and_sin': {
            und_pet_sum: () => new EH.PolExpTrig({
                trig_freq: new EH.Int(H.randInt(1, 3)),
                degree: new EH.Int(H.randInt(1, 2))
            }),
            selectCoefs: function(pet_obj) {
                pet_obj.polynom_c[pet_obj.degree.value].value = new EH.Int(0);
                pet_obj.polynom_s[pet_obj.degree.value].value = new EH.Int(1);

                for (let i = 0; i < pet_obj.degree.value; i++) {
                    pet_obj.polynom_c[i].value = new EH.Int(0);
                    pet_obj.polynom_s[i].value = new EH.Int(0);
                }
            }
        },
        'tn_and_cos': {
            und_pet_sum: () => new EH.PolExpTrig({
                trig_freq: new EH.Int(H.randInt(1, 3)),
                degree: new EH.Int(H.randInt(1, 2))
            }),
            selectCoefs: function(pet_obj) {
                pet_obj.polynom_s[pet_obj.degree.value].value = new EH.Int(0);
                pet_obj.polynom_c[pet_obj.degree.value].value = new EH.Int(1);

                for (let i = 0; i < pet_obj.degree.value; i++) {
                    pet_obj.polynom_s[i].value = new EH.Int(0);
                    pet_obj.polynom_c[i].value = new EH.Int(0);
                }
            }
        }
    },
    adjustForReso: function(y_h_pets, y_p_pets, adjust_y_p = true) {
        let reso_found = false;
        for (let i = 0; i < y_p_pets.length; i++) {
            for (let j = 0; j < y_h_pets.length; j++) {
                const y_p_pet = y_p_pets[i];
                const y_h_pet = y_h_pets[j];

                // check if terms resonate, adjust or break according to request
                if (
                    (
                        y_p_pet.polynom_c.some(entry => entry.value !== 0) ||
                        y_p_pet.polynom_s.some(entry => entry.value !== 0)
                    ) &&
                    (
                        y_h_pet.polynom_c.some(entry => entry.value !== 0) ||
                        y_h_pet.polynom_s.some(entry => entry.value !== 0)
                    ) &&
                    (
                        y_p_pet.exp_freq === y_h_pet.exp_freq && y_p_pet.trig_freq === y_h_pet.trig_freq
                    ) &&
                    (
                        y_h_pet.degree.value >= y_p_pet.degree.value
                    )
                ) {
                    if (!adjust_y_p) return true;
                    else {
                        reso_found = true;
                        const degree_increase = (y_h_pet.degree.value - y_p_pet.degree.value) + 1;
                        y_p_pet.degree.value += degree_increase;

                        const added_zero_terms = new Array(degree_increase).fill(new EH.Int(0));
                        y_p_pet.polynom_s = added_zero_terms.concat(y_p_pet.polynom_s);
                        y_p_pet.polynom_c = added_zero_terms.concat(y_p_pet.polynom_c);
                    }
                }
            }
        }

        return reso_found;
    },
    polynom_ops: {
        scale: function(polyom_arr, scalar) {
            return polyom_arr.map(coef => new EH.Mul(scalar, coef));
        },
        add: function(polynom_arr1, polynom_arr2) {
            const [shorter_poly, longer_poly] = polynom_arr2.length > polynom_arr1.length? [polynom_arr1, polynom_arr2] : [polynom_arr2, polynom_arr1];

            const sum_poly = [];
            for (let i = 0; i < longer_poly.length; i++) {
                const long_term = longer_poly[i];
                const short_term = i < shorter_poly.length? shorter_poly[i] : new EH.Int(0);
                
                sum_poly.push(new EH.Sum(short_term, long_term));
            }

            return sum_poly;
        },
        diff: function(polynom_arr) {
            const diffed_poly = [];

            for (let n = 1; n < polynom_arr.length; n++) {
                diffed_poly.push(new EH.Mul(new EH.Int(n), polynom_arr[n]));
            }

            return diffed_poly;
        },
        evaluate: function(polynom_arr, value) {
            let accum = new EH.Int(0);

            for (let n = 0; n < polynom_arr.length; n++) {
                accum = new EH.Sum(
                    accum,
                    new EH.Mul(
                        polynom_arr[n],
                        new EH.Pow(
                            value,
                            new EH.Int(n)
                        )
                    )
                );
            }

            return accum;
        }
    },
    diffPetSum: function(pet_sum) {
        return pet_sum.map(pet_obj => {
            const diffed_pet = new SOH.PolExpTrig(pet_obj);

            diffed_pet.polynom_s = SOH.polynom_ops.add(
                SOH.polynom_ops.scale(pet_obj.polynom_s, pet_obj.exp_freq),
                SOH.polynom_ops.add(
                    SOH.polynom_ops.diff(pet_obj.polynom_s),
                    SOH.polynom_ops.scale(pet_obj.polynom_c, new EH.Int(-1))
                )
            );

            diffed_pet.polynom_c = SOH.polynom_ops.add(
                SOH.polynom_ops.scale(pet_obj.polynom_c, pet_obj.exp_freq),
                SOH.polynom_ops.add(
                    SOH.polynom_ops.diff(pet_obj.polynom_c),
                    pet_obj.polynom_s
                )
            );

            return diffed_pet;
        });
    },
    normPolyLens: function(poly_1, poly_2) {
        if (poly_1.length > poly_2.length) {
            return [poly_1, poly_2.concat(new Array(poly_1.length - poly_2.length).fill(new EH.Int(0)))];
        }
        else {
            return [poly_1.concat(new Array(poly_2.length - poly_1.length).fill(new EH.Int(0))), poly_2];
        }
    },
    extractValsDotCoefs: function(oper_tree, val_coef_pairs = []) {
        if (oper_tree instanceof EH.Sum) {
            [oper_tree.operand1, oper_tree.operand2].forEach(operand => {
                if (operand instanceof EH.Oper) {
                    SOH.extractValsDotCoefs(operand, val_coef_pairs);
                }
                else if (operand instanceof EH.Coef) {
                    val_coef_pairs.push([new EH.Int(1), operand]);
                }
                else {
                    throw new Error('Detached Value or unexpected operand found in sum.')
                }
            });
        }
        else if (oper_tree instanceof EH.Mul) {
            if (
                oper_tree.operand1 instanceof EH.Value && 
                oper_tree.operand2 instanceof EH.Coef
            ) {
                val_coef_pairs.push([oper_tree.operand1, oper_tree.operand2]);
            }
            else if (
                oper_tree.operand1 instanceof EH.Coef &&
                oper_tree.operand2 instanceof EH.Value
            ) {
                val_coef_pairs.push([oper_tree.operand2, oper_tree.operand1]);
            }
            else if (
                oper_tree.operand1 instanceof EH.Value &&
                (
                    oper_tree.operand2 instanceof EH.Sum ||
                    oper_tree.operand2 instanceof EH.Mul
                )
            ) {
                SOH.extractValsDotCoefs(
                    new oper_tree.operand2.constructor(
                        new EH.Mul(oper_tree.operand1, oper_tree.operand2.operand1),
                        new EH.Mul(oper_tree.operand1, oper_tree.operand2.operand2)
                    ),
                    val_coef_pairs
                );
            }
            else if (
                (
                    oper_tree.operand1 instanceof EH.Sum ||
                    oper_tree.operand1 instanceof EH.Mul
                ) &&
                oper_tree.operand2 instanceof EH.Value
            ) {
                SOH.extractValsDotCoefs(
                    new oper_tree.operand1.constructor(
                        new EH.Mul(oper_tree.operand2, oper_tree.operand1.operand1),
                        new EH.Mul(oper_tree.operand2, oper_tree.operand1.operand2)
                    ),
                    val_coef_pairs
                );
            }
            else {
                throw new Error('Unexpected operands encountered in Mul.');
            }
        }
        else throw new Error('Unexpected or unknown operation encountered.');

        // combine like terms
        let curr_idx = 0;
        while (curr_idx++ < val_coef_pairs.length) {
            for (let search_idx = curr_idx + 1; search_idx < val_coef_pairs.length; search_idx++) {
                if (val_coef_pairs[search_idx][1] === val_coef_pairs[curr_idx][1]) {
                    const sum_coefs = new EH.Sum(
                        val_coef_pairs[search_idx][0],
                        val_coef_pairs[curr_idx][0]
                    );

                    sum_coefs.evaluate();
                    val_coef_pairs[curr_idx] = sum_coefs.value;

                    val_coef_pairs.splice(search_idx);
                    search_idx--;
                }
            }
        }

        return val_coef_pairs;
    },
    determineCoefs: function(char_eq, y_p_pets, d_y_p_pets, dd_y_p_pets, f_t_pets) {
        // compute all scaled pet objs on the lhs (when y_p is substituted into the diff-eq)
        let all_lhs_pets = [y_p_pets, d_y_p_pets, dd_y_p_pets].map((pet_sum, term_idx) => {
            return pet_sum.map(pet_obj => {
                const clone_pet_obj = SOH.PolExpTrig(pet_obj);

                ['polynom_c', 'polynom_s'].forEach(poly_key => {
                    clone_pet_obj[poly_key] = SOH.polynom_ops.scale(
                        pet_obj[poly_key],
                        char_eq.coefs[String.fromCharCode(term_idx + 97)]
                    );
                });

                return clone_pet_obj;
            });
        }).flat();
        
        // equate polynomials on matching pet terms
        const equal_polynoms = [];
        f_t_pets.forEach(f_t_pet => {
            const matching_lhs_idxs = [];
            let accum_lhs_c_poly = [new EH.Int(0)];
            let accum_lhs_s_poly = [new EH.Int(0)];

            all_lhs_pets.forEach((lhs_pet, lhs_idx) => {
                if (
                    lhs_pet.trig_freq === f_t_pet.trig_freq &&
                    lhs_pet.exp_freq === f_t_pet.trig_freq
                ) {
                    matching_lhs_idxs.push(lhs_idx);
                    accum_lhs_c_poly = SOH.polynom_ops.add(accum_lhs_c_poly, lhs_pet.polynom_c);
                    accum_lhs_s_poly = SOH.polynom_ops.add(accum_lhs_s_poly, lhs_pet.polynom_s);
                }
            });

            equal_polynoms.push(
                SOH.normPolyLens(accum_lhs_c_poly, f_t_pet.polynom_c),
                SOH.normPolyLens(accum_lhs_s_poly, f_t_pet.polynom_s)
            );

            all_lhs_pets = all_lhs_pets.filter((_, idx) => !matching_lhs_idxs.includes(idx))
        });

        // remaining polynomials after matching must be equal to zero
        all_lhs_pets.forEach(remaining_pet => equal_polynoms.push(
            SOH.normPolyLens(remaining_pet.polynom_c, [new EH.Int(0)]),
            SOH.normPolyLens(remaining_pet.polynom_s, [new EH.Int(0)])
        ));

        // dynamically extract and pad each row to create the matrix representing the system
        const seen_coefs = [];
        const coef_mtrx = [];
        equal_polynoms.forEach(poly_eq => {
            for (let i = 0; i < poly_eq[0].length; i++) {
                const lhs_coef = poly_eq[0][i];
                const rhs_coef = poly_eq[1][i]; // must be a Value(Int)

                if (!(rhs_coef instanceof EH.Int)) {
                    throw new Error('Invalid system row: rhs is not a value.');
                }
                else if (lhs_coef instanceof EH.Int) {
                    if (lhs_coef.value === rhs_coef.value) continue; // redundant row
                    else throw new Error('Inconsistent sytem equation found.');
                }
                else if (lhs_coef instanceof EH.Coef) {
                    const idx = seen_coefs.indexOf(lhs_coef);

                    if (idx === -1) {
                        coef_mtrx.forEach(row => row.splice(row.length - 1, 0, 0));
                        coef_mtrx.push((new Array(seen_coefs.length)).fill(0).concat([1, rhs_coef.value]));
                        seen_coefs.push(lhs_coef);
                    }
                    else {
                        const zero_row = (new Array(seen_coefs.length)).fill(0);
                        zero_row[idx] = 1;
                        coef_mtrx.push(zero_row.concat(rhs_coef.value));
                    }
                }
                else if (lhs_coef instanceof EH.Oper) {
                    const val_coef_pairs = SOH.extractValsDotCoefs(lhs_coef);
                    const mtrx_row = (new Array(seen_coefs.length)).fill(0);
                    const new_coef_pairs = [];

                    val_coef_pairs.forEach(val_coef_pair => {
                        const seen_idx = seen_coefs.find(seen_coef => (
                            seen_coef === val_coef_pair[1]
                        ));

                        if (seen_idx === -1) {
                            new_coef_pairs.push(val_coef_pair);
                        }
                        else if (val_coef_pair[0] instanceof EH.Int) {
                            mtrx_row[seen_idx] = val_coef_pair[0].value;
                        }
                        else throw new Error('Non-integer coefficient found in matrix row.');
                    });

                    if (new_coef_pairs.length > 0) {
                        const zero_padding = (new Array(new_coef_pairs.length)).fill(0);
                        coef_mtrx.forEach(row => row.splice(row.length - 1, 0, ...zero_padding));

                        new_coef_pairs.forEach(new_coef_pair => {
                            seen_coefs.push(new_coef_pair[1]);

                            if (new_coef_pair[0] instanceof EH.Int) {
                                mtrx_row.push(new_coef_pair[0].value);
                            }
                            else throw new Error('Non-integer coefficient found in matrix row.');
                        });
                    }
                }
                else throw new Error('Failed to create system row: polynom entries have invalid types.');
            }
        });

        const rref_mtrx = LH.matrix_operations.rref(coef_mtrx); // returns matrix with rational entries, represented as [num, den]
        let coef_err_found = false;
        for (let i = 0; i < seen_coefs.length; i++) {
            const curr_mtrx_row = rref_mtrx[i];
            const curr_diag_entry = curr_mtrx_row[i];
            const curr_coef = seen_coefs[i];
            const curr_sol = curr_mtrx_row[curr_mtrx_row.length - 1];

            if (curr_diag_entry[0] === curr_diag_entry[1]) {
                if (curr_sol[0] % curr_sol[1] === 0) {
                    curr_coef.value = EH.Int(curr_coef[0] / curr_coef[1]);
                }
                else curr_coef.value = EH.Frac(curr_sol[0], curr_sol[1]);
            }
            else {
                coef_err_found = true;
                break;
            }
        }

        if (coef_err_found || seen_coefs.length !== rref_mtrx.length) {
            throw new Error('Coef system is inconsistent or is underdetermined.');
        }
    },
    allIntegerCoefs: function(y_p_pets) {
        return y_p_pets.every(pet_obj => (
            [pet_obj.polynom_c, pet_obj.polynom_s].every(polynom => (
                polynom.every(coef => coef.value instanceof EH.Int)
            ))
        ));
    }
};
export default function genSecOrd(settings) {
    const root_size = {'real_dis': 6, 'real_rep': 6, 'complex': 4}[settings.sec_ord_roots];
    const allow_b_term = (settings.sec_ord_b_term === 'zero')? false : true;

    const resoCheckAndAdjust = {
        'prefer': SOH.adjustForReso, 
        'allow': () => true, 
        'avoid': (...args) => !SOH.adjustForReso(...args)
    }[settings.sec_ord_reso];

    // search loop flags and controls
    const resonance_attempts = 5_000;
    const y_p_coef_attempts = 10_000;
    const init_cond_attempts = 15_000;
    const max_total_attempts = [
        resonance_attempts, y_p_coef_attempts, init_cond_attempts
    ].sort((a, b) => a - b).reduce((acc, curr, idx, arr) => {
        const prev = idx > 0? arr[idx] : 0;
        return acc + (curr - prev);
    }, 0);
    let current_attempts = 0;
    let eq_found = false;

    // search loop to match resonance preference and find clean numbers in both y_p coefs and initial conditions
    let char_eq, f_t_pets, y_h_pets, y_p_pets, init_conds;
    while (!eq_found && current_attempts++ < max_total_attempts) {
        char_eq = EH.createCharEq(settings.sec_ord_roots, root_size, allow_b_term);
        y_h_pets = EH.homo_sols[settings.sec_ord_roots](char_eq.roots);
        f_t_pets = EH.forms[settings.force_func_form].und_pet_sum();
        y_p_pets = f_t_pets.map(pet_obj => SOH.PolExpTrig(pet_obj));
        EH.forms[settings.force_func_form].selectPolyCoefs(f_t_pets.length > 1? f_t_pets : f_t_pets[0]);
        
        if (current_attempts < resonance_attempts && !resoCheckAndAdjust(y_h_pets, y_p_pets)) continue;

        const d_y_p_pets = EH.diffPetSum(y_p_pets);
        const dd_y_p_pets = EH.diffPetSum(d_y_p_pets);
        SOH.determineCoefs(char_eq, y_p_pets, d_y_p_pets, dd_y_p_pets, f_t_pets);

        if (current_attempts < y_p_coef_attempts && !SOH.allIntegerCoefs(y_p_pets)) continue;

        // note: if integer coefs checks are done (fracs are comming through), searching for nice init-conds may not be practical anymore

        // if there is an init cond, pick random (potentially biasing nice) C-vals

        // skip if less than init cond attempts and the init cond isn't nice

        // if made past all of above, sol found within attempt limit
    }

    // if sol not found past above loop, use current state of vals?
}

export const settings_fields = [
    'sec_ord_roots',
    'force_func_form',
    'diff_initcond',
    'diff_eq_vars',
    'sec_ord_reso',
    'sec_ord_b_term',
    'func_notation',
    'diff_notation'
];

export const presets = {
    default: function() {
        return {
            
        };
    },
    random: function() {
        return {
            
        };
    },
    // has_topic_presets: true
};

export const size_adjustments = {
    width: 1.25,
    height: 1.4,
    // present: {
        
    // }
};