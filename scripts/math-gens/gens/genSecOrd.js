import * as H from '../helpers/gen-helpers.js';
import * as EH from '../helpers/expr-helpers.js';
import * as LH from '../helpers/linalg-helpers.js';

export function validateSettings(form_obj, error_locations) {
    if (form_obj.diff_notation === 'frac') form_obj.func_notation = 'implicit';

    if (form_obj.sec_ord_roots === 'real_rep') form_obj.sec_ord_b_term = 'rand';

    if (
        form_obj.diff_initcond === 'yes' && 
        form_obj.diff_notation === 'frac'
    ) form_obj.diff_notation === 'prime';
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

            const build_polynom = () => Array.from(
                {length: this.degree.value + 1},
                () => new EH.Coef([EH.Int, EH.Frac])
            );
            this.polynom_c = build_polynom();
            this.polynom_s = build_polynom();

            if (this.trig_freq.value === 0) this.polynom_s.forEach(coef => coef.value = new EH.Int(0));
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
            new SOH.PolExpTrig({
                exp_freq: new EH.Int(roots[0])
            }),
            new SOH.PolExpTrig({
                exp_freq: new EH.Int(roots[1])
            })
        ],
        real_rep: (roots) => [new SOH.PolExpTrig({
            exp_freq: new EH.Int(roots[0]),
            degree: new EH.Int(1)
        })],
        complex: (roots) => [new SOH.PolExpTrig({
            exp_freq: new EH.Int(roots[0][0]),
            trig_freq: new EH.Int(Math.abs(roots[0][1]))
        })]
    },
    forms: {
        'zero': {
            und_pet_sum: () => [new SOH.PolExpTrig()],
            selectPolyCoefs: function(pet_obj) {
                pet_obj.polynom_c[0].value = new EH.Int(0);
            }
        },
        'constant': {
            und_pet_sum: () => [new SOH.PolExpTrig()],
            selectPolyCoefs: function(pet_obj) {
                pet_obj.polynom_c[0].value = new EH.Int(H.randIntExcept(-9, 9, 0));
            }
        },
        'et_alone': {
            und_pet_sum: () => new [SOH.PolExpTrig({
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
            und_pet_sum: () => new SOH.PolExpTrig({
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
            und_pet_sum: () => new SOH.PolExpTrig({
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
            und_pet_sum: () => new SOH.PolExpTrig({
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
            und_pet_sum: () => new SOH.PolExpTrig({
                exp_freq: new EH.Int(H.randIntExcept(-2, 2, 0)),
                trig_freq: new EH.Int(H.randInt(1, 2))
            }),
            selectCoefs: function(pet_obj) {
                pet_obj.polynom_c[0].value = new EH.Int(0);
                pet_obj.polynom_s[0].value = new EH.Int(1);
            }
        },
        'e_and_sin': {
            und_pet_sum: () => new SOH.PolExpTrig({
                exp_freq: new EH.Int(H.randIntExcept(-2, 2, 0)),
                trig_freq: new EH.Int(H.randInt(1, 2))
            }),
            selectCoefs: function(pet_obj) {
                pet_obj.polynom_s[0].value = new EH.Int(0);
                pet_obj.polynom_c[0].value = new EH.Int(1);
            }
        },
        'tn_and_e': {
            und_pet_sum: () => new SOH.PolExpTrig({
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
            und_pet_sum: () => new SOH.PolExpTrig({
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
            und_pet_sum: () => new SOH.PolExpTrig({
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
                    SOH.polynom_ops.scale(pet_obj.polynom_c, new EH.Int(-diffed_pet.trig_freq.value))
                )
            );

            diffed_pet.polynom_c = SOH.polynom_ops.add(
                SOH.polynom_ops.scale(pet_obj.polynom_c, pet_obj.exp_freq),
                SOH.polynom_ops.add(
                    SOH.polynom_ops.diff(pet_obj.polynom_c),
                   SOH.polynom_ops.scale(pet_obj.polynom_s, diffed_pet.trig_freq)
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
    determineCoefs: function(char_eq, y_p_pets, d_y_p_pets, dd_y_p_pets, f_t_pets) {
        // compute all scaled pet objs on the lhs (when y_p is substituted into the diff-eq)
        let all_lhs_pets = [y_p_pets, d_y_p_pets, dd_y_p_pets].map((pet_sum, term_idx) => {
            return pet_sum.map(pet_obj => {
                const clone_pet_obj = new SOH.PolExpTrig(pet_obj);

                ['polynom_c', 'polynom_s'].forEach(poly_key => {
                    clone_pet_obj[poly_key] = SOH.polynom_ops.scale(
                        pet_obj[poly_key],
                        new EH.Int(char_eq.coefs[String.fromCharCode(term_idx + 97)])
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
                const eq0_lhs = new EH.Sum(
                    poly_eq[0][i], 
                    new EH.Mul(new EH.Int(-1), poly_eq[1][i])
                );
                
                // assuming eq0_lhs is affine linear (aC1 + bC2 + ... + c), the row entries are determined as follows
                let curr_row_coefs = new Set();
                (function walkForCoefs(expr_tree) {
                    [expr_tree.operand1, expr_tree.operand2].forEach(operand => {
                        if (operand instanceof EH.Coef) {
                            if (!operand.has_value) curr_row_coefs.add(operand);
                        }
                        else if (operand instanceof EH.Oper) walkForCoefs(operand);
                    })
                })(eq0_lhs);
                curr_row_coefs = Array.from(curr_row_coefs);
                
                if (curr_row_coefs.length === 0) {
                    eq0_lhs.evaluate();
                    if (eq0_lhs.value.value === 0) continue; // skip redudant row
                    else throw new Error('Unsatisfyable equation found in coefficient system.');
                }
                else {
                    const zero_sub = eq0_lhs.subs(new Map(
                        curr_row_coefs.map(coef => [
                            coef, new EH.Int(0)
                        ])
                    ));
                    zero_sub.evaluate();
                    const shift_term = zero_sub.value; // c in (aC1 + bC2 + ... + c)
                    if (!(shift_term instanceof EH.Int)) throw new Error('Non-integer shift term found in coef system.');

                    const coef_scalar_map = new Map(); // C1 -> a, C2 -> b, ...
                    for (let coef_idx = 0; coef_idx < curr_row_coefs.length; coef_idx++) {
                        const curr_sub = eq0_lhs.subs(new Map(
                            curr_row_coefs.map((coef, idx) => [
                                coef, new EH.Int((idx === coef_idx)? 1 : 0)
                            ])
                        ));
                        curr_sub.evaluate();
                        if (!(curr_sub.value instanceof EH.Int)) throw new Error('Non-integer row entry found in coef system.');

                        coef_scalar_map.set(curr_row_coefs[coef_idx], curr_sub.value - shift_term.value);
                    }

                    const curr_row = [];
                    seen_coefs.forEach(seen_coef => {
                        if (coef_scalar_map.has(seen_coef)) {
                            curr_row.push(coef_scalar_map.get(seen_coef));
                            coef_scalar_map.delete(seen_coef);
                        }
                        else curr_row.push(0);
                    });

                    if (coef_scalar_map.size > 0) { // adjust for newly found coefs
                        const zero_pad = (new Array(coef_scalar_map.size)).fill(0);
                        coef_mtrx.forEach(row => row.splice(-1, 0, ...zero_pad));

                        coef_scalar_map.forEach((scalar, coef) => {
                            curr_row.push(scalar);
                            seen_coefs.push(coef);
                        });
                    }

                    curr_row.push(shift_term.value);
                    coef_mtrx.push(curr_row);
                }
            }
        });

        const rref_mtrx = LH.matrix_operations.rref(coef_mtrx); // returns matrix with rational entries, represented as [num, den]
        for (let i = 0; i < seen_coefs.length; i++) {
            const curr_mtrx_row = rref_mtrx[i];
            const curr_diag_entry = curr_mtrx_row[i];
            const curr_coef = seen_coefs[i];
            const curr_sol = curr_mtrx_row[curr_mtrx_row.length - 1];

            if (curr_diag_entry[0] === curr_diag_entry[1]) {
                if (curr_sol[0] % curr_sol[1] === 0) {
                    curr_coef.value = new EH.Int(curr_sol[0] / curr_sol[1]);
                }
                else curr_coef.value = new EH.Frac(curr_sol[0], curr_sol[1]);
            }
            else throw new Error('Coef system is inconsistent or is underdetermined.');
        }
    },
    allIntegerCoefs: function(y_p_pets) {
        return y_p_pets.every(pet_obj => (
            [pet_obj.polynom_c, pet_obj.polynom_s].every(polynom => (
                polynom.every(coef => coef.value instanceof EH.Int)
            ))
        ));
    },
    getHomoSolCvals: function(homo_sol_pets, root_type) {
        const cvals = {'C1': null, 'C2': null};

        if (root_type === 'real_dis') {
            cvals['C1'] = homo_sol_pets[0].polynom_c[0];
            cvals['C2'] = homo_sol_pets[1].polynom_c[0];
        }
        else if (root_type === 'real_rep') {
            cvals['C1'] = homo_sol_pets[0].polynom_c[0];
            cvals['C2'] = homo_sol_pets[0].polynom_c[1];
        }
        else if (root_type === 'complex') {
            cvals['C1'] = homo_sol_pets[0].polynom_s[0];
            cvals['C2'] = homo_sol_pets[0].polynom_c[0];
        }

        return cvals;
    },
    petSumAtZero: function(pet_sum) {
        let acc_expr = new EH.Sum(new EH.Int(0), new EH.Int(0));

        pet_sum.forEach(pet_obj => {
            acc_expr = new EH.Sum(acc_expr, pet_obj.polynom_c[0]);
        });

        return acc_expr;
    },
    pickSmallInitConds: function(cvals, y_0_expr, d_y_0_expr) {
        const coef_size = 5;
        const frac_weight = 4;
        const sample_size = 250;
        const selection_percentile = 20;
        
        const randSubs = () => new Map([
            [cvals['C1'], new EH.Int(H.randInt(-coef_size, coef_size))],
            [cvals['C2'], new EH.Int(H.randInt(-coef_size, coef_size))]
        ]);
        const subsScore = (y_0_value, d_y_0_value) => {
            const scoreValue = (val) => {
                if (val instanceof EH.Int) {
                    const abs_val = Math.abs(val.value);
                    
                    if (val.value < 0) return abs_val * 1.25;
                    else abs_val;
                }
                else if (val instanceof EH.Frac) {
                    const num_score = scoreValue(new EH.Int(val.num));
                    const den_score = scoreValue(new EH.Int(val.den));

                    return frac_weight * ( ( num_score + den_score ) / 2 );
                }
            }

            return Math.max(scoreValue(y_0_value), scoreValue(d_y_0_value));
        }

        const ordered_attempts = [];
        for (let i = 0; i < sample_size; i++) {
            const rand_subs = randSubs();
            const [y_0_value, d_y_0_value] = [
                y_0_expr, d_y_0_expr
            ].map(expr => {
                const subbed = expr.subs(rand_subs);
                subbed.evaluate();
                return subbed.value;
            })

            const curr_entry = [subsScore(y_0_value, d_y_0_value), rand_subs, [y_0_value, d_y_0_value]];
            
            if (ordered_attempts.length > 0) {
                if (curr_entry[0] <= ordered_attempts[0][0]) ordered_attempts.unshift(curr_entry);
                else if (curr_entry[0] >= ordered_attempts[ordered_attempts.length - 1][0]) ordered_attempts.push(curr_entry);
                else {
                    for (let j = 1; j < ordered_attempts.length; j++) {
                        if (curr_entry[0] < ordered_attempts[j][0]) {
                            ordered_attempts.splice(j, 0, curr_entry);
                            break;
                        }
                    }
                }
            }
            else ordered_attempts.unshift(curr_entry);
        }

        const cutoff = Math.max(1, Math.floor(ordered_attempts.length * (selection_percentile / 100)));
        const [final_subs, final_vals] = H.randFromList(ordered_attempts.slice(0, cutoff)).slice(1);

        cvals['C1'].value = final_subs.get(cvals['C1']);
        cvals['C2'].value = final_subs.get(cvals['C2']);

        return {
            'init_y_0': final_vals[0],
            'init_d_y_0': final_vals[1]
        };
    },
    pickZeroInitConds: function(cvals, y_0_expr, d_y_0_expr) {
        const exprSubsVal = (C1, C2) => {
            const subbed = init_expr.subs(new Map([
                [cvals['C1'], new EH.Int(C1)],
                [cvals['C2'], new EH.Int(C2)]
            ]));
            subbed.evaluate();

            return subbed.value;
        };
    
        // y^{(n)}(0)=aC1 + bC1 + c, below a, b, and c are found via substitution
        const coef_mtrx = [y_0_expr, d_y_0_expr].map(init_expr => {
            const c = exprSubsVal(0, 0);
            const a = exprSubsVal(1, 0) - c;
            const b = exprSubsVal(0, 1) - c;

            let den_acc = 1;
            return [a, b, c].map(rational_val => {
                if (rational_val instanceof EH.Int) {
                    return [rational_val.value, 1];
                }
                else if (rational_val instanceof EH.Frac) {
                    den_acc *= rational_val.denl;
                    return [rational_val.num, rational_val.den];
                }
            }).map(num_den => num_den[0] * den_acc);
        });

        const rref_mtrx = LH.matrix_operations.rref(coef_mtrx);

        ['C1', 'C2'].forEach((coef_id, idx) => {
            const [sol_num, sol_den] = rref_mtrx[idx][2];

            if (sol_num % sol_den === 0) {
                cvals[coef_id].value = new EH.Int(sol_num / sol_den);
            }
            else {
                cvals[coef_id].value = new EH.Frac(sol_num, sol_den);
            }
        });

        return {
            'init_y_0': new EH.Int(0),
            'init_d_y_0': new EH.Int(0)
        };
    },
    coef: (int) => Math.abs(int) === 1? String(int).replace('1', '') : String(int),
    polArrToString: function(pol_arr, variable) {
        let acc_str = '';

        for (let n = 0; n < pol_arr.length; n++) {
            const curr_coef = pol_arr[n];
            if (
                (curr_coef instanceof EH.Value) ||
                (curr_coef instanceof EH.Coef &&
                    (
                        curr_coef.has_value || curr_coef.has_symbol
                    )
                )
            ) {
                let coef_str = curr_coef.toString();

                let curr_term;
                if (coef_str === '0') curr_term = '';
                else if (n === 0) {
                    curr_term = coef_str;
                }
                else {
                    if (coef_str === '1') coef_str = '';
                    else if (coef_str === '-1') coef_str = '-';

                    curr_term = `${coef_str}${variable}${n > 1? `^{${n}}` : ''}`;
                }

                if (
                    acc_str !== '' &&
                    curr_term.length > 0 &&
                    curr_term.charAt(0) !== '-'
                ) {
                    acc_str += `+${curr_term}`;
                }
                else acc_str += curr_term;
            }
            else throw new Error('Entry in polynom array is not a Value or determined Coef.');
        }

        return acc_str? acc_str : '0';
    },
    petSumToString: function(pet_sum, variable) {
        let acc_str = '';

        pet_sum.map(pet_obj => {
            if (pet_obj.trig_freq.value !== 0) {
                let freq_coef = pet_obj.trig_freq.toString();
                if (freq_coef === '1') freq_coef = '';
                else if (freq_coef === '-1') freq_coef = '-';

                let sin_cos_expr = '';
                [
                    ['sin', pet_obj.polynom_s], 
                    ['cos', pet_obj.polynom_c]
                ].forEach(func_pol_pair => {
                    const [func_str, polynom_arr] = func_pol_pair;
                    let polynom_str = SOH.polArrToString(polynom_arr, variable);

                    if (polynom_str === '0') return;
                    else {
                        let curr_trig_term;
                        if (polynom_arr.filter(coef => coef.value?.value !== 0).length === 1) {
                            let t_n_coef = polynom_str.split(variable)[0];
                            polynom_str = polynom_str.replace(t_n_coef, '');
                            if (t_n_coef === '1') t_n_coef = '';
                            else if (t_n_coef === '-1') t_n_coef = '-';

                            curr_trig_term = `${t_n_coef}${polynom_str}\\${func_str}(${freq_coef}${variable})`;
                        }
                        else {
                            curr_trig_term = `(${polynom_str})\\${func_str}(${freq_coef}${variable})`;
                        }

                        if (sin_cos_expr !== '' && curr_trig_term.charAt(0) !== '-') {
                            sin_cos_expr += `+${curr_trig_term}`;
                        }
                        else sin_cos_expr += curr_trig_term;
                    }
                });

                if (sin_cos_expr === '') return '';
                else if (pet_obj.exp_freq.value !== 0) {
                    let exp_coef = pet_obj.exp_freq.toString();
                    if (exp_coef === '1') exp_coef = '';
                    else if (exp_coef === '-1') exp_coef = '-';

                    const exp_expr = `e^{${exp_coef}${variable}}`;
                    
                    const includes_sin = sin_cos_expr.includes('\\sin');
                    const includes_cos = sin_cos_expr.includes('\\cos');

                    if (includes_sin && includes_cos) {
                        return `${exp_expr}(${sin_cos_expr})`;
                    }
                    else {
                        const included_trig = includes_sin? '\\sin' : '\\cos';
                        const [pre_trig, post_trig] = sin_cos_expr.split(included_trig, 2);
                        const trig_alone = `${included_trig}${post_trig}`;

                        return `${pre_trig}${exp_expr}${trig_alone}`;
                    }
                }
                else return sin_cos_expr;
            }
            else {
                let polynom_str = SOH.polArrToString(pet_obj.polynom_c, variable);

                if (polynom_str === '0') return '';
                else if (pet_obj.exp_freq.value !== 0) {
                    let exp_coef = pet_obj.exp_freq.toString();
                    if (exp_coef === '1') exp_coef = '';
                    else if (exp_coef === '-1') exp_coef = '-';

                    const exp_expr = `e^{${exp_coef}${variable}}`;

                    if (pet_obj.polynom_c.filter(coef => coef.value?.value !== 0).length === 1) {
                        let t_n_coef = polynom_str.split(variable)[0];
                        polynom_str = polynom_str.replace(t_n_coef, '');
                        if (t_n_coef === '1') t_n_coef = '';
                        else if (t_n_coef === '-1') t_n_coef = '-';

                        return `${t_n_coef}${polynom_str}${exp_expr}`;
                    }
                    else {
                        return `${exp_expr}(${polynom_str})`;
                    }
                }
                else return polynom_str;
            }
        }).forEach(single_pet_str => {
            if (
                acc_str !== '' && 
                single_pet_str.length > 0 &&
                single_pet_str.charAt(0) !== '-'
            ) {
                acc_str += `+${single_pet_str}`;
            }
            else acc_str += single_pet_str;
        });

        return acc_str? acc_str : '0';
    }
};
export default function genSecOrd(settings) {
    const root_size = {'real_dis': 6, 'real_rep': 8, 'complex': 4}[settings.sec_ord_roots];
    const allow_b_term = (settings.sec_ord_b_term === 'zero')? false : true;

    const resoCheckAndAdjust = {
        'prefer': SOH.adjustForReso, 
        'allow': () => true, 
        'avoid': (...args) => !SOH.adjustForReso(...args)
    }[settings.sec_ord_reso];

    // search loop to match resonance preference and find clean numbers in the y_p coefs
    const resonance_attempts = 2_500;
    const y_p_coef_attempts = 10_000;
    let current_attempts = 0;
    let char_eq, f_t_pets, y_h_pets, y_p_pets, y_sol_pets, cvals, init_vals;
    while (true) {
        current_attempts++;

        char_eq = SOH.createCharEq(settings.sec_ord_roots, root_size, allow_b_term);
        y_h_pets = SOH.homo_sols[settings.sec_ord_roots](char_eq.roots);
        f_t_pets = SOH.forms[settings.force_func_form].und_pet_sum();
        y_p_pets = f_t_pets.map(pet_obj => new SOH.PolExpTrig(pet_obj));
        SOH.forms[settings.force_func_form].selectPolyCoefs(f_t_pets.length > 1? f_t_pets : f_t_pets[0]);
        
        if (current_attempts < resonance_attempts && !resoCheckAndAdjust(y_h_pets, y_p_pets)) continue;

        const d_y_p_pets = SOH.diffPetSum(y_p_pets);
        const dd_y_p_pets = SOH.diffPetSum(d_y_p_pets);
        SOH.determineCoefs(char_eq, y_p_pets, d_y_p_pets, dd_y_p_pets, f_t_pets);
        const all_int_coefs = SOH.allIntegerCoefs(y_p_pets);

        if (current_attempts < y_p_coef_attempts && !all_int_coefs) continue;

        y_sol_pets = [...y_h_pets, ...y_p_pets];
        cvals = SOH.getHomoSolCvals(y_h_pets, settings.sec_ord_roots);
        if (settings.diff_initcond === 'yes') {
            const y_0_expr = SOH.petSumAtZero(y_sol_pets);
            const d_y_sol_pets = SOH.diffPetSum(y_sol_pets);
            const d_y_0_expr = SOH.petSumAtZero(d_y_sol_pets);
            if (settings.force_zero_inits === 'yes') {
                init_vals = SOH.pickZeroInitConds(cvals, y_0_expr, d_y_0_expr);
            }
            else init_vals = SOH.pickSmallInitConds(cvals, y_0_expr, d_y_0_expr);
        }
        
        break;
    }

    // question and answer string building
    const [ind_var, dep_var] = settings.diff_eq_vars.split('_');
    let unk = ind_var;

    let d_unk, dd_unk;
    if (settings.diff_notation === 'dot') {
        d_unk = `\\dot{${unk}}`;
        dd_unk = `\\ddot{${unk}}`;
    }
    else if (settings.diff_notation === 'prime') {
        d_unk = `${unk}'`;
        dd_unk = `${unk}''`;
    }
    else if (settings.diff_notation === 'frac') {
        d_unk = `\\frac{d${unk}}{d${dep_var}}`;
        dd_unk = `\\frac{d^{2}${unk}}{d${dep_var}^{2}}`;
    }

    if (settings.func_notation === 'explicit') [unk, d_unk, dd_unk] = [
        unk, d_unk, dd_unk
    ].map(v => `${v}(${dep_var})`);

    let prompt_lhs = '';
    [
        [char_eq.coefs.a, dd_unk],
        [char_eq.coefs.b, d_unk],
        [char_eq.coefs.c, unk]
    ].forEach(coef_vari_pair => {
        const [coef, vari] = coef_vari_pair;

        let term;
        if (coef === 0) term = '';
        else if (Math.abs(coef) === 1) term = `${String(coef).replace('1', '')}${vari}`;
        else term = `${String(coef)}${vari}`;

        if (
            prompt_lhs !== '' && 
            term.length > 0 &&
            term.charAt(0) !== '-'
        ) prompt_lhs += `+${term}`;
        else prompt_lhs += term;
    });
    if (prompt_lhs === '') prompt_lhs = '0';

    const prompt_eq = `${prompt_lhs}=${SOH.petSumToString(f_t_pets, dep_var)}`;
    let question_str;
    if (settings.diff_initcond === 'yes') {
        const [init_unk, init_d_unk] = [
            [unk, init_vals.init_y_0], 
            [d_unk, init_vals.init_d_y_0]
        ].map(unk_val_pair => {
            const [unk_symbol, unk_val] = unk_val_pair;
            return `${unk_symbol.replace(`(${dep_var})`, '')}(0)=${unk_val.toString()}`;
        });

        question_str = `${prompt_eq} , \\quad ${init_unk} , ~ ${init_d_unk}`;
    }
    else if (settings.diff_initcond === 'no') {
        question_str = prompt_eq;

        cvals['C1'].symbol = 'C_{1}';
        cvals['C2'].symbol = 'C_{2}';
    }

    const answer_str = `${unk}=${SOH.petSumToString(y_sol_pets, dep_var)}`;

    console.log('Settings:', JSON.stringify(settings))
    console.log('Gen Output:', JSON.stringify({
        question: question_str,
        answer: answer_str
    }))

    return {
        question: question_str,
        answer: answer_str
    };
}

export const settings_fields = [
    'sec_ord_roots',
    'force_func_form',
    'diff_initcond',
    'diff_eq_vars',
    'sec_ord_reso',
    'sec_ord_b_term',
    'func_notation',
    'diff_notation',
    'force_zero_inits'
];

export const presets = {
    default: function() {
        return {
            sec_ord_roots: 'real_dis',
            force_func_form: 'zero',
            diff_initcond: 'no',
            diff_eq_vars: 'y_t',
            sec_ord_reso: 'allow',
            sec_ord_b_term: 'rand',
            func_notation: 'implicit',
            diff_notation: 'prime',
            force_zero_inits: 'no'
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

// const genFunc = (await import('/scripts/math-gens/gens/genSecOrd.js')).default
