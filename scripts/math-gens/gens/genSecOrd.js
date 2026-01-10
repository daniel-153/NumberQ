import * as H from '../helpers/gen-helpers.js';

export function validateSettings(form_obj, error_locations) {
    if (form_obj.diff_notation === 'frac') form_obj.func_notation = 'implicit';

    if (form_obj.sec_ord_roots === 'real_rep') form_obj.sec_ord_b_term = 'rand';
}

const SOH = { // genSecOrd helpers
    Int: class {
        constructor(int) {
            this.value = int;
        }
    },
    Frac: class {        
        constructor(num, den) {
            this.num = num;
            this.den = den;
        }
    },
    Coef: class {
        constructor(tex, value) {
            this.tex = tex;
            this.value = value;
        }
    },
    PolExpTrig: class {
        field_info = [
            {
                field: 'degree',
                valid_types: [SOH.Int],
                default: {constructor: SOH.Int, args: [0]}
            },
            {
                field: 'exp_freq',
                valid_types: [SOH.Int],
                default: {constructor: SOH.Int, args: [0]}
            },
            {
                field: 'trig_freq',
                valid_types: [SOH.Int],
                default: {constructor: SOH.Int, args: [0]}
            }
        ];
        
        constructor(pet_obj = {}) {
            this.field_info.forEach(field_entry => {
                if (Object.prototype.hasOwnProperty.call(pet_obj, field_entry.field)) {
                    const supplied_value = pet_obj[field_entry.field];

                    if (field_entry.valid_types.some(type => supplied_value instanceof type)) {
                        this[field_entry.field] = supplied_value;
                    }
                    else {
                        throw new Error(`Invalid PolExpTrig, '${supplied_value}' type of '${typeof(supplied_value)}' is not a valid type for field '${field_entry.field}'.`)
                    }
                }
                else {
                    this[field_entry.field] = new field_entry.default.constructor(...field_entry.default.args);
                }
            });
            
            const build_polynom = () => (new Array(this.degree + 1)).fill(null).map(_ => new SOH.Coef());
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
            new SOH.PolExpTrig({
                exp_freq: new SOH.Int(roots[0])
            }),
            new SOH.PolExpTrig({
                exp_freq: new SOH.Int(roots[1])
            })
        ],
        real_rep: (roots) => [new SOH.PolExpTrig({
            exp_freq: new SOH.Int(roots[0]),
            degree: new SOH.Int(1)
        })],
        complex: (roots) => [new SOH.PolExpTrig({
            exp_freq: new SOH.Int(roots[0][0]),
            trig_freq: new SOH.Int(Math.abs(roots[0][1]))
        })]
    },
    forms: {
        'zero': {
            und_pet_sum: () => [new SOH.PolExpTrig()],
            selectPolyCoefs: function(pet_obj) {
                pet_obj.polynom_c[0].value = new SOH.Int(0);
            }
        },
        'constant': {
            und_pet_sum: () => [new SOH.PolExpTrig()],
            selectPolyCoefs: function(pet_obj) {
                pet_obj.polynom_c[0].value = new SOH.Int(H.randIntExcept(-9, 9, 0));
            }
        },
        'et_alone': {
            und_pet_sum: () => new [SOH.PolExpTrig({
                exp_freq: new SOH.Int(H.randIntExcept(-4, 4, 0))
            })],
            selectPolyCoefs: function(pet_obj) {
                if (H.randInt(0, 1)) {
                    pet_obj.polynom_c[0].value = new SOH.Int(1);
                }
                else {
                    pet_obj.polynom_c[0].value = new SOH.Int(H.randIntExcept(-3, 3, 0));
                }
            }
        },
        'sin_alone': {
            und_pet_sum: () => new SOH.PolExpTrig({
                trig_freq: new SOH.Int(H.randInt(1, 3))
            }),
            selectPolyCoefs: function(pet_obj) {
                pet_obj.polynom_c[0].value = new SOH.Int(0);
                
                if (H.randInt(0, 1)) {
                    pet_obj.polynom_s[0].value = new SOH.Int(1);
                }
                else {
                    pet_obj.polynom_s[0].value = new SOH.Int(H.randIntExcept(-3, 3, 0));
                }
            }
        },
        'sin_alone': {
            und_pet_sum: () => new SOH.PolExpTrig({
                trig_freq: new SOH.Int(H.randInt(1, 3))
            }),
            selectPolyCoefs: function(pet_obj) {
                pet_obj.polynom_s[0].value = new SOH.Int(0);
                
                if (H.randInt(0, 1)) {
                    pet_obj.polynom_c[0].value = new SOH.Int(1);
                }
                else {
                    pet_obj.polynom_c[0].value = new SOH.Int(H.randIntExcept(-3, 3, 0));
                }
            }
        },
        'tn_alone': {
            und_pet_sum: () => new SOH.PolExpTrig({
                degree: new SOH.Int(H.randInt(1, 2))
            }),
            selectCoefs: function(pet_obj) {
                pet_obj.polynom_c[pet_obj.degree.value].value = new SOH.Int(H.randIntExcept(-3, 3, 0));

                for (let i = 0; i < pet_obj.degree.value; i++) {
                    pet_obj.polynom_c[i].value = new SOH.Int(0);
                }
            }
        },
        'e_and_sin': {
            und_pet_sum: () => new SOH.PolExpTrig({
                exp_freq: new SOH.Int(H.randIntExcept(-2, 2, 0)),
                trig_freq: new SOH.Int(H.randInt(1, 2))
            }),
            selectCoefs: function(pet_obj) {
                pet_obj.polynom_c[0].value = new SOH.Int(0);
                pet_obj.polynom_s[0].value = new SOH.Int(1);
            }
        },
        'e_and_sin': {
            und_pet_sum: () => new SOH.PolExpTrig({
                exp_freq: new SOH.Int(H.randIntExcept(-2, 2, 0)),
                trig_freq: new SOH.Int(H.randInt(1, 2))
            }),
            selectCoefs: function(pet_obj) {
                pet_obj.polynom_s[0].value = new SOH.Int(0);
                pet_obj.polynom_c[0].value = new SOH.Int(1);
            }
        },
        'tn_and_e': {
            und_pet_sum: () => new SOH.PolExpTrig({
                exp_freq: new SOH.Int(H.randIntExcept(-3, 3, 0)),
                degree: new SOH.Int(H.randInt(1, 2))
            }),
            selectCoefs: function(pet_obj) {
                pet_obj.polynom_c[pet_obj.degree.value].value = new SOH.Int(1);

                for (let i = 0; i < pet_obj.degree.value; i++) {
                    pet_obj.polynom_c[i].value = new SOH.Int(0);
                }
            }
        },
        'tn_and_sin': {
            und_pet_sum: () => new SOH.PolExpTrig({
                trig_freq: new SOH.Int(H.randInt(1, 3)),
                degree: new SOH.Int(H.randInt(1, 2))
            }),
            selectCoefs: function(pet_obj) {
                pet_obj.polynom_c[pet_obj.degree.value].value = new SOH.Int(0);
                pet_obj.polynom_s[pet_obj.degree.value].value = new SOH.Int(1);

                for (let i = 0; i < pet_obj.degree.value; i++) {
                    pet_obj.polynom_c[i].value = new SOH.Int(0);
                    pet_obj.polynom_s[i].value = new SOH.Int(0);
                }
            }
        },
        'tn_and_cos': {
            und_pet_sum: () => new SOH.PolExpTrig({
                trig_freq: new SOH.Int(H.randInt(1, 3)),
                degree: new SOH.Int(H.randInt(1, 2))
            }),
            selectCoefs: function(pet_obj) {
                pet_obj.polynom_s[pet_obj.degree.value].value = new SOH.Int(0);
                pet_obj.polynom_c[pet_obj.degree.value].value = new SOH.Int(1);

                for (let i = 0; i < pet_obj.degree.value; i++) {
                    pet_obj.polynom_s[i].value = new SOH.Int(0);
                    pet_obj.polynom_c[i].value = new SOH.Int(0);
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

                        const added_zero_terms = new Array(degree_increase).fill(new SOH.Int(0));
                        y_p_pet.polynom_s = added_zero_terms.concat(y_p_pet.polynom_s);
                        y_p_pet.polynom_c = added_zero_terms.concat(y_p_pet.polynom_c);
                    }
                }
            }
        }

        return reso_found;
    },
    clonePetSum: function(pet_obj_sum) {
        return pet_obj_sum.map(pet_obj => {
            const copied_pet_obj = SOH.PolExpTrig(pet_obj);

            copy_polynom = (polynom) => polynom.map(entry => new entry.constructor(Object.keys(entry)));

            copied_pet_obj.polynom_s = copy_polynom(pet_obj.polynom_s);
            copied_pet_obj.polynom_c = copy_polynom(pet_obj.polynom_c);

            return copied_pet_obj;
        });
    },
    int_frac_ops: {
        add: function(int_or_frac1, int_or_frac2) {
            if (
                int_or_frac1 instanceof SOH.Int && 
                int_or_frac2 instanceof SOH.Int
            ) {
                return new SOH.Int(int_or_frac1.value + int_or_frac2.value);
            }
            else if (
                int_or_frac1 instanceof SOH.Int &&
                int_or_frac2 instanceof SOH.Frac
            ) {
                return new SOH.Frac(int_or_frac1.value*int_or_frac2.den + int_or_frac2.num, int_or_frac2.den);
            }
            else if (
                int_or_frac1 instanceof SOH.Frac &&
                int_or_frac2 instanceof SOH.Int
            ) {
                return new SOH.Frac(int_or_frac2.value*int_or_frac1.den + int_or_frac1.num, int_or_frac1.den);
            }
            else if (
                int_or_frac1 instanceof SOH.Frac && 
                int_or_frac2 instanceof SOH.Frac
            ) {
                return new SOH.Frac(int_or_frac1.value*int_or_frac2.den + int_or_frac2.value*int_or_frac1.den, int_or_frac1.den*int_or_frac2.den);
            }
        },
        mul: function(int_or_frac1, int_or_frac2) {
            if (
                int_or_frac1 instanceof SOH.Int && 
                int_or_frac2 instanceof SOH.Int
            ) {
                return new SOH.Int(int_or_frac1.value * int_or_frac2.value);
            }
            else if (
                int_or_frac1 instanceof SOH.Int &&
                int_or_frac2 instanceof SOH.Frac
            ) {
                return new SOH.Frac(int_or_frac1.value * int_or_frac2.num, int_or_frac2.den);
            }
            else if (
                int_or_frac1 instanceof SOH.Frac &&
                int_or_frac2 instanceof SOH.Int
            ) {
                return new SOH.Frac(int_or_frac2.value * int_or_frac1.num, int_or_frac1.den);
            }
            else if (
                int_or_frac1 instanceof SOH.Frac && 
                int_or_frac2 instanceof SOH.Frac
            ) {
                return new SOH.Frac(int_or_frac1.num * int_or_frac2.num, int_or_frac1.den*int_or_frac2.den);
            }
        },
        pow: function(int_or_frac_base, int_exp) {
            if (
                (int_or_frac_base instanceof SOH.Int || int_or_frac_base instanceof SOH.Frac) &&
                int_exp instanceof SOH.Int && int_exp.value >= 0
            ) {
                let accum = new SOH.Int(1);

                for (let n = 0; n < int_exp.value; n++) {
                    accum = SOH.int_frac_ops.mul(accum, int_or_frac_base);
                }

                return accum;
            }
        }
    },
    polynom_ops: {
        scale: function(polyom_arr, scalar) {
            return polyom_arr.map(coef => SOH.int_frac_ops.mul(scalar, coef));
        },
        add: function(polynom_arr1, polynom_arr2) {
            const [shorter_poly, longer_poly] = polynom_arr2.length > polynom_arr1.length? [polynom_arr1, polynom_arr2] : [polynom_arr2, polynom_arr1];

            const sum_poly = [];
            for (let i = 0; i < longer_poly.length; i++) {
                const long_term = longer_poly[i];
                const short_term = i < shorter_poly.length? shorter_poly[i] : new SOH.Int(0);
                
                sum_poly.push(SOH.int_frac_ops.add(long_term, short_term));
            }

            return sum_poly;
        },
        diff: function(polynom_arr) {
            const diffed_poly = [];

            for (let n = 1; n < polynom_arr.length; n++) {
                diffed_poly.push(SOH.int_frac_ops.mul(new SOH.Int(n), polynom_arr[n]));
            }

            return diffed_poly;
        },
        evaluate: function(polynom_arr, value) {
            let accum = new SOH.Int(0);

            for (let n = 0; n < polynom_arr.length; n++) {
                accum = SOH.int_frac_ops.add(
                    accum,
                    SOH.int_frac_ops.mul(
                        polynom_arr[n],
                        SOH.int_frac_ops.pow(
                            value,
                            new SOH.Int(n)
                        )
                    )
                );
            }

            return accum;
        }
    },
    diffPetSum: function(pet_sum) {
        return pet_sum.map(pet_obj => {
            const diffed_pet = SOH.PolExpTrig(pet_obj);

            diffed_pet.polynom_s = SOH.polynom_ops.add(
                SOH.polynom_ops.scale(pet_obj.polynom_s, pet_obj.exp_freq),
                SOH.polynom_ops.add(
                    SOH.polynom_ops.diff(pet_obj.polynom_s),
                    SOH.polynom_ops.scale(pet_obj.polynom_c, new SOH.Int(-1))
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
        char_eq = SOH.createCharEq(settings.sec_ord_roots, root_size, allow_b_term);
        y_h_pets = SOH.homo_sols[settings.sec_ord_roots](char_eq.roots);
        f_t_pets = SOH.forms[settings.force_func_form].und_pet_sum();
        y_p_pets = SOH.clonePetSum(f_t_pets);
        SOH.forms[settings.force_func_form].selectPolyCoefs(f_t_pets.length > 1? f_t_pets : f_t_pets[0]);
        
        if (current_attempts < resonance_attempts && resoCheckAndAdjust(y_h_pets, y_p_pets)) continue;

        const d_y_p_pets = SOH.diffPetSum(y_p_pets);
        const dd_y_p_pets = SOH.diffPetSum(d_y_p_pets);


        // skip if less than y_p coef attempts and the coefs aren't nice

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