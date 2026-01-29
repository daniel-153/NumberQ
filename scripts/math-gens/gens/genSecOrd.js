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
    homo_sols: {
        real_dis: function(roots) { // only sol component allowed to be more than one PolExpTrig
            const homo_sol = new EH.PolExpTrigArray(
                new EH.PolExpTrig({
                    exp_freq: new EH.Int(roots[0]), 
                }),
                new EH.PolExpTrig({
                    exp_freq: new EH.Int(roots[1]), 
                })
            );

            return {
                homo_sol,
                cvals: {
                    'C1': homo_sol[0].polynom_c[0],
                    'C2': homo_sol[1].polynom_c[0]
                }
            };
        },
        real_rep: function(roots) {
            const homo_sol = new EH.PolExpTrig({
                exp_freq: new EH.Int(roots[0]),
                degree: new EH.Int(1)
            });

            return {
                homo_sol,
                cvals: {
                    'C1': homo_sol.polynom_c[0],
                    'C2': homo_sol.polynom_c[1]
                }
            };
        },
        complex: function(roots) {
            const homo_sol = new EH.PolExpTrig({
                exp_freq: new EH.Int(roots[0][0]),
                trig_freq: new EH.Int(Math.abs(roots[0][1]))
            });

            return {
                homo_sol,
                cvals: {
                    'C1': homo_sol.polynom_s[0],
                    'C2': homo_sol.polynom_c[0]
                }
            };
        }
    },
    forcing_forms: { // each form must be a single PolExpTrig (no PolExpTrigArrays)
        'zero': {
            undPetObj: () => new EH.PolExpTrig(),
            selectPolyCoefs: function(pet_obj) {
                pet_obj.polynom_c[0].value = new EH.Int(0);
            }
        },
        'constant': {
            undPetObj: () => new EH.PolExpTrig(),
            selectPolyCoefs: function(pet_obj) {
                pet_obj.polynom_c[0].value = new EH.Int(H.randIntExcept(-9, 9, 0));
            }
        },
        'et_alone': {
            undPetObj: () => new EH.PolExpTrig({
                exp_freq: new EH.Int(H.randIntExcept(-4, 4, 0))
            }),
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
            undPetObj: () => new EH.PolExpTrig({
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
        'cos_alone': {
            undPetObj: () => new EH.PolExpTrig({
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
            undPetObj: () => new EH.PolExpTrig({
                degree: new EH.Int(H.randInt(1, 2))
            }),
            selectPolyCoefs: function(pet_obj) {
                pet_obj.polynom_c[pet_obj.degree.value].value = new EH.Int(H.randIntExcept(-3, 3, 0));

                for (let i = 0; i < pet_obj.degree.value; i++) {
                    pet_obj.polynom_c[i].value = new EH.Int(0);
                }
            }
        },
        'e_and_sin': {
            undPetObj: () => new EH.PolExpTrig({
                exp_freq: new EH.Int(H.randIntExcept(-2, 2, 0)),
                trig_freq: new EH.Int(H.randInt(1, 2))
            }),
            selectPolyCoefs: function(pet_obj) {
                pet_obj.polynom_c[0].value = new EH.Int(0);
                pet_obj.polynom_s[0].value = new EH.Int(1);
            }
        },
        'e_and_cos': {
            undPetObj: () => new EH.PolExpTrig({
                exp_freq: new EH.Int(H.randIntExcept(-2, 2, 0)),
                trig_freq: new EH.Int(H.randInt(1, 2))
            }),
            selectPolyCoefs: function(pet_obj) {
                pet_obj.polynom_s[0].value = new EH.Int(0);
                pet_obj.polynom_c[0].value = new EH.Int(1);
            }
        },
        'tn_and_e': {
            undPetObj: () => new EH.PolExpTrig({
                exp_freq: new EH.Int(H.randIntExcept(-3, 3, 0)),
                degree: new EH.Int(H.randInt(1, 2))
            }),
            selectPolyCoefs: function(pet_obj) {
                pet_obj.polynom_c[pet_obj.degree.value].value = new EH.Int(1);

                for (let i = 0; i < pet_obj.degree.value; i++) {
                    pet_obj.polynom_c[i].value = new EH.Int(0);
                }
            }
        }
    },
    createCharEq: function(type, allow_b_term, reso_pref, forcing_pet) {
        const root_size = {'real_dis': 6, 'real_rep': 8, 'complex': 4}[type];
        const char_eq = {
            coefs: {a: 1, b: null, c: null},
            type: type,
            roots: []
        };

        if (type === 'real_dis') {
            if (
                forcing_pet.trig_freq.value !== 0 &&
                forcing_pet.polynom_c[0].value !== 0
            ) { // reso possible
                if (allow_b_term) {
                    if (reso_pref === 'prefer') {
                        char_eq.roots[0] = forcing_pet.exp_freq.value;
                        char_eq.roots[1] = H.randIntExcept(-root_size, root_size, char_eq.roots[0]);
                    }
                    else if (reso_pref === 'allow') {
                        char_eq.roots[0] = H.randInt(-root_size, root_size);
                        char_eq.roots[1] = H.randIntExcept(-root_size, root_size, char_eq.roots[0]);
                    }
                    else if (reso_pref === 'avoid') {
                        char_eq.roots[0] = H.randIntExcept(-root_size, root_size, forcing_pet.exp_freq.value);
                        char_eq.roots[1] = H.randIntExcept(-root_size, root_size, forcing_pet.exp_freq.value);
                        if (char_eq.roots[0] === char_eq.roots[1]) char_eq.roots[1] += ((-1)**H.randInt(0, 1));
                    }
                }
                else {
                    let r;
                    if (reso_pref === 'prefer') {
                        if (forcing_pet.exp_freq.value !== 0) r = Math.abs(forcing_pet.exp_freq.value);
                        else r = H.randInt(1, root_size);
                    }
                    else if (reso_pref === 'allow') r = H.randInt(1, root_size);
                    else if (reso_pref === 'avoid') r = H.randIntExcept(1, root_size, Math.abs(forcing_pet.exp_freq.value));

                    char_eq.roots = [-r, r];
                }
            }
            else { // reso not possible
                if (allow_b_term) {
                    const r1 = H.randInt(-root_size, root_size);
                    const r2 = H.randIntExcept(-root_size, root_size, r1);
                    char_eq.roots = [r1, r2];
                }
                else {
                    const r = H.randInt(1, root_size);
                    char_eq.roots = [-r, r];
                }
            }
            
            char_eq.coefs.b = -(char_eq.roots[0] + char_eq.roots[1]);
            char_eq.coefs.c = char_eq.roots[0]*char_eq.roots[1];
        }
        else if (type === 'real_rep') { // by settings validation b_term must be allowed here
            let root;
            if (
                forcing_pet.trig_freq.value === 0 &&
                (
                    forcing_pet.polynom_c[0].value !== 0 ||
                    forcing_pet.polynom_c[1].value !== 0
                )
            ) { // reso possible
                if (reso_pref === 'prefer') root = forcing_pet.exp_freq.value;
                else if (reso_pref === 'allow') root = (H.randInt(1, 20) === 1)? 0 : H.randIntExcept(-root_size, root_size, 0);
                else if (reso_pref === 'avoid') root = H.randIntExcept(-root_size, root_size, forcing_pet.exp_freq.value);
            }
            else { // reso not possible
                root = (H.randInt(1, 20) === 1)? 0 : H.randIntExcept(-root_size, root_size, 0);
            }

            char_eq.roots = [root, root];
            char_eq.coefs.b = (-2) * root;
            char_eq.coefs.c = root**2;
        }
        else if (type === 'complex') {
            let re, im;
            if (
                forcing_pet.trig_freq.value !== 0 &&
                (
                    forcing_pet.polynom_c[0].value !== 0 ||
                    forcing_pet.polynom_s[0].value !== 0
                )
            ) { // reso possible
                if (allow_b_term) {
                    if (reso_pref === 'prefer') {
                        re = forcing_pet.exp_freq.value;
                        im = forcing_pet.trig_freq.value;
                    }
                    else if (reso_pref === 'allow') {
                        re = H.randInt(-root_size, root_size);
                        im = H.randInt(1, root_size);
                    }
                    else if (reso_pref === 'avoid') {
                        if (H.randInt(0, 1)) {
                            re = H.randIntExcept(-root_size, root_size, forcing_pet.exp_freq.value);
                            im = H.randInt(1, root_size);
                        }
                        else {
                            re = H.randInt(-root_size, root_size);
                            im = H.randIntExcept(1, root_size, Math.abs(forcing_pet.trig_freq.value));
                        }
                    }
                }
                else {
                    re = 0;
                    if (reso_pref === 'prefer') im = forcing_pet.trig_freq.value;
                    else if (reso_pref === 'allow') im = H.randInt(1, root_size);
                    else if (reso_pref === 'avoid') im = H.randIntExcept(1, root_size, Math.abs(forcing_pet.trig_freq.value));
                }
            }
            else { // reso not possible
                if (allow_b_term) {
                    re = H.randInt(-root_size, root_size);
                    im = H.randInt(1, root_size);
                }
                else {
                    re = 0;
                    im = H.randInt(1, root_size);
                }
            }

            char_eq.roots = [[re, im], [re, -im]];
            char_eq.coefs.b = (-2)*re;
            char_eq.coefs.c = re**2 + im**2;
        }

        return char_eq;
    },
    adjustedForReso: function(y_p_pet, y_h_pet, forcing_pet) {
        if (
            y_h_pet instanceof EH.PolExpTrigArray &&
            y_h_pet.length === 2 &&
            y_p_pet instanceof EH.PolExpTrig
        ) {
            if (
                y_h_pet[0].exp_freq.value === y_p_pet.exp_freq.value &&
                y_h_pet[0].trig_freq.value === y_p_pet.trig_freq.value
            ) {
                return SOH.adjustedForReso(y_p_pet, y_h_pet[0], forcing_pet);
            }
            else if (
                y_h_pet[1].exp_freq.value === y_p_pet.exp_freq.value &&
                y_h_pet[1].trig_freq.value === y_p_pet.trig_freq.value
            ) {
                return SOH.adjustedForReso(y_p_pet, y_h_pet[1], forcing_pet);
            }
            else return y_p_pet;
        }
        else if (
            y_h_pet instanceof EH.PolExpTrig &&
            y_p_pet instanceof EH.PolExpTrig
        ) {
            if (
                y_h_pet.exp_freq.value === y_p_pet.exp_freq.value && 
                y_h_pet.trig_freq.value === y_p_pet.trig_freq.value &&
                y_p_pet.degree.value < forcing_pet.degree.value + y_h_pet.degree.value + 1
            ) {
                const adjusted_pet = new EH.PolExpTrig({
                    exp_freq: y_p_pet.exp_freq,
                    trig_freq: y_p_pet.trig_freq,
                    degree: new EH.Int(forcing_pet.degree.value + y_h_pet.degree.value + 1)
                });

                const deg_increase = adjusted_pet.degree.value - y_p_pet.degree.value;
                for (let i = 0; i < deg_increase; i++) {
                    adjusted_pet.polynom_c[i].value = new EH.Int(0);
                    if (adjusted_pet.trig_freq.value !== 0) {
                        adjusted_pet.polynom_s[i].value = new EH.Int(0);
                    }
                }

                return adjusted_pet;
            } 
            else return y_p_pet;
        }   
        else throw new Error('Invalid forcing pet or y_p pet in resonance adjustment.');
    },
    determineCoefs: function(y_p_pet, forcing_pet, char_eq) {
        if (
            !(y_p_pet instanceof EH.PolExpTrig) ||
            !(forcing_pet instanceof EH.PolExpTrig) 
        ) throw new Error('y_p and forcing pet are not single PolExpTrig instances.');
        else if (
            y_p_pet.exp_freq.value !== forcing_pet.exp_freq.value ||
            y_p_pet.trig_freq.value !== forcing_pet.trig_freq.value
        ) throw new Error('y_p and forcing pet do not have matching frequencies.');
        else if (
            y_p_pet.degree.value < forcing_pet.degree.value
        ) throw new Error('y_p degree is less than that of the forcing function.');
        
        const d_y_p_pet = EH.PolExpTrig.diff(y_p_pet);
        const dd_y_p_pet = EH.PolExpTrig.diff(d_y_p_pet);

        const eqs_to_0 =[];
        for (let i = 0; i < y_p_pet.degree.value + 1; i++) {
            ['polynom_c', 'polynom_s'].forEach(poly_key => {
                eqs_to_0.push(
                    new EH.Sum(
                        new EH.Mul(new EH.Int(char_eq.coefs.a), dd_y_p_pet[poly_key][i]),
                        new EH.Sum(
                            new EH.Mul(new EH.Int(char_eq.coefs.b), d_y_p_pet[poly_key][i]),
                            new EH.Sum(
                                new EH.Mul(new EH.Int(char_eq.coefs.c), y_p_pet[poly_key][i]),
                                new EH.Mul(new EH.Int(-1), forcing_pet[poly_key][i] ?? new EH.Int(0))
                            )
                        )
                    )
                );
            });
        }

        const coef_mtrx = [];
        const seen_coefs = new Set();
        const aug_col = [];
        let max_row_len = 0;
        eqs_to_0.forEach(eq_to_0 => {
            const curr_coefs = new Set();
            (function walkForCoefs(expr_tree) {
                [expr_tree.operand1, expr_tree.operand2].forEach(operand => {
                    if (operand instanceof EH.Coef) {
                        if (!operand.has_value) curr_coefs.add(operand);
                    }
                    else if (operand instanceof EH.Oper) walkForCoefs(operand);
                })
            })(eq_to_0);
            if (curr_coefs.size === 0) {
                eq_to_0.evaluate();
                if (eq_to_0.value instanceof EH.Int && eq_to_0.value.value === 0) return;
                else throw new Error('False equation encountered in coef system.');
            }
            const coef_map = new Map(Array.from(curr_coefs, (coef) => [coef, new EH.Int(0)]));

            const zero_subbed = eq_to_0.subs(coef_map);
            zero_subbed.evaluate();
            if (zero_subbed.value instanceof EH.Int) aug_col.push(-zero_subbed.value.value);
            else throw new Error('Value on rhs of system equation is a non-integer');
            const lin_comb_coefs = new EH.Sum(eq_to_0, new EH.Int(-zero_subbed.value.value));

            const curr_row = [];
            seen_coefs.forEach(seen_coef => {
                if (coef_map.has(seen_coef)) {
                    coef_map.set(seen_coef, new EH.Int(1));

                    const curr_sub = lin_comb_coefs.subs(coef_map);
                    curr_sub.evaluate();
                    if (curr_sub.value instanceof EH.Int) curr_row.push(curr_sub.value.value);
                    else throw new Error('Coef of variable in system is a non-integer');
                    curr_coefs.delete(seen_coef);

                    coef_map.set(seen_coef, new EH.Int(0));
                }
                else curr_row.push(0);
            });
            curr_coefs.forEach(new_coef => {
                coef_map.set(new_coef, new EH.Int(1));

                const curr_sub = lin_comb_coefs.subs(coef_map);
                curr_sub.evaluate();
                if (curr_sub.value instanceof EH.Int) curr_row.push(curr_sub.value.value);
                else throw new Error('Coef of variable in system is a non-integer');
                seen_coefs.add(new_coef);
                
                coef_map.set(new_coef, new EH.Int(0));
            });

            max_row_len = Math.max(curr_row.length, max_row_len);
            coef_mtrx.push(curr_row);
        });

        // norm row lengths for zero coefs and add augment entries
        coef_mtrx.forEach((row, idx) => {
            if (row.length < max_row_len) {
                const zero_pad = Array.from({length: max_row_len - row.length}, () => 0);
                Array.prototype.push.apply(row, zero_pad);
            }
            row.push(aug_col[idx]);
        });

        const rref_mtrx = LH.matrix_operations.rref(coef_mtrx); // returns matrix with rational entries, represented as [num, den]
        if (rref_mtrx.length < seen_coefs.size) throw new Error('RREF matrix contains fewer rows than expeceted.');
        const coefs_iter = seen_coefs.values();
        const free_coefs = [];
        let col_offset = 0;
        for (let row_idx = 0; row_idx < seen_coefs.size; row_idx++) {
            const curr_mtrx_row = rref_mtrx[row_idx];
            if (curr_mtrx_row.length !== seen_coefs.size + 1) throw new Error('RREF matrix row size error.');
            const curr_diag_entry = curr_mtrx_row[row_idx + col_offset];
            let curr_coef = coefs_iter.next().value;
            
            // traverse rightward if a zero diagonal entry is encountered
            if (curr_diag_entry[0]/curr_diag_entry[1] === 0) {
                let col_idx = row_idx + col_offset;
                while (
                    col_idx < seen_coefs.size &&
                    (curr_mtrx_row[col_idx][0]/curr_mtrx_row[col_idx][1] === 0)
                ) {
                    free_coefs.push(curr_coef);
                    curr_coef = coefs_iter.next().value;
                    col_idx++;
                }
                col_offset = col_idx - row_idx;

                if (col_idx === seen_coefs.size) { // loop terminated on zero entry prior to augment col
                    if (curr_mtrx_row[col_idx][0]/curr_mtrx_row[col_idx][1] === 0) break;
                    else throw new Error('Coef system is inconsistent.');
                }
            }

            const curr_sol = curr_mtrx_row[curr_mtrx_row.length - 1];
            if (curr_sol[0] % curr_sol[1] === 0) {
                curr_coef.value = new EH.Int(curr_sol[0] / curr_sol[1]);
            }
            else curr_coef.value = new EH.Frac(curr_sol[0], curr_sol[1]);
        }
        free_coefs.forEach(coef => coef.value = new EH.Int(0));
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
                    else return abs_val;
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
            init_y: final_vals[0],
            init_d_y: final_vals[1]
        };
    },
    pickZeroInitConds: function(cvals, y_0_expr, d_y_0_expr) {
        const exprSubsVal = (init_expr, C1, C2) => {
            const subbed = init_expr.subs(new Map([
                [cvals['C1'], new EH.Int(C1)],
                [cvals['C2'], new EH.Int(C2)]
            ]));
            subbed.evaluate();

            return subbed.value;
        };
        const subVals = (val1, val2) => {
            const [n1, d1] = val1 instanceof EH.Frac ? [val1.num, val1.den] : [val1.value, 1];
            const [n2, d2] = val2 instanceof EH.Frac ? [val2.num, val2.den] : [val2.value, 1];
            const num = n1 * d2 - n2 * d1;
            const den = d1 * d2;
            if (num % den === 0) return new EH.Int(num / den);
            return new EH.Frac(num, den);
        };
    
        // y^{(n)}(0)=aC1 + bC1 + c, below a, b, and c are found via substitution
        const coef_mtrx = [y_0_expr, d_y_0_expr].map(init_expr => {
            const c = exprSubsVal(init_expr, 0, 0);
            const a = subVals(exprSubsVal(init_expr, 1, 0), c);
            const b = subVals(exprSubsVal(init_expr, 0, 1), c);

            let den_acc = 1;
            const num_den_pairs = [a, b, c].map(rational_val => {
                if (rational_val instanceof EH.Int) {
                    return [rational_val.value, 1];
                }
                else if (rational_val instanceof EH.Frac) {
                    den_acc *= rational_val.den;
                    return [rational_val.num, rational_val.den];
                }
            });

            return num_den_pairs.map(([num, den], idx) => num * (den_acc / den) * (idx === 2? -1 : 1));
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
            init_y: new EH.Int(0),
            init_d_y: new EH.Int(0)
        };
    },
    buildVarSymbols: function(settings) {
        let [unknown, time_var] = settings.diff_eq_vars.split('_');

        let d_unknown, dd_unknown;
        if (settings.diff_notation === 'dot') {
            d_unknown = `\\dot{${unknown}}`;
            dd_unknown = `\\ddot{${unknown}}`;
        }
        else if (settings.diff_notation === 'prime') {
            d_unknown = `${unknown}'`;
            dd_unknown = `${unknown}''`;
        }
        else if (settings.diff_notation === 'frac') {
            d_unknown = `\\frac{d${unknown}}{d${time_var}}`;
            dd_unknown = `\\frac{d^{2}${unknown}}{d${time_var}^{2}}`;
        }

        if (settings.func_notation === 'explicit') [unknown, d_unknown, dd_unknown] = [
            unknown, d_unknown, dd_unknown
        ].map(v => `${v}(${time_var})`);

        return {time_var, unknown, d_unknown, dd_unknown};
    },
    buildPromptEq: function(char_eq, var_symbols, forcing_pet) {
        let prompt_lhs = '';
        [
            [char_eq.coefs.a, var_symbols.dd_unknown],
            [char_eq.coefs.b, var_symbols.d_unknown],
            [char_eq.coefs.c, var_symbols.unknown]
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

        return `${prompt_lhs}=${forcing_pet.toString(var_symbols.time_var)}`;
    },
    buildAnswerEq: function(ans_pet_arr, var_symbols) {
        return `${var_symbols.unknown}=${ans_pet_arr.toString(var_symbols.time_var)}`;
    },
    buildInitConds: function(settings, var_symbols, init_y, init_d_y) {
        if (settings.diff_initcond === 'yes') {
            const [init_unk, init_d_unk] = [
                [var_symbols.unknown, init_y], 
                [var_symbols.d_unknown, init_d_y]
            ].map(unk_val_pair => {
                const [unk_symbol, unk_val] = unk_val_pair;
                return `${unk_symbol.replace(`(${var_symbols.time_var})`, '')}(0)=${unk_val.toString()}`;
            });

            return `${init_unk} , ~ ${init_d_unk}`;
        }
        else if (settings.diff_initcond === 'no') {
            return '';
        } 
    },
    formatPrompt: function(prompt_eq, init_addon, settings) {
        if (settings.diff_initcond === 'no' || init_addon.length === 0) return prompt_eq;
        else {
            return `\\begin{array}{c} ${prompt_eq}, \\\\ ${init_addon} \\end{array}`;
        }
    }
};
export default function genSecOrd(settings) {
    const forcing_pet = SOH.forcing_forms[settings.force_func_form].undPetObj();
    SOH.forcing_forms[settings.force_func_form].selectPolyCoefs(forcing_pet);
    
    const char_eq = SOH.createCharEq(
        settings.sec_ord_roots, 
        (settings.sec_ord_b_term === 'zero')? false : true, 
        settings.sec_ord_reso,
        forcing_pet
    );
    const {homo_sol, cvals} = SOH.homo_sols[settings.sec_ord_roots](char_eq.roots);

    const y_p_pet = SOH.adjustedForReso(new EH.PolExpTrig({
        exp_freq: forcing_pet.exp_freq, 
        trig_freq: forcing_pet.trig_freq, 
        degree: forcing_pet.degree
    }), homo_sol, forcing_pet);
    SOH.determineCoefs(y_p_pet, forcing_pet, char_eq);

    let y_sol_petarr;
    if (homo_sol instanceof EH.PolExpTrigArray) {
        y_sol_petarr = new EH.PolExpTrigArray(...homo_sol, y_p_pet);
    }
    else y_sol_petarr = new EH.PolExpTrigArray(homo_sol, y_p_pet);

    let init_y, init_d_y;
    if (settings.diff_initcond === 'yes') {
        const y_0_expr = y_sol_petarr.exprAtZero();
        const d_y_0_expr = EH.PolExpTrigArray.diff(y_sol_petarr).exprAtZero();
        if (settings.force_zero_inits === 'yes') {
            ({init_y, init_d_y} = SOH.pickZeroInitConds(cvals, y_0_expr, d_y_0_expr));
        }
        else ({init_y, init_d_y} = SOH.pickSmallInitConds(cvals, y_0_expr, d_y_0_expr));
    }
    else {
        cvals['C1'].symbol = 'C_{1}';
        cvals['C2'].symbol = 'C_{2}';
    }
    
    const var_symbols = SOH.buildVarSymbols(settings);
    const prompt_eq = SOH.buildPromptEq(char_eq, var_symbols, forcing_pet);
    const init_addon = SOH.buildInitConds(settings, var_symbols, init_y, init_d_y);
    const question_str = SOH.formatPrompt(prompt_eq, init_addon, settings);
    const answer_str = SOH.buildAnswerEq(y_sol_petarr, var_symbols);
    
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