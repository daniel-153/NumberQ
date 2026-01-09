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
            },
            {
                field: 'has_sin',
                valid_types: [Boolean],
                default: {constructor: Boolean, args: [false]}
            },
            {
                field: 'has_cos',
                valid_types: [Boolean],
                default: {constructor: Boolean, args: [false]}
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
                    const default_constructor = field_entry.default.constructor;

                    if ([Number, Boolean].includes(default_constructor)) {
                        this[field_entry.field] = default_constructor(...field_entry.default.args);
                    }
                    else {
                        this[field_entry.field] = new default_constructor(...field_entry.default.args);
                    }
                }
            });

            if (
                (this.trig_freq.value === 0 && (this.has_sin || this.has_cos)) ||
                (this.trig_freq.value !== 0 && !this.has_sin && !this.has_cos)
            ) throw new Error(`Invalid PolExpTrig, [trig_freq: ${this.trig_freq.value}] and [has_sin: ${this.has_sin}, has_cos: ${this.has_cos}] are conflicting.`)
            
            const build_polynom = () => (new Array(this.degree + 1)).fill(null).map(_ => new SOH.Coef());
            if (this.has_sin && this.his_cos) {
                this.polynom_S = build_polynom();
                this.polynom_C = build_polynom();
            }
            else {
                this.polynom = build_polynom();
            }
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
        real_rep: (roots) => new SOH.PolExpTrig({
            exp_freq: new SOH.Int(roots[0]),
            degree: new SOH.Int(1)
        }),
        complex: (roots) => new SOH.PolExpTrig({
            exp_freq: new SOH.Int(roots[0][0]),
            trig_freq: new SOH.Int(Math.abs(roots[0][1])),
            has_sin: true,
            has_cos: true
        })
    },
    forms: {
        'zero': {
            pet_obj: () => new SOH.PolExpTrig(),
            selectPolyCoefs: function(pet_obj) {
                pet_obj.polynom[0].value = new SOH.Int(0);
            }
        },
        'constant': {
            pet_obj: () => new SOH.PolExpTrig(),
            selectPolyCoefs: function(pet_obj) {
                pet_obj.polynom[0].value = new SOH.Int(H.randIntExcept(-9, 9, 0));
            }
        },
        'et_alone': {
            pet_obj: () => new SOH.PolExpTrig({
                exp_freq: new SOH.Int(H.randIntExcept(-4, 4, 0))
            }),
            selectPolyCoefs: function(pet_obj) {
                if (H.randInt(0, 1)) {
                    pet_obj.polynom[0].value = new SOH.Int(1);
                }
                else {
                    pet_obj.polynom[0].value = new SOH.Int(H.randIntExcept(-3, 3, 0));
                }
            }
        },
        'sin_alone': {
            pet_obj: () => new SOH.PolExpTrig({
                trig_freq: new SOH.Int(H.randInt(1, 3)),
                has_sin: true
            }),
            selectPolyCoefs: function(pet_obj) {
                if (H.randInt(0, 1)) {
                    pet_obj.polynom[0].value = new SOH.Int(1);
                }
                else {
                    pet_obj.polynom[0].value = new SOH.Int(H.randIntExcept(-3, 3, 0));
                }
            }
        },
        'cos_alone': {
            pet_obj: () => new SOH.PolExpTrig({
                trig_freq: new SOH.Int(H.randInt(1, 3)),
                has_cos: true
            }),
            selectPolyCoefs: function(pet_obj) {
                if (H.randInt(0, 1)) {
                    pet_obj.polynom[0].value = new SOH.Int(1);
                }
                else {
                    pet_obj.polynom[0].value = new SOH.Int(H.randIntExcept(-3, 3, 0));
                }
            }
        },
        'tn_alone': {
            pet_obj: () => new SOH.PolExpTrig({
                degree: new SOH.Int(H.randInt(1, 2))
            }),
            selectCoefs: function(pet_obj) {
                pet_obj.polynom[pet_obj.degree.value].value = new SOH.Int(H.randIntExcept(-3, 3, 0));

                for (let i = 0; i < pet_obj.degree.value; i++) {
                    pet_obj.polynom[i].value = new SOH.Int(0);
                }
            }
        },
        'e_and_sin': {
            pet_obj: () => new SOH.PolExpTrig({
                exp_freq: new SOH.Int(H.randIntExcept(-2, 2, 0)),
                trig_freq: new SOH.Int(H.randInt(1, 2)),
                has_sin: true
            }),
            selectCoefs: function(pet_obj) {
                pet_obj.polynom[0].value = new SOH.Int(1);
            }
        },
        'e_and_cos': {
            pet_obj: () => new SOH.PolExpTrig({
                exp_freq: new SOH.Int(H.randIntExcept(-2, 2, 0)),
                trig_freq: new SOH.Int(H.randInt(1, 2)),
                has_cos: true
            }),
            selectCoefs: function(pet_obj) {
                pet_obj.polynom[0].value = new SOH.Int(1);
            }
        },
        'tn_and_e': {
            pet_obj: () => new SOH.PolExpTrig({
                exp_freq: new SOH.Int(H.randIntExcept(-3, 3, 0)),
                degree: new SOH.Int(H.randInt(1, 2))
            }),
            selectCoefs: function(pet_obj) {
                pet_obj.polynom[pet_obj.degree.value].value = new SOH.Int(1);

                for (let i = 0; i < pet_obj.degree.value; i++) {
                    pet_obj.polynom[i].value = new SOH.Int(0);
                }
            }
        },
        'tn_and_sin': {
            pet_obj: () => new SOH.PolExpTrig({
                trig_freq: new SOH.Int(H.randInt(1, 3)),
                degree: new SOH.Int(H.randInt(1, 2)),
                has_sin: true
            }),
            selectCoefs: function(pet_obj) {
                pet_obj.polynom[pet_obj.degree.value].value = new SOH.Int(1);

                for (let i = 0; i < pet_obj.degree.value; i++) {
                    pet_obj.polynom[i].value = new SOH.Int(0);
                }
            }
        },
        'tn_and_cos': {
            pet_obj: () => new SOH.PolExpTrig({
                trig_freq: new SOH.Int(H.randInt(1, 3)),
                degree: new SOH.Int(H.randInt(1, 2)),
                has_cos: true
            }),
            selectCoefs: function(pet_obj) {
                pet_obj.polynom[pet_obj.degree.value].value = new SOH.Int(1);

                for (let i = 0; i < pet_obj.degree.value; i++) {
                    pet_obj.polynom[i].value = new SOH.Int(0);
                }
            }
        }
    },
    checkForReso: function(yh_pet_obj, ft_pet_obj, adjust_ft = false) {
        const [yh_pet_objs, ft_pet_objs] = [yh_pet_obj, ft_pet_obj].map(v => Array.isArray(v)? v : [v]);

        let reso_found = false;
        for (let i = 0; i < ft_pet_objs.length; i++) {
            for (let j = 0; j < yh_pet_objs.length; j++) {
                ft_pet_obj = ft_pet_objs[i];
                yh_pet_obj = yh_pet_obj[j];

                // check if terms resonate, adjust or break according to request
                if (
                    (
                        (Array.isArray(ft_pet_obj.polynom) && ft_pet_obj.polynom.some(entry => entry.value !== 0)) ||
                        (
                            ft_pet_obj.has_sin && ft_pet_obj.has_cos && (
                                ft_pet_obj.polynom_S.some(entry => entry.value !== 0) || 
                                ft_pet_obj.polynom_C.some(entry => entry.value !== 0)
                            )
                        )
                    ) &&
                    (
                        (Array.isArray(yh_pet_obj.polynom) && yh_pet_obj.polynom.some(entry => entry.value !== 0)) ||
                        (
                            yh_pet_obj.has_sin && yh_pet_obj.has_cos && (
                                yh_pet_obj.polynom_S.some(entry => entry.value !== 0) || 
                                yh_pet_obj.polynom_C.some(entry => entry.value !== 0)
                            )
                        )
                    ) &&
                    (
                        ft_pet_obj.exp_freq === yh_pet_obj.exp_freq && ft_pet_obj.trig_freq === yh_pet_obj.trig_freq
                    ) &&
                    (
                        yh_pet_obj.degree.value >= ft_pet_obj.degree.value
                    )
                ) {
                    if (!adjust_ft) return true;
                    else {
                        reso_found = true;
                        const degree_increase = (yh_pet_obj.degree.value - ft_pet_obj.degree.value) + 1;
                        ft_pet_obj.degree.value += degree_increase;

                        const added_zero_terms = () => (new Array(degree_increase)).fill(null).map(_ => new SOH.Int(0));
                        if (ft_pet_obj.has_sin && ft_pet_obj.has_cos) {
                            ft_pet_obj.polynom_S = added_zero_terms().concat(ft_pet_obj.polynom_S);
                            ft_pet_obj.polynom_C = added_zero_terms().concat(ft_pet_obj.polynom_C);
                        }
                        else {
                            ft_pet_obj.polynom = added_zero_terms().concat(ft_pet_obj.polynom);
                        }
                    }
                }
            }
        }

        return reso_found;
    },
    clonePetObj: function(pet_obj) {
        const copied_pet_obj = SOH.PolExpTrig(pet_obj);

        copy_polynom = (polynom) => polynom.map(entry => new entry.constructor(Object.keys(entry)));

        if (copied_pet_obj.has_sin && copied_pet_obj.has_cos) {
            copied_pet_obj.polynom_S = copy_polynom(polynom_S);
            copied_pet_obj.polynom_C = copy_polynom(polynom_C);
        }
        else {
            copied_pet_obj.polynom = copy_polynom(polynom);
        }

        return copied_pet_obj;
    } 
};
export default function genSecOrd(settings) {
    const root_size = {'real_dis': 6, 'real_rep': 6, 'complex': 4}[settings.sec_ord_roots];
    const allow_b_term = (settings.sec_ord_b_term === 'zero')? false : true;

    let resoConidtionMet;
    if (settings.force_func_form !== 'zero' && settings.sec_ord_reso === 'prefer') {
        resoConidtionMet = function(yh_pet_obj, ft_pet_obj) {
            return SOH.checkForReso(yh_pet_obj, ft_pet_obj);
        }
    }
    else if (settings.force_func_form !== 'zero' && settings.sec_ord_reso === 'avoid') {
        resoConidtionMet = function(yh_pet_obj, ft_pet_obj) {
            return !SOH.checkForReso(yh_pet_obj, ft_pet_obj);
        }
    }
    else {
        resoConidtionMet = function() {
            return true;
        }
    }

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
    let char_eq, f_t_pet, y_h_pet, y_p_pet, init_conds;
    while (!eq_found && current_attempts++ < max_total_attempts) {
        char_eq = SOH.createCharEq(settings.sec_ord_roots, root_size, allow_b_term);
        y_h_pet = SOH.homo_sols[settings.sec_ord_roots](char_eq.roots);
        f_t_pet = SOH.forms[settings.force_func_form].pet_obj();
        SOH.forms[settings.force_func_form].selectPolyCoefs(force_func_pet);

        if (current_attempts < resonance_attempts && !resoConidtionMet(y_h_pet, f_t_pet)) continue;

        // build y_p and find the undetermined coefs

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