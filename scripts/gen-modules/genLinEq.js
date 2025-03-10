import * as H from '../helper-modules/gen-helpers.js';
import * as PH from '../helper-modules/polynom-helpers.js';
import * as SH from '../helper-modules/settings-helpers.js';
import * as MH from '../helper-modules/math-string-helpers.js';

function processSettings(formObj) {
    let { solution_size_range, lin_eq_equation_form, solution_form, variable_letter, flip_equation, force_positive_coefs } = formObj;
    let error_locations = []; // stores a list of input fields where errors occured (same field can appear multiple times)

    // validate the variable letter (default to 'x' if anything was invalid)
    variable_letter = SH.val_variable_letter(variable_letter, error_locations);

    return {
        solution_size_range,
        lin_eq_equation_form,
        solution_form,
        variable_letter,
        flip_equation,
        force_positive_coefs,
        error_locations
    };
}

export default function genLinEq(formObj) {
    const settings = processSettings(formObj);
    let { solution_size_range, lin_eq_equation_form, solution_form, variable_letter, flip_equation, force_positive_coefs } = settings;
    
    // equation templates, solutions and requirements
    const equations = {
        begin_1: {
            verify_reqs(a, b) { 
                return !(
                    a === 1  
                );
            },
            get_sol(a,b) {
                return {
                    raw_value: b / a,
                    numer: b,
                    denom: a
                };
            },
            create_prompt(vl, a, b) {
                a = MH.start_var(a);
                b = b + '';
    
                return a + vl + '=' + b;
            },
            absorber: ['b'],
            number_of_coefs: 2
        },
        begin_2: {
            verify_reqs(a, b) {
                return true; // no reqs for this eq
            },
            get_sol(a,b) {
                return {
                    raw_value: b - a,
                    numer: b - a,
                    denom: 1
                };
            },
            create_prompt(vl, a, b) {
                a = MH.middle_const(a);
                b = b + '';
    
                return vl + a + '=' + b;
            },
            absorber: [],
            number_of_coefs: 2,
            no_fractions: true
        },
        begin_3: {
            verify_reqs(a, b) {
                return true; // no reqs for this eq
            },
            get_sol(a,b) {
                return {
                    raw_value: b - a,
                    numer: b - a,
                    denom: 1
                };
            },
            create_prompt(vl, a, b) {
                a = a + '';
                b = b + '';
    
                return a + '+' + vl + '=' + b;
            },
            absorber: [],
            number_of_coefs: 2,
            no_fractions: true
        },
        begin_4: {
            verify_reqs(a, b) {
                return !(
                    a === 1 ||
                    a === -1
                ); 
            },
            get_sol(a,b) {
                return {
                    raw_value: a*b,
                    numer: a*b,
                    denom: 1
                };
            },
            create_prompt(vl, a, b) {
                let x_on_a = MH.start_denom(a, vl);
                b = b + '';
    
                return x_on_a + '=' + b;
            },
            absorber: [],
            number_of_coefs: 2,
            no_fractions: true
        },
        begin_5: {
            verify_reqs(a, b, c) {
                return !(
                    a === 1 
                ); 
            },
            get_sol(a,b, c) {
                return {
                    raw_value: (c - b) / a,
                    numer: (c - b),
                    denom: a
                };
            },
            create_prompt(vl, a, b, c) {
                a = MH.start_var(a);
                b = MH.middle_const(b);
                c = c + '';
    
                return a + vl + b + '=' + c;
            },
            absorber: [H.randFromList(['b','c'])],
            number_of_coefs: 3
        },
        begin_6: {
            verify_reqs(a, b, c) {
                return !(
                    b === 1 
                ); 
            },
            get_sol(a,b, c) {
                return {
                    raw_value: (c - a) / b,
                    numer: (c - a),
                    denom: b
                };
            },
            create_prompt(vl, a, b, c) {
                a = a + '';
                b = MH.middle_var(b);
                c = c + '';
    
                return a + b + vl + '=' + c;
            },
            absorber: [H.randFromList(['a','c'])],
            number_of_coefs: 3
        },
        begin_7: {
            verify_reqs(a, b, c) {
                return !(
                    a === b 
                ); 
            },
            get_sol(a,b, c) {
                return {
                    raw_value: c / (a - b),
                    numer: c,
                    denom: a - b
                };
            },
            create_prompt(vl, a, b, c) {
                a = MH.start_var(a);
                b = MH.start_var(b);
                c = MH.middle_const(c);
    
                return a + vl + '=' + b + vl + c;
            },
            absorber: ['c'],
            number_of_coefs: 3
        },
        absorber: ['c'],
        begin_8: {
            verify_reqs(a, b, c, d) {
                return !(
                    b < 0 ||
                    d < 0 ||
                    b === 1 ||
                    d === 1 ||
                    a === b ||
                    a === -b ||
                    c === d ||
                    c === -d 
                ); 
            },
            get_sol(a, b, c, d) {
                return {
                    raw_value: (b*c) / (a*d),
                    numer: (b*c),
                    denom: (a*d)
                };
            },
            create_prompt(vl, a, b, c, d) {
                let a_on_b = MH.start_frac(a, b);
                let c_on_d = MH.start_frac(c, d);
    
                return a_on_b + vl + '=' + c_on_d;
            },
            absorber: [H.randFromList(['b','c'])],
            number_of_coefs: 4
        },
        begin_9: {
            verify_reqs(a, b, c, d) {
                return !(
                    b < 0 ||
                    d < 0 ||
                    b === 1 ||
                    d === 1 ||
                    a === b ||
                    a === -b ||
                    c === d ||
                    c === -d 
                ); 
            },
            get_sol(a, b, c, d) {
                return {
                    raw_value: ((b*c) - (a*d)) / (b*d),
                    numer: ((b*c) - (a*d)),
                    denom: (b*d)
                };
            },
            create_prompt(vl, a, b, c, d) {
                let a_on_b = MH.middle_frac(a, b);
                let c_on_d = MH.start_frac(c, d);
    
                return vl + a_on_b + '=' + c_on_d;
            },
            absorber: [H.randFromList(['a','c'])],
            number_of_coefs: 4
        },
        begin_10: {
            verify_reqs(a, b, c) {
                return !(
                    b === 1 ||
                    b === -1
                ); 
            },
            get_sol(a,b, c) {
                return {
                    raw_value: (b*c) - a,
                    numer: (b*c) - a,
                    denom: 1
                };
            },
            create_prompt(vl, a, b, c) {
                a = MH.middle_const(a);
                let on_b = MH.start_denom(b, vl + a);
                c = c + '';
    
                return on_b + '=' + c
            },
            absorber: [],
            number_of_coefs: 3,
            no_fractions: true
        },
        begin_11: {
            verify_reqs(a, b, c) {
                return !(
                    a === 1 ||
                    a === -1
                ); 
            },
            get_sol(a,b, c) {
                return {
                    raw_value: (a*c) - (a*b),
                    numer: (a*c) - (a*b),
                    denom: 1
                };
            },
            create_prompt(vl, a, b, c) {
                let x_on_a = MH.start_denom(a, vl);
                b = MH.middle_const(b);
                c = c + '';
    
                return x_on_a + b + '=' + c;
            },
            absorber: [],
            number_of_coefs: 3,
            no_fractions: true
        },
        begin_12: {
            verify_reqs(a, b, c) {
                return !(
                    b === 1 ||
                    b === -1
                ); 
            },
            get_sol(a,b, c) {
                return {
                    raw_value: (b*c) - (a*b),
                    numer: (b*c) - (a*b),
                    denom: 1
                };
            },
            create_prompt(vl, a, b, c) {
                a = a + '';
                let x_on_b = MH.middle_denom(b, vl);
                c = c + '';
    
                return a + x_on_b + '=' + c;
            },
            absorber: [],
            number_of_coefs: 3,
            no_fractions: true
        },
        begin_13: {
            verify_reqs(a, b, c) {
                return !(
                    a === -b
                ); 
            },
            get_sol(a,b, c) {
                return {
                    raw_value: c / (a + b),
                    numer: c,
                    denom: (a + b)
                };
            },
            create_prompt(vl, a, b, c) {
                a = MH.start_var(a);
                b = MH.middle_var(b);
                c = c + '';
    
                return a + vl + b + vl + '=' + c;
            },
            absorber: ['c'],
            number_of_coefs: 3
        },
        inter_1: {
            verify_reqs(a, b, c, d) {
                return !(
                    a === c 
                );
            },
            get_sol(a, b, c, d) {
                return {
                    raw_value: (d - b) / (a - c),
                    numer: d - b,
                    denom: a - c
                };
            },
            create_prompt(vl, a, b, c, d) {
                a = MH.start_var(a);
                b = MH.middle_const(b);
                c = MH.start_var(c);
                d = MH.middle_const(d);
    
                return a + vl + b + '=' + c + vl + d;
            },
            absorber: [H.randFromList(['b','d'])],
            number_of_coefs: 4
        },
        inter_2: {
            verify_reqs(a, b, c, d) {
                return !(
                    b === c 
                );
            },
            get_sol(a, b, c, d) {
                return {
                    raw_value: (d - a) / (b - c),
                    numer: d - a,
                    denom: b - c
                };
            },
            create_prompt(vl, a, b, c, d) {
                a = a + '';
                b = MH.middle_var(b);
                c = MH.start_var(c);
                d = MH.middle_const(d);
    
                return a + b + vl + '=' + c + vl + d;
            },
            absorber: [H.randFromList(['a','d'])],
            number_of_coefs: 4
        },
        inter_3: {
            verify_reqs(a, b, c) {
                return !(
                    a === 1 
                ); 
            },
            get_sol(a, b, c) {
                return {
                    raw_value: (c - (a*b)) / a,
                    numer: (c - (a*b)),
                    denom: a
                };
            },
            create_prompt(vl, a, b, c) {
                a = MH.start_var(a);
                b = MH.middle_const(b);
                c = c + '';
    
                return a + '(' + vl + b + ')=' + c;
            },
            absorber: ['c'],
            number_of_coefs: 3
        },
        inter_4: {
            verify_reqs(a, b, c, d) {
                return !(
                    a === 1 ||
                    b === 1 
                );
            },
            get_sol(a, b, c, d) {
                return {
                    raw_value: (d - (a*c)) / (a*b),
                    numer: (d - (a*c)),
                    denom: (a*b)
                };
            },
            create_prompt(vl, a, b, c, d) {
                a = MH.start_var(a);
                b = MH.start_var(b);
                c = MH.middle_const(c);
                d = d + '';
    
                return a + '(' + b + vl + c + ')=' + d;
            },
            absorber: [H.randFromList(['c','d'])],
            number_of_coefs: 4
        },
        inter_5: {
            verify_reqs(a, b, c, d, e) {
                return !(
                    b === 1 
                );
            },
            get_sol(a, b, c, d, e) {
                return {
                    raw_value: (e - a - (b*d)) / (b*c),
                    numer: (e - a - (b*d)),
                    denom: (b*c)
                };
            },
            create_prompt(vl, a, b, c, d, e) {
                a = a + '';
                b = MH.middle_var(b);
                c = MH.start_var(c);
                d = MH.middle_const(d);
                e = e + '';
    
                return a + b + '(' + c + vl  + d + ')=' + e;
            },
            absorber: [H.randFromList(['a','d','e'])],
            number_of_coefs: 5
        },
        inter_6: {
            verify_reqs(a, b, c, d, e) {
                return !(
                    a === 1 
                );
            },
            get_sol(a, b, c, d, e) {
                return {
                    raw_value: (e - (a*c) - d) / (a*b),
                    numer: (e - (a*c) - d),
                    denom: (a*b)
                };
            },
            create_prompt(vl, a, b, c, d, e) {
                a = MH.start_var(a);
                b = MH.start_var(b);
                c = MH.middle_const(c);
                d = MH.middle_const(d);
                e = e + '';
    
                return a + '(' + b + vl + c + ')' + d + '=' + e;
            },
            absorber: [H.randFromList(['c','d','e'])],
            number_of_coefs: 5
        },
        inter_7: {
            verify_reqs(a, b, c, d, e) {
                return !(
                    b === 1 ||
                    a === (-1)*b*c 
                );
            },
            get_sol(a, b, c, d, e) {
                return {
                    raw_value: (e - (b*d)) / (a + (b*c)),
                    numer: (e - (b*d)),
                    denom: (a + (b*c))
                };
            },
            create_prompt(vl, a, b, c, d, e) {
                a = MH.start_var(a);
                b = MH.middle_var(b);
                c = MH.start_var(c);
                d = MH.middle_const(d);
                e = e + '';
    
                return a + vl + b + '(' + c + vl + d + ')=' + e;
            },
            absorber: [H.randFromList(['e','d'])],
            number_of_coefs: 5
        },
        inter_8: {
            verify_reqs(a, b, c, d, e) {
                return !(
                    a === 1 ||
                    d === (-1)*a*b 
                );
            },
            get_sol(a, b, c, d, e) {
                return {
                    raw_value: (e - (a*c)) / ((a*b) + d),
                    numer: (e - (a*c)),
                    denom: ((a*b) + d)
                };
            },
            create_prompt(vl, a, b, c, d, e) {
                a = MH.start_var(a);
                b = MH.start_var(b);
                c = MH.middle_const(c);
                d = MH.middle_var(d);
                e = e + '';
    
                return a + '(' + b + vl + c + ')' + d + vl + '=' + e;
            },
            absorber: [H.randFromList(['e','c'])],
            number_of_coefs: 5
        },
        inter_9: {
            verify_reqs(a, b, c, d, e) {
                return !(
                    a === 1 ||
                    e === a*b 
                );
            },
            get_sol(a, b, c, d, e) {
                return {
                    raw_value: ((a*c) + d) / (e - (a*b)),
                    numer: ((a*c) + d),
                    denom: (e - (a*b))
                };
            },
            create_prompt(vl, a, b, c, d, e) {
                a = MH.start_var(a);
                b = MH.start_var(b);
                c = MH.middle_const(c);
                d = MH.middle_const(d);
                e = MH.start_var(e);
    
                return a + '(' + b + vl + c + ')' + d + '=' + e + vl;
            },
            absorber: [H.randFromList(['c','d'])],
            number_of_coefs: 5
        },
        inter_10: {
            verify_reqs(a, b, c, d, e, f) {
                return !(
                    a === 1 ||
                    d === 1 ||
                    a*b === d*e 
                );
            },
            get_sol(a, b, c, d, e, f) {
                return {
                    raw_value: ((d*f) - (a*c)) / ((a*b) - (d*e)),
                    numer: ((d*f) - (a*c)),
                    denom: ((a*b) - (d*e))
                };
            },
            create_prompt(vl, a, b, c, d, e, f) {
                a = MH.start_var(a);
                b = MH.start_var(b);
                c = MH.middle_const(c);
                d = MH.start_var(d);
                e = MH.start_var(e);
                f = MH.middle_const(f);
    
                return a + '(' + b + vl + c + ')=' + d + '(' + e + vl + f + ')';
            },
            absorber: [H.randFromList(['c','f'])],
            number_of_coefs: 6
        },
        inter_11: {
            verify_reqs(a, b, c, d, e) {
                return !(
                    c === 1 ||
                    c < 0 ||
                    a === c*d 
                );
            },
            get_sol(a, b, c, d, e) {
                return {
                    raw_value: ((c*e) - b) / (a - (c*d)),
                    numer: ((c*e) - b),
                    denom: (a - (c*d))
                };
            },
            create_prompt(vl, a, b, c, d, e) {
                a = MH.start_var(a);
                b = MH.middle_const(b);
                let on_c = MH.start_denom(c, a + vl + b);
                d = MH.start_var(d);
                e = MH.middle_const(e);
                return on_c + '=' + d + vl + e;
            },
            absorber: [H.randFromList(['b','e'])],
            number_of_coefs: 5
        },
        inter_12: {
            verify_reqs(a, b, c) {
                return !(
                    a === 1 ||
                    a === -1 ||
                    b === 1 ||
                    b === -1 ||
                    a === (-1)*b 
                ); 
            },
            get_sol(a, b, c) {
                return {
                    raw_value: (a*b*c) / (a + b),
                    numer: (a*b*c),
                    denom: (a + b)
                };
            },
            create_prompt(vl, a, b, c) {
                let x_on_a = MH.start_denom(a, vl);
                let x_on_b = MH.middle_denom(b, vl);
                c = c + '';
    
                return x_on_a + x_on_b + '=' + c;
            },
            absorber: ['c'],
            number_of_coefs: 3
        },
        inter_13: {
            verify_reqs(a, b, c, d) {
                return !(
                    a === -1 ||
                    a === 1 ||
                    (a*c) === 1 
                );
            },
            get_sol(a, b, c, d) {
                return {
                    raw_value: ((a*d) - (a*b)) / (1 - (a*c)),
                    numer: ((a*d) - (a*b)),
                    denom: (1 - (a*c))
                };
            },
            create_prompt(vl, a, b, c, d) {
                let x_on_a = MH.start_denom(a, vl);
                b = MH.middle_const(b);
                c = MH.start_var(c);
                d = MH.middle_const(d);
    
                return x_on_a + b + '=' + c + vl + d;
            },
            absorber: [H.randFromList(['b','d'])],
            number_of_coefs: 4
        },
        inter_14: {
            verify_reqs(a, b, c, d) {
                return !(
                    a === 1 ||
                    b === 1 ||
                    b === -1 
                );
            },
            get_sol(a, b, c, d) {
                return {
                    raw_value: ((b*d) - (a*b*c)) / (a),
                    numer: ((b*d) - (a*b*c)),
                    denom: (a)
                };
            },
            create_prompt(vl, a, b, c, d) {
                a = MH.start_var(a);
                let x_on_b = MH.start_denom(b, vl);
                c = MH.middle_const(c);
                d = d + '';
    
                return a + '(' + x_on_b + c + ')=' + d;
            },
            absorber: [H.randFromList(['b','c','d'])],
            number_of_coefs: 4
        },
        inter_15: {
            verify_reqs(a, b, c, d) {
                return !(
                    a === 1 ||
                    a === -1 ||
                    c === 1 ||
                    c === -1 ||
                    a === c 
                );
            },
            get_sol(a, b, c, d) {
                return {
                    raw_value: ((a*c*d) - (a*b*c)) / (c - a),
                    numer: ((a*c*d) - (a*b*c)),
                    denom: (c - a)
                };
            },
            create_prompt(vl, a, b, c, d) {
                let x_on_a = MH.start_denom(a, vl);
                b = MH.middle_const(b);
                let x_on_c = MH.start_denom(c, vl);
                d = MH.middle_const(d);
    
                return x_on_a + b + '=' + x_on_c + d;
            },
            absorber: [H.randFromList(['b','d'])],
            number_of_coefs: 4
        },
        inter_16: {
            verify_reqs(a, b, c, d, e) {
                return !(
                    a === (d - c) 
                );
            },
            get_sol(a, b, c, d, e) {
                return {
                    raw_value: (e - b) / (a + c - d),
                    numer: (e - b),
                    denom: (a + c - d)
                };
            },
            create_prompt(vl, a, b, c, d, e) {
                a = MH.start_var(a);
                b = MH.middle_const(b);
                c = MH.middle_var(c);
                d = MH.start_var(d);
                e = MH.middle_const(e);
    
                return a + vl + b + c + vl + '=' + d + vl + e; 
            },
            absorber: [H.randFromList(['b','e'])],
            number_of_coefs: 5
        },
        advan_1: {
            verify_reqs(a, b, c, d, e, f, g) {
                return !(
                    b === 1 ||
                    e === 1 ||
                    (b * c) === (e * f) 
                );
            },
            get_sol(a, b, c, d, e, f, g) {
                return {
                    raw_value: ((e*g) - a - (b*d)) / ((b*c) - (e*f)),
                    numer: ((e*g) - a - (b*d)),
                    denom: ((b*c) - (e*f))
                };
            },
            create_prompt(vl, a, b, c, d, e, f, g) {
                a = a + '';
                b = MH.middle_var(b);
                c = MH.start_var(c);
                d = MH.middle_const(d);
                e = MH.start_var(e);
                f = MH.start_var(f);
                g = MH.middle_const(g);
    
                return a + b + '(' + c + vl + d + ')=' + e +'(' + f + vl + g + ')';
            },
            absorber: [H.randFromList(['a','d','g'])],
            number_of_coefs: 7
        },
        advan_2: {
            verify_reqs(a, b, c, d, e, f, g) {
                return !(
                    b === 1 ||
                    e === 1 ||
                    a === (e*f) - (b*c) 
                );
            },
            get_sol(a, b, c, d, e, f, g) {
                return {
                    raw_value: ((e*g) - (b*d)) / (a + (b*c) - (e*f)),
                    numer: ((e*g) - (b*d)),
                    denom: (a + (b*c) - (e*f))
                };
            },
            create_prompt(vl, a, b, c, d, e, f, g) {
                a = MH.start_var(a);
                b = MH.middle_var(b);
                c = MH.start_var(c);
                d = MH.middle_const(d);
                e = MH.start_var(e);
                f = MH.start_var(f);
                g = MH.middle_const(g);
    
                return a + vl + b + '(' + c + vl + d + ')=' + e + '(' + f + vl + g + ')'; 
            },
            absorber: [H.randFromList(['d','g'])],
            number_of_coefs: 7
        },
        advan_3: {
            verify_reqs(a, b, c, d, e, f, g, h) {
                return !(
                    b === 1 ||
                    f === 1 ||
                    (b*c) === e + (f*g) 
                );
            },
            get_sol(a, b, c, d, e, f, g, h) {
                return {
                    raw_value: ((f*h) - a - (b*d)) / ((b*c) - e - (f*g)),
                    numer: ((f*h) - a - (b*d)),
                    denom: ((b*c) - e - (f*g))
                };
            },
            create_prompt(vl, a, b, c, d, e, f, g, h) {
                a = a + '';
                b = MH.middle_var(b);
                c = MH.start_var(c);
                d = MH.middle_const(d);
                e = MH.start_var(e);
                f = MH.middle_var(f);
                g = MH.start_var(g);
                h = MH.middle_const(h);
    
                return a + b + '(' + c + vl + d + ')=' + e + vl + f + '(' + g + vl + h + ')';
            },
            absorber: [H.randFromList(['a','d','h'])],
            number_of_coefs: 8
        },
        advan_4: {
            verify_reqs(a, b, c, d, e, f, g) {
                return !(
                    a === 1 ||
                    d === 1 ||
                    (a*b) === (-1)*d*e 
                );
            },
            get_sol(a, b, c, d, e, f, g) {
                return {
                    raw_value: (g - (a*c) - (d*f)) / ((a*b) + (d*e)),
                    numer: (g - (a*c) - (d*f)),
                    denom: ((a*b) + (d*e))
                };
            },
            create_prompt(vl, a, b, c, d, e, f, g) {
                a = MH.start_var(a);
                b = MH.start_var(b);
                c = MH.middle_const(c);
                d = MH.middle_var(d);
                e = MH.start_var(e);
                f = MH.middle_const(f);
                g = g + '';
    
                return a + '(' + b + vl + c + ')' + d + '(' + e + vl + f + ')=' + g; 
            },
            absorber: [H.randFromList(['c','f','g'])],
            number_of_coefs: 7
        },
        advan_5: {
            verify_reqs(a, b, c, d, e, f) {
                return !(
                    c < 0 ||
                    f < 0 ||
                    c === 1 ||
                    f === 1 ||
                    c === f ||
                    (a*f) === (c*d) 
                );
            },
            get_sol(a, b, c, d, e, f) {
                return {
                    raw_value: ((c*e) - (b*f)) / ((a*f) - (c*d)),
                    numer: ((c*e) - (b*f)),
                    denom: ((a*f) - (c*d))
                };
            },
            create_prompt(vl, a, b, c, d, e, f) {
                a = MH.start_var(a);
                b = MH.middle_const(b);
                let on_c = MH.start_denom(c, a + vl + b);
                d = MH.start_var(d);
                e = MH.middle_const(e);
                let on_f = MH.start_denom(f, d + vl + e);
    
                return on_c + '=' + on_f; 
            },
            absorber: [H.randFromList(['b','e'])],
            number_of_coefs: 6
        },
        advan_6: {
            verify_reqs(a, b, c, d, e, f, g) {
                return !(
                    c < 0 ||
                    f < 0 ||
                    c === 1 ||
                    f === 1 ||
                    (a*f) === (-1)*(c*d) 
                );
            },
            get_sol(a, b, c, d, e, f, g) {
                return {
                    raw_value: ((c*f*g) - (b*f) - (c*e)) / ((a*f) + (c*d)),
                    numer: ((c*f*g) - (b*f) - (c*e)),
                    denom: ((a*f) + (c*d))
                };
            },
            create_prompt(vl, a, b, c, d, e, f, g) {
                a = MH.start_var(a);
                b = MH.middle_const(b);
                let on_c = MH.start_denom(c, a + vl + b);
                d = MH.start_var(d);
                e = MH.middle_const(e);
                let on_f = MH.middle_denom(f, d + vl + e);
                g = g + '';
    
                return on_c + on_f + '=' + g; 
            },
            absorber: [H.randFromList(['b','e','g'])],
            number_of_coefs: 7
        },
        advan_7: {
            verify_reqs(a, b, c, d, e, f, g) {
                return !(
                    c < 0 ||
                    g < 0 ||
                    c === 1 ||
                    g === 1 ||
                    (a*g) === (c*e) 
                );
            },
            get_sol(a, b, c, d, e, f, g) {
                return {
                    raw_value: ((c*f) - (b*g) - (c*d*g)) / ((a*g) - (c*e)),
                    numer: ((c*f) - (b*g) - (c*d*g)),
                    denom: ((a*g) - (c*e))
                };
            },
            create_prompt(vl, a, b, c, d, e, f, g) {
                a = MH.start_var(a);
                b = MH.middle_const(b);
                let on_c = MH.start_denom(c, a + vl + b);
                d = MH.middle_const(d);
                e = MH.start_var(e);
                f = MH.middle_const(f);
                let on_g = MH.start_denom(g, e + vl + f);
    
                return on_c + d + '=' + on_g;
            },
            absorber: [H.randFromList(['b','d','f'])],
            number_of_coefs: 7
        },
        advan_8: {
            verify_reqs(a, b, c, d, e, f) {
                return !(
                    c === 1 ||
                    d === 1 ||
                    c < 0 ||
                    a === (c*d*e) 
                );
            },
            get_sol(a, b, c, d, e, f) {
                return {
                    raw_value: ((c*d*f) - b) / (a - (c*d*e)),
                    numer: ((c*d*f) - b),
                    denom: (a - (c*d*e))
                };
            },
            create_prompt(vl, a, b, c, d, e, f) {
                a = MH.start_var(a);
                b = MH.middle_const(b);
                let on_c = MH.start_denom(c, a + vl + b);
                d = MH.start_var(d);
                e = MH.start_var(e);
                f = MH.middle_const(f);
    
                return on_c + '=' + d + '(' + e + vl + f + ')'; 
            },
            absorber: [H.randFromList(['b','f'])],
            number_of_coefs: 6
        },
        advan_9: {
            verify_reqs(a, b, c, d, e, f) {
                return !(
                    c === 1 ||
                    c < 0 ||
                    a === (c*e) - (c*d) 
                );
            },
            get_sol(a, b, c, d, e, f) {
                return {
                    raw_value: ((c*f) - b) / (a + (c*d) - (c*e)),
                    numer: ((c*f) - b),
                    denom: (a + (c*d) - (c*e))
                };
            },
            create_prompt(vl, a, b, c, d, e, f) {
                a = MH.start_var(a);
                b = MH.middle_const(b);
                let on_c = MH.start_denom(c, a + vl + b);
                d = MH.middle_var(d);
                e = MH.start_var(e);
                f = MH.middle_const(f);
    
                return on_c +  d + vl + '=' + e + vl + f; 
            },
            absorber: [H.randFromList(['b','f'])],
            number_of_coefs: 6
        },
        advan_10: {
            verify_reqs(a, b, c, d, e, f, g, h) {
                return !(
                    b < 0 ||
                    f < 0 ||
                    b === 1 ||
                    f === 1 ||
                    a === b ||
                    a === -b ||
                    e === f ||
                    e === -f ||
                    (a*c*f) === (b*e*g) 
                );
            },
            get_sol(a, b, c, d, e, f, g, h) {
                return {
                    raw_value: ((b*e*h) - (a*d*f)) / ((a*c*f) - (b*e*g)),
                    numer: ((b*e*h) - (a*d*f)),
                    denom: ((a*c*f) - (b*e*g))
                };
            },
            create_prompt(vl, a, b, c, d, e, f, g, h) {
                let a_on_b = MH.start_frac(a, b);
                c = MH.start_var(c);
                d = MH.middle_const(d);
                let e_on_f = MH.start_frac(e, f);
                g = MH.start_var(g);
                h = MH.middle_const(h); 
    
                return a_on_b + '(' + c + vl + d + ')=' + e_on_f + '(' + g + vl + h + ')';
            },
            absorber: [H.randFromList(['d','h'])],
            number_of_coefs: 8
        },
        advan_11: {
            verify_reqs(a, b, c, d, e, f) {
                return !(
                    a === 1 ||
                    b === 1 ||
                    d === 1 ||
                    e === 1 ||
                    b === -1 ||
                    e === -1 ||
                    (a*e) === (b*d) 
                );
            },
            get_sol(a, b, c, d, e, f) {
                return {
                    raw_value: ((b*d*e*f) - (a*b*c*e)) / ((a*e) - (b*d)),
                    numer: ((b*d*e*f) - (a*b*c*e)),
                    denom: ((a*e) - (b*d))
                };
            },
            create_prompt(vl, a, b, c, d, e, f) {
                a = MH.start_var(a);
                let x_on_b = MH.start_denom(b, vl);
                c = MH.middle_const(c);
                d = MH.start_var(d);
                let x_on_e = MH.start_denom(e, vl);
                f = MH.middle_const(f);
    
                return a + '(' + x_on_b + c + ')=' + d + '(' + x_on_e + f + ')'; 
            },
            absorber: [H.randFromList(['c','f'])],
            number_of_coefs: 6
        },
        advan_12: {
            verify_reqs(a, b, c, d, e, f, g, h, i) {
                return !(
                    a === 1 ||
                    d === 1 ||
                    g === 1 ||
                    (a*b) === (g*h) - (d*e) 
                );
            },
            get_sol(a, b, c, d, e, f, g, h, i) {
                return {
                    raw_value: ((g*i) - (a*c) - (d*f)) / ((a*b) + (d*e) - (g*h)),
                    numer: ((g*i) - (a*c) - (d*f)),
                    denom: ((a*b) + (d*e) - (g*h))
                };
            },
            create_prompt(vl, a, b, c, d, e, f, g, h, i) {
                a = MH.start_var(a);
                b = MH.start_var(b);
                c = MH.middle_const(c);
                d = MH.middle_var(d);
                e = MH.start_var(e);
                f = MH.middle_const(f);
                g = MH.start_var(g);
                h = MH.start_var(h);
                i = MH.middle_const(i);
    
                return a + '(' + b + vl + c + ')' + d + '(' + e + vl + f + ')=' + g + '(' + h + vl + i + ')';
            },
            absorber: [H.randFromList(['c','f','i'])],
            number_of_coefs: 9
        },
        advan_13: {
            verify_reqs(a, b, c, d, e, f, g, h) {
                return !(
                    b < 0 ||
                    d < 0 ||
                    f < 0 ||
                    h < 0 ||
                    b === 1 ||
                    d === 1 ||
                    f === 1 ||
                    h === 1 ||
                    a === b ||
                    c === d ||
                    e === f ||
                    g === h ||
                    (a*d*f*h) === (b*d*e*h) 
                );
            },
            get_sol(a, b, c, d, e, f, g, h) {
                return {
                    raw_value: ((b*d*f*g) - (b*c*f*h)) / ((a*d*f*h) - (b*d*e*h)),
                    numer: ((b*d*f*g) - (b*c*f*h)),
                    denom: ((a*d*f*h) - (b*d*e*h))
                };
            },
            create_prompt(vl, a, b, c, d, e, f, g, h) {
                let a_on_b = MH.start_frac(a, b);
                let c_on_d = MH.middle_frac(c, d);
                let e_on_f = MH.start_frac(e, f);
                let g_on_h = MH.middle_frac(g, h);
    
                return a_on_b + vl + c_on_d + '=' + e_on_f + vl + g_on_h;
            },
            absorber: [H.randFromList(['c','g'])],
            number_of_coefs: 8
        },
    };

    // backup template if generation fails/is invalid for any reason (only using JSON.parse() here so that all the text can be collapsed)
    const backups = JSON.parse(`
            {"all_begin": {"000": [[2,9,1],[4,1,45],[4,3,19],[9,5,4],[2,7,9,7],[2,6],[4,3,5],[2,56,1,7],[18,5,3,5],[8,40,8],[5,3,5],[4,4],[4,2,42],[3,2],[7,8,8],[7,40,5],[7,5,26],[1,2],[31,8,7,8],[4,3,7]],"001": [[4,3,7],[-8,56],[-6,4,54,6],[5,3,4],[6,3,27],[2,-4],[-3,6,-22,4],[4,5,41],[-3,-3,3],[-2,5],[6,-3,45],[-1,-9],[9,2,-36,4],[-71,8,1,8],[-14,-4,-2],[-1,-5],[2,-3],[5,-8,-26],[45,5,9,3],[-6,7,-54,9]],"010": [[6,4,9],[9,7],[2,7,1,4],[1,3,2,3],[5,4,4,2],[4,3,2],[1,4,2],[3,11,4],[9,11,9],[6,1,9],[3,4,1,2],[9,6,4],[21,4,9,2],[8,2,7],[9,3],[6,3,4],[7,1,7],[5,4,4,2],[4,5,6],[6,2,7,2]],"011": [[3,7,3],[-8,-1,1],[-2,3,2,4],[-2,4,-5],[2,3,6],[-5,3,-6],[6,-4,3],[-3,-1,-9],[8,-8,-4],[-7,3,-3,2],[21,4,9,2],[7,8,7],[3,8,-1,3],[3,9,1,2],[9,-4,3],[5,-6,3],[3,9,-1,2],[-15,-4,-6],[-6,4,-4,2],[-2,7,8]],"100": [[9,5,54],[9,18],[9,6,7],[2,43,8,4],[7,2,49,2],[2,5,30],[2,7,1],[49,2,3],[2,10],[9,2,5],[59,9,5,9],[5,20],[12,3,3],[4,7,21],[8,45,5],[24,4,9,3],[4,4],[1,2,64],[4,6,52],[4,3,4]],"101": [[-2,6,4],[3,-6,4],[-9,2,6],[-8,5],[1,6,-8],[4,3],[2,-3,18],[-9,-7,-8],[-3,2,-50,4],[3,-1,7],[9,5,36,5],[3,1,-2],[2,49,2,7],[-1,-7,6],[9,66,-9,6],[-2,-3,-8],[56,-6,-4],[3,-4,-45],[6,-6,6],[9,2,-65,2]],"110": [[5,9,35],[4,1,8],[2,33],[4,9,41],[7,2],[5,2,44],[1,4,32],[7,1,34],[2,6,23],[6,20],[6,4,6],[3,1,33],[3,17],[4,23],[5,9,38],[2,9,60],[4,20,4,3],[9,8,2,3],[17,7,2],[2,9,32]],"111": [[-6,2,-35,4],[-9,-14],[7,-5,36],[-5,4,-28],[-7,-5,66],[-7,62,5],[7,9,9],[-6,7,-24],[-8,-5,41],[-5,-4,7],[-8,-34],[1,2,-38,8],[8,44,-2,8],[-25,4,-8,4],[-69,6,-8,2],[-6,-8,-49],[5,1,-58],[-8,-5,63],[-71,4,7],[-1,2,-35,4]]},"begin_1": {"000": [[6,18],[8,56],[2,18],[7,7],[6,12],[4,36],[5,25],[9,54],[2,10],[4,28],[4,36],[7,49],[6,42],[8,72],[2,18],[8,56],[5,15],[7,56],[7,21],[7,14]],"001": [[-9,27],[-7,35],[-4,24],[8,-56],[9,63],[7,49],[-5,-10],[5,-30],[2,4],[-8,-16],[-9,27],[-7,63],[-5,-5],[5,-15],[7,-28],[8,40],[-9,9],[5,-35],[8,16],[-9,-36]],"010": [[2,9],[7,3],[8,5],[9,4],[3,7],[9,4],[9,4],[6,2],[8,2],[5,9],[8,7],[3,8],[7,4],[6,8],[7,8],[5,9],[7,9],[9,6],[3,7],[4,3]],"011": [[7,2],[4,-3],[-7,5],[-8,-9],[-6,8],[3,-7],[-9,1],[7,-4],[6,2],[3,-1],[2,-5],[-4,-1],[-6,9],[-9,-1],[6,2],[6,-5],[-7,-1],[-5,8],[4,-9],[5,6]],"100": [[2,16],[4,36],[3,54],[6,30],[2,54],[4,48],[4,44],[3,36],[2,10],[7,14],[4,16],[2,12],[6,36],[4,24],[8,8],[6,66],[5,30],[2,72],[6,12],[3,30]],"101": [[4,-32],[-1,38],[-7,14],[-9,63],[-3,-33],[2,-72],[-4,36],[-1,-23],[-4,-12],[-2,54],[-3,30],[-4,12],[-3,21],[2,-14],[2,14],[-4,20],[-3,6],[-4,-28],[-1,-71],[4,20]],"110": [[8,5],[6,22],[9,35],[3,16],[4,25],[6,3],[5,72],[6,27],[7,51],[9,28],[5,11],[4,55],[2,23],[3,67],[2,13],[6,44],[8,26],[9,65],[4,11],[3,29]],"111": [[-3,-26],[-6,-38],[-5,-31],[-4,-33],[6,13],[6,-2],[-8,-60],[-6,-65],[-9,-11],[-9,-29],[-3,25],[8,-26],[8,11],[-4,-23],[-4,30],[4,19],[9,48],[2,-39],[-4,-26],[7,-9]]},"begin_2": {"000": [[8,7],[7,5],[8,6],[6,8],[7,2],[3,5],[6,1],[7,3],[8,5],[5,8],[7,7],[6,9],[2,7],[7,9],[4,4],[6,8],[7,2],[2,7],[1,7],[7,7]],"001": [[7,8],[4,-4],[4,3],[6,-1],[-5,4],[-3,-5],[5,6],[8,6],[4,-2],[-1,5],[-4,2],[-3,3],[-7,-7],[-6,2],[5,8],[4,1],[9,1],[-7,-5],[9,9],[6,-1]],"010": [null],"011": [null],"100": [[4,1],[5,1],[6,3],[3,1],[7,4],[4,3],[7,9],[5,9],[3,5],[8,8],[2,9],[9,3],[5,8],[2,8],[9,5],[2,3],[2,7],[4,8],[5,6],[9,8]],"101": [[-1,6],[1,6],[-7,6],[-2,-5],[7,-7],[4,7],[-8,6],[-2,5],[-9,3],[-7,-9],[-7,-8],[9,2],[2,9],[-2,-3],[5,5],[-6,2],[-5,2],[6,-7],[2,-8],[-4,-6]],"110": [null],"111": [null]},"begin_3": {"000": [[5,9],[7,7],[4,6],[8,4],[9,7],[5,8],[4,1],[1,8],[5,4],[4,6],[8,1],[4,6],[2,3],[2,5],[6,8],[1,8],[1,5],[1,6],[7,1],[5,2]],"001": [[-2,-7],[-9,-4],[-7,-7],[-5,-4],[5,6],[5,8],[-4,-2],[5,3],[-4,2],[-1,-6],[-8,-7],[6,-3],[-8,-2],[-7,-7],[-4,-3],[-7,-7],[-3,-4],[1,-1],[2,5],[-4,-5]],"010": [null],"011": [null],"100": [[3,8],[4,9],[8,8],[1,7],[9,1],[8,7],[1,4],[3,3],[6,8],[5,7],[4,7],[3,2],[6,7],[2,5],[4,4],[3,4],[7,7],[1,8],[5,3],[6,5]],"101": [[1,4],[1,1],[-1,6],[-4,5],[5,-5],[-3,3],[4,-4],[-6,7],[5,-1],[8,-8],[-2,9],[3,-6],[-2,-2],[-6,-4],[-1,4],[-8,-9],[5,-2],[6,-1],[-7,1],[6,-5]],"110": [null],"111": [null]},"begin_4": {"000": [[7,1],[7,1],[9,1],[3,1],[2,3],[2,4],[3,1],[4,2],[4,2],[5,1],[5,1],[3,1],[7,1],[6,1],[3,1],[7,1],[6,1],[7,1],[3,3],[3,3]],"001": [[6,1],[-3,2],[-3,-1],[-5,1],[-4,-2],[4,-1],[9,1],[6,1],[9,1],[2,-2],[-2,2],[-5,-1],[-9,1],[5,-1],[-8,1],[-5,1],[2,-1],[-9,1],[2,-4],[-2,4]],"010": [null],"011": [null],"100": [[4,3],[4,9],[6,6],[3,8],[7,4],[6,1],[8,1],[7,4],[6,1],[6,2],[6,8],[2,8],[9,1],[3,1],[5,7],[3,8],[5,9],[4,9],[3,7],[2,9]],"101": [[6,-1],[5,9],[-4,-4],[-4,-9],[7,-6],[6,4],[7,2],[6,-8],[2,3],[-9,4],[3,3],[-5,-5],[3,1],[6,4],[-4,7],[3,-8],[6,1],[2,5],[-3,1],[-2,-2]],"110": [null],"111": [null]},"begin_5": {"000": [[2,9,21],[7,8,57],[8,3,19],[9,46,1],[9,25,7],[2,3,21],[6,19,1],[3,4,1],[6,62,8],[8,2,34],[3,2,11],[2,21,3],[9,29,2],[6,63,9],[3,15,3],[9,61,7],[2,21,3],[3,9,36],[8,71,7],[7,32,4]],"001": [[3,-9,-24],[-8,-5,-69],[4,-27,-7],[-4,5,41],[7,29,-6],[3,3,21],[5,-6,9],[-8,-66,-2],[-6,-3,-39],[-2,5,-1],[2,-3,-21],[4,8,40],[6,-62,-8],[4,-1,-37],[-9,36,9],[7,61,-2],[3,12,9],[-3,8,-7],[-9,44,8],[5,38,-7]],"010": [[9,13,8],[4,6,15],[8,6,8],[7,10,2],[4,5,8],[8,9,7],[2,11,4],[3,5,10],[3,7,11],[8,16,7],[7,16,7],[7,10,6],[7,5,13],[2,11,8],[9,3,8],[6,11,8],[8,9,10],[7,2,7],[8,6,12],[7,4,6]],"011": [[3,-9,-7],[-9,11,3],[7,-4,1],[-8,3,7],[7,-9,-5],[-2,2,-1],[2,5,8],[3,-11,-3],[5,-1,3],[4,-6,-7],[6,4,-4],[-5,5,9],[-5,15,8],[-8,8,10],[-2,9,6],[-3,-1,3],[3,4,9],[-5,-9,-1],[-5,-3,-7],[-7,1,-5]],"100": [[3,6,72],[2,16,2],[2,5,17],[6,1,1],[5,34,9],[9,6,6],[6,35,5],[2,3,29],[9,8,17],[4,6,42],[6,8,32],[6,67,1],[7,53,4],[7,1,1],[8,46,6],[6,70,4],[2,6,66],[4,3,11],[9,4,13],[4,49,5]],"101": [[2,-9,21],[4,-70,-2],[8,-36,-4],[6,-59,-5],[6,-5,55],[9,-10,8],[8,1,-55],[5,-51,4],[-7,1,8],[-8,-1,-25],[6,-50,-8],[-3,7,-11],[8,4,-4],[4,-18,-6],[-9,5,5],[4,-7,5],[-4,-68,4],[3,61,-8],[-7,-51,-2],[4,7,3]],"110": [[7,1,6],[8,59,5],[4,5,26],[3,2,72],[7,15,7],[6,33,4],[7,7,20],[5,10,1],[7,3,43],[2,4,17],[9,20,4],[8,42,8],[4,43,1],[5,8,12],[8,6,5],[7,2,7],[4,35,6],[3,43,5],[7,23,1],[8,1,62]],"111": [[-5,-31,-2],[-3,3,14],[7,-5,32],[3,-20,-9],[4,-66,3],[-7,-9,-47],[7,-5,17],[9,6,35],[2,-68,-1],[-3,-3,62],[-5,-15,1],[2,33,-4],[-8,-3,-25],[-6,-42,-2],[2,-23,-2],[4,17,3],[2,-23,-8],[7,5,66],[5,12,-9],[-3,9,-10]]},"begin_6": {"000": [[5,8,5],[7,2,23],[55,6,1],[8,8,16],[1,9,28],[7,5,52],[60,6,6],[4,7,67],[48,7,6],[9,2,3],[18,2,4],[8,8,56],[14,2,8],[66,7,3],[33,8,9],[61,9,7],[49,7,7],[4,8,20],[10,6,4],[5,3,26]],"001": [[15,4,-5],[2,-9,56],[7,-1,1],[-66,-8,-2],[-8,-5,-8],[-6,-7,22],[6,9,33],[-2,-7,-2],[1,8,17],[6,5,-39],[32,-7,4],[71,9,-1],[-5,8,3],[-6,4,-34],[5,9,-58],[-9,6,-21],[-5,-9,67],[-4,-8,-52],[6,5,26],[-68,-9,-5]],"010": [[3,9,6],[2,4,8],[4,3,8],[15,8,9],[9,7,15],[10,7,2],[17,8,8],[12,8,8],[7,6,9],[6,2,13],[8,6,5],[9,3,11],[1,4,8],[6,6,7],[3,3,8],[16,8,9],[11,5,3],[3,4,5],[16,4,9],[6,9,5]],"011": [[8,-9,6],[17,-6,8],[16,8,9],[-10,-8,-5],[6,-8,5],[6,-7,3],[-2,5,2],[3,4,-3],[-4,-2,-3],[1,-6,2],[12,-9,6],[-5,-6,-9],[12,2,3],[16,9,9],[1,-9,-2],[8,5,2],[-6,-7,-12],[-14,5,-8],[-2,3,-9],[4,7,-5]],"100": [[8,2,2],[46,7,4],[5,8,21],[51,4,7],[2,2,2],[7,8,31],[13,8,5],[2,4,42],[7,2,19],[8,7,29],[8,2,26],[3,9,3],[5,9,5],[5,2,31],[14,6,2],[42,5,2],[4,2,70],[18,3,6],[4,7,53],[6,5,61]],"101": [[10,-6,-2],[-2,5,-22],[33,6,9],[-1,-1,53],[-14,8,-6],[-5,9,40],[57,-3,3],[-2,-1,2],[4,-7,4],[14,-1,6],[15,-3,-9],[-8,-1,31],[-4,4,-12],[-9,-1,18],[38,6,8],[-6,2,6],[2,-3,14],[-55,-4,-7],[4,2,14],[-6,-5,9]],"110": [[4,9,10],[7,6,27],[31,6,4],[6,4,8],[14,5,3],[34,2,3],[9,7,7],[49,5,2],[50,3,9],[5,5,68],[6,6,20],[3,8,50],[1,6,17],[2,5,61],[3,7,53],[4,5,33],[4,6,56],[4,9,12],[6,3,35],[6,8,69]],"111": [[-40,-4,-6],[65,-9,6],[9,-4,71],[-9,7,1],[8,-8,-5],[45,-2,-2],[-4,-8,2],[-27,-7,-9],[8,3,57],[2,5,-10],[28,-8,6],[-6,-8,-4],[5,-3,64],[43,-5,9],[31,2,8],[-5,6,-54],[10,8,3],[22,8,-7],[55,2,-6],[26,-9,-8]]},"begin_7": {"000": [[2,9,56],[9,6,24],[8,1,42],[6,1,45],[8,2,42],[6,7,9],[6,2,32],[4,8,8],[1,8,63],[2,6,32],[5,2,15],[4,6,12],[9,2,63],[1,9,56],[9,3,48],[2,7,30],[4,7,27],[7,4,6],[3,2,3],[9,1,72]],"001": [[-1,-2,8],[9,-7,64],[3,-2,-10],[-8,-2,42],[4,2,-6],[8,-2,30],[7,5,12],[-6,2,48],[-6,5,55],[1,9,56],[9,2,-35],[1,5,-32],[2,3,8],[-4,2,48],[-3,8,44],[8,1,-42],[5,8,21],[8,3,40],[-9,5,-14],[-6,-2,-24]],"010": [[5,7,1],[1,4,8],[5,3,1],[9,5,6],[7,3,7],[9,4,8],[7,4,2],[2,5,4],[7,3,3],[8,2,4],[4,8,7],[5,1,2],[3,7,9],[5,7,3],[8,5,4],[7,2,8],[7,5,7],[3,1,1],[6,9,8],[1,8,2]],"011": [[6,3,-5],[2,6,-3],[-8,-4,9],[8,6,7],[-8,1,8],[7,-1,-2],[-6,2,3],[-9,-3,-7],[-4,5,-5],[-5,-7,1],[-2,-4,1],[8,2,-5],[6,8,9],[-2,7,8],[4,2,3],[-5,-2,7],[-9,-3,1],[6,-1,-9],[2,8,4],[4,2,1]],"100": [[3,4,11],[7,8,3],[6,5,43],[1,4,51],[7,9,40],[1,2,22],[2,1,62],[8,7,18],[8,4,44],[5,4,1],[3,6,33],[3,7,36],[2,3,36],[4,1,48],[1,4,15],[5,2,45],[2,5,30],[5,7,28],[1,3,34],[8,3,5]],"101": [[8,7,1],[2,6,32],[4,7,30],[-6,-4,68],[-3,-6,15],[2,3,-6],[-4,-6,44],[3,8,-35],[4,5,63],[-4,4,32],[9,8,-16],[-8,-7,1],[-2,-1,-44],[-8,-3,-15],[-5,-7,58],[4,3,-3],[-9,-8,-13],[3,1,72],[-4,3,-14],[-9,-8,9]],"110": [[6,9,38],[7,4,43],[2,8,10],[1,4,64],[6,8,69],[4,2,37],[6,8,5],[9,1,21],[9,6,28],[6,2,6],[6,1,58],[4,7,29],[4,9,23],[3,7,22],[6,1,1],[1,3,71],[3,9,59],[6,1,32],[4,1,23],[1,3,55]],"111": [[-3,9,-65],[5,-1,59],[9,2,-18],[-4,3,-64],[5,8,49],[-5,1,9],[4,-4,46],[7,-8,58],[3,-4,-16],[2,-5,-37],[-8,7,31],[2,-6,15],[9,-2,5],[-6,9,-10],[5,-9,-26],[-9,1,-32],[-7,-4,71],[-6,9,52],[2,-8,-68],[3,-1,38]]},"begin_8": {"000": [[5,3,70,7],[4,2,56,7],[4,3,64,8],[8,45,8,9],[2,49,2,7],[9,6,3,2],[3,24,3,4],[9,3,18,2],[6,60,4,5],[9,2,9,2],[8,3,48,9],[5,21,5,3],[8,4,18,3],[4,36,4,9],[2,18,8,9],[7,2,21,6],[2,49,2,7],[3,5,21,5],[9,3,60,4],[4,72,2,4]],"001": [[-2,7,4,2],[7,5,35,5],[-8,7,16,7],[-4,8,3,6],[-9,7,-72,7],[-7,2,-35,5],[9,7,-18,7],[-7,8,14,4],[1,2,28,8],[5,70,-1,2],[-9,8,-45,8],[-7,49,-2,7],[-9,5,-72,8],[1,64,1,8],[1,9,8,9],[-4,2,48,8],[-3,49,3,7],[9,4,63,7],[-7,9,-14,9],[-9,40,9,5]],"010": [[2,8,1,3],[4,5,1,2],[3,6,1,3],[1,8,1,9],[2,4,2,3],[3,9,1,2],[4,7,1,2],[1,4,2,9],[4,5,1,2],[3,8,1,3],[1,4,1,5],[3,5,1,2],[4,6,1,2],[4,2,3,2],[4,9,1,2],[1,4,2,5],[1,5,1,2],[2,9,1,2],[2,9,1,3],[2,8,1,3]],"011": [[-1,7,-1,3],[-2,4,1,3],[1,5,1,7],[-4,7,-1,2],[3,6,1,3],[-2,6,1,4],[-3,8,-1,3],[-1,6,-1,7],[3,6,-1,3],[2,3,1,4],[4,7,-1,2],[-1,4,2,3],[-4,2,1,2],[-2,6,-1,4],[-3,8,1,2],[-2,6,1,2],[3,5,1,2],[-2,7,1,2],[-4,3,1,2],[3,9,1,2]],"100": [[7,5,70,5],[8,4,4,2],[1,47,4,2],[7,2,7,2],[7,63,4,2],[3,2,6,4],[2,65,4,5],[5,3,30,9],[1,7,24,6],[4,31,8,2],[1,56,1,7],[8,4,72,6],[6,7,6,7],[4,47,8,2],[1,62,2,4],[7,36,7,6],[9,5,9,5],[1,2,56,8],[1,4,18,3],[5,6,5,3]],"101": [[-7,50,-7,5],[-6,66,8,4],[-5,3,15,9],[7,2,70,5],[-6,8,45,5],[-2,4,25,5],[-4,9,24,2],[-7,63,8,2],[9,30,-9,3],[2,4,-65,2],[-1,18,3,2],[-8,42,-4,7],[9,7,-18,2],[-1,9,64,6],[5,44,-5,4],[-8,9,8,3],[-1,69,-4,3],[-7,6,-14,4],[-3,16,3,8],[4,2,6,3]],"110": [[4,57,1,3],[6,61,1,7],[4,28,1,4],[2,18,2,7],[9,18,3,7],[5,2,7,4],[6,23,1,5],[8,25,3,4],[5,31,2,5],[8,2,44,4],[1,37,2,9],[3,2,44,4],[6,57,1,3],[8,2,21,6],[8,15,6,2],[2,4,21,5],[7,59,1,8],[8,71,1,7],[9,2,2,4],[6,9,6,5]],"111": [[8,3,26,6],[-3,2,-34,3],[3,2,48,7],[-1,18,3,5],[-7,14,-1,4],[9,56,-1,9],[8,2,-42,5],[5,2,-43,7],[-7,2,46,7],[1,5,-7,2],[-7,5,8,7],[-2,14,-2,3],[4,17,4,3],[-7,50,1,8],[-9,22,-4,3],[-3,2,5,6],[-7,42,-1,9],[4,2,-38,2],[-4,48,-1,5],[4,69,1,9]]},"begin_9": {"000": [[17,8,9,8],[2,5,37,5],[3,2,17,2],[6,3,12,6],[33,7,5,7],[3,9,57,9],[16,5,1,5],[3,7,10,7],[4,8,5,2],[3,5,23,5],[4,6,51,9],[2,3,58,6],[2,3,24,9],[11,6,5,6],[9,3,36,9],[3,7,3,7],[3,8,43,8],[55,8,7,8],[9,3,48,8],[3,2,45,6]],"001": [[6,3,6,3],[1,8,-55,8],[1,8,9,8],[-4,3,42,9],[-58,9,5,9],[9,7,65,7],[51,8,3,8],[6,3,8,4],[61,8,-3,8],[-37,8,3,8],[28,8,3,6],[7,2,4,8],[-25,2,-9,2],[-2,5,13,5],[-4,3,60,9],[-51,9,2,6],[30,8,-1,4],[45,7,-4,7],[6,8,27,4],[8,4,42,6]],"010": [[9,2,21,4],[16,4,7,2],[9,2,21,4],[21,4,9,2],[2,3,4,2],[10,4,4,2],[21,4,9,2],[11,2,8,2],[14,4,6,2],[5,2,7,3],[21,4,9,2],[21,4,9,2],[8,2,10,3],[5,2,11,3],[3,4,1,2],[11,3,6,2],[3,2,2,3],[10,4,6,2],[9,2,21,4],[5,3,6,3]],"011": [[6,2,3,2],[7,2,15,3],[-10,3,-9,3],[9,2,21,4],[9,2,21,4],[-2,3,1,2],[-16,3,-9,2],[-9,2,-21,4],[-5,2,-11,3],[-14,3,-7,2],[-9,2,-21,4],[-7,3,-6,3],[5,2,4,3],[3,4,3,2],[-7,4,-3,2],[7,3,4,2],[-1,2,-1,3],[-4,2,-7,3],[-21,4,-9,2],[-12,2,-9,2]],"100": [[10,7,3,7],[2,7,58,7],[7,3,21,9],[23,4,6,8],[38,2,6,3],[7,9,43,9],[5,2,58,4],[4,8,68,8],[1,3,1,3],[10,4,2,4],[43,6,7,6],[9,7,65,7],[9,2,15,6],[3,5,68,5],[7,2,15,6],[2,9,38,9],[54,8,6,8],[5,8,37,8],[1,3,55,3],[30,2,8,4]],"101": [[60,9,-4,3],[-8,9,1,9],[68,2,-8,4],[-1,2,15,2],[9,8,-7,8],[39,5,9,5],[8,5,63,5],[-54,3,8,4],[-5,4,-2,8],[-1,6,-43,6],[27,6,7,2],[3,4,-61,4],[1,2,27,6],[-8,4,21,3],[-4,5,26,5],[47,6,5,6],[-53,9,1,9],[-10,9,-1,9],[-2,9,-65,9],[-3,6,-55,2]],"110": [[9,2,69,9],[24,3,1,2],[5,2,59,5],[3,6,21,9],[8,2,71,7],[33,6,6,2],[5,6,15,5],[6,4,24,4],[54,8,3,2],[9,2,64,5],[8,6,21,6],[70,9,7,2],[9,4,37,7],[57,2,8,2],[7,4,39,9],[13,3,6,9],[9,2,56,6],[1,5,21,8],[3,2,30,8],[5,8,5,9]],"111": [[-6,4,2,6],[-16,8,-4,6],[4,2,37,2],[5,2,46,7],[63,7,9,2],[4,2,50,8],[-11,5,-3,5],[-36,8,-7,4],[-6,2,-64,9],[-29,6,-9,4],[11,9,4,6],[29,3,-2,3],[1,3,22,2],[5,4,-6,4],[-6,9,-8,9],[-2,8,-4,6],[6,5,25,7],[2,8,1,6],[34,5,9,4],[-28,5,-7,3]]},"begin_10": {"000": [[4,3,3],[3,6,2],[9,8,2],[2,7,1],[4,8,1],[2,3,3],[4,3,4],[8,4,1],[3,5,1],[6,3,4],[9,3,6],[5,2,3],[6,3,5],[4,4,3],[3,3,3],[3,4,1],[7,9,1],[4,4,1],[3,5,1],[9,3,1]],"001": [[4,4,1],[7,-9,-1],[-1,7,-1],[9,-9,-1],[-5,3,-1],[5,-2,-3],[-3,7,-1],[-9,7,-2],[-6,2,-2],[-1,5,1],[-2,2,-2],[-3,-2,2],[5,2,-1],[1,-8,-1],[3,-3,-3],[-8,2,-8],[-8,-8,2],[-3,-3,-1],[7,2,1],[8,3,5]],"010": [null],"011": [null],"100": [[3,7,6],[7,7,6],[2,3,3],[9,3,1],[7,3,6],[6,3,2],[6,6,2],[2,6,1],[8,2,6],[9,8,5],[5,6,4],[1,2,3],[7,9,5],[2,7,2],[1,7,7],[7,5,3],[3,8,3],[6,7,4],[2,7,4],[9,7,3]],"101": [[-1,3,-3],[3,3,9],[3,5,-8],[-8,-8,-1],[2,-5,9],[9,-9,-8],[-5,7,-9],[-1,5,9],[9,-8,-6],[-9,2,-2],[6,5,-3],[-5,-3,7],[8,-4,-4],[-2,-4,5],[-3,-4,3],[-8,5,-1],[-3,-2,-5],[2,-9,-7],[2,8,4],[8,2,3]],"110": [null],"111": [null]},"begin_11": {"000": [[4,9,8],[3,6,5],[9,8,7],[4,2,3],[3,1,4],[7,6,7],[4,7,9],[9,6,7],[5,3,2],[5,7,6],[8,4,4],[4,6,7],[7,6,6],[7,9,8],[4,4,2],[9,7,8],[9,1,1],[8,2,1],[3,8,6],[9,7,6]],"001": [[8,-2,-2],[-5,3,3],[5,-8,-7],[2,9,7],[2,-4,-4],[3,7,9],[-3,9,7],[-3,-6,-6],[4,6,5],[8,-1,-2],[-8,-5,-5],[3,2,-1],[9,5,5],[7,-4,-5],[-9,-4,-5],[-8,2,1],[-4,-3,-5],[4,2,3],[-4,-3,-1],[-9,-8,-7]],"010": [null],"011": [null],"100": [[4,2,1],[6,2,8],[6,7,8],[8,6,9],[2,5,3],[6,5,3],[5,2,7],[2,1,1],[4,9,5],[6,9,2],[3,2,1],[3,3,4],[9,3,7],[3,1,6],[2,1,5],[4,4,4],[2,7,8],[3,7,4],[4,6,2],[4,1,4]],"101": [[8,-7,-5],[4,1,-8],[-6,2,-8],[5,-2,-5],[8,-4,-9],[-5,-6,8],[6,5,-5],[-4,5,3],[-9,1,9],[4,-9,-3],[-7,9,5],[-4,3,-8],[5,-9,-3],[-9,3,9],[-4,-9,3],[-8,-3,-4],[4,-7,5],[-8,-1,-2],[-7,8,-2],[-9,8,3]],"110": [null],"111": [null]},"begin_12": {"000": [[6,3,7],[7,9,6],[5,3,4],[3,6,4],[8,4,6],[6,3,7],[4,4,2],[9,3,9],[6,2,6],[7,4,9],[7,3,4],[7,2,3],[4,9,4],[4,9,5],[5,3,3],[2,6,3],[4,6,5],[9,5,9],[5,9,4],[5,8,6]],"001": [[-1,6,-2],[-2,-3,-1],[9,7,9],[9,-7,9],[5,-2,1],[3,-4,3],[-1,3,1],[3,5,2],[-1,4,-3],[2,-9,3],[-5,-9,-6],[-6,4,-4],[-3,-3,-2],[-5,-3,-4],[2,2,-2],[-4,-4,-4],[1,-4,3],[-1,3,-1],[5,-2,5],[7,-2,7]],"010": [null],"011": [null],"100": [[3,7,3],[7,6,4],[4,5,7],[9,4,2],[6,5,4],[4,2,5],[1,8,7],[6,7,9],[9,4,2],[1,5,1],[1,5,4],[2,5,6],[8,7,9],[4,3,2],[9,7,1],[7,5,6],[4,4,4],[7,9,1],[4,8,6],[7,9,1]],"101": [[-5,6,-9],[9,4,6],[-2,2,8],[-7,5,-8],[1,5,3],[-9,5,4],[2,-2,9],[-1,-2,-6],[9,-5,5],[3,-9,-8],[-5,-5,-8],[-8,6,-6],[2,-7,-7],[-6,-7,7],[-9,-2,6],[3,-4,-2],[-5,3,-3],[7,-7,3],[-3,8,-7],[-7,9,-7]],"110": [null],"111": [null]},"begin_13": {"000": [[8,1,9],[2,2,12],[6,8,28],[6,4,40],[6,4,30],[7,2,9],[6,5,22],[5,1,18],[2,7,45],[4,4,72],[5,6,33],[5,2,7],[8,5,26],[1,8,63],[6,4,10],[3,7,20],[1,2,24],[9,4,13],[5,2,14],[4,3,7]],"001": [[5,-6,2],[-5,1,-28],[1,-3,-12],[-8,5,-18],[2,2,12],[5,9,-42],[1,-9,56],[-6,-1,-56],[4,3,-28],[3,1,20],[6,2,72],[-1,-3,-36],[7,-1,12],[8,8,-64],[-9,-1,40],[-5,-2,49],[-1,7,-30],[-1,8,-42],[4,4,64],[-8,-8,64]],"010": [[1,5,4],[6,2,3],[3,1,3],[2,3,2],[5,4,6],[8,1,5],[1,4,2],[2,6,4],[3,5,4],[6,2,2],[2,4,8],[3,4,8],[8,1,7],[7,2,5],[7,1,7],[2,5,6],[7,2,3],[8,1,4],[4,4,3],[8,1,3]],"011": [[4,-1,5],[6,-1,-4],[-3,8,9],[-9,1,-9],[5,-7,3],[3,-5,-7],[4,3,1],[5,3,2],[1,-8,1],[1,-6,7],[-4,8,7],[8,-3,-3],[2,1,-4],[4,2,-9],[-1,9,-5],[-9,7,7],[1,-4,7],[-9,7,-3],[-1,-6,2],[8,-4,-5]],"100": [[4,7,55],[5,1,18],[6,2,16],[7,4,22],[9,6,30],[9,1,10],[4,1,55],[4,5,18],[4,1,50],[6,8,56],[3,2,65],[2,1,3],[5,3,8],[7,4,22],[8,6,14],[3,2,15],[2,5,49],[1,3,16],[1,1,44],[4,3,14]],"101": [[-3,7,-40],[9,-3,-54],[2,1,-48],[4,2,60],[-4,7,51],[1,-4,12],[1,-2,-41],[6,-2,16],[2,-5,42],[1,-9,-56],[-9,-7,-32],[4,-5,-6],[5,-9,-36],[7,3,40],[6,-8,-34],[-3,2,62],[-8,3,65],[-4,2,38],[-1,-2,3],[7,-8,-23]],"110": [[3,7,46],[8,7,70],[2,3,37],[6,5,43],[5,8,30],[8,8,42],[3,4,36],[9,2,21],[4,3,39],[7,8,32],[6,4,2],[1,3,14],[9,1,25],[2,3,48],[4,2,27],[7,6,34],[9,6,41],[9,2,18],[8,9,14],[6,8,25]],"111": [[-4,-7,68],[8,6,-50],[-9,-2,-62],[-4,-5,-22],[-1,6,18],[-4,-8,-71],[6,-4,35],[3,-9,-33],[-5,-2,-45],[8,-2,62],[-1,8,-15],[-6,3,-37],[-1,-2,40],[5,-2,64],[-7,-2,47],[-8,-3,23],[4,-6,9],[1,6,29],[-5,-8,-58],[3,4,8]]},"all_inter": {"000": [[6,6,5,2,60],[4,6,5,9,20],[7,8,6,15,1],[9,7,48,2,1],[2,3,4,4,12],[9,1,8,6,15],[2,1,4,4,4,23],[2,5,12],[5,5,2],[22,7,8,5,1],[2,8,5,1,7],[6,24,3,7],[29,8,6,9,5],[20,1,3,8],[8,4,35,9,1],[1,38,7,8],[2,6,8,42,2],[6,4,9,66,9],[8,8,1],[7,6,8,61]],"001": [[3,7,8,-1,5],[2,-8,8,1,1],[-68,-7,2,4],[2,-5,-20,-9,1],[2,-4,1,-1],[7,7,-6,50],[-3,40,-3,9,-5],[2,4,-5,-34],[6,-27,6,8],[-15,3,-3,3],[-5,-7,58,9,-1],[-72,-4,1,-8,-4],[-10,-1,1,-9,-1],[-7,5,-50,-2,-4,-3],[3,1,-8,-4,-7,6],[7,8,-2,-64],[7,9,36,-8,2],[9,6,-2,-1,46],[-3,7,8,-2,9],[9,-8,7,2]],"010": [[2,2,6,3,21],[2,4,8,1,24],[7,6,1,9,63],[4,2,9,38],[8,1,1,6,2],[2,3,6,7,14],[5,6,7,13],[5,1,3,3,16],[1,4,1,6,27],[8,15,9,8,9],[9,3,4,11],[3,3,3,5,12],[4,2,1,9],[7,9,59],[6,2,1,3],[7,3,6,2,6,23],[8,1,7,1,54],[7,6,2,10],[3,6,1,3,3,2],[4,9,43]],"011": [[8,-6,1,3,-8],[2,-1,4,4,-1],[6,-1,8,3,55],[4,2,1],[4,2,-2,3],[-4,10,2,9],[-9,7,-4,4],[-3,2,1,-8],[2,1,-3,13,7],[3,5,-2,-8,-1,1],[-9,-1,1,-3],[2,9,13],[-8,1,-8,-2,57],[-1,1,-40,7,1,7],[5,16,2,8],[2,4,-1],[-2,9,-7,4,-6,4],[-8,-2,-2,1,5],[6,4,-3,8,40],[2,-11,-3,-7,-6]],"100": [[8,3,7,5,23],[6,39,2,6],[13,3,2,1],[3,4,4,63,7],[9,6,2,7,10],[4,4,50,2,7,3],[7,9,6,30],[2,12,1,6],[5,20,3,9,3],[42,6,5,5],[8,4,17,8],[3,3,56],[9,6,5,2,30],[5,7,57,5],[4,9,24],[2,2,2,36,6],[8,1,32],[6,2,42],[8,4,5,6,14],[2,9,8]],"101": [[7,-1,32,-7,-4,-2],[7,5,-5,-3,-3],[-6,-5,-54,-5,-1],[-3,-4,-27,7,8],[-6,-5,5,60],[9,-4,1,-72,3],[-9,-8,-3,67,7],[-8,8,-2,-10],[-7,18,6,-2,7],[-4,12,5,-5,-6],[-2,-6,20,-7,1],[-3,39,9,2,-9],[-3,3,48,2,-4],[7,6,49],[5,2,-4,38],[-6,3,-4,-8,-2],[-9,-8,-65,1,1],[2,6,-42,3,9],[9,-1,4,4,-4,72],[8,-36,-2,4,4]],"110": [[3,9,24,1,2],[4,14,6,9],[6,2,6,28,1],[54,2,1,6,7],[9,5,6,65],[6,5,3,9,44],[6,8,3,8,37],[5,1,12,9,7],[4,4,6,5],[5,44,7,4,9],[9,3,8,3,2],[5,2,3,7],[2,13,7,7],[6,8,3,64],[2,1,38,2,3],[7,13,5,8,3],[6,22,8,8],[2,2,49,1,2],[2,7,4,52],[1,27,8,2]],"111": [[7,-61,2,-9],[4,4,2,-19],[-7,5,-34],[-2,-6,9,-31],[-6,19,1,-3],[-1,-3,-4,-1,-7],[-2,39,8,8],[8,-5,-3,21,-8],[-3,-1,4,62,9],[2,1,5,5,6],[-3,2,-8,6],[-9,2,9,56,5],[-58,7,1,-2],[-6,-5,2,-9],[-4,-7,3,-6],[-1,-7,7,23,-7],[-2,3,-49,-6,6],[-8,2,-5,-7,-54],[-2,-52,-2,-5],[-2,41,3,4]]},"inter_1": {"000": [[4,8,8,44],[1,64,8,8],[7,8,5,22],[3,2,4,1],[6,11,7,4],[4,2,7,5],[4,8,5,7],[9,6,5,38],[3,7,2,3],[7,7,6,9],[7,7,1,55],[1,8,6,43],[4,7,3,9],[1,6,4,12],[5,17,7,5],[9,50,3,8],[1,9,3,13],[1,8,4,26],[6,53,1,8],[1,2,8,58]],"001": [[-5,-3,8,-42],[-9,54,-4,9],[-1,-3,1,-21],[-8,23,9,6],[-4,-3,-6,-21],[-8,-15,-4,5],[-5,27,4,-9],[-3,-8,4,20],[9,-16,-9,2],[3,7,7,-13],[8,37,2,7],[-4,-34,6,6],[3,-2,-5,-2],[6,-2,9,-14],[5,4,4,1],[-1,72,-8,9],[3,6,-5,62],[4,-4,-2,26],[2,-4,4,-4],[7,60,-1,4]],"010": [[8,5,4,8],[8,6,5,7],[8,13,3,6],[6,6,4,1],[6,14,2,7],[5,7,8,2],[4,8,7,10],[4,5,2,4],[3,6,5,1],[4,2,2,1],[3,8,6,6],[8,14,1,9],[8,12,1,7],[7,17,9,8],[3,17,6,9],[7,15,2,9],[7,1,4,9],[1,3,9,2],[5,2,9,5],[3,7,8,3]],"011": [[7,15,1,6],[-8,-8,-4,-6],[2,9,-6,15],[7,-15,2,-9],[-7,-2,-1,-5],[-8,6,-2,9],[-9,6,-5,3],[-2,8,6,-1],[-4,1,-1,-4],[-5,-12,4,-4],[1,13,7,9],[2,11,9,2],[-8,12,-1,7],[4,6,-3,5],[3,-8,-2,-4],[8,-3,1,-2],[-6,6,1,2],[2,7,5,8],[7,5,9,8],[9,-1,2,-2]],"100": [[5,9,3,19],[3,50,4,7],[5,5,6,1],[3,6,1,24],[3,6,7,62],[8,69,9,8],[4,68,3,2],[5,4,6,51],[1,4,4,10],[9,49,1,1],[2,2,1,67],[2,41,7,1],[6,4,5,4],[6,8,8,4],[7,6,6,32],[9,36,6,9],[7,1,5,55],[3,5,4,5],[3,41,6,5],[8,11,1,4]],"101": [[8,-32,2,-2],[-6,19,1,-2],[-8,-7,-9,34],[-3,32,-5,6],[4,7,5,-60],[-3,4,1,-44],[-2,-6,-5,-12],[3,4,6,-26],[-7,-3,-8,-19],[8,-2,7,2],[1,-8,-4,27],[-8,-3,-9,7],[3,6,6,-3],[-5,-63,-7,5],[-7,9,-6,38],[4,-4,3,59],[2,-1,1,-18],[-8,2,-1,51],[-8,-8,-7,1],[5,-32,4,-6]],"110": [[9,7,4,25],[6,9,4,10],[8,4,4,35],[2,2,8,3],[6,11,3,1],[8,2,6,1],[8,2,6,11],[5,32,7,9],[6,7,3,68],[8,6,2,31],[6,7,1,5],[6,17,2,2],[3,6,8,19],[2,35,6,2],[2,54,9,6],[5,7,9,21],[1,38,5,5],[4,1,7,11],[5,2,8,70],[1,6,4,5]],"111": [[1,-2,-9,2],[3,9,7,2],[3,71,1,8],[-7,-7,8,60],[-1,10,-4,-9],[6,-3,-9,-67],[-4,21,-6,8],[-6,22,7,4],[8,-9,1,-10],[4,-22,-5,3],[-6,8,-8,41],[-6,7,7,-61],[3,9,1,4],[-5,-5,-8,-60],[2,-36,-6,-6],[-5,3,2,27],[6,-59,4,8],[5,17,-8,-2],[9,3,5,-19],[-5,-72,-2,5]]},"inter_2": {"000": [[21,5,9,1],[10,6,5,4],[36,4,9,1],[1,7,6,8],[9,5,9,41],[16,7,5,2],[27,9,3,9],[26,5,8,5],[17,5,6,9],[3,1,3,21],[5,2,5,5],[1,7,2,46],[1,7,2,36],[33,5,9,1],[3,4,1,21],[52,1,7,4],[1,3,8,26],[3,9,5,27],[48,3,9,6],[35,2,7,5]],"001": [[-4,-7,3,-34],[-5,-2,3,-45],[-3,7,5,-13],[-8,-4,5,1],[18,9,-3,-6],[-7,-7,-9,1],[8,9,-1,-22],[9,-7,6,-43],[-35,7,-6,-9],[69,8,-2,-1],[57,5,-1,9],[-25,9,-7,-9],[-6,-6,7,-32],[-7,-8,1,47],[-72,-2,8,-2],[-2,3,-3,28],[-39,8,-2,1],[-18,-3,-7,-6],[70,5,-6,4],[9,-4,-6,23]],"010": [[11,8,2,6],[17,1,9,8],[1,7,3,2],[14,7,2,8],[9,3,8,11],[7,9,3,14],[12,4,7,8],[3,7,4,11],[5,1,5,8],[14,9,4,5],[3,7,1,10],[9,4,6,8],[1,3,8,7],[3,7,1,1],[3,6,1,7],[1,6,4,10],[3,3,1,4],[4,3,6,9],[10,2,6,5],[9,1,8,15]],"011": [[-8,7,9,-3],[15,9,2,9],[5,-4,4,7],[8,-5,-7,3],[1,-1,-4,3],[9,-2,2,2],[13,-8,-4,7],[-1,-4,-7,1],[-6,3,-1,-5],[5,-4,5,9],[-9,-6,-8,-8],[7,-8,-1,3],[13,-1,7,4],[5,-5,2,13],[4,9,5,9],[-7,-5,-7,-12],[3,-1,-3,6],[10,-6,-2,3],[9,-7,1,8],[-6,9,2,-15]],"100": [[39,7,8,3],[62,7,6,5],[10,5,4,5],[5,8,9,63],[35,3,1,1],[51,1,3,5],[7,2,4,5],[50,4,2,2],[8,1,3,2],[8,6,7,70],[2,3,6,41],[2,8,9,33],[10,6,3,7],[9,1,4,24],[60,8,7,4],[43,1,3,3],[32,5,1,8],[1,2,3,64],[12,4,5,5],[2,2,1,7]],"101": [[8,6,3,59],[11,-3,2,6],[13,-1,-5,1],[36,7,2,6],[-18,-1,-2,3],[62,1,3,-8],[58,7,-4,-8],[-2,-9,-8,-67],[6,-9,-8,-20],[8,5,2,32],[-7,5,4,-66],[42,-4,-3,4],[-20,2,1,-3],[-1,-9,-8,68],[-8,-4,2,-2],[3,9,8,-40],[-30,-1,-6,5],[-35,5,6,3],[-4,7,5,-70],[-7,-3,-5,3]],"110": [[39,8,3,1],[2,2,5,21],[2,4,1,45],[9,4,7,17],[1,2,4,70],[27,7,3,5],[8,4,1,13],[8,3,9,25],[4,4,9,1],[7,8,4,57],[5,6,2,7],[6,6,1,27],[8,6,4,3],[9,1,3,56],[9,6,9,28],[16,6,1,7],[3,7,3,5],[72,4,8,5],[6,2,7,5],[1,9,5,4]],"111": [[48,-6,1,4],[-5,9,-4,-29],[24,6,8,9],[2,9,-7,6],[3,9,-2,70],[-9,1,-7,5],[64,-1,2,-7],[9,9,6,-8],[-2,-6,-9,-22],[31,8,-8,1],[-8,5,-2,43],[51,-8,-3,-5],[45,7,1,-5],[59,-8,-2,8],[19,2,8,-3],[6,9,-9,-17],[-7,1,-4,70],[26,-9,-1,-2],[-37,6,3,-2],[-7,-7,8,46]]},"inter_3": {"000": [[9,4,27],[7,6,63],[5,7,10],[8,3,32],[3,5,27],[4,6,16],[4,2,4],[5,9,60],[7,6,28],[9,2,36],[4,2,4],[7,2,35],[4,8,4],[5,1,20],[3,1,21],[9,8,63],[5,7,40],[9,4,9],[5,3,50],[8,8,8]],"001": [[4,-1,4],[4,7,56],[-6,6,-12],[4,-5,-44],[-7,-3,-14],[-3,8,-45],[8,-1,56],[8,-6,-8],[-9,7,-63],[6,8,24],[-9,2,9],[-6,-4,60],[5,6,-15],[-5,8,-5],[6,-1,-18],[3,9,54],[-4,-8,36],[-5,6,15],[2,2,8],[9,5,9]],"010": [[7,1,16],[6,2,8],[9,6,55],[7,3,29],[2,1,9],[9,1,17],[7,2,23],[5,8,43],[7,9,72],[9,8,68],[7,2,17],[9,7,61],[8,5,31],[8,9,69],[6,9,61],[8,3,22],[4,9,41],[5,4,16],[5,9,41],[8,5,43]],"011": [[-9,-4,40],[8,7,51],[8,3,30],[5,6,32],[2,9,19],[-9,-7,65],[6,8,52],[8,-7,-57],[-6,-8,40],[3,1,-5],[7,1,-1],[-9,-6,49],[7,-8,-50],[-9,-3,33],[3,3,7],[2,6,21],[-9,1,-2],[6,-2,-4],[-4,3,-9],[-2,-9,23]],"100": [[6,1,36],[5,3,55],[7,7,63],[6,6,54],[5,2,60],[7,8,63],[2,1,30],[8,9,16],[2,3,8],[5,2,20],[2,6,14],[2,3,40],[6,9,72],[2,3,6],[7,7,14],[5,5,20],[4,5,8],[5,8,55],[5,1,25],[2,1,16]],"101": [[-3,-4,39],[3,-6,72],[9,-5,72],[-8,6,24],[4,-3,-4],[4,6,-36],[4,-8,-36],[-4,7,-4],[3,-6,-21],[5,-8,60],[8,8,-24],[8,-3,-72],[2,-5,-4],[9,1,-45],[-1,-6,41],[-4,-2,20],[4,6,12],[-6,-3,48],[-9,3,45],[-7,-2,42]],"110": [[6,9,4],[6,2,1],[6,2,25],[3,7,67],[4,3,27],[2,3,27],[4,1,63],[3,1,52],[9,6,37],[8,9,2],[6,3,68],[7,8,31],[4,2,70],[8,3,61],[5,6,33],[6,3,17],[6,4,35],[8,8,52],[8,2,53],[4,7,53]],"111": [[-4,-7,-55],[-2,9,-57],[8,4,-39],[-6,-5,7],[8,-7,-19],[8,9,2],[-9,-2,59],[9,5,1],[-3,-2,-25],[-9,-6,69],[-4,5,-26],[-8,-8,45],[-6,-8,11],[-4,-4,7],[8,4,4],[-5,-5,31],[4,-3,-5],[-8,-3,35],[-7,1,-25],[-8,-1,21]]},"inter_4": {"000": [[5,8,5,65],[2,3,27,6],[6,9,1,6],[7,9,2,14],[3,6,8,42],[8,3,13,8],[2,8,7,62],[9,7,8,9],[7,6,1,7],[6,2,5,6],[8,8,41,8],[8,7,64,8],[6,5,3,48],[6,5,31,6],[4,6,1,4],[5,6,37,5],[4,9,56,8],[6,5,5,60],[8,9,3,24],[5,3,7,5]],"001": [[5,-5,8,-10],[9,-4,-7,9],[7,6,-4,14],[7,-7,-2,-14],[-8,-3,6,48],[-2,-5,-8,26],[-3,3,-6,-9],[-3,5,-32,-9],[-6,-7,15,-6],[-4,-8,-30,-8],[4,7,6,24],[-3,-9,7,33],[8,9,-8,-64],[-4,7,-1,-24],[-3,7,-5,36],[5,-7,-64,-5],[9,9,-26,9],[4,7,9,64],[9,6,55,9],[-9,-8,-3,27]],"010": [[3,3,7,22],[3,3,6,19],[4,2,3,17],[2,4,6,3],[2,2,3,11],[4,2,9,40],[3,3,2,7],[2,3,1,3],[2,3,4,7],[2,2,6,19],[3,3,5,7],[2,4,1,6],[2,2,8,23],[2,2,9,20],[2,3,6,8],[4,2,8,38],[4,2,2,3],[3,2,9,23],[4,2,9,40],[2,4,9,25]],"011": [[8,-1,6,51],[-3,-2,4,-15],[-3,3,3,-8],[-8,-1,-6,53],[-9,-1,7,-56],[-1,8,-8,11],[4,-1,8,41],[7,-1,9,55],[-2,3,-6,4],[2,4,-3,-9],[-1,-2,-8,-1],[-2,-2,-8,19],[-1,6,8,-11],[-6,-1,-1,3],[-1,9,8,-9],[-1,-2,3,6],[-3,-1,-5,23],[-4,2,6,-33],[-3,2,9,-31],[8,-1,5,39]],"100": [[8,5,31,8],[7,4,33,7],[8,2,2,16],[8,9,1,8],[8,3,9,24],[6,3,8,66],[8,8,49,8],[8,8,25,8],[3,9,7,21],[8,3,61,8],[7,8,41,7],[7,3,3,63],[5,6,6,30],[5,5,6,55],[4,9,9,36],[6,9,1,6],[7,9,3,21],[2,9,30,6],[3,7,17,9],[5,4,9,5]],"101": [[8,-7,69,-8],[6,2,-9,6],[-9,9,5,-45],[-7,6,-1,49],[-2,2,8,36],[2,-3,16,-4],[3,3,62,6],[-2,7,-9,46],[-2,-9,-26,-2],[3,2,-61,-9],[-5,4,33,-5],[4,-5,4,-4],[-9,-9,-26,-9],[7,-9,5,-28],[-3,-7,66,-9],[5,3,1,-70],[5,-2,9,25],[5,6,67,5],[-4,-8,-70,-8],[2,4,30,4]],"110": [[4,4,10,1],[3,8,7,24],[3,2,7,47],[4,6,1,13],[5,9,8,2],[5,2,14,9],[2,4,42,2],[8,8,1,4],[9,9,9,4],[2,7,27,4],[2,4,37,1],[8,3,5,10],[3,4,26,9],[2,7,42,7],[8,8,8,28],[7,6,2,5],[2,4,1,17],[2,3,7,33],[2,6,50,3],[3,9,28,5]],"111": [[-1,-8,-61,-6],[-1,-3,-66,-4],[-5,9,4,-8],[-1,2,4,-7],[-1,9,56,-1],[2,2,-8,-30],[4,-7,9,-31],[-2,8,-20,-9],[-1,-6,63,5],[-1,7,-44,6],[-1,9,-72,-8],[-3,-5,-4,-1],[-2,-3,-7,72],[8,-5,-1,53],[2,6,-24,-3],[-8,-1,-1,-5],[2,-1,-49,-9],[2,-3,30,2],[3,-3,-3,57],[2,-9,-44,-4]]},"inter_5": {"000": [[55,2,4,7,5],[23,5,1,4,8],[8,6,5,10,8],[2,4,2,13,6],[8,7,9,71,1],[1,8,7,8,65],[49,7,3,9,7],[6,8,8,6,54],[2,8,9,5,42],[64,7,9,1,8],[4,7,9,36,4],[6,2,3,24,6],[24,7,8,5,3],[7,4,3,23,3],[6,6,7,9,18],[9,3,8,72,9],[17,3,3,9,8],[49,4,8,6,9],[1,7,9,1,8],[67,9,2,5,4]],"001": [[-6,-3,5,5,-66],[-33,-5,-2,7,2],[59,-7,-8,-7,-4],[-1,-8,9,18,-1],[3,-1,-7,-4,14],[-7,5,-2,21,8],[-2,-6,-8,-55,-8],[-8,2,6,-33,-2],[1,4,7,2,-19],[-61,-3,-3,-3,-7],[-8,4,-8,-6,-32],[-6,-2,4,4,42],[-1,-3,-9,34,5],[5,9,2,7,50],[-2,-4,5,6,-6],[-41,7,3,4,8],[7,-1,2,29,-8],[4,4,-5,2,-8],[-1,-4,7,-58,7],[1,3,-5,-40,1]],"010": [[1,2,4,9,21],[9,7,1,1,8],[9,3,3,1,8],[5,3,3,2,12],[5,4,2,5,24],[5,3,3,2,8],[5,3,1,9,39],[2,9,1,1,6],[7,7,1,1,6],[6,9,1,1,8],[8,3,1,1,18],[8,3,1,4,15],[4,2,4,1,5],[2,6,1,1,16],[13,2,4,1,9],[1,3,2,1,9],[3,4,1,9,38],[6,8,1,3,36],[6,2,2,4,8],[4,8,1,7,62]],"011": [[8,-1,-2,7,-8],[9,-5,-1,-9,45],[-3,5,-1,-5,-25],[-48,-6,1,-8,-7],[4,-1,9,1,-2],[-42,-4,1,-9,-3],[3,-7,1,-8,55],[-12,-1,9,-9,-1],[58,8,1,-7,-2],[21,3,2,-6,-6],[-60,-8,-1,-7,-8],[3,3,1,-1,2],[35,9,1,-2,9],[5,6,1,-3,-17],[7,-2,2,5,-9],[6,-2,-1,-3,21],[50,4,1,-9,5],[9,-4,-1,-6,32],[4,-6,-1,-6,32],[38,8,-1,-5,7]],"100": [[6,8,7,21,6],[1,9,6,7,64],[9,3,4,2,15],[4,8,2,4,20],[7,4,4,71,3],[6,2,2,8,14],[7,8,5,25,7],[9,9,9,7,72],[4,9,8,56,4],[6,5,9,9,6],[4,3,9,8,1],[4,7,5,2,18],[8,4,4,2,16],[2,6,8,25,8],[8,3,7,41,5],[10,9,2,1,1],[4,8,3,3,4],[5,6,4,60,5],[7,3,5,2,28],[4,3,5,2,40]],"101": [[-6,4,1,5,22],[2,-2,8,-9,-28],[55,-9,-6,6,1],[-6,2,-5,-8,48],[-9,-6,3,-3,9],[12,-5,9,-6,-3],[4,6,-2,-5,-38],[-6,6,-7,-1,-54],[5,6,-3,5,17],[-4,-2,4,1,58],[2,5,-1,-1,-8],[-1,-2,-4,64,-9],[-3,2,2,-1,-9],[16,-5,6,-2,-4],[46,-5,4,2,-4],[8,4,5,-7,-20],[6,3,-1,-9,69],[7,4,9,7,-1],[-8,-7,2,-8,-64],[1,8,-1,3,-7]],"110": [[58,6,1,8,7],[7,7,5,4,42],[8,7,8,2,8],[49,2,8,3,8],[63,8,6,1,8],[2,2,8,6,6],[49,5,9,7,2],[3,6,2,5,6],[4,6,7,8,66],[9,6,1,2,7],[6,2,6,7,7],[1,2,9,22,1],[52,4,4,6,5],[9,6,8,1,29],[4,2,9,4,58],[72,6,5,3,2],[34,9,4,2,6],[8,8,5,8,35],[8,5,9,4,63],[3,3,5,1,26]],"111": [[-16,-3,-6,6,8],[16,6,-7,2,-4],[2,-2,7,55,-9],[-8,-6,5,-4,-60],[-61,2,-7,-5,-6],[2,8,-8,-4,-2],[-13,-5,-4,-6,-8],[-21,-3,1,-3,-4],[-23,-1,-6,-3,3],[-4,2,-9,53,6],[-4,3,-1,37,9],[3,4,4,-26,-4],[8,-4,4,7,-18],[-4,-9,-4,-5,27],[4,-7,-1,-7,49],[60,-1,-7,7,-7],[4,-3,9,26,4],[7,-9,9,-4,34],[9,-8,-9,2,-4],[8,2,-9,22,1]]},"inter_6": {"000": [[3,2,6,2,26],[3,5,36,5,8],[4,4,33,1,5],[8,8,2,8,24],[9,2,4,5,23],[5,9,9,5,5],[4,5,1,22,6],[5,5,2,9,19],[2,6,5,5,15],[2,9,6,25,1],[5,9,55,1,6],[2,8,3,30,4],[8,4,11,9,1],[5,2,3,2,7],[7,2,16,6,6],[2,4,4,2,2],[5,6,2,1,71],[2,7,47,7,3],[3,9,61,9,3],[7,4,19,9,2]],"001": [[5,-3,8,5,-15],[-4,-9,-4,4,-16],[-3,4,-9,4,-29],[-8,-5,5,-33,7],[8,1,8,-4,4],[3,-5,37,-2,4],[5,2,-11,-2,3],[-8,9,26,-6,2],[7,-9,-7,-7,7],[-1,3,-5,-10,-5],[3,2,-7,48,3],[5,6,-3,7,-68],[-1,3,21,6,6],[5,4,-13,-4,-9],[-5,5,38,7,-8],[4,6,-7,-7,-59],[-8,-8,5,7,-33],[-9,-1,-5,4,49],[-1,-4,-6,5,15],[5,-9,66,-9,6]],"010": [[2,3,1,3,6],[5,1,2,1,4],[3,1,5,2,9],[4,1,7,9,34],[4,2,2,3,14],[5,1,1,9,21],[3,1,8,4,20],[7,1,5,6,49],[7,1,6,9,56],[7,1,4,6,31],[3,1,7,9,37],[2,1,8,1,16],[3,3,5,1,9],[2,2,3,9,22],[5,1,3,1,8],[3,2,5,3,9],[3,3,5,1,8],[2,3,6,5,8],[8,1,7,9,69],[2,2,5,5,22]],"011": [[7,1,9,-4,55],[-1,6,-26,-9,8],[2,-4,-6,2,-4],[-1,3,2,-9,-4],[7,-1,-9,50,-5],[-1,-9,6,23,9],[-1,-2,-7,-22,-8],[6,-1,7,9,56],[3,-2,9,-20,3],[9,-1,-8,2,-63],[9,-1,-3,25,2],[-5,-1,9,63,9],[-6,-1,5,-8,-41],[4,1,-9,3,-40],[-1,3,-24,-7,9],[-1,8,-5,8,4],[-1,6,-5,4,8],[6,-1,-9,9,-36],[6,1,-5,-4,-31],[-4,-1,9,6,-37]],"100": [[3,9,8,8,5],[2,5,15,5,5],[4,4,9,2,6],[4,7,3,3,71],[9,2,9,13,4],[8,1,2,4,12],[2,4,8,4,4],[6,6,5,7,1],[4,1,2,6,6],[3,9,65,3,9],[6,3,6,19,1],[6,3,67,3,9],[4,7,5,9,1],[3,1,45,3,9],[3,1,6,7,19],[7,3,2,2,37],[8,7,7,6,6],[7,6,5,9,2],[2,4,2,21,9],[4,2,5,21,9]],"101": [[-9,4,-6,-50,4],[-4,8,-3,-4,-56],[-2,1,1,9,-11],[-3,7,7,9,30],[-4,3,20,-6,-2],[7,-2,1,13,6],[-8,-1,1,-65,7],[2,-5,-9,3,5],[5,7,-9,-1,24],[3,-7,-9,53,5],[-4,7,-3,22,6],[8,1,1,39,7],[-8,-4,-4,-2,-2],[7,-3,-32,-8,-1],[-9,6,6,-7,-7],[9,-2,-4,-6,-24],[-4,-3,-7,-9,-17],[-3,-3,-7,-5,52],[-6,4,-6,7,-29],[-2,1,4,-33,-1]],"110": [[5,4,16,5,2],[2,6,21,9,8],[9,1,8,1,13],[2,1,36,6,9],[4,2,2,1,53],[9,2,4,9,6],[5,4,4,3,45],[2,7,1,1,27],[4,9,24,6,4],[4,3,2,5,53],[4,2,3,5,2],[7,1,5,9,42],[2,1,9,51,6],[3,5,21,2,4],[5,9,21,2,8],[5,4,5,63,2],[2,1,24,6,3],[5,5,2,9,17],[8,2,5,8,6],[7,4,1,5,2]],"111": [[-4,-2,1,-7,1],[-8,-2,-5,9,57],[-3,-2,7,9,-40],[2,-9,-46,7,-1],[3,1,3,8,42],[-9,2,5,-52,-2],[-5,7,3,49,7],[-9,-5,-7,-68,-7],[2,2,-9,31,-2],[-1,2,-8,-19,8],[-1,8,72,-9,-2],[-6,8,-5,-8,9],[-7,-7,4,9,-3],[-8,6,6,-4,26],[3,6,6,-58,9],[-7,-8,8,40,9],[3,5,-3,-2,-23],[-3,4,3,65,-8],[5,2,9,58,8],[-5,-9,3,-8,-17]]},"inter_7": {"000": [[9,2,7,3,6],[4,8,9,1,8],[1,2,7,1,2],[5,7,7,24,6],[3,7,1,8,26],[8,6,2,9,14],[2,7,7,1,7],[2,4,9,48,2],[6,3,3,7,36],[3,5,7,8,40],[4,7,5,34,4],[1,5,6,13,3],[8,2,3,64,2],[6,3,6,65,3],[5,7,4,1,7],[3,3,6,38,9],[2,9,7,4,36],[2,6,6,58,6],[9,3,2,47,6],[5,8,5,34,2]],"001": [[1,-3,-9,-49,7],[3,-8,-5,-7,56],[2,2,-5,-17,6],[7,-3,-5,1,-69],[5,-2,7,-8,34],[-8,-4,7,5,16],[-4,-1,5,-9,36],[5,6,-8,-5,56],[5,-3,5,-5,-65],[-6,8,5,38,-2],[9,6,9,1,6],[6,-8,-8,2,-16],[-5,-2,5,-4,-7],[-9,-8,-6,6,69],[-9,8,-8,-5,-40],[-1,-3,-3,-5,55],[7,-1,-5,-55,7],[-3,9,-8,58,-3],[-6,5,-8,-65,-3],[-8,2,-8,46,-4]],"010": [[1,4,1,9,37],[3,2,2,9,22],[5,4,1,1,6],[2,4,1,9,44],[1,4,1,7,37],[2,2,1,5,5],[2,2,2,9,22],[2,4,1,4,12],[6,3,1,3,5],[1,8,1,1,5],[2,6,1,7,39],[4,4,1,9,37],[1,6,1,8,57],[2,4,1,3,4],[7,2,1,4,3],[5,2,2,9,24],[1,3,2,6,23],[5,3,1,7,15],[1,4,1,1,6],[3,5,1,1,7]],"011": [[1,-3,-2,8,-20],[-7,-3,-1,1,-9],[4,-7,1,8,-57],[-4,-1,-9,7,-13],[2,-7,1,-1,3],[-2,-1,-8,-5,-2],[-7,5,3,7,28],[-9,-6,-1,9,-59],[9,-7,2,-4,32],[5,-7,1,-5,44],[-2,5,2,-8,-44],[-2,-9,-1,8,-70],[9,-1,7,6,-1],[-4,7,1,9,68],[-8,-6,-2,-9,60],[-4,4,-1,1,-3],[-4,-1,-6,6,-15],[-4,5,-1,1,11],[6,-3,3,2,-11],[-2,4,2,4,21]],"100": [[5,5,1,31,5],[8,6,9,1,6],[6,2,9,26,4],[4,5,3,32,8],[4,4,3,2,24],[2,5,1,33,4],[3,9,9,29,9],[5,2,5,10,5],[4,7,8,27,9],[1,8,9,2,16],[6,3,1,8,33],[2,4,2,69,6],[3,6,4,2,66],[8,3,7,1,32],[1,8,2,20,7],[9,7,4,5,72],[1,9,1,7,3],[2,7,2,8,40],[8,2,5,6,12],[7,5,7,9,45]],"101": [[3,-4,-2,-1,70],[7,-1,-5,68,-8],[1,-2,-7,-32,4],[-5,-6,-7,42,7],[2,9,7,8,7],[1,-6,8,9,-7],[2,-7,5,-5,2],[4,4,3,7,60],[9,-8,-5,-62,6],[-3,-7,4,67,-4],[6,7,7,-17,-9],[2,-7,-7,58,2],[3,-9,-8,-42,3],[1,5,-1,-4,8],[-2,-2,-6,8,44],[-7,-2,-8,-8,-11],[2,4,-8,-44,4],[-8,-2,-3,3,-72],[8,-8,-8,10,-8],[1,-4,-7,53,-9]],"110": [[6,5,8,21,6],[8,3,5,2,11],[5,4,8,21,6],[7,5,1,21,6],[2,5,8,8,27],[1,2,2,31,6],[9,2,5,36,3],[9,6,8,6,25],[6,2,6,18,1],[4,9,7,11,3],[9,7,9,5,70],[1,2,9,5,13],[5,2,2,45,6],[2,9,6,5,13],[7,2,4,40,6],[4,2,1,2,9],[4,7,3,6,26],[1,7,1,1,49],[5,5,8,10,1],[5,8,2,3,63]],"111": [[5,-3,9,-9,31],[-4,5,7,-8,15],[1,-6,4,6,58],[7,8,-4,8,-8],[-3,-8,-1,3,30],[-9,-3,-8,-2,-41],[-5,5,-8,21,9],[-5,3,-5,-25,-4],[2,6,2,7,-26],[7,-1,1,44,5],[-1,2,2,3,22],[3,-1,-4,16,4],[5,-5,3,-21,7],[5,9,4,-9,-2],[-6,-4,-7,-21,-2],[-9,3,-8,-33,-7],[-7,-2,6,3,65],[9,-9,-1,8,-2],[2,3,2,6,38],[6,-3,4,17,4]]},"inter_8": {"000": [[7,1,5,7,7],[3,3,9,6,57],[4,2,6,5,24],[7,6,37,1,1],[4,8,3,7,12],[2,3,5,3,1],[5,9,5,9,25],[2,4,58,8,4],[3,5,3,2,43],[6,7,49,6,6],[9,5,31,1,3],[2,9,1,5,71],[4,3,2,1,8],[7,5,5,1,71],[7,3,5,7,7],[7,6,45,9,9],[7,4,20,5,8],[6,2,7,3,42],[7,5,2,5,14],[9,2,14,2,6]],"001": [[-6,1,14,-7,7],[-9,9,70,-8,-7],[-3,7,26,1,2],[-1,8,-42,-5,3],[-4,-6,58,2,2],[-9,-6,-60,7,-9],[-1,-7,7,-5,-13],[-7,-2,-2,-4,-36],[7,-7,-2,1,-62],[-5,2,-31,-9,3],[-7,-5,-3,6,-20],[5,8,-8,-3,-3],[-7,2,-5,6,43],[-1,1,-50,-6,8],[-2,9,-58,-2,-4],[9,5,1,-9,45],[-2,-2,-1,5,-43],[-4,5,-4,6,-12],[-2,7,20,1,-1],[-4,9,-61,-4,4]],"010": [[2,4,9,1,23],[7,1,6,2,47],[2,2,1,2,4],[5,1,1,2,1],[2,1,8,1,23],[6,1,5,3,22],[2,2,8,1,9],[6,1,7,3,35],[2,3,4,1,7],[4,2,8,1,37],[4,2,6,1,32],[3,2,4,2,21],[7,1,7,2,44],[4,2,2,1,15],[3,2,6,1,9],[8,1,3,1,20],[2,1,7,4,21],[2,1,2,3,5],[2,2,8,1,8],[4,1,4,4,25]],"011": [[-6,3,-9,9,57],[3,-2,2,9,1],[-9,2,-3,9,20],[-2,1,6,-7,-14],[-1,-4,13,-8,-4],[-6,1,-5,9,37],[-5,2,-3,5,6],[7,1,-8,-1,-53],[-3,-6,-8,-9,23],[-1,8,-7,5,6],[6,-3,-8,9,-54],[6,2,-9,-4,-48],[-4,2,-4,5,24],[-8,1,-5,4,35],[7,2,7,-8,56],[9,2,-4,-9,-40],[-1,-1,9,-8,-5],[-4,3,7,5,-37],[-7,1,-9,3,60],[-3,4,-1,5,-6]],"100": [[4,1,58,1,2],[9,1,11,7,3],[9,5,24,7,8],[5,3,8,1,72],[7,5,2,2,51],[7,6,4,7,28],[9,4,2,8,18],[7,2,5,2,51],[2,8,9,1,1],[3,4,34,7,7],[6,8,4,7,24],[9,1,14,2,5],[5,3,11,2,4],[8,3,7,2,4],[6,7,1,5,6],[2,4,10,4,8],[4,8,9,8,36],[8,4,9,3,37],[8,7,36,1,3],[9,1,7,6,3]],"101": [[3,-7,2,-3,-42],[-2,7,-13,7,-2],[-9,-7,-8,6,-66],[-1,-9,18,-7,8],[-9,7,-6,-8,54],[-7,-4,2,-6,8],[-3,-6,28,-8,-4],[-6,3,3,8,-8],[-1,4,-33,-4,9],[4,-2,7,7,17],[2,-8,1,6,12],[-8,1,2,9,-72],[2,-2,63,-6,6],[-1,-3,-4,-4,11],[2,-6,18,7,-4],[8,-5,-7,1,61],[-5,5,-7,1,59],[-8,7,-6,3,-5],[2,-9,-21,9,-6],[-9,-1,-8,5,30]],"110": [[9,5,7,3,36],[2,6,50,9,4],[6,1,2,8,11],[6,3,1,4,56],[2,1,1,8,34],[3,5,26,6,3],[5,7,7,4,68],[9,6,9,6,51],[8,4,5,6,3],[2,2,7,4,16],[4,8,1,1,40],[6,1,1,1,59],[4,4,25,7,7],[8,7,7,9,35],[5,1,2,7,43],[2,2,23,8,9],[6,8,18,2,9],[6,1,18,9,9],[7,1,3,3,65],[2,6,32,3,5]],"111": [[8,9,-1,-7,-6],[-1,7,65,-9,8],[-2,-9,34,6,5],[-1,9,72,4,2],[-8,4,-1,6,3],[-1,2,-70,-5,2],[-6,-4,2,-8,-13],[7,-9,3,-9,8],[-1,-7,4,4,8],[-6,5,-7,4,64],[7,-5,-3,9,-39],[-7,-2,4,-5,6],[-1,-1,-1,7,7],[5,1,14,5,-2],[4,9,-11,8,8],[6,3,-10,7,-9],[2,3,25,-3,-8],[3,6,27,3,5],[7,-9,-3,6,5],[7,-7,5,-5,-7]]},"inter_9": {"000": [[5,9,8,4,1],[7,8,4,20,8],[7,8,59,3,4],[4,4,1,7,5],[6,9,29,6,9],[9,2,10,8,4],[6,9,6,66,3],[5,5,4,4,1],[6,4,16,9,3],[2,4,25,4,2],[7,3,5,25,9],[9,6,17,3,2],[4,2,5,8,4],[9,4,6,39,5],[8,5,6,66,2],[6,8,47,5,7],[6,3,12,9,9],[5,8,20,5,5],[8,9,72,9,7],[6,4,25,3,7]],"001": [[5,-8,-36,5,-5],[-6,9,2,-44,2],[5,7,-50,-2,-1],[2,8,5,29,3],[-2,5,-23,8,-1],[-2,5,-5,-38,-6],[-5,7,-29,5,-5],[-4,-9,-3,-56,-8],[4,-7,-3,12,-1],[-3,-9,-7,-21,3],[4,-1,11,5,3],[-8,-9,-3,-24,-1],[6,-7,-8,-28,-4],[4,-3,6,48,-3],[-5,-4,-10,4,-7],[9,4,-15,6,-7],[4,-5,2,-8,8],[-1,-2,-4,-8,-2],[-9,8,-6,72,-9],[9,-7,-9,10,8]],"010": [[4,4,1,1,7],[2,3,3,3,2],[2,8,1,5,7],[4,1,2,1,9],[8,2,1,1,8],[2,4,2,4,1],[8,1,1,1,6],[2,6,2,2,5],[2,7,2,2,5],[2,3,3,2,9],[2,9,1,4,9],[3,6,1,2,9],[3,3,1,6,1],[8,2,1,1,9],[3,5,2,1,9],[2,2,4,1,9],[4,2,1,1,2],[2,2,3,3,2],[4,1,2,1,8],[2,2,3,2,9]],"011": [[-2,9,3,14,-9],[-3,-6,5,22,9],[-3,-4,-1,-5,5],[-1,-6,4,5,2],[3,-1,4,-18,-8],[-1,4,16,8,3],[-1,1,-3,-8,-9],[-4,-1,-5,-17,-3],[8,1,9,-69,6],[-5,3,-1,2,-6],[-8,2,7,51,-9],[-8,-2,8,72,9],[-4,-2,8,25,3],[6,-1,-9,61,-3],[-6,-2,-3,-11,9],[3,2,3,-16,-2],[4,-4,-2,3,-7],[-2,5,9,22,-5],[-3,-1,-9,-18,8],[3,-3,-4,13,-7]],"100": [[5,7,9,19,3],[5,2,4,29,9],[9,6,1,36,9],[8,9,8,1,7],[9,3,69,3,3],[8,5,36,9,7],[4,2,57,6,5],[3,5,29,9,7],[2,8,56,8,4],[2,9,9,34,5],[3,8,4,28,4],[7,6,6,63,7],[2,6,5,32,5],[9,3,2,60,1],[7,4,43,3,9],[6,5,9,4,1],[2,3,57,2,2],[7,8,7,59,2],[9,5,2,66,3],[2,5,2,41,7]],"101": [[-2,-1,36,6,-4],[-2,-3,-35,4,4],[-8,-9,-4,33,7],[6,-6,-1,49,7],[7,-7,13,-7,-7],[-4,-8,5,-32,6],[-3,1,30,-7,-2],[7,-1,51,-6,6],[-9,5,-1,45,9],[8,7,4,20,4],[-4,-6,1,4,-9],[-6,3,-6,8,-7],[-6,-8,45,5,-5],[-8,-7,65,-2,-2],[-9,2,-2,1,1],[-1,-8,-26,-2,6],[-6,-7,-5,16,-4],[4,7,7,44,4],[-4,-7,8,32,-6],[-3,-4,-10,5,5]],"110": [[2,5,7,59,8],[8,4,8,19,9],[6,8,6,40,8],[7,1,3,6,1],[2,3,2,3,1],[2,1,4,30,6],[5,8,6,50,6],[4,1,6,7,7],[8,6,7,2,5],[2,9,16,7,7],[5,1,5,28,9],[8,5,7,38,3],[7,6,9,1,4],[6,1,7,50,9],[3,5,29,1,2],[3,4,18,6,1],[3,6,6,19,7],[7,5,9,14,2],[2,7,13,9,8],[3,6,23,7,9]],"111": [[-9,2,8,70,2],[-4,1,5,34,4],[-2,3,8,34,1],[4,-8,21,-1,4],[-1,6,-63,-5,8],[-1,4,64,-2,8],[-5,3,-1,-23,5],[-2,6,-49,-5,-3],[-1,-7,-69,1,4],[7,-6,7,5,2],[-9,-6,3,-34,-1],[2,4,-43,-3,5],[-1,-6,8,-60,-6],[2,-8,20,-5,4],[2,1,27,4,-5],[-5,-6,4,-3,-9],[-8,-6,3,7,-8],[9,-6,9,-58,-9],[-1,4,4,-7,-2],[2,8,-5,14,-2]]},"inter_10": {"000": [[6,5,9,4,6,27],[3,7,44,3,3,8],[5,9,3,4,1,55],[4,4,1,4,9,36],[4,2,54,4,9,5],[8,9,28,8,6,1],[6,5,9,2,8,69],[2,2,4,5,9,59],[8,6,31,8,9,7],[3,3,1,5,4,5],[5,9,3,3,5,5],[9,2,37,9,8,1],[5,2,43,5,8,7],[9,4,13,9,6,9],[6,4,2,7,5,8],[2,2,62,4,5,7],[3,2,60,7,5,5],[3,6,60,9,4,6],[3,3,3,2,7,2],[5,3,3,7,6,33]],"001": [[-3,9,29,-8,1,-1],[-2,4,-72,2,9,7],[3,-6,32,4,-7,9],[-2,4,-69,-2,-8,3],[4,4,-1,4,-9,64],[6,-7,-7,-3,-9,-9],[-2,4,-32,-3,-7,-2],[3,-2,9,-1,-4,-7],[8,1,47,-9,-7,1],[7,-9,-13,5,-6,-5],[7,9,5,2,-9,58],[-6,-2,-23,-3,5,-1],[-9,7,-6,-9,5,-6],[6,-3,8,8,-3,12],[2,-2,48,-9,-1,-2],[-2,5,8,6,6,-41],[7,-1,9,-7,-8,72],[-8,4,13,9,6,-2],[9,-8,2,7,3,-24],[8,5,-62,-4,5,4]],"010": [[6,7,8,5,8,9],[2,2,27,9,1,5],[3,6,10,5,4,7],[3,4,27,8,1,9],[9,1,8,7,1,9],[2,7,40,8,1,9],[2,1,40,8,1,9],[6,7,6,5,7,7],[2,8,38,8,1,9],[7,3,9,2,9,28],[2,4,8,7,2,3],[2,2,40,9,1,9],[5,3,1,2,5,3],[4,7,5,9,4,3],[3,3,25,9,2,9],[3,7,4,9,3,1],[3,6,5,9,1,2],[2,6,38,9,2,8],[6,3,9,7,2,9],[3,9,1,7,3,1]],"011": [[7,1,7,-1,-2,-55],[-9,5,-6,5,-8,10],[6,-1,5,-1,1,-23],[-6,-7,-2,-8,-6,-2],[7,-3,7,2,-8,28],[-1,-1,66,7,-1,-9],[-7,-1,-5,-1,-3,-41],[4,-8,-4,-9,4,1],[3,-6,2,-3,4,-5],[2,8,-37,8,3,-9],[-5,-3,-9,-9,-1,-4],[-8,2,-3,5,-4,5],[-1,9,-30,-6,3,-4],[4,-3,-8,-1,7,41],[4,-8,5,7,-5,3],[-1,-1,-55,8,1,8],[3,-5,-5,-1,9,24],[7,-2,8,-1,7,-64],[-1,2,-3,8,-1,1],[7,-2,9,-1,9,-60]],"100": [[7,4,12,2,8,6],[6,6,2,6,9,11],[8,6,29,2,5,2],[7,6,36,4,9,9],[5,7,70,4,5,5],[3,8,27,5,5,4],[3,6,13,5,3,6],[4,4,44,4,8,4],[9,2,6,9,4,4],[3,7,2,2,8,3],[2,1,4,5,1,43],[8,9,29,7,8,8],[6,8,30,9,5,7],[5,3,6,3,4,30],[8,5,1,7,4,44],[8,7,69,2,3,1],[5,2,9,5,8,9],[5,3,10,8,2,2],[2,5,4,9,1,4],[2,7,40,5,5,5]],"101": [[3,2,-33,-9,-1,-2],[-6,9,3,3,6,-54],[9,5,-38,-3,-9,-6],[8,-6,6,-4,9,9],[6,-6,6,-7,3,-3],[-4,2,-6,2,-3,-57],[5,4,-5,-7,-2,67],[9,2,2,5,3,-9],[-4,8,-2,7,-4,-32],[-8,-3,7,8,5,45],[-4,-3,8,8,-5,48],[-7,-4,-6,6,7,-56],[-2,-5,2,8,2,28],[-8,4,8,-7,7,65],[-9,6,-9,7,-8,-1],[-6,3,-45,-1,-6,-6],[-5,9,7,-1,1,-9],[5,-7,9,-2,9,3],[-4,-3,6,-2,-8,8],[8,7,-5,-3,-2,-20]],"110": [[3,4,26,2,4,6],[4,5,4,3,8,38],[2,2,64,8,9,9],[3,5,9,6,5,21],[7,4,5,9,9,6],[3,6,12,2,1,5],[7,7,6,6,3,17],[2,4,42,5,4,8],[9,6,11,2,5,7],[2,6,6,2,3,55],[2,5,30,4,4,8],[2,6,60,8,9,6],[2,2,37,3,7,3],[5,3,8,3,4,45],[2,9,55,2,5,9],[4,6,22,5,6,9],[3,5,5,5,1,22],[7,5,18,5,2,8],[2,6,42,2,1,3],[6,2,17,7,1,5]],"111": [[9,6,14,-5,-5,-6],[-1,-6,35,-5,-5,-8],[-1,3,64,7,-8,-1],[9,9,-17,6,6,-9],[-8,3,-5,-2,2,-59],[7,-1,1,2,-9,7],[-8,4,9,-7,-9,2],[-1,9,-58,-7,4,5],[4,-4,-6,4,1,-4],[4,7,5,-3,5,21],[-1,8,24,-5,4,8],[9,-5,-6,-3,1,43],[-4,-9,-1,-3,9,21],[9,-7,4,-6,4,-21],[4,5,-25,2,-3,-7],[7,7,11,4,-9,5],[-7,-5,-2,-3,-1,7],[9,-4,-4,4,8,-2],[2,-3,8,-2,-5,-57],[-5,1,-8,3,9,36]]},"inter_11": {"000": [[9,2,2,9,37],[5,39,6,1,7],[5,33,2,1,9],[7,1,9,2,5],[7,5,2,5,16],[2,9,9,8,71],[1,1,8,7,62],[5,49,2,5,2],[2,8,2,6,24],[2,2,9,8,8],[1,3,3,1,3],[9,4,4,1,1],[5,3,4,8,21],[1,13,5,2,8],[2,16,3,4,2],[1,6,7,5,30],[7,40,2,1,5],[1,6,7,1,6],[5,7,3,9,61],[9,4,8,8,28]],"001": [[2,-4,8,4,-8],[6,-2,8,-6,-61],[-1,-51,8,-1,-2],[5,71,2,-2,-5],[-3,-4,7,-9,-52],[2,-51,3,-8,9],[4,36,6,-9,6],[-5,4,9,6,-52],[4,64,4,-1,4],[-4,3,9,-2,-9],[-6,4,2,-7,6],[-1,-2,8,-5,29],[7,-33,9,1,-5],[-5,-1,8,6,33],[4,-52,4,-2,2],[9,1,8,-2,-28],[-5,1,4,-6,43],[-4,20,8,4,-2],[-7,6,3,3,2],[9,-5,5,-9,-1]],"010": [[3,32,3,2,8],[5,55,6,2,9],[5,60,7,1,9],[4,30,3,4,7],[4,14,7,1,3],[6,8,4,3,4],[9,28,9,2,3],[2,6,5,2,2],[1,36,5,2,6],[3,65,9,1,7],[2,7,5,2,1],[8,4,3,1,2],[1,14,3,1,7],[3,15,7,1,2],[5,3,3,3,2],[3,72,7,1,9],[9,2,6,2,1],[7,24,8,2,4],[6,25,5,2,4],[3,17,3,4,7]],"011": [[-7,69,7,-2,9],[-5,59,9,-1,6],[-5,-62,8,-1,-8],[-5,59,9,-1,6],[-9,-49,9,-2,-5],[-2,41,7,-1,6],[-1,1,2,2,1],[-3,40,7,-1,6],[-7,1,3,-4,-2],[-4,46,8,-1,6],[-4,-6,3,-4,1],[7,-9,5,1,-2],[-5,-7,2,1,-8],[9,17,7,2,3],[-4,45,7,-1,7],[-2,-11,8,-1,-2],[-2,-47,9,-1,-5],[-3,26,6,-1,5],[-1,27,5,-2,5],[6,19,3,3,4]],"100": [[8,2,6,1,4],[8,46,5,2,2],[9,3,7,1,9],[1,7,8,1,63],[3,3,2,7,18],[5,22,4,1,2],[6,3,3,4,23],[5,5,2,3,47],[9,1,7,2,48],[5,1,4,2,4],[1,43,5,3,3],[6,15,5,1,8],[3,19,5,1,7],[6,8,2,2,35],[2,22,6,3,1],[2,47,9,4,9],[5,9,3,4,52],[2,10,6,1,9],[5,3,9,4,21],[1,1,5,5,29]],"101": [[1,3,7,-7,-21],[-7,12,4,-4,3],[-3,-21,8,-8,5],[8,1,3,4,-69],[1,-34,3,-7,-4],[2,-15,9,-1,-9],[4,36,8,2,3],[-5,7,9,-5,23],[-7,8,8,-4,1],[-1,69,7,-7,3],[-1,-7,2,-4,-21],[4,-1,5,4,-13],[6,4,4,1,-42],[8,-8,6,7,-7],[-2,22,9,-1,-3],[7,-28,7,8,-4],[-5,1,8,-1,-4],[-9,72,3,-4,-5],[1,1,7,-7,43],[-3,69,9,1,5]],"110": [[2,4,2,5,24],[8,5,2,1,47],[8,70,2,9,9],[4,35,3,3,8],[8,2,2,8,32],[4,37,6,7,3],[7,42,7,5,7],[7,5,8,9,8],[7,35,6,6,5],[1,3,4,6,3],[4,3,5,4,9],[8,5,5,2,4],[4,34,7,4,2],[5,1,2,8,38],[5,68,2,1,9],[8,30,8,4,1],[8,15,5,2,8],[2,36,3,5,4],[4,4,6,3,15],[2,30,7,5,1]],"111": [[9,-3,3,8,2],[9,9,6,-5,6],[5,9,2,-2,47],[6,35,6,4,8],[-3,-3,2,8,-47],[1,57,8,3,-1],[1,-48,5,1,-3],[-9,13,4,7,5],[-5,-58,3,3,-9],[9,11,4,5,-8],[-5,-9,2,-9,-39],[8,8,2,8,23],[-5,4,2,-6,42],[7,9,3,-7,7],[-8,-1,2,3,-39],[8,-66,3,-7,4],[-4,6,3,6,-19],[-1,-6,4,-7,-25],[9,-56,6,-1,-3],[7,-8,6,8,7]]},"inter_12": {"000": [[9,9,2],[9,9,2],[2,2,7],[6,3,1],[8,2,5],[3,3,6],[4,2,6],[2,6,6],[8,4,3],[8,2,5],[5,5,2],[7,7,2],[7,7,2],[6,2,2],[2,6,2],[9,9,2],[4,8,3],[4,4,4],[7,7,2],[5,5,2]],"001": [[-6,-6,-1],[-7,-7,-2],[-4,2,-2],[-3,-3,4],[-4,-4,-2],[-9,-9,-2],[-2,-2,-9],[-3,-6,-3],[8,2,-5],[-2,-2,-3],[-9,3,2],[9,-3,-2],[2,-6,1],[7,7,2],[5,5,2],[-3,6,1],[9,-3,-2],[6,-3,-1],[3,9,-4],[-8,-8,-1]],"010": [[3,2,1],[2,3,1],[3,2,1],[3,2,1],[3,2,1],[3,3,1],[3,2,1],[2,3,1],[2,4,1],[2,4,1],[2,4,1],[3,2,1],[3,3,1],[4,2,1],[4,2,1],[3,3,1],[2,4,1],[2,4,1],[2,4,1],[4,2,1]],"011": [[-2,-4,-1],[4,2,-1],[-4,-2,1],[-2,-4,-1],[-2,-4,1],[-4,-2,-1],[3,3,1],[-4,-2,1],[-3,-3,-1],[2,4,-1],[4,2,1],[-2,-4,-1],[-2,-3,1],[4,2,-1],[-2,-4,1],[4,2,1],[-3,-2,-1],[-3,-3,-1],[3,3,1],[3,3,1]],"100": [[2,4,57],[3,6,25],[8,4,6],[7,2,27],[3,8,11],[5,2,7],[6,2,54],[6,3,14],[2,3,10],[4,4,46],[9,2,55],[9,3,24],[8,4,33],[6,6,1],[6,3,42],[9,2,55],[8,2,55],[4,2,69],[9,2,55],[5,5,28]],"101": [[-7,-5,-12],[6,-4,1],[5,5,-2],[-6,-2,-58],[-3,-6,-2],[-5,-3,-48],[7,4,-22],[6,3,-29],[-9,-9,-22],[-3,8,-10],[-3,-9,36],[6,9,20],[-5,-2,-42],[-6,-6,29],[-6,-6,-7],[-4,-4,-38],[5,2,-49],[-3,-6,-24],[-4,-2,51],[-7,2,-35]],"110": [[6,5,2],[8,2,2],[8,3,2],[5,6,3],[5,6,1],[4,2,4],[9,3,2],[2,4,8],[8,9,1],[5,4,4],[9,2,2],[9,3,2],[2,9,1],[7,2,4],[9,3,3],[4,5,2],[8,3,1],[2,7,4],[8,3,4],[6,5,2]],"111": [[-9,-2,5],[7,-9,-1],[-9,-3,-2],[-6,-5,2],[-4,-2,-7],[2,5,1],[-6,-4,3],[-2,-3,7],[-2,-6,1],[8,9,-1],[-7,-9,1],[2,7,-6],[-4,-6,-1],[2,-5,-4],[-6,-5,2],[3,2,-11],[-6,-5,-2],[8,-3,-3],[-2,5,-5],[-3,-2,-7]]},"inter_13": {"000": [[9,19,2,2],[2,31,4,3],[7,7,1,1],[5,21,3,7],[2,9,8,24],[6,9,5,38],[2,28,4,7],[8,4,4,4],[9,8,2,25],[4,9,7,63],[3,8,2,8],[5,8,9,8],[9,31,3,5],[7,4,4,4],[4,1,1,4],[2,36,8,6],[5,4,4,23],[3,2,1,6],[4,6,8,68],[3,1,6,52]],"001": [[-7,54,8,-3],[2,-9,-7,-54],[-9,-1,-8,70],[7,-9,6,-50],[-5,-9,-5,-33],[-6,-54,9,1],[-5,-54,9,-8],[6,38,-7,-5],[-7,11,-1,5],[-8,-53,7,4],[6,29,-6,-8],[-9,1,-3,-25],[4,60,8,-2],[5,-9,9,-9],[2,-25,-3,3],[5,-17,-5,9],[3,8,9,60],[-8,-11,-1,-4],[-3,-2,6,-2],[-3,-7,-6,44]],"010": [[7,2,1,3],[7,10,1,9],[7,3,1,2],[5,8,2,9],[3,3,2,4],[9,1,1,2],[3,8,2,7],[5,4,2,3],[2,6,2,4],[5,1,1,2],[5,7,1,6],[6,6,1,7],[4,6,1,4],[7,1,1,2],[6,1,1,2],[9,5,1,4],[3,3,2,4],[3,9,2,8],[9,3,1,4],[6,8,1,9]],"011": [[-3,-4,1,-7],[2,-10,4,-9],[8,-1,-1,-2],[-2,11,2,7],[-2,-5,-4,-6],[3,12,2,9],[2,-10,-3,-8],[8,-2,-1,-1],[9,-5,1,-4],[-3,-10,-1,-7],[-3,-7,-1,-8],[9,6,1,5],[-8,-3,-1,-4],[-6,-9,-1,-8],[-6,-5,-1,-6],[-9,-4,-1,-3],[-8,-2,-1,-3],[6,-6,-1,-7],[-9,6,-1,7],[4,-6,1,-8]],"100": [[7,6,3,26],[4,39,4,9],[5,2,2,20],[3,48,1,8],[4,29,2,8],[8,5,8,68],[8,1,1,36],[4,68,2,5],[3,9,1,15],[9,15,1,7],[6,61,2,6],[8,58,1,9],[5,6,1,34],[9,66,7,4],[5,6,1,30],[5,1,9,1],[5,72,7,4],[6,35,2,2],[6,13,1,8],[9,18,2,1]],"101": [[-5,-36,8,5],[2,-24,1,-1],[-8,-5,-7,-60],[3,-69,-3,1],[-4,-3,-2,18],[-5,-2,6,60],[-3,-57,-9,-5],[6,-34,-2,5],[-2,-5,2,-45],[3,-31,-7,-9],[9,-63,4,7],[-8,-53,1,-8],[-3,40,7,-4],[8,6,9,-65],[5,-2,1,38],[6,22,1,-3],[7,8,2,21],[-7,35,-3,-5],[8,54,1,5],[5,-1,-2,-23]],"110": [[9,2,7,1],[7,6,8,10],[2,37,7,6],[2,50,3,8],[8,17,3,7],[7,18,1,4],[3,5,8,38],[3,4,3,27],[8,4,1,7],[6,21,3,5],[2,8,9,56],[4,5,7,18],[2,7,7,55],[6,2,2,9],[2,55,8,9],[2,28,5,3],[9,1,2,4],[2,7,8,55],[4,9,9,27],[4,9,5,13]],"111": [[-3,20,-7,7],[4,-4,4,-24],[8,-3,-7,9],[3,-42,-2,-9],[6,2,7,-2],[-2,-9,-5,-55],[4,-6,4,-2],[2,9,2,25],[9,8,-8,9],[-2,-7,6,-56],[-8,5,-1,16],[3,24,4,-8],[4,-8,-3,2],[-2,-8,2,-55],[7,5,-6,6],[4,-2,7,-1],[-3,39,-5,9],[2,7,8,56],[-6,-6,-9,-17],[2,58,7,9]]},"inter_14": {"000": [[6,61,1,6],[7,7,3,24],[4,54,1,4],[2,5,9,20],[4,9,3,8],[5,19,1,5],[8,4,1,8],[8,66,1,8],[9,19,1,9],[3,2,9,39],[2,4,5,7],[5,57,1,5],[6,60,1,6],[4,31,2,8],[8,6,1,4],[5,5,5,17],[7,6,2,14],[6,5,1,6],[7,2,9,49],[3,7,9,27]],"001": [[-4,4,4,-8],[8,-3,-4,-56],[7,-9,-9,-56],[6,-3,-9,-70],[6,-7,-7,-48],[-9,3,3,-6],[9,-7,5,36],[-3,-22,-1,3],[7,-6,7,42],[-3,-67,1,-3],[-5,4,-2,5],[4,17,1,4],[-3,-64,3,-9],[9,3,-2,-9],[-7,4,-8,42],[-6,20,1,-6],[6,11,1,6],[8,-3,4,8],[7,-4,-6,-42],[-8,-3,-3,8]],"010": [[6,5,1,7],[2,9,3,7],[8,2,1,10],[8,9,1,9],[6,7,1,5],[6,8,1,5],[3,5,2,7],[5,6,2,9],[6,5,9,55],[4,7,2,9],[6,5,7,43],[7,8,1,8],[7,5,1,6],[7,9,1,6],[9,3,1,8],[4,9,2,9],[7,3,9,61],[9,8,1,8],[6,5,4,23],[4,3,5,19]],"011": [[9,-2,-1,-8],[3,-5,-1,-4],[9,4,7,64],[6,-5,5,29],[9,-4,6,56],[9,4,3,25],[8,6,-2,-17],[-9,5,-7,62],[-5,9,1,-6],[-9,8,1,-8],[-8,6,-1,9],[-8,-9,3,-25],[-5,-9,-1,6],[-8,7,3,-23],[-7,6,7,-50],[6,-8,-7,-43],[9,-6,-8,-71],[4,6,9,35],[9,7,1,8],[7,5,-1,-8]],"100": [[9,4,3,63],[3,17,5,6],[6,2,39,9],[9,5,8,45],[6,20,2,9],[5,17,1,5],[9,31,2,9],[7,2,42,7],[9,2,43,9],[8,2,38,8],[9,5,9,45],[3,5,9,57],[6,7,6,42],[3,2,38,9],[3,5,22,9],[7,4,21,7],[3,4,2,3],[9,4,21,9],[7,6,2,7],[6,9,6,48]],"101": [[-4,-2,-4,-26],[2,56,4,7],[-9,65,1,-9],[-1,-2,-56,7],[-5,5,2,37],[-1,5,6,-5],[8,-44,-2,-4],[2,-2,3,23],[2,-6,-2,20],[4,-9,2,40],[-1,2,55,-8],[7,-5,-4,35],[-3,-68,3,-9],[-1,-2,55,-9],[-3,-2,45,9],[-1,-2,55,-7],[-1,2,-57,9],[-6,-2,-25,6],[-3,40,-1,9],[-4,-44,-1,-4]],"110": [[3,38,2,8],[9,61,1,8],[8,66,1,9],[2,7,9,7],[5,7,9,58],[2,7,6,25],[2,3,21,9],[7,3,3,1],[5,7,9,59],[7,33,1,8],[4,9,6,26],[2,9,4,13],[8,13,1,6],[5,23,1,3],[4,3,4,31],[5,2,3,21],[3,37,3,8],[8,52,1,9],[6,4,5,19],[8,5,7,58]],"111": [[4,5,2,18],[3,5,-4,-31],[-9,-32,1,-7],[4,-2,-4,-1],[2,-9,6,23],[-4,-6,-2,9],[-8,63,-1,7],[2,-3,21,9],[9,-34,1,7],[6,-8,6,46],[8,23,-1,-6],[2,-3,-21,-9],[-2,-3,21,-9],[3,-2,-5,5],[8,-33,1,9],[-2,3,-21,9],[-2,-3,-21,9],[6,7,-1,-3],[2,3,-21,-9],[-4,-5,3,-3]]},"inter_15": {"000": [[5,7,2,7],[2,4,3,5],[8,2,4,2],[4,3,9,3],[8,9,7,9],[5,9,8,9],[8,12,2,9],[6,9,2,7],[7,1,5,1],[5,8,7,8],[5,8,6,8],[7,5,2,5],[5,5,4,5],[8,10,2,7],[4,6,8,5],[8,1,2,4],[6,12,2,9],[8,9,4,9],[7,8,4,8],[9,9,2,9]],"001": [[-9,3,-3,1],[8,-3,-4,-3],[-6,-8,-2,-5],[-9,7,-6,7],[4,1,-6,1],[3,15,-3,9],[6,-3,-6,-1],[-3,-13,6,-9],[-8,2,-9,2],[-3,3,3,1],[-2,-6,4,-9],[-6,3,2,1],[-2,3,2,-1],[6,1,-2,7],[4,10,-4,6],[-5,11,5,9],[-2,1,7,1],[8,-4,5,-4],[2,2,8,-1],[3,-3,-9,1]],"010": [null],"011": [[2,-1,-4,-2],[4,4,-2,5],[2,4,-4,3],[2,6,-3,5],[-3,-8,2,-9],[-3,4,2,5],[-3,9,2,8],[2,1,-4,2],[3,8,-3,7],[3,-5,-3,-6],[-2,1,4,2],[2,4,-4,5],[3,9,-3,8],[-2,-10,3,-9],[4,3,-2,4],[2,-8,-3,-9],[3,-1,-2,-2],[-3,-10,3,-9],[-3,-1,3,-2],[2,1,-3,2]],"100": [[5,6,2,33],[7,40,2,5],[8,30,2,3],[9,9,3,27],[5,21,3,9],[9,8,3,22],[6,9,2,42],[5,7,7,7],[8,17,4,8],[7,10,3,6],[4,5,2,23],[2,6,7,41],[5,7,2,34],[8,1,4,5],[3,7,5,1],[8,7,7,6],[4,9,2,23],[3,9,8,14],[3,16,2,5],[7,2,2,37]],"101": [[8,4,-2,-56],[-7,2,2,38],[-7,6,6,-20],[-9,57,2,2],[5,-8,2,-2],[3,-9,-3,55],[4,-68,-2,-2],[-4,1,4,21],[-3,-54,2,-9],[6,-59,-2,3],[7,-8,-4,-30],[2,-49,-8,-4],[6,-33,-2,-1],[-2,8,-3,4],[7,23,-7,3],[2,56,-6,-8],[-8,9,2,59],[-7,6,2,-30],[5,2,9,-6],[-8,-69,2,-9]],"110": [[2,13,9,8],[5,2,8,3],[3,13,5,8],[4,4,9,2],[9,1,7,2],[5,5,2,6],[7,5,4,4],[4,9,9,7],[3,6,7,8],[7,1,2,7],[7,9,2,11],[4,9,7,10],[9,6,4,8],[9,6,2,5],[8,2,3,4],[5,2,2,10],[8,1,2,2],[8,12,2,8],[2,5,8,6],[3,10,8,8]],"111": [[3,-9,-2,-25],[-4,-19,2,-8],[-2,1,4,-6],[-3,5,2,21],[2,9,-3,25],[-9,3,4,1],[-8,-8,2,-5],[-2,24,3,8],[8,2,-4,1],[2,5,-3,21],[2,-6,-3,-22],[3,6,-2,22],[-3,-22,2,-9],[-2,24,3,8],[2,-9,-3,-25],[-3,24,2,8],[5,4,-9,6],[-3,-21,2,-9],[7,-7,-2,-6],[3,-22,-2,-8]]},"inter_16": {"000": [[8,16,4,9,1],[5,56,2,1,8],[4,8,4,4,44],[8,1,1,6,22],[9,5,6,4,60],[9,1,3,1,56],[6,27,2,3,2],[6,9,3,3,57],[5,11,6,3,3],[8,42,7,7,2],[2,2,7,6,2],[9,49,3,7,9],[6,3,5,2,57],[5,41,9,8,5],[3,30,9,8,2],[6,4,7,4,22],[1,57,9,2,1],[9,49,6,8,7],[2,5,8,1,59],[7,3,9,1,48]],"001": [[-8,3,-7,-1,31],[4,65,-1,-7,-5],[-1,7,4,-7,-63],[7,69,-6,-6,6],[5,-10,9,-1,5],[6,-41,1,-6,-2],[7,48,8,6,-6],[4,-2,-4,5,-12],[-6,3,4,-3,5],[8,28,4,1,6],[-8,50,-5,3,2],[-8,-35,2,1,-7],[1,-1,7,-3,65],[-2,-5,7,-4,-41],[4,33,4,5,9],[9,-1,-8,-1,-5],[5,2,7,8,-6],[-8,3,-1,-8,8],[-8,29,-4,-3,2],[7,4,-8,6,53]],"010": [[3,1,6,2,3],[6,1,2,6,4],[6,17,9,9,9],[6,7,1,9,6],[8,3,6,6,12],[5,6,5,3,1],[9,5,2,3,2],[4,2,3,9,9],[5,2,9,8,4],[7,2,9,7,4],[4,3,8,5,2],[4,5,6,7,4],[3,11,8,8,3],[4,2,2,1,8],[6,4,2,3,12],[7,5,3,1,12],[8,7,2,3,3],[7,12,2,1,7],[7,2,9,9,4],[2,4,5,2,10]],"011": [[6,-12,-8,6,-8],[-4,5,8,-2,13],[1,1,-7,3,8],[-6,-3,3,3,-10],[2,7,-9,-9,10],[-4,2,3,-6,-5],[9,17,-3,1,8],[2,8,1,-6,7],[7,-6,-5,-7,-1],[4,4,-3,-1,1],[-5,-5,1,-7,-1],[2,-9,7,1,-7],[-6,6,2,4,8],[-4,-15,8,-3,-9],[8,18,6,9,9],[-3,-3,-9,-6,-10],[-5,2,6,-1,9],[2,-3,5,3,-2],[7,4,-8,3,5],[3,-18,-8,-7,-9]],"100": [[9,35,9,9,8],[5,4,1,7,33],[8,6,6,9,11],[6,7,2,6,33],[6,1,9,7,25],[6,2,6,7,67],[6,70,1,4,1],[9,12,8,8,3],[7,37,1,7,1],[6,1,6,6,61],[7,1,6,9,29],[6,4,1,3,16],[5,9,5,2,9],[7,3,8,8,24],[3,17,3,7,2],[3,8,4,3,68],[1,4,7,7,7],[5,6,1,4,36],[4,8,5,8,28],[6,8,5,4,29]],"101": [[-6,8,-2,-5,-13],[-7,69,4,-2,-4],[1,-51,-7,-2,-7],[2,5,2,5,12],[-1,9,-7,-7,11],[-7,-7,7,-1,4],[-2,27,-1,-2,-7],[3,67,-3,-8,-5],[-2,-12,5,4,6],[-6,-6,-1,-6,-2],[-1,-18,-8,-6,9],[4,52,1,-6,8],[-2,48,-9,-8,9],[-7,52,-9,7,6],[4,-24,-3,-3,-8],[3,-32,2,3,-8],[-7,-58,9,3,6],[8,-19,3,-2,-6],[-4,42,4,1,8],[1,-9,-7,-9,-57]],"110": [[3,9,3,9,32],[1,7,1,5,63],[9,70,1,7,3],[9,29,3,2,2],[1,1,6,2,28],[8,7,5,4,47],[6,68,9,4,3],[9,5,8,5,18],[3,60,8,1,2],[1,6,6,1,13],[5,2,4,5,3],[9,2,1,3,10],[5,17,9,1,6],[2,9,5,5,22],[1,4,7,3,10],[2,4,6,6,49],[8,17,2,2,6],[4,61,9,2,2],[8,45,9,1,4],[8,4,8,8,7]],"111": [[4,-1,3,-3,-24],[-1,-23,-7,9,-3],[9,-7,8,-2,35],[5,31,6,-5,-5],[-2,70,-9,-6,-9],[-8,3,1,-3,45],[-1,8,-2,8,-26],[7,25,-3,-3,7],[6,8,2,2,5],[-2,-20,-3,2,-5],[2,-33,9,-6,-4],[7,-3,2,1,-39],[-3,-13,2,1,-6],[7,-9,-6,-6,37],[6,-3,8,9,-36],[3,3,5,1,-14],[7,1,-9,4,9],[8,-2,-4,-3,32],[6,5,3,-3,11],[-2,-39,-5,6,1]]},"all_advan": {"000": [[4,11,3,2,2,2,7],[39,2,2,7,1,2,4,4],[3,2,7,18,3,7,9,1],[6,4,6,8,8,9,9,9],[6,3,5,28,2,1,6],[9,9,2,3,7,1],[7,3,7,8,6,9,47,8],[6,8,2,2,2,4,27],[8,3,8,4,6,7,7,6,8],[8,7,6,3,6,38,8],[6,2,65,4,5,7,1,4],[3,2,6,6,9,8,55],[4,9,8,7,9,4,47],[3,8,2,6,3,2,60],[9,1,6,7,60,9],[3,6,2,2,6,2,8,54],[6,65,3,8,6,6,6],[2,1,6,1,5,7,8],[6,6,9,3,5,7,1],[9,6,56,8,3,6,6,3]],"001": [[1,-2,4,-2,44,5,8],[4,-13,7,3,3,-7],[-5,-31,6,2,7,3],[-1,7,-69,8,2,5],[7,-2,3,2,8,6],[-68,-4,-8,-4,-7,-3,9],[-9,5,-15,-5,-6,-3,-6,8,-3],[9,-3,5,6,8,-4,7,-6,-42],[-6,3,7,-3,1,15],[-8,5,2,-6,1,2,31],[4,7,7,3,8,5,14,6],[-1,-9,-59,5,3,9],[-4,-6,9,9,3,-5,8,-19],[-8,-50,2,-9,-4,7],[-9,9,-1,5,-4,9,6,2,9],[5,-5,3,-5,-40,6],[9,4,2,8,1,2],[-2,38,-8,-2,2,-4],[1,9,6,-7,-29,9],[-2,1,45,-2,-3,6,3,-9,-3]],"010": [[2,1,2,5,1,3,28],[4,1,3,5,1,1,9],[8,8,3,8,3,22,2],[4,3,7,24,7,3,9],[6,2,6,8,8,1],[4,3,6,2,9,3,3,1],[2,1,7,3,1,1,8],[2,4,3,7,2,3,7,2,3],[4,8,1,3,2,23,9,4,8],[9,7,3,3,8,11,2],[2,9,1,8,4,1,17],[6,2,7,41,8,9,1,9],[1,5,4,5,2,5,4,7],[3,40,9,1,8,2],[3,27,3,6,4,8],[7,4,4,3,4,3],[5,4,6,2,4,2],[1,2,3,3,9,1,1],[1,9,2,9,41,9],[1,8,3,9,1,3,9,26]],"011": [[9,-1,5,70,9,1,-7],[7,-6,8,-5,-5,-1],[8,-3,8,3,-2,21],[4,3,5,-5,-1,-8,3],[-9,65,9,5,5,8],[-7,-2,-4,-44,-8,-2,-9],[-7,-17,-5,-3,-1,-1],[2,8,-28,-5,4,-9,-9],[4,-6,-6,-6,-5,5,-47],[4,5,8,-3,-3,1],[-2,-4,7,-1,-2,-6,-8,-2,2],[-1,-2,-10,2,-2,4],[-3,6,-3,-8,2,2,-6,-23],[7,8,8,6,7,48,7],[-6,-2,-1,2,-7,-6,-1],[-1,9,2,2,-7,-3,-7,-8],[-3,7,2,1,-3,5,1,1],[7,-8,-1,6,-1,-3,43],[-5,6,-3,8,1,3,6,-21],[-8,5,7,-2,1,2]],"100": [[4,4,6,5,3,8,64],[9,9,5,4,4,63],[6,4,6,8,7,36,4],[1,29,7,1,1,7],[18,2,9,9,2,9,4,4],[3,2,40,7,5,7,7,2,1],[9,4,7,41,2,3,5,8],[8,6,8,8,5,5,2],[5,63,2,1,9,4],[5,7,5,8,6,4,4,20],[5,3,2,6,6,63,3],[2,9,1,34,2,3,1,8],[8,4,6,7,2,4,6,28],[5,6,41,3,4,8,7,3],[3,4,6,4,2,4,8],[4,7,47,2,9,7,8,8,5],[3,9,2,1,47,8],[4,8,2,16,7,1,6],[5,4,1,20,2,5,1,3],[4,2,3,8,7,5,9,4]],"101": [[-2,-1,2,-4,-11,6,-9],[1,66,8,9,-1,2],[8,-7,6,6,-34,8,5],[9,-3,-1,-7,1,1,-16],[-3,-5,8,-56,-3,2,-7],[3,-9,3,-27,-6,-3,4],[-6,5,1,-46,-4,-6,-5],[5,-2,-68,-9,-9,2,7,4,-2],[-5,7,-9,-9,2,64],[5,-7,44,6,-9,6,-7,9,8],[-7,-7,-61,2,-6,2,4,5,-7],[-5,4,9,-9,6,9,26],[-4,47,5,-1,-2,4],[-6,9,-1,7,4,2,-1,7],[9,-7,-1,-7,-2,5,2,-3,-65],[-9,5,-6,3,4,-3,-54],[4,-6,-4,-9,5,9,2,5],[-8,-7,-5,9,-3,3,5,1,23],[7,6,3,3,-50,4,8],[-3,5,7,8,4,12]],"110": [[2,8,5,63,5,2,2,8],[2,3,2,1,59,9],[2,3,2,7,9,4,7],[9,7,1,5,9,6,2,4],[5,55,4,6,3,8],[2,3,9,6,7,3,4,6],[65,3,9,2,9,6,5,3],[41,4,3,5,3,9,8],[9,9,9,1,8,21,6],[2,3,20,8,2,4],[1,8,3,23,9,3,1,2],[2,3,4,2,8,5,1],[4,4,3,7,2,3,2,13],[9,2,1,4,8,2,5,9],[9,2,5,7,2,3,9,43],[33,4,7,2,5,9,2,7],[8,6,3,9,8,31],[8,5,2,25,4,9,2],[41,7,4,5,2,7,5],[6,41,4,9,7,3]],"111": [[6,24,2,2,9,5,2],[-3,7,3,6,-6,7,-3],[9,-7,2,-8,-9,-25,2],[-5,4,5,-12,6,5,-6,9],[4,2,-8,23,5,6,-4],[-5,6,5,-19,-5,-8,5],[6,1,2,-9,1,2,21],[9,-2,6,-3,5,-35,6],[1,-71,3,9,3,-3,2],[-6,2,6,3,-8,51,-2,-3,-9],[4,6,9,-2,-24,8,-2],[-9,-8,-2,-5,7,22,6],[5,-32,5,-7,5,-3],[6,-5,3,-1,-41,8],[-5,2,24,5,-4,2,7,2],[32,4,8,-2,2,2,-5],[8,-7,7,-9,-7,4,-2],[-1,-1,4,-2,9,-7,-69],[-7,-5,2,-1,2,21],[-3,-4,-2,2,-5,-2,-9]]},"advan_1": {"000": [[14,8,8,5,9,6,6],[4,7,4,8,4,3,43],[2,4,3,10,6,8,1],[4,6,8,23,5,7,5],[8,2,5,5,8,2,6],[6,4,6,8,7,9,50],[28,4,8,5,3,7,5],[72,6,1,4,5,5,4],[8,4,6,7,9,3,1],[17,9,4,2,5,7,7],[6,7,8,2,2,6,10],[71,5,1,4,8,6,6],[27,6,7,6,3,5,3],[30,5,6,4,8,3,7],[5,7,2,59,8,7,5],[9,6,8,4,3,6,71],[3,7,4,2,3,2,57],[32,2,4,4,9,1,5],[15,4,1,3,9,2,3],[27,7,5,1,8,5,8]],"001": [[-32,-8,-6,-4,7,7,-1],[-9,3,-5,7,-6,-9,-25],[5,-4,6,-58,-7,9,-6],[2,6,3,5,4,-9,-19],[21,-1,1,4,3,1,-1],[20,-1,5,9,6,-2,-4],[-9,-4,-9,-6,-3,1,60],[-33,-3,-8,-3,2,-3,3],[-6,-3,9,58,5,2,1],[2,5,-5,-14,2,-2,8],[-6,2,-8,4,7,1,-3],[-9,4,1,6,-5,-9,-44],[51,9,8,1,2,-1,-7],[-12,7,-5,-6,-3,9,-6],[-5,-1,1,-59,-2,-4,-9],[-8,-6,-1,-43,-4,5,-4],[-1,7,-9,16,-5,3,-3],[4,-7,-8,27,-9,-2,-9],[3,-2,-4,-40,-3,-5,-9],[-9,-9,-2,7,-1,2,52]],"010": [[9,3,5,3,3,7,7],[4,9,4,6,3,9,21],[1,2,5,17,6,3,6],[2,4,2,5,3,4,8],[1,2,5,37,9,2,8],[8,2,1,6,4,2,7],[9,3,4,7,4,4,7],[5,5,7,10,6,5,9],[4,4,5,8,7,2,5],[4,3,3,2,4,4,4],[5,2,9,4,7,3,3],[6,8,4,9,3,9,29],[24,3,6,8,9,1,5],[59,5,6,1,9,3,8],[35,3,7,3,8,3,5],[37,5,1,6,9,1,8],[33,9,4,2,8,5,7],[4,8,1,9,2,1,34],[6,3,4,4,8,2,2],[4,7,4,5,6,5,5]],"011": [[-8,-1,-9,-66,-7,-1,-9],[-1,-2,-2,28,8,1,-6],[7,2,1,22,-9,-1,-5],[3,-4,-3,3,9,2,-2],[1,8,1,8,-1,-3,-61],[-6,-4,1,9,-2,4,22],[22,-2,-1,-2,-9,-1,-3],[-5,-1,-7,-58,9,1,6],[-24,5,6,2,-6,-4,2],[-8,-6,8,-7,6,-9,5],[1,6,-2,-9,-1,5,59],[5,-6,-1,-2,-1,3,-21],[-3,-4,1,7,-8,1,3],[61,9,4,2,9,3,8],[-66,-7,3,-6,-9,3,3],[2,3,4,11,8,2,5],[-2,4,-8,6,-3,8,-7],[-8,5,2,-5,-6,-2,4],[-33,8,5,-2,9,5,-5],[-3,-1,4,-56,-8,1,-6]],"100": [[2,4,6,64,7,3,3],[6,8,6,7,7,7,1],[9,2,4,2,9,1,7],[34,5,1,9,9,1,3],[3,4,6,5,7,7,14],[7,9,7,7,8,7,35],[5,7,7,48,3,3,7],[8,9,6,33,7,9,5],[9,5,3,6,9,2,13],[19,7,1,7,6,2,3],[8,4,6,51,7,4,8],[6,7,7,12,3,7,2],[3,2,8,20,7,3,4],[6,3,6,2,3,4,16],[26,2,7,5,3,4,4],[4,2,5,6,2,7,22],[7,3,6,2,5,4,23],[9,2,9,13,5,4,9],[3,4,8,50,7,5,2],[3,7,8,9,5,5,69]],"101": [[2,-5,8,15,-7,-3,-7],[32,2,1,-1,4,1,8],[1,-7,-7,-23,8,-7,-6],[-7,-4,1,-8,5,-1,-6],[6,3,9,2,8,1,30],[8,-8,7,-54,-2,-8,-4],[2,7,9,-7,2,-4,-59],[1,-4,5,-8,9,-3,34],[5,-3,-5,-48,7,3,-7],[-1,-9,3,43,-4,-5,3],[2,-9,5,48,-7,2,-5],[25,-1,-2,2,5,1,-8],[63,-7,7,-6,-9,5,-9],[6,-8,1,5,9,-5,62],[-8,-7,-5,1,-3,-9,-35],[4,-4,-1,-7,9,1,48],[2,4,6,-68,-9,-3,6],[-51,-4,1,-8,3,1,-4],[2,-2,-1,18,-8,-1,2],[9,-8,4,4,-7,5,-31]],"110": [[8,2,5,7,3,1,37],[29,6,4,1,7,2,4],[9,2,8,5,2,9,56],[1,2,7,2,9,4,9],[5,9,5,3,2,4,61],[1,6,8,3,7,6,8],[3,8,8,3,8,1,7],[3,9,6,2,4,9,6],[43,7,6,2,4,6,4],[7,2,9,30,9,3,8],[8,8,3,1,2,4,57],[3,7,8,9,3,4,17],[66,8,1,9,8,8,9],[6,2,7,3,6,8,7],[15,5,5,5,8,1,3],[51,8,3,7,2,1,8],[4,4,8,8,5,5,15],[8,6,2,4,5,6,23],[72,6,5,2,5,7,8],[72,7,6,1,5,4,1]],"111": [[-9,2,-9,1,7,2,6],[-4,6,-1,10,-1,-1,-9],[3,6,9,-8,-1,5,58],[1,8,2,-6,4,7,-22],[8,6,-6,-15,-9,1,5],[1,3,-6,5,-1,-6,47],[-6,-5,-4,-5,4,-1,25],[5,-3,-2,7,-6,-4,-4],[7,-6,9,1,5,-3,3],[12,-2,-9,7,8,-5,9],[2,-2,-8,56,-6,2,4],[8,9,1,-7,-5,-5,-2],[-68,-1,1,3,-4,-1,7],[-9,-9,-1,-11,-1,7,9],[7,6,9,10,4,-4,1],[16,-3,-6,-3,7,7,-8],[5,-8,-5,-2,-9,-3,-5],[-4,-8,8,-8,-2,-7,-57],[-8,-1,8,-16,-5,5,5],[10,2,5,3,-2,-1,7]]},"advan_2": {"000": [[3,2,7,5,3,1,36],[4,2,9,40,9,3,5],[8,2,9,49,6,9,7],[4,9,5,43,2,4,9],[1,5,1,72,8,6,3],[2,4,9,17,8,2,3],[7,6,1,15,7,3,6],[9,8,2,2,2,4,59],[3,3,6,1,8,9,45],[1,7,8,30,2,3,3],[9,9,9,2,6,1,17],[6,5,7,9,8,6,3],[2,7,7,6,8,5,8],[4,8,3,22,4,3,8],[1,7,1,28,9,3,7],[8,5,1,9,6,7,51],[1,9,2,65,9,9,3],[7,6,1,2,2,6,9],[3,3,8,3,5,4,6],[6,4,5,7,9,1,5]],"001": [[5,4,-9,-71,3,8,-3],[5,-4,-4,65,5,-6,-1],[3,-3,-8,37,-8,-7,3],[4,8,7,-71,2,-6,4],[7,-6,9,10,5,-6,5],[1,6,-8,64,5,1,4],[1,7,8,-6,3,8,-3],[-6,-4,1,-1,9,2,-12],[-9,8,-8,-19,-9,7,8],[-9,-2,-8,25,3,-4,-4],[-8,6,-2,-3,-2,-5,54],[-4,-6,4,-7,-1,4,-66],[7,-6,6,23,6,-9,2],[-6,-1,-4,-21,-3,5,6],[-5,7,6,-5,-8,-9,-35],[2,4,-5,-9,-4,-5,-67],[5,5,-5,8,3,8,72],[-3,9,6,-62,2,-9,-3],[-1,9,-2,4,-4,5,-8],[3,2,3,-4,5,3,-10]],"010": [[1,5,6,6,9,3,4],[3,9,1,9,2,8,40],[1,9,1,9,2,6,44],[6,6,9,7,7,8,5],[8,2,8,39,9,2,9],[2,4,5,9,2,8,22],[8,7,4,8,3,9,21],[6,9,2,6,9,2,7],[1,3,2,12,4,4,7],[2,6,4,6,2,9,21],[2,5,7,1,4,8,3],[4,3,4,17,8,3,6],[4,3,6,6,3,9,8],[2,7,1,9,2,2,31],[5,5,3,8,2,6,22],[2,7,3,8,2,7,31],[7,6,6,9,5,9,9],[7,2,5,43,9,1,9],[6,8,1,4,2,5,13],[1,7,2,7,7,3,8]],"011": [[6,9,3,-8,3,9,-23],[-7,-7,-2,-4,-1,1,-37],[-5,-4,2,9,-9,2,5],[-5,-1,2,63,-9,1,8],[-7,-1,4,-24,8,-1,4],[6,-1,-5,-44,-7,-2,-6],[-8,6,3,6,-1,-4,-44],[6,-1,-5,-72,-7,-1,-9],[5,-2,-7,-13,-7,-4,-4],[6,5,-2,-8,2,2,-22],[-1,-2,7,-9,3,-7,9],[4,4,-4,8,4,-1,9],[3,4,-9,10,-8,5,-4],[8,-3,2,1,-5,-1,-1],[-7,-3,-4,-1,-5,-2,1],[-2,-1,-6,-55,8,1,8],[-5,6,-4,-2,-9,4,2],[7,-4,1,-7,-1,4,-37],[-5,-9,1,9,-1,9,72],[-7,-1,-4,66,-8,1,8]],"100": [[2,3,5,21,8,2,5],[7,2,3,5,9,2,20],[9,5,4,2,6,4,40],[2,3,1,20,4,1,9],[7,6,1,7,6,2,23],[8,4,9,4,9,7,6],[8,9,2,4,4,8,42],[1,7,8,4,7,9,34],[2,2,6,7,5,5,71],[7,3,2,5,4,4,27],[7,4,3,6,6,9,39],[5,2,7,26,3,6,6],[8,3,7,6,4,9,50],[5,4,1,33,5,1,8],[7,2,3,3,4,4,24],[4,2,7,6,8,5,7],[3,4,5,2,4,8,11],[2,5,4,5,9,1,49],[6,4,4,9,9,2,48],[1,5,1,3,9,2,23]],"101": [[7,7,-4,9,-8,2,39],[3,-1,5,2,2,-3,1],[-1,-1,8,-9,-5,4,-70],[-6,-2,6,16,-4,3,-4],[-7,4,9,4,3,8,-63],[5,5,9,67,-3,-6,-5],[-5,8,-3,-2,-7,3,24],[5,-9,9,-48,-2,-5,-1],[-8,-1,-6,24,-7,-1,6],[7,-9,6,-7,5,-9,-23],[7,-8,-5,68,8,4,-8],[-5,8,2,49,9,3,-8],[-4,2,-7,-9,-8,2,25],[8,-5,-7,-1,-4,-7,-5],[-5,-4,9,2,-3,8,-3],[-9,-3,2,-5,-6,3,-51],[-4,-1,4,6,3,-3,20],[7,-2,5,53,-7,9,-2],[-3,9,6,6,-9,-7,-34],[-1,-3,-8,7,-3,-7,13]],"110": [[3,3,9,9,2,8,3],[3,3,5,3,4,9,27],[2,6,7,1,9,9,8],[9,9,3,8,5,5,11],[3,7,3,7,3,9,39],[2,2,1,61,8,7,5],[9,6,1,2,5,2,2],[2,6,9,20,4,1,8],[5,2,8,21,6,7,6],[8,5,1,6,5,3,5],[7,2,6,64,9,5,9],[6,6,1,22,8,4,7],[9,8,5,3,2,6,55],[1,3,5,8,2,4,59],[4,6,5,1,4,4,23],[1,3,6,4,7,2,13],[2,9,7,14,4,2,7],[5,7,5,9,4,1,13],[4,6,7,8,9,3,2],[6,6,5,22,8,6,8]],"111": [[4,2,8,-72,9,-6,-8],[-6,5,-4,11,-9,-5,-1],[-7,2,1,17,-3,-4,-2],[-8,-3,-7,-7,-2,4,4],[-2,-4,-7,-7,-5,-2,-23],[-4,2,-6,-34,6,8,-6],[4,-4,-6,24,4,4,-1],[7,2,7,-55,-8,1,4],[4,-4,-6,-1,3,4,22],[1,-2,1,5,-1,-7,-69],[7,6,-4,-6,9,2,-9],[-1,3,-1,9,-9,4,-11],[-1,9,-2,-4,2,4,-36],[1,5,-5,16,4,9,8],[-1,8,2,3,-1,3,-62],[2,-1,2,-72,-8,-6,-1],[1,-8,2,6,2,1,-62],[-9,-2,5,-55,6,-5,9],[-5,-1,3,-66,-4,1,4],[-8,-4,6,-41,-8,-4,-9]]},"advan_3": {"000": [[50,4,5,6,3,4,2,5],[1,6,7,51,1,7,1,5],[50,7,9,2,2,7,8,7],[2,7,1,1,1,7,8,37],[8,6,2,3,5,6,2,1],[2,4,9,1,4,6,2,31],[1,5,1,7,7,8,9,60],[8,7,1,6,4,2,5,4],[7,2,7,71,1,8,3,9],[36,4,9,2,2,7,6,4],[28,5,9,4,4,2,9,1],[67,4,2,9,3,7,3,1],[6,9,6,4,5,5,8,3],[13,2,8,1,9,9,2,9],[8,5,6,4,7,2,7,5],[3,9,9,37,6,4,9,6],[14,7,3,6,5,3,7,7],[2,5,2,5,1,3,4,4],[53,5,9,1,2,8,5,8],[2,4,1,1,1,5,6,39]],"001": [[-9,5,-6,7,7,4,-6,26],[5,7,1,9,5,6,5,2],[24,-5,9,9,8,7,-3,-3],[8,8,-6,-3,-5,-1,8,16],[4,6,-3,4,3,-4,6,-1],[8,-6,6,34,-8,-3,-1,-7],[-4,-1,4,-9,-1,-1,-8,-49],[-8,-4,3,7,5,5,3,44],[8,-1,1,15,8,-7,-2,1],[5,6,-6,6,1,-7,9,9],[1,-5,-7,-6,-8,-7,-1,-25],[-13,8,-6,-1,-4,-5,9,5],[3,-9,4,-9,6,-4,2,13],[3,-3,7,-35,9,-4,-2,-8],[46,8,-9,-6,-2,4,-9,8],[-12,4,6,-1,1,8,7,-2],[-4,-1,-4,-65,-3,6,5,-9],[-46,3,5,-7,2,-3,-7,1],[-72,2,-4,-3,6,2,1,9],[2,9,8,7,1,-5,-5,33]],"010": [[37,6,7,7,4,9,4,8],[1,7,1,7,8,6,1,7],[8,7,5,7,7,3,7,22],[4,8,1,3,8,6,1,4],[31,3,9,9,5,7,2,7],[7,8,7,6,5,9,6,6],[4,3,9,24,6,8,3,9],[65,2,2,2,1,7,1,9],[9,5,6,6,7,7,4,5],[2,2,4,43,1,9,1,9],[5,9,3,7,6,2,9,38],[2,4,8,16,5,8,4,8],[24,5,5,1,1,9,3,3],[30,9,5,3,8,7,6,9],[5,6,1,11,1,8,1,8],[49,4,9,2,7,8,3,8],[37,7,2,3,6,7,2,7],[6,8,3,8,5,7,2,9],[68,3,6,3,5,8,2,9],[60,9,8,3,7,9,8,9]],"011": [[-5,5,9,2,8,-5,-6,-2],[-7,5,8,8,-3,-5,-8,-7],[-2,-8,-4,4,-4,3,9,-9],[-18,4,-1,9,-7,-1,4,-9],[-1,-3,2,-3,5,2,-1,2],[-8,-3,-3,-27,-3,8,1,8],[-9,-1,2,-70,-4,-8,-1,-7],[-7,-8,1,8,-9,-1,8,66],[7,8,1,8,6,7,-1,11],[-2,-1,4,-59,6,-9,2,-6],[-3,9,-1,-5,1,-1,3,57],[5,-1,4,51,9,-7,3,7],[-1,2,-1,39,-7,9,1,8],[2,-5,2,9,-4,-1,8,50],[25,-2,-7,9,3,3,5,3],[59,-7,8,-1,-5,8,-7,9],[2,-2,-9,-2,7,-7,-2,-2],[2,7,4,-4,8,9,3,-2],[-72,-7,-4,-8,-3,8,5,-1],[-15,-6,2,1,-1,-5,1,6]],"100": [[52,3,3,4,7,7,2,4],[45,9,2,4,3,4,3,3],[12,3,3,8,1,7,2,6],[9,7,1,5,8,3,3,8],[3,6,8,7,3,6,7,3],[40,7,1,2,1,2,1,5],[3,3,5,8,9,7,3,21],[2,6,1,42,3,5,7,6],[52,7,7,4,8,3,9,8],[25,8,9,3,9,7,3,7],[4,4,1,9,5,4,4,61],[4,5,7,70,7,5,2,6],[6,2,4,5,3,8,3,59],[8,7,2,16,4,4,2,2],[7,4,8,2,5,4,1,44],[24,7,7,3,6,6,7,2],[3,4,9,63,4,7,9,1],[39,7,7,4,2,3,6,3],[2,2,6,10,5,5,2,8],[5,8,6,7,5,8,6,62]],"101": [[-7,4,-6,2,2,3,-5,-18],[7,7,7,-7,3,-2,-7,-11],[2,6,-4,-5,7,4,-5,4],[-30,5,-3,-3,2,2,-9,7],[-20,2,4,4,7,-1,5,6],[-1,-7,-2,6,-2,7,1,8],[-4,-4,-9,1,-1,-5,-7,14],[38,-8,-8,-3,1,4,7,-2],[-9,-9,-5,3,-8,8,7,3],[-64,-9,-6,5,-4,-9,-6,-7],[2,5,-2,14,9,5,-8,6],[31,-3,-3,3,-4,-1,8,-1],[-56,-4,5,8,-4,-7,-1,6],[3,-3,6,-5,-4,-4,-3,-63],[6,-1,-1,56,2,7,9,2],[42,5,3,-4,9,-4,-2,3],[8,-4,5,-20,3,-4,6,-2],[-1,-5,1,-9,-1,-9,2,-8],[-3,-5,3,-31,-2,-2,5,5],[-4,-3,-4,-1,3,-1,-8,-14]],"110": [[6,5,2,22,6,9,4,4],[17,2,5,5,6,9,1,5],[3,5,6,1,7,7,1,4],[4,6,5,8,8,3,6,49],[39,4,7,8,9,3,2,7],[7,6,5,7,8,2,8,54],[67,3,4,4,1,9,9,9],[1,9,4,2,7,4,8,2],[7,2,1,7,3,3,3,34],[21,2,1,4,4,9,7,2],[17,6,4,2,9,7,8,5],[7,5,8,22,5,8,6,9],[7,3,6,5,4,6,6,12],[13,5,9,5,7,5,1,8],[6,2,1,9,1,6,9,3],[22,8,2,7,6,8,5,2],[70,9,2,3,8,2,7,4],[27,2,3,8,4,6,3,9],[9,2,1,16,4,5,5,1],[9,4,4,9,4,3,8,29]],"111": [[-45,-8,-8,-3,-2,-6,-1,8],[-28,8,1,4,3,-8,3,-3],[-4,-8,9,8,5,3,-5,4],[-1,-4,-4,8,-8,-1,-2,16],[5,4,7,1,8,-2,5,29],[35,-8,-4,8,-9,-3,1,9],[-5,2,2,55,-5,-2,6,-7],[-4,2,-2,-59,8,-9,6,5],[-4,2,2,1,-2,-8,9,8],[60,-9,9,6,-4,9,1,9],[-65,-7,-8,6,-9,-4,-7,3],[7,6,9,-9,-6,-9,-4,1],[2,2,-7,59,8,-9,8,-5],[-70,-9,-5,-7,-9,3,4,2],[7,-1,5,-72,5,-4,6,-7],[65,-5,-9,9,7,-1,8,1],[5,3,2,-26,-6,-5,9,1],[-8,5,6,3,-3,6,-3,3],[52,9,-4,8,2,4,-2,7],[3,4,4,8,1,-1,7,-3]]},"advan_4": {"000": [[8,6,1,6,7,44,2],[6,1,4,8,8,2,40],[2,8,5,4,7,9,2],[9,3,7,7,6,7,43],[7,9,4,4,9,7,56],[2,2,9,6,4,26,6],[2,9,2,4,2,59,6],[3,8,4,5,3,7,8],[5,2,6,2,4,13,2],[5,7,3,3,4,1,18],[3,5,7,4,1,33,1],[4,6,9,7,7,1,43],[3,4,16,4,6,8,8],[9,4,24,7,1,1,8],[9,6,6,9,4,9,45],[4,5,6,5,2,5,19],[7,7,4,3,2,2,34],[2,1,3,7,7,1,13],[4,7,15,5,6,1,7],[5,4,1,8,3,8,25]],"001": [[7,3,-8,-4,-7,-3,-44],[6,-7,-5,4,5,39,-6],[-1,-9,-7,3,5,-3,22],[-9,4,-5,-9,9,7,-18],[-4,9,2,3,-3,6,-35],[-4,1,9,8,6,7,-24],[5,-8,2,3,7,-41,1],[8,-6,-6,-2,4,7,-6],[-4,-1,-7,7,3,9,66],[-5,4,7,-7,7,-63,-8],[7,3,8,9,3,4,-4],[-5,4,38,4,-8,-6,-6],[7,7,4,-3,-6,8,4],[6,7,2,-4,-2,-33,-6],[-8,1,-8,3,-9,7,-20],[-6,5,8,-6,7,-43,-6],[-7,-7,8,7,8,37,-7],[-1,-7,-9,-3,-6,-7,30],[2,-8,-5,-6,-2,-6,6],[4,-4,-48,2,-4,4,8]],"010": [[3,1,1,5,1,3,14],[3,1,3,3,2,2,13],[2,1,1,3,2,3,4],[2,1,2,2,3,2,2],[2,2,4,4,1,1,6],[2,1,4,7,1,1,9],[3,2,5,2,1,1,8],[2,1,9,2,2,2,19],[6,1,9,3,1,1,51],[2,1,4,5,1,3,17],[4,1,4,5,1,7,55],[7,1,1,2,1,9,18],[2,2,6,2,2,6,15],[2,1,3,3,2,9,32],[5,1,2,3,1,1,4],[4,1,3,3,1,3,16],[2,1,6,6,1,1,9],[2,1,5,3,1,1,10],[6,1,2,3,1,1,8],[2,2,6,2,2,3,9]],"011": [[-2,6,-43,-8,-2,9,9],[-3,-8,9,2,-8,22,8],[-5,2,-5,-2,-3,21,-8],[-2,-9,26,-9,3,-6,7],[4,-9,-4,6,7,6,27],[6,1,7,-1,-1,48,-7],[-2,9,-6,-1,-9,23,-9],[-1,-9,-23,2,-8,-8,3],[-7,1,5,-3,-5,-13,3],[-2,-7,4,6,-3,-1,-7],[7,-2,-6,2,6,24,-3],[-5,4,-4,2,7,-14,1],[-4,6,-3,-3,-7,9,-16],[-9,-1,-8,2,-1,-34,-2],[-3,5,-1,-1,-6,-1,9],[-3,-6,-29,8,-3,-9,7],[3,-5,13,6,2,-9,-7],[-8,2,3,-2,-9,-6,-17],[-2,-3,4,-2,7,-5,5],[-5,5,-8,7,3,-1,40]],"100": [[9,1,19,5,3,6,9],[8,6,9,9,4,21,9],[3,3,67,9,3,6,3],[5,8,9,2,1,1,5],[7,2,68,5,2,1,1],[4,7,5,6,2,8,28],[5,1,61,2,1,2,1],[3,2,50,7,7,3,6],[7,6,6,5,5,20,8],[8,7,9,8,4,47,8],[7,7,6,8,3,8,33],[2,2,8,9,3,71,4],[4,7,9,7,2,7,43],[4,5,4,2,8,2,20],[6,1,9,2,3,11,4],[9,5,2,4,9,18,9],[8,9,4,9,9,1,41],[5,6,3,8,2,7,25],[6,4,4,5,2,3,5],[6,9,7,6,2,49,6]],"101": [[-1,-5,-12,7,-6,-2,-2],[-1,-5,-7,5,3,4,7],[-3,-6,-16,6,4,5,-6],[-8,3,-3,-5,6,3,9],[-5,-8,-9,7,-2,-9,8],[-4,-9,6,-3,6,37,9],[9,-9,-3,8,-3,4,5],[4,-3,-6,-8,-9,64,4],[9,5,47,7,2,-2,-4],[7,-1,9,3,9,-46,5],[-2,-5,-5,4,-2,3,10],[-3,6,8,7,-5,-8,26],[7,9,-3,-1,6,-8,-70],[5,-9,-8,-1,-7,-69,-9],[-8,-4,-2,4,-6,-6,-56],[4,6,-8,-9,-5,-65,1],[-2,-7,5,4,-4,33,6],[-9,-6,1,-4,1,-8,-27],[-5,-4,19,-5,-7,2,5],[-9,5,8,-7,-6,-9,9]],"110": [[3,4,6,2,7,7,7],[8,2,4,4,2,4,25],[4,1,8,2,5,10,4],[8,8,4,3,1,8,4],[2,3,7,9,1,6,71],[5,2,4,7,1,9,48],[9,3,1,2,5,45,3],[2,4,3,2,9,45,5],[3,5,8,6,8,3,10],[9,9,5,2,4,29,4],[7,6,4,4,3,3,3],[4,2,6,8,4,7,7],[5,3,4,8,2,11,9],[5,2,7,6,5,6,26],[9,8,1,2,7,11,8],[6,5,9,2,6,7,11],[2,3,30,4,1,8,5],[2,6,49,8,6,1,9],[3,8,9,9,6,1,9],[7,5,3,8,6,3,5]],"111": [[-1,-9,-7,-1,5,-1,71],[-1,1,-9,-9,-1,-9,35],[-3,-5,2,2,1,57,9],[2,2,-5,3,6,-26,-2],[-8,5,3,-2,2,-27,-3],[4,-1,3,-1,1,57,1],[-3,-4,-23,5,4,5,-4],[2,-2,-7,7,2,-8,18],[3,3,36,7,5,-6,3],[-6,7,-2,-1,-7,-37,-6],[5,-7,31,7,3,-9,4],[-2,8,-38,4,5,4,7],[5,-6,18,7,-2,-1,6],[2,5,58,-2,4,6,9],[2,-1,-67,9,9,9,4],[-3,3,-7,6,-5,-21,-8],[-2,-1,-9,-7,-7,-3,3],[4,-6,-5,-6,2,-21,8],[9,-3,5,4,4,-37,-5],[-4,9,8,-6,3,-8,-58]]},"advan_5": {"000": [[2,5,9,8,9,3],[3,61,5,8,4,4],[8,8,2,6,42,3],[2,7,7,9,58,5],[1,7,2,8,31,6],[4,70,9,5,5,3],[3,3,3,8,4,9],[5,8,2,7,67,9],[9,1,5,5,58,8],[9,9,3,8,36,5],[5,5,3,6,28,8],[2,3,3,9,19,8],[9,3,3,4,48,6],[5,39,7,8,5,3],[7,7,3,9,1,5],[5,16,4,2,5,2],[6,36,9,1,9,6],[2,61,5,3,9,2],[4,3,9,8,21,3],[2,5,4,3,19,8]],"001": [[5,4,4,7,-1,5],[-2,-1,4,5,25,8],[-2,-30,5,-9,-3,6],[-9,1,4,-9,11,8],[-9,-8,3,-9,30,9],[2,-4,6,9,-54,9],[-4,-1,5,-2,-2,4],[-6,3,2,9,-36,4],[-6,3,7,6,30,4],[6,-1,7,4,21,9],[3,-5,6,-5,2,9],[-8,-1,2,-7,7,4],[-3,-3,8,8,8,5],[-3,-23,7,-4,-4,4],[7,-22,9,7,-3,6],[-7,18,2,-1,-6,6],[7,-13,9,-2,-2,6],[9,-52,2,7,4,6],[3,-8,2,7,-6,6],[5,31,9,1,9,3]],"010": [[6,6,2,6,5,3],[6,7,8,1,1,2],[3,9,2,8,37,8],[7,34,8,1,8,2],[9,27,5,5,9,2],[1,8,2,3,37,9],[9,6,5,2,3,2],[2,9,2,8,45,9],[9,8,3,4,7,2],[7,13,9,2,3,2],[1,7,3,2,21,8],[2,37,8,1,9,2],[4,9,2,7,22,5],[4,1,6,3,2,5],[4,1,4,8,4,9],[3,8,2,9,24,7],[1,8,2,2,38,9],[4,7,2,6,22,5],[5,26,7,1,8,2],[8,37,9,2,9,2]],"011": [[6,-43,9,1,-9,2],[3,-9,3,5,-23,8],[7,8,7,8,9,9],[7,-13,5,3,-8,3],[5,4,3,7,5,5],[8,43,9,1,9,2],[-9,-11,8,-9,-9,7],[1,1,2,-2,-3,3],[9,-8,9,5,-3,4],[2,6,2,8,21,6],[-2,-9,2,-5,-37,8],[6,22,5,1,7,2],[-1,-33,8,-1,-8,2],[-3,-28,9,-1,-6,2],[6,-7,6,6,-7,5],[8,26,8,3,7,2],[2,25,8,1,9,3],[5,26,7,2,7,2],[4,10,7,4,8,5],[-4,25,9,-2,8,3]],"100": [[7,6,8,3,4,2],[2,34,2,6,6,4],[7,1,4,7,51,8],[2,10,5,5,8,4],[2,9,4,7,69,8],[2,13,9,7,3,6],[4,6,9,7,32,5],[4,6,3,1,33,6],[6,8,6,2,15,3],[3,8,4,8,68,6],[6,8,5,7,40,2],[5,4,3,3,64,6],[4,10,6,1,1,2],[2,41,6,1,2,4],[7,19,2,6,6,4],[5,3,9,4,68,6],[4,8,9,4,8,5],[9,3,7,5,47,2],[5,3,6,3,9,2],[7,33,9,1,9,2]],"101": [[-9,-1,5,-1,-3,2],[-3,9,5,-1,19,3],[-3,1,2,2,-6,4],[6,-2,4,-6,-63,9],[-6,-24,8,2,8,5],[4,6,2,-8,-48,8],[2,-34,9,-8,-4,6],[2,-23,4,-9,-7,8],[-9,-66,4,8,-2,8],[6,5,2,1,-23,4],[-5,7,7,7,3,3],[4,-70,5,-4,-2,7],[5,45,6,6,-1,5],[8,12,4,-6,2,8],[-9,43,8,8,-6,9],[-2,8,3,-4,-4,9],[1,-49,5,6,5,7],[-4,-8,9,3,-45,6],[9,-52,6,1,9,3],[1,-3,9,-1,-39,5]],"110": [[5,30,4,1,8,3],[9,22,3,2,3,2],[6,15,9,2,1,2],[7,1,2,6,40,5],[4,1,8,3,9,3],[6,7,4,2,25,5],[2,47,7,8,7,2],[4,12,3,9,5,5],[6,38,2,2,9,3],[7,9,4,8,39,9],[9,2,2,8,37,7],[8,3,3,8,37,7],[8,5,4,3,15,7],[6,9,3,8,42,5],[6,25,8,6,9,5],[6,1,5,1,16,6],[7,7,5,8,18,7],[9,40,8,2,8,4],[9,2,6,5,3,8],[9,14,8,9,4,3]],"111": [[-4,-2,7,2,4,6],[9,-3,5,-3,-21,8],[7,-19,4,-4,3,2],[7,-1,2,4,6,3],[-9,3,4,3,-8,3],[7,-29,8,7,-3,2],[-4,-9,4,7,2,5],[-9,-26,3,-3,-9,2],[5,19,2,-4,-3,3],[-7,4,7,2,-4,2],[1,-2,2,6,-55,6],[-6,-46,9,1,-8,2],[-2,4,4,-8,23,5],[-8,7,2,-1,57,5],[5,-11,7,-2,-4,3],[1,34,7,6,6,2],[-4,6,5,8,-3,6],[-6,33,7,1,8,3],[-6,3,2,4,45,9],[2,9,8,-1,21,9]]},"advan_6": {"000": [[8,9,9,2,54,4,2],[1,4,2,4,44,3,2],[9,1,2,8,9,3,25],[2,2,6,4,52,9,3],[9,5,2,8,57,7,5],[1,6,6,7,1,4,7],[4,9,9,9,65,6,6],[5,8,5,6,6,5,5],[4,4,7,7,6,3,20],[7,8,9,3,6,6,7],[3,6,2,7,53,5,2],[2,2,8,6,1,2,30],[3,5,2,8,7,2,39],[4,39,4,5,6,4,9],[5,5,3,1,42,6,5],[1,4,6,8,5,2,24],[2,7,2,7,16,6,4],[5,7,3,2,9,9,9],[7,37,9,7,3,3,2],[9,8,2,6,4,2,66]],"001": [[-5,33,3,-8,6,6,-6],[6,-68,7,9,8,2,5],[-9,5,7,-6,-3,3,-20],[-3,2,8,3,-14,5,-3],[9,-5,6,8,7,3,39],[1,11,9,-5,-2,9,1],[7,2,5,-7,-3,2,1],[-9,-1,3,2,3,9,25],[-4,-1,3,-7,-60,3,-2],[6,8,2,4,-4,2,47],[-4,-1,9,2,15,9,2],[-7,-66,3,9,9,9,-9],[-5,-62,8,4,7,8,-6],[3,-2,5,-3,32,7,4],[8,-9,6,3,-60,2,-6],[2,6,6,-9,2,6,-1],[5,-61,4,4,2,4,1],[-2,-61,5,6,-5,5,-6],[-6,-3,9,1,-5,4,-2],[4,-5,7,4,63,7,6]],"010": [[1,8,2,3,7,2,7],[1,1,3,2,14,2,8],[3,7,3,1,6,2,4],[1,8,2,2,24,5,9],[2,8,4,1,5,2,5],[1,3,2,2,38,5,9],[1,15,5,1,4,3,4],[1,2,3,1,2,4,1],[1,2,2,1,47,7,8],[3,6,3,1,3,2,3],[1,8,2,1,1,5,4],[2,7,3,1,7,3,4],[2,1,3,1,6,2,4],[1,37,5,1,5,4,9],[2,4,2,2,11,2,8],[2,27,4,1,2,2,8],[3,9,2,1,1,2,6],[1,3,4,1,18,5,4],[1,1,2,3,3,3,1],[1,5,2,1,2,2,5]],"011": [[-5,-8,9,2,12,2,5],[-9,27,4,9,-2,5,6],[7,-1,8,-5,-6,7,-1],[7,55,6,-9,-7,7,8],[-6,7,2,7,-7,3,2],[4,-57,7,-4,6,5,-7],[-9,1,9,3,3,2,2],[-6,-26,5,1,7,2,-2],[-9,-21,8,9,4,7,-2],[9,40,8,-9,1,9,5],[2,8,7,-3,4,6,2],[-1,5,5,2,23,4,7],[3,5,3,-4,2,7,2],[-8,60,5,4,-8,3,9],[6,-3,4,-9,-1,5,-1],[-1,56,9,1,9,5,8],[7,57,9,-1,-2,2,5],[3,-24,4,-7,6,7,-5],[9,6,7,-6,-36,4,-8],[-4,-7,3,5,-7,2,-6]],"100": [[2,6,2,4,10,2,5],[2,9,6,2,2,4,12],[3,3,2,8,11,2,7],[6,18,2,8,2,3,4],[4,2,2,9,48,6,2],[5,7,5,5,13,5,2],[5,7,3,9,7,6,13],[9,25,5,9,5,5,6],[1,8,4,1,14,2,3],[9,47,2,7,7,6,2],[1,40,2,7,5,4,1],[1,5,5,6,38,5,3],[9,15,4,7,1,4,8],[5,71,4,1,7,6,9],[7,46,2,6,1,2,4],[6,40,6,6,6,9,4],[8,9,4,5,45,4,7],[6,65,2,7,9,6,9],[7,5,8,8,2,4,4],[3,8,4,1,8,5,53]],"101": [[2,-16,3,8,-7,3,-1],[-9,6,4,7,-6,4,-11],[-8,-8,4,9,-7,7,-63],[1,2,5,-8,-25,5,-6],[1,-5,3,-4,-2,9,9],[-9,5,5,5,9,5,22],[-8,6,3,-8,3,5,-23],[-9,13,9,-4,-7,9,5],[8,9,5,-5,-28,5,-2],[4,3,4,-5,2,8,25],[6,-9,5,-1,-9,2,7],[6,-9,5,3,7,5,41],[-7,-3,6,5,5,8,-8],[-2,1,7,-6,8,4,20],[-3,7,5,2,6,2,32],[-9,3,2,-9,6,5,9],[2,35,3,-6,7,5,4],[-9,9,5,-4,-8,9,-35],[7,-13,7,6,9,7,-8],[2,1,6,1,-11,4,-2]],"110": [[2,12,7,6,7,2,2],[2,9,8,1,3,4,4],[3,71,9,6,7,4,8],[6,10,2,6,8,7,9],[9,5,8,5,6,4,1],[6,3,4,2,9,7,5],[8,53,6,9,1,3,8],[9,9,4,7,45,6,9],[2,13,7,1,4,3,2],[3,3,3,4,7,2,21],[1,1,5,4,1,6,3],[8,4,5,4,7,2,6],[2,18,7,2,9,3,6],[1,7,4,4,28,3,5],[1,7,3,4,7,2,22],[4,1,9,7,9,7,2],[7,57,9,9,8,2,8],[2,65,8,7,7,4,8],[9,44,4,6,7,3,9],[4,9,7,5,70,9,9]],"111": [[-2,-66,3,-2,5,2,-6],[4,9,7,4,1,2,1],[-6,57,8,-9,4,2,6],[5,4,7,1,37,5,6],[-9,7,2,-1,-6,2,23],[3,52,8,7,9,2,6],[5,-9,5,-1,35,7,6],[8,4,5,-1,9,3,4],[8,-2,2,-1,5,2,21],[7,-36,5,-8,9,6,-3],[-3,7,3,4,-10,2,6],[3,-3,9,2,-9,2,-1],[-8,2,3,-4,-34,5,-7],[3,48,4,3,-9,8,9],[-9,6,7,3,-12,2,-1],[2,-59,2,-5,-3,2,-8],[-7,21,3,9,4,8,8],[-9,32,6,4,-1,9,4],[3,-8,5,-5,-45,4,-8],[-4,-2,6,1,-25,4,-9]]},"advan_7": {"000": [[2,9,3,7,2,22,2],[5,4,7,1,4,14,3],[8,9,9,1,7,2,6],[8,7,7,3,3,8,2],[4,4,3,5,6,5,3],[8,2,6,1,3,9,3],[6,2,8,35,9,3,2],[9,2,3,1,2,5,3],[7,6,5,24,9,7,2],[4,3,4,6,1,36,4],[8,6,3,4,1,11,3],[4,10,9,3,8,1,9],[8,1,2,7,7,39,4],[2,31,6,6,9,4,6],[9,1,7,5,5,8,7],[5,8,3,4,6,23,3],[7,46,2,1,4,6,4],[7,4,3,4,5,70,8],[8,21,3,1,1,3,5],[4,43,9,1,3,1,2]],"001": [[6,4,6,-6,2,-60,6],[-7,-46,5,-2,-8,-7,3],[7,7,6,-7,-6,-9,6],[-7,-3,3,46,5,3,2],[3,-4,3,-2,6,-9,9],[7,-1,4,8,-4,-7,2],[-9,68,9,3,3,-1,9],[4,7,4,4,-4,70,8],[6,9,3,4,9,27,3],[-1,17,9,-8,1,-9,3],[-5,8,4,28,7,3,2],[9,7,2,-29,-4,8,4],[-5,-4,3,-52,9,-8,2],[-1,-9,5,-7,9,6,5],[9,-2,2,59,-8,-3,2],[-9,-43,8,6,9,5,8],[4,-7,2,36,-3,9,2],[-3,2,6,-3,-3,-33,9],[-6,-6,9,-23,7,1,3],[-9,-7,2,-58,8,9,3]],"010": [[8,7,2,9,6,22,2],[4,7,6,5,7,54,9],[9,5,5,1,9,9,4],[4,8,2,1,8,8,2],[2,1,5,3,5,26,8],[4,6,3,9,1,19,2],[7,2,6,1,6,6,4],[5,1,2,6,3,10,2],[1,8,8,5,1,19,3],[4,7,3,9,5,22,2],[9,4,5,2,9,11,4],[4,23,8,2,2,9,2],[1,5,4,3,1,40,9],[6,3,2,9,6,28,3],[6,9,2,1,6,21,3],[6,7,4,3,8,20,4],[3,9,2,8,2,39,3],[5,7,3,3,5,8,2],[1,1,2,6,4,23,4],[6,6,3,2,4,9,3]],"011": [[2,-9,4,9,5,61,9],[-5,9,2,-9,-5,-9,3],[-8,7,8,-3,-3,-8,4],[4,2,6,2,2,5,2],[6,16,3,-2,2,4,2],[-2,-55,8,7,-1,1,3],[1,7,3,-3,1,-1,5],[-4,19,7,1,-2,7,2],[-5,4,9,9,-4,57,6],[2,47,6,-4,2,7,2],[-4,19,2,-8,-4,7,4],[-5,-4,5,-2,-1,-7,2],[6,14,5,-8,3,-9,2],[9,58,5,-8,7,9,3],[3,46,7,-2,2,9,2],[6,-51,5,9,7,-9,7],[-2,66,7,-6,-2,9,3],[-5,-9,3,-6,-2,-28,3],[-6,-8,3,6,-3,8,2],[1,-6,7,5,1,36,9]],"100": [[7,25,5,6,9,9,3],[9,3,6,5,7,29,3],[2,7,2,34,6,4,4],[7,2,2,4,6,44,2],[4,4,2,7,8,13,3],[8,6,3,53,5,3,3],[7,9,4,2,5,14,3],[4,30,9,3,8,5,9],[5,64,5,3,6,1,5],[4,8,2,48,7,2,6],[2,6,6,9,5,28,9],[1,56,7,5,4,4,7],[5,1,5,3,1,12,5],[9,9,7,5,5,60,5],[5,16,4,9,3,1,2],[9,8,5,11,9,9,2],[6,6,9,63,8,5,3],[6,3,8,2,4,5,8],[6,1,5,1,4,44,2],[3,14,3,6,1,2,3]],"101": [[-9,-3,2,50,-9,6,3],[-3,6,4,41,-2,5,7],[6,5,7,7,-8,-72,4],[2,4,2,41,-1,-4,2],[7,-1,4,-1,-1,-35,3],[-4,3,2,-9,-3,-5,4],[5,5,7,29,-3,-6,9],[-4,-2,6,-1,1,-38,6],[-9,-3,4,-27,-2,2,8],[-1,-2,8,-1,6,-18,4],[6,7,6,-35,-7,5,6],[-3,19,5,-6,-7,-3,6],[-9,-1,7,-3,-5,-34,7],[-9,-29,8,-2,-6,-9,6],[-9,25,9,2,5,1,9],[5,69,3,-2,4,2,9],[-9,2,9,-63,7,-5,9],[6,9,9,-9,1,11,3],[-9,-6,3,33,3,1,7],[5,2,3,11,-2,-2,6]],"110": [[7,8,6,5,7,6,3],[9,4,2,22,6,8,2],[5,39,4,6,6,9,2],[7,1,9,8,4,41,6],[2,9,7,4,1,3,2],[5,58,7,3,1,9,2],[8,46,8,4,1,9,2],[8,46,9,4,8,8,2],[1,9,3,8,2,7,2],[4,3,2,4,7,56,8],[4,10,4,8,9,8,2],[5,1,8,7,4,14,2],[5,9,2,9,2,34,3],[8,1,7,7,8,36,4],[2,5,4,2,7,18,2],[8,5,2,7,5,7,3],[5,66,9,1,8,9,2],[5,3,8,5,6,14,4],[9,7,4,6,5,40,6],[4,6,5,2,8,29,7]],"111": [[4,-4,8,-6,-7,-59,9],[-6,4,8,8,-5,44,5],[-3,-9,3,-8,-1,-14,3],[7,1,8,3,9,5,4],[-2,4,9,6,2,56,9],[-4,1,6,8,4,58,8],[-1,25,4,-8,-5,-1,5],[1,-6,3,-4,7,-3,4],[2,-3,4,7,8,36,2],[-3,-6,5,7,-8,5,2],[-8,-5,6,9,2,16,2],[-4,8,2,-8,7,32,3],[-3,-2,7,3,4,6,5],[-4,1,2,24,-7,6,2],[3,2,2,-22,7,-5,2],[-1,3,4,6,-9,20,3],[-5,40,5,6,6,9,2],[-2,-27,8,5,2,2,3],[6,-5,4,5,7,-7,3],[-7,26,8,-9,-3,-3,2]]},"advan_8": {"000": [null],"001": [[3,-32,-4,-4,-2,-2],[-7,4,-1,6,-7,32],[-1,-4,-5,4,-9,-36],[3,-4,-5,-5,6,41],[8,-8,-2,-9,8,60],[5,4,-2,-3,-7,32],[7,-28,-2,-4,3,5],[-2,-35,-5,-7,-8,-1],[-2,8,-2,3,3,20],[7,1,-4,9,1,-6],[7,-39,-5,-2,3,3],[-1,30,-2,-5,6,3],[9,-3,-1,2,-1,19],[1,-26,-3,-8,1,-3],[8,-62,-7,-9,1,6],[2,-2,-1,-3,8,36],[-2,4,-2,-8,9,55],[5,-39,-6,-4,-1,2],[-6,8,-5,-4,-3,22],[-5,57,-9,-4,-1,-1]],"010": [null],"011": [[-9,-9,-1,-4,-1,-3],[-9,-9,-1,6,3,2],[6,43,-9,-1,1,4],[-7,3,-1,6,2,-1],[-9,3,-1,4,4,-3],[-9,-26,-4,-1,-3,-7],[-9,8,-1,4,3,-1],[3,15,-1,-8,1,1],[-3,-10,-2,4,1,2],[8,-60,-7,-2,1,-4],[-3,55,-5,-2,-1,5],[7,62,-2,-5,1,6],[6,-67,-2,-6,1,-5],[-4,-6,-1,-7,-1,-2],[-6,-18,-4,-1,-3,-4],[-3,-43,-5,2,1,4],[-2,71,-1,-7,1,9],[6,70,-1,-7,2,9],[9,-29,-7,2,-1,2],[-5,-2,-1,2,5,5]],"100": [null],"101": [[8,8,-2,7,6,6],[-4,-36,-3,5,-1,-9],[1,-4,-5,-6,2,51],[-1,-9,-5,-3,9,-55],[-1,-7,-9,-8,5,35],[1,-6,-5,-4,1,70],[-1,-41,-3,2,4,3],[9,1,-5,7,2,9],[7,-4,-5,-5,6,17],[8,24,-7,6,1,3],[6,6,-5,-2,2,72],[-8,-56,-2,3,1,8],[-6,-54,-6,-4,-1,3],[-2,-20,-8,-1,5,8],[2,24,-8,-1,7,3],[-1,70,-9,-2,-3,-2],[-6,12,-2,6,-2,-1],[7,-6,-8,3,8,50],[-1,-6,-6,-7,2,12],[-3,45,-1,-1,-5,5]],"110": [null],"111": [[-6,3,-1,-4,-4,21],[-7,-14,-7,9,-1,-1],[-7,8,-9,-3,3,1],[-9,-4,-1,3,5,33],[3,-33,-4,-3,-8,1],[2,40,-2,6,4,-5],[4,5,-1,2,2,44],[7,6,-1,-2,-4,-46],[-8,11,-8,2,2,5],[9,-3,-2,-1,-2,-43],[3,-5,-1,2,2,51],[-7,-35,-4,5,5,4],[9,1,-9,-8,1,-1],[4,51,-5,-9,-2,3],[-9,1,-3,7,-1,-4],[-4,-65,-9,-9,1,-1],[2,-7,-2,-1,-1,-42],[2,-44,-1,-7,-8,-3],[-2,-7,-1,-1,-7,37],[-1,-1,-5,3,4,-3]]},"advan_9": {"000": [[5,7,9,2,7,23],[8,33,7,4,5,5],[8,7,9,9,3,49],[5,8,7,2,3,2],[7,23,5,2,5,3],[5,1,3,7,8,5],[4,7,7,9,1,61],[5,31,6,7,7,1],[3,8,5,1,3,3],[4,8,7,4,5,2],[8,60,5,7,8,9],[3,9,5,3,4,5],[5,4,6,1,4,5],[1,35,3,3,6,1],[6,9,9,3,6,8],[3,22,7,4,4,7],[3,2,2,8,6,29],[7,40,3,2,8,6],[6,2,4,6,1,46],[9,50,5,1,2,6]],"001": [[-1,3,3,-3,-4,1],[7,-25,8,2,2,-4],[9,-2,7,9,9,-8],[-9,-23,4,-1,-3,-4],[-2,57,9,5,5,7],[5,3,9,-8,-7,3],[7,-32,4,-1,6,-8],[-3,43,4,-5,-2,-8],[8,-23,9,-7,-7,-7],[-9,-62,2,5,7,-5],[-1,-30,8,-3,-2,3],[3,19,2,-2,2,2],[-3,-13,7,-1,-1,2],[-3,-2,2,1,7,59],[-5,6,7,1,-6,26],[1,-9,5,-1,8,7],[7,14,5,6,9,-2],[8,7,9,-4,5,-56],[7,-6,5,-8,-8,-11],[-5,4,3,3,-8,-64]],"010": [[5,19,5,1,3,4],[8,5,7,5,7,1],[5,60,9,1,1,7],[1,3,8,5,4,1],[3,4,4,1,3,3],[2,5,2,9,7,5],[9,45,5,2,3,8],[5,7,2,2,3,7],[4,68,9,4,5,8],[5,34,7,8,8,4],[4,49,5,2,1,9],[8,5,7,5,7,1],[3,45,7,7,7,7],[9,56,7,3,3,7],[3,4,7,4,5,1],[8,26,6,4,6,4],[1,17,9,2,3,2],[9,56,8,5,5,6],[7,17,9,9,9,2],[3,66,8,6,6,8]],"011": [[-7,-29,7,9,7,-3],[-4,49,6,2,1,9],[9,8,9,4,6,1],[3,12,7,-9,-8,3],[-5,28,6,-2,-2,6],[-4,55,7,2,1,9],[-8,7,8,-7,-9,2],[-5,29,4,8,5,7],[-8,-44,5,9,8,-9],[2,4,2,-5,-7,4],[4,-16,5,-3,-4,-4],[7,16,5,9,9,5],[5,-10,7,-3,-1,-1],[1,54,9,-8,-7,7],[-1,-49,9,6,5,-5],[-2,-4,9,6,5,-1],[-1,-24,7,9,8,-4],[-5,-7,3,-2,-6,-1],[3,42,5,7,8,7],[-2,38,8,6,5,5]],"100": [[7,12,5,7,9,9],[9,15,6,8,9,1],[9,1,5,9,3,8],[5,61,6,7,7,6],[7,5,6,3,6,32],[8,62,6,1,3,7],[2,58,7,9,9,8],[7,69,6,6,7,9],[7,43,4,6,1,4],[3,62,8,1,1,1],[9,4,4,4,7,43],[6,7,5,2,2,29],[8,69,7,1,6,6],[3,3,5,3,4,27],[1,17,4,1,2,5],[4,5,9,9,7,3],[8,5,5,8,8,49],[8,23,5,2,4,7],[4,5,7,5,6,32],[5,5,9,7,9,54]],"101": [[2,4,2,-4,-6,-49],[-8,48,8,-5,-8,-8],[4,66,3,7,9,-4],[-7,42,2,-9,-4,4],[-7,2,4,2,2,-38],[5,3,9,-7,-7,22],[-2,-31,3,7,6,3],[3,-3,9,6,6,-19],[8,30,9,2,3,6],[6,-9,3,-7,-8,-12],[-1,-67,5,-3,-3,-9],[5,-4,8,9,4,22],[-9,13,4,-5,-9,-2],[-4,-1,9,3,1,-25],[-5,-6,6,-4,5,58],[-2,-8,5,-3,-2,-10],[-7,5,4,-5,-7,3],[-9,-30,5,1,-1,4],[6,15,7,5,6,-7],[-3,3,2,-7,-2,-5]],"110": [[2,1,2,5,1,48],[7,4,6,4,7,14],[4,33,8,5,8,5],[3,41,4,6,8,8],[9,2,8,7,7,3],[9,48,5,8,9,5],[5,15,2,6,3,6],[5,1,3,5,8,33],[9,5,2,4,2,33],[1,7,5,1,5,21],[6,25,2,9,3,3],[8,8,4,8,7,25],[3,69,9,3,6,2],[9,18,9,2,8,1],[7,8,6,4,4,10],[7,8,5,3,4,21],[5,66,9,3,7,9],[4,36,4,4,8,4],[6,5,3,5,9,26],[8,4,5,4,2,11]],"111": [[-1,-3,2,3,-7,41],[3,-54,5,9,1,-8],[-6,-3,2,9,9,-35],[5,-6,3,-8,-1,-30],[2,-16,2,-3,6,4],[7,9,8,-6,-4,7],[-8,6,5,3,6,14],[-5,-4,4,1,3,-22],[7,23,5,7,3,8],[-1,-8,5,-5,8,15],[-6,50,2,-2,-9,-6],[-6,-25,3,7,-5,-7],[-8,-3,3,4,-8,7],[-1,26,5,6,-2,-9],[5,-27,7,8,4,-4],[-6,7,2,-5,6,-42],[-1,-3,4,2,5,4],[-4,25,4,8,9,-3],[8,2,4,2,3,-21],[-8,4,3,8,4,7]]},"advan_10": {"000": [[8,4,4,14,6,9,3,6],[9,4,5,5,9,4,2,2],[5,4,4,4,3,7,3,55],[3,7,9,4,7,5,2,5],[4,8,3,3,7,6,4,4],[1,2,1,2,5,4,9,61],[1,6,5,8,1,9,7,8],[3,8,7,5,3,5,4,2],[9,8,6,23,9,8,2,3],[1,2,1,54,7,4,6,4],[1,8,3,22,4,8,2,3],[8,2,5,25,9,2,8,8],[1,6,3,8,3,9,7,37],[4,3,4,8,9,2,3,6],[4,3,2,3,6,3,8,22],[6,2,9,9,4,8,2,2],[6,4,9,57,4,7,8,9],[5,7,6,7,2,4,7,21],[4,2,1,3,1,8,5,26],[2,5,2,8,5,3,5,20]],"001": [[-1,6,-7,-55,5,4,3,-3],[7,6,-4,-18,-4,8,4,-6],[-1,5,7,-6,-4,6,-9,-24],[8,2,-4,47,-8,2,-6,-7],[3,4,7,4,6,4,2,-7],[-6,9,2,-2,2,7,3,20],[5,4,-9,48,3,5,-6,-2],[3,9,4,50,-5,2,2,6],[9,6,2,-9,-7,8,-2,4],[-1,6,9,-15,-1,7,-5,-2],[3,9,1,3,3,4,7,-38],[-4,9,-7,-5,1,8,4,-24],[-3,4,-3,21,7,5,-1,7],[2,9,-1,70,4,5,-9,2],[-9,2,1,23,-6,2,7,7],[-8,6,6,-50,-5,3,-3,-1],[8,4,9,45,-1,2,1,5],[6,7,-1,-3,-9,4,-7,-21],[-4,2,-6,72,8,6,-7,4],[-8,2,2,9,1,6,-4,4]],"010": [[1,3,3,68,5,2,1,9],[5,9,5,48,9,3,1,9],[1,8,3,24,4,9,1,7],[1,3,1,29,4,3,1,7],[1,2,8,30,7,3,2,6],[6,3,1,7,1,5,8,69],[1,2,1,13,5,4,1,5],[1,2,1,19,8,7,1,8],[9,4,1,9,3,9,6,61],[8,2,1,4,3,4,6,21],[5,2,2,9,6,9,7,34],[1,4,8,38,4,3,1,7],[3,4,4,25,8,3,1,7],[2,4,2,2,1,4,6,3],[1,8,4,31,4,7,1,7],[7,4,1,4,1,5,7,33],[2,4,2,8,1,5,3,21],[1,4,4,37,5,3,1,6],[5,2,2,5,3,5,9,21],[5,8,1,1,1,5,2,4]],"011": [[-1,7,6,17,-4,5,1,3],[1,2,8,-13,-7,5,-3,4],[5,2,2,-2,4,5,7,-6],[-6,3,2,3,7,3,-2,-3],[6,5,-2,9,-7,9,3,-14],[7,4,-2,-5,9,2,-1,-2],[1,8,-5,25,-2,5,2,-8],[-9,5,-4,-7,4,3,5,9],[-7,5,4,-1,5,7,-8,2],[-2,4,6,-1,-2,5,8,-2],[-1,3,9,-5,-2,3,3,-3],[6,4,2,-8,-1,3,-7,37],[1,9,5,-53,-3,4,-1,8],[-1,7,6,4,-3,5,1,1],[1,2,9,-29,-5,2,-1,6],[7,9,3,-23,-9,4,-1,8],[-3,7,-9,4,-2,4,-8,3],[-8,7,2,1,-5,4,2,1],[2,5,8,6,-9,8,-3,-2],[-3,6,-3,-9,-1,7,-9,-31]],"100": [[7,6,6,54,6,4,4,4],[2,5,7,7,1,2,6,32],[6,8,2,22,7,2,1,3],[4,7,6,7,1,4,8,16],[6,3,7,2,3,6,9,65],[4,2,3,2,5,6,6,48],[1,6,2,66,4,7,1,3],[4,3,9,16,6,9,9,5],[3,8,3,48,4,3,1,6],[9,2,2,8,2,9,2,8],[5,4,7,6,5,7,9,30],[7,8,5,3,7,3,3,72],[5,9,4,48,9,3,1,5],[4,9,8,35,7,6,2,6],[5,6,4,34,5,6,5,4],[7,6,7,45,4,9,8,4],[2,7,8,3,4,8,4,36],[3,6,7,7,7,5,3,22],[5,6,3,46,2,9,9,6],[6,2,3,1,7,3,8,22]],"101": [[2,3,2,6,-8,4,-6,62],[-2,8,2,-4,9,3,1,19],[-6,3,6,8,-5,7,5,46],[3,8,3,34,-3,8,-5,-6],[-9,5,-9,8,9,5,-6,-8],[-2,6,7,-7,2,7,-9,49],[-2,8,9,-49,4,6,-3,3],[-6,9,-6,4,2,6,9,43],[-3,6,-6,3,-6,8,2,68],[-7,2,1,9,3,6,-6,-65],[-5,7,9,-52,-2,8,-3,-5],[-1,9,-4,7,-9,4,-1,18],[-7,8,3,-72,-1,9,6,-3],[-4,7,2,-3,-9,6,1,-24],[-3,7,6,7,1,5,-3,-15],[-8,4,3,-45,-2,9,-9,-9],[-4,9,1,-6,-2,4,1,-9],[1,7,4,-60,-8,9,5,4],[7,9,2,7,-1,4,-6,-18],[-2,3,1,-12,2,5,-4,-1]],"110": [[2,4,9,22,9,3,4,1],[1,8,3,63,4,5,3,7],[6,2,1,6,1,3,3,27],[7,4,4,4,1,2,1,7],[1,2,3,28,8,2,3,4],[6,5,6,14,8,2,1,3],[2,6,6,14,5,3,4,3],[2,5,9,32,8,2,2,2],[3,4,8,5,8,2,2,3],[2,6,5,51,8,2,2,5],[2,7,5,7,3,5,2,8],[2,8,6,42,9,8,2,9],[2,7,2,31,4,2,2,4],[2,9,1,10,1,6,9,7],[2,8,8,21,4,8,6,9],[4,3,4,15,8,5,1,9],[1,9,9,21,4,7,4,3],[1,5,1,29,2,5,2,5],[8,6,3,8,2,5,6,19],[8,7,4,8,6,4,5,7]],"111": [[5,6,-8,2,-8,4,3,-1],[9,2,-5,2,2,3,-9,-5],[-2,5,9,-2,-6,3,4,-1],[-1,6,-5,70,7,3,2,-3],[6,8,3,-33,-8,3,-1,9],[-2,5,-2,38,-4,3,3,9],[1,3,2,3,1,5,8,37],[5,6,-8,-7,-3,4,5,9],[5,2,-1,-4,-3,5,-6,29],[-1,4,-2,-25,-3,2,-6,-1],[1,2,-4,-4,1,3,7,-55],[9,8,3,2,-3,2,1,2],[3,6,1,9,-2,7,3,-23],[-9,6,-5,-8,3,2,8,9],[4,3,5,-4,-3,9,-9,22],[5,2,2,5,-1,2,6,-22],[-1,8,1,47,-4,3,3,6],[5,4,-6,-9,2,3,-2,-27],[6,3,2,-4,1,8,6,-44],[-3,5,2,-29,9,2,-1,6]]},"advan_11": {"000": [[7,3,6,5,5,10],[3,5,9,8,5,4],[3,8,1,5,2,4],[6,9,8,4,2,10],[6,8,3,3,7,6],[3,3,17,8,5,6],[2,4,45,7,2,9],[2,7,40,9,7,8],[2,2,28,9,3,6],[3,4,7,9,6,3],[9,7,8,2,7,32],[2,8,38,6,2,9],[2,4,31,6,4,9],[8,8,9,2,8,39],[2,8,3,4,8,2],[2,7,9,5,7,3],[7,5,7,8,5,6],[9,3,7,5,5,11],[2,4,39,9,2,6],[2,9,23,4,3,9]],"001": [[7,-7,-6,9,3,-6],[2,3,-37,7,-6,-9],[8,-4,5,-1,-4,-58],[-1,-7,7,-5,5,3],[-1,-3,9,8,6,-1],[9,9,-4,-1,-2,40],[-3,6,31,-8,2,9],[-2,6,-5,-9,-9,-2],[2,2,-25,8,4,-7],[-1,2,62,-7,2,8],[5,-5,9,-1,-4,-55],[-9,-2,8,-2,4,56],[-4,7,-8,-1,-7,-37],[-9,-3,-7,-1,6,-63],[-2,3,3,4,3,-5],[-1,-9,61,-5,3,9],[9,3,-3,-6,4,9],[8,3,7,-1,3,-44],[7,9,6,-1,9,-34],[-6,6,8,-1,-2,36]],"010": [[8,3,8,3,2,21],[7,2,1,4,2,2],[5,2,2,2,2,6],[7,2,3,4,2,5],[7,2,1,4,2,2],[2,2,25,7,3,7],[4,3,6,5,2,5],[7,4,9,2,2,32],[5,2,8,2,2,21],[3,2,5,8,3,2],[3,2,13,8,3,5],[5,2,11,9,2,6],[5,3,1,2,2,3],[5,3,9,2,2,22],[5,3,4,3,3,7],[2,2,25,7,3,7],[8,3,1,7,2,1],[6,2,8,7,3,7],[5,2,5,2,2,12],[7,2,2,3,2,5]],"011": [[-3,2,-5,7,-3,2],[4,-3,-8,-1,2,33],[-1,-2,-6,-4,-2,-2],[-7,-4,7,2,2,-25],[-6,3,9,-1,2,55],[5,-2,-4,2,-2,-9],[-4,3,-6,-1,2,-23],[-1,2,27,-4,3,7],[-4,-3,-9,-1,-2,-35],[7,-2,7,-4,2,-12],[-7,-3,-7,-2,-2,-25],[-5,-2,4,-3,-3,7],[2,-3,-1,-1,-2,3],[-2,-2,21,-5,-2,8],[-7,-3,3,-5,-3,4],[4,-2,-6,-5,4,5],[2,3,-8,3,2,-5],[-1,-2,11,-3,2,4],[-6,-3,9,-1,-2,55],[7,2,-3,-4,-2,5]],"100": [[3,8,9,3,2,45],[4,4,5,4,8,7],[9,4,1,2,5,60],[7,5,6,4,2,24],[7,9,4,9,6,6],[9,8,36,8,2,6],[5,3,7,5,6,3],[7,2,19,8,8,6],[8,4,7,2,2,57],[3,8,38,7,2,2],[6,9,18,5,3,9],[4,7,2,6,2,41],[8,4,4,3,3,7],[5,4,18,4,9,8],[5,7,7,8,2,36],[2,6,4,3,7,4],[7,2,1,4,3,31],[6,8,7,7,7,8],[7,4,5,6,4,6],[9,7,6,2,4,49]],"101": [[2,-6,2,6,4,-25],[-4,-3,29,-8,9,2],[4,3,-6,-4,-5,6],[-2,3,5,-9,-9,5],[-8,-6,-47,-6,2,-2],[-7,8,7,-6,-4,43],[-4,4,-7,-3,2,-10],[-9,3,29,3,9,3],[3,3,-2,-1,-5,-22],[-9,-6,18,2,-4,-2],[2,-2,-59,7,5,2],[-8,-2,-3,-2,-4,23],[-7,3,9,-5,6,30],[-9,-3,6,7,-2,-30],[-9,8,33,-8,-2,-9],[-3,-5,3,-7,5,-5],[3,7,1,2,-4,-5],[-4,-4,-8,8,4,10],[-2,-6,7,2,-3,-11],[-2,-6,-4,2,-2,-62]],"110": [[2,2,4,4,7,1],[8,4,3,7,2,4],[3,8,13,9,2,4],[2,5,10,9,8,2],[8,2,8,3,5,21],[6,9,11,8,2,8],[2,7,38,8,3,9],[3,8,8,6,2,5],[3,5,20,8,3,7],[2,2,52,9,2,9],[3,8,8,9,4,3],[2,8,24,7,2,7],[9,3,3,2,2,21],[5,3,9,2,5,22],[2,2,31,8,5,8],[8,9,8,2,5,31],[2,2,32,5,2,9],[2,8,39,8,2,9],[4,6,6,7,5,3],[9,7,5,2,5,22]],"111": [[8,-7,-6,-2,-3,23],[-5,-6,-2,7,5,1],[-3,5,-18,6,-2,8],[2,4,24,-5,2,-8],[3,-6,-8,-1,-6,23],[9,-4,7,-1,5,-60],[-6,3,5,-1,-2,38],[-6,-2,7,-2,-5,22],[5,7,6,-6,-2,-6],[6,2,9,-6,3,-10],[8,2,-7,-1,5,60],[2,-9,-1,-3,-9,1],[-7,2,-9,-3,3,-25],[7,9,7,-9,2,-6],[2,-2,-14,-8,3,5],[-4,-7,-12,7,-6,7],[6,-8,-6,-1,6,38],[-1,-5,-49,9,2,6],[-1,2,68,7,2,-7],[4,3,-8,-2,2,21]]},"advan_12": {"000": [[4,2,17,9,2,1,7,4,9],[2,1,42,5,4,3,3,3,7],[5,5,5,7,6,66,9,1,9],[8,2,3,8,6,1,5,2,28],[5,4,8,6,6,36,8,3,4],[4,2,72,6,9,7,3,9,5],[5,6,3,7,7,59,2,4,1],[6,9,26,2,8,6,9,6,8],[5,5,9,9,7,1,9,5,49],[3,6,31,8,6,3,7,7,7],[9,2,9,3,4,5,6,8,1],[4,6,1,6,9,14,2,3,8],[2,1,3,6,2,14,2,1,3],[8,8,1,2,5,6,9,8,4],[3,4,2,3,3,59,8,6,6],[9,3,1,6,6,38,4,8,5],[9,8,7,5,3,1,8,4,36],[8,2,5,6,8,25,9,9,6],[6,1,20,9,9,2,6,6,6],[2,5,47,7,1,3,4,1,6]],"001": [[-4,1,-4,2,6,7,6,-9,-26],[-2,5,13,9,-8,-3,7,-9,6],[-2,-5,-8,-7,-7,20,-3,5,-8],[-5,-7,-9,8,-2,-15,7,2,-5],[-3,6,24,-7,1,6,8,5,2],[6,-4,-18,4,-4,3,6,1,7],[4,-1,-7,-4,1,-1,4,-4,10],[8,-3,-31,8,-1,7,5,-1,-6],[-6,2,-5,9,-3,-7,4,4,-22],[-5,-5,-7,-4,-3,-68,6,-2,-6],[8,5,-33,-7,2,-2,-2,8,-1],[-1,4,2,-9,-1,-14,-3,5,-8],[5,-6,-1,2,3,9,-1,7,4],[-8,-6,9,-3,5,-5,3,-9,21],[5,-4,2,-2,-5,10,-4,2,7],[-5,-1,-36,6,-4,5,-1,-5,6],[-1,-3,52,-7,-1,8,-4,-7,-9],[-7,-9,-8,-4,8,-4,-2,-2,45],[-2,-8,5,-5,-4,-2,6,4,6],[-5,-8,-6,3,-7,-50,-2,2,-9]],"010": [[2,2,1,4,4,6,7,2,3],[2,5,29,5,3,1,8,2,8],[2,4,37,3,3,1,8,1,9],[8,2,9,2,7,5,4,6,21],[2,1,2,9,1,6,3,5,19],[6,1,2,5,3,4,8,3,3],[5,4,1,2,2,22,7,3,8],[9,1,4,8,1,9,2,4,56],[4,1,8,5,3,3,9,3,6],[6,4,2,7,3,8,6,8,10],[7,1,4,4,9,5,8,6,5],[8,2,6,7,8,7,8,8,12],[2,8,36,3,3,3,9,2,8],[2,9,2,2,7,35,9,4,8],[5,1,7,6,4,6,8,3,8],[3,5,9,8,3,3,9,5,6],[7,1,7,9,2,5,3,6,33],[2,8,30,2,5,1,7,5,8],[6,1,2,3,9,1,3,8,4],[5,1,6,4,4,6,2,6,24]],"011": [[4,-8,4,-1,5,-59,-8,4,-9],[-2,6,3,-1,-4,-44,7,-2,5],[-1,-9,-35,-3,4,-3,6,-1,6],[-2,4,6,9,-1,8,2,-7,32],[8,4,6,9,-4,-7,3,1,-3],[-2,-1,-7,-1,3,57,7,-1,-6],[-1,8,-10,-4,-9,2,-7,-5,-1],[-7,-3,-2,-3,8,32,-9,1,9],[-3,-4,19,4,2,3,-8,-3,6],[-5,-1,-7,-7,4,-8,2,-7,47],[3,-7,-3,3,5,-1,5,-2,-3],[-1,1,2,-7,-1,8,-1,-3,60],[-6,5,-7,-6,-2,-4,-1,9,-65],[-7,-6,-3,2,7,-7,6,8,1],[-2,-4,6,-2,9,-49,-9,2,-9],[-1,7,66,-5,-4,-7,-4,-5,8],[5,6,1,-4,9,14,6,-2,-9],[-5,-5,13,5,-3,7,-4,-1,7],[4,4,-1,-1,-7,-31,9,2,2],[-1,4,35,-1,-6,-2,7,1,-6]],"100": [[4,6,6,6,1,69,7,3,6],[3,6,1,2,7,7,9,1,30],[5,4,52,6,2,3,6,9,6],[2,4,9,7,1,48,7,5,2],[7,8,8,4,4,10,8,8,2],[5,5,6,4,2,3,6,6,8],[5,3,9,7,2,8,4,5,23],[7,9,8,3,2,9,2,1,8],[3,3,44,4,9,3,3,6,3],[2,3,4,8,3,2,9,2,24],[7,8,13,6,4,6,7,9,6],[3,2,3,7,1,12,2,5,9],[2,7,7,2,2,13,2,8,3],[9,8,8,8,4,8,8,4,53],[3,3,1,2,8,3,4,6,26],[8,9,9,8,1,24,6,9,5],[9,3,61,8,8,8,9,9,7],[9,1,1,2,3,57,7,7,3],[6,6,3,4,1,3,6,5,5],[2,3,1,5,9,50,3,4,6]],"101": [[6,1,-18,4,-1,-7,-9,2,4],[-2,-4,-3,8,7,9,3,9,-11],[2,-9,2,-2,-1,-24,-3,5,2],[2,-9,45,3,-9,-9,-8,6,-9],[-1,-1,1,3,-2,-71,9,-1,6],[-1,-8,-14,7,-9,8,-3,-4,-1],[5,-9,54,2,-1,-2,4,-2,8],[-7,-1,-71,-1,-2,8,-2,-9,-6],[-5,9,-7,3,7,-5,-4,7,15],[-9,6,-10,-9,7,-4,-3,-2,-1],[-5,-5,-9,-3,-4,1,-6,-6,-8],[-1,5,7,3,-6,2,-3,9,-1],[-4,3,3,-9,2,7,-7,5,10],[3,-9,4,4,-8,-5,-8,8,6],[8,-4,3,6,3,-1,3,-5,1],[7,-3,6,-4,-6,-9,6,9,-21],[9,-3,67,2,-6,-3,-9,-1,3],[-9,-9,-15,7,-7,3,9,4,-4],[9,6,-7,-7,4,13,-4,-5,7],[-2,9,-11,6,9,7,-4,6,-1]],"110": [[5,8,6,7,6,1,2,3,63],[6,3,3,3,3,41,6,6,8],[5,8,28,6,2,2,8,1,7],[3,7,3,2,1,46,6,7,7],[2,2,64,6,5,2,9,9,8],[6,3,3,2,6,6,5,3,7],[4,2,6,9,6,3,2,5,55],[4,9,9,2,9,5,8,5,16],[6,4,3,2,8,56,6,4,7],[2,5,59,8,8,2,9,7,7],[2,7,61,3,9,8,8,2,8],[3,1,4,3,5,40,7,5,5],[6,7,5,3,7,13,8,2,8],[4,8,8,2,4,8,3,9,40],[7,9,6,9,5,3,2,6,37],[8,7,9,3,9,2,3,4,16],[2,4,5,2,4,57,9,8,7],[8,6,5,3,8,3,3,5,29],[3,2,2,7,8,3,6,3,20],[2,5,64,5,4,2,9,1,5]],"111": [[-6,2,2,-2,2,3,-7,4,8],[5,9,23,-9,4,2,3,4,3],[5,4,9,-5,-5,3,3,-9,31],[8,4,-7,-7,7,8,-8,-9,9],[9,-8,4,-1,4,-56,4,4,3],[8,-1,2,8,5,-16,-9,6,2],[2,-3,-42,7,9,9,9,-4,-9],[-4,-8,8,4,-3,-6,-7,4,22],[-3,1,-4,3,6,-4,5,-9,-3],[-6,6,-8,5,7,6,-3,8,-45],[2,-2,-4,7,2,-6,2,-6,-55],[2,8,-57,-6,-7,2,8,5,-7],[2,-8,-66,-4,-7,3,6,7,-8],[9,2,17,6,-7,-8,5,-2,8],[-4,-3,9,-1,-9,8,6,-7,-22],[-2,5,-5,4,-9,4,-2,2,-60],[2,-7,72,-8,8,9,-6,-1,-5],[-2,5,6,3,3,-2,-1,-8,65],[8,-4,-2,-7,2,-8,-2,-3,-60],[6,-8,1,-1,7,8,-2,9,-48]]},"advan_13": {"000": [[5,8,62,5,4,2,7,5],[4,5,14,5,2,5,8,4],[4,6,45,9,8,2,5,3],[9,7,7,8,4,6,7,8],[8,6,2,7,1,7,66,6],[8,6,45,9,3,4,3,2],[8,3,9,7,5,7,65,5],[9,3,1,6,7,9,1,6],[7,3,64,3,1,9,4,3],[1,7,1,6,7,2,71,3],[6,8,8,6,1,6,29,6],[4,6,2,9,1,2,11,9],[4,9,6,9,2,9,6,3],[8,5,4,3,8,3,4,3],[4,6,60,9,1,7,9,3],[9,4,19,4,6,7,4,7],[6,3,1,3,7,5,30,9],[9,6,2,7,1,5,2,7],[6,2,62,6,2,9,4,2],[4,3,8,5,6,2,8,5]],"001": [[4,5,5,2,-6,6,69,6],[-7,5,5,8,7,5,5,8],[9,3,2,8,4,7,1,4],[9,3,-3,3,-8,7,-9,9],[-5,3,6,3,5,7,-44,3],[-7,3,4,2,2,8,12,6],[-6,2,-26,4,-7,2,-8,2],[7,2,-62,4,-7,8,4,2],[-3,7,-23,7,6,2,1,7],[8,4,4,3,8,7,66,9],[-3,3,-44,8,-6,4,-9,9],[-1,7,9,4,-3,8,31,8],[6,5,5,3,-6,7,5,3],[-1,9,-7,5,-6,5,42,5],[-2,9,-57,3,-9,3,-7,3],[6,2,7,3,-7,8,21,9],[1,9,6,9,5,9,34,9],[-8,4,22,8,-4,6,-5,4],[-2,9,-24,9,-1,4,-8,3],[9,2,6,4,-4,7,9,6]],"010": [null],"011": [null],"100": [[8,2,3,4,9,6,33,4],[4,6,1,7,7,4,1,7],[7,9,45,3,1,3,3,9],[7,4,1,7,8,7,30,6],[3,6,1,6,2,6,46,4],[5,4,5,4,3,2,35,5],[2,6,9,8,1,7,41,8],[5,9,3,7,1,3,31,7],[2,3,1,6,8,2,27,2],[4,7,4,5,5,2,4,5],[6,8,2,8,2,5,18,9],[6,3,59,3,3,8,1,6],[4,8,30,3,3,2,4,2],[3,9,8,6,2,7,3,9],[6,5,8,3,2,4,24,9],[9,3,6,2,7,8,27,9],[2,9,5,6,8,9,69,6],[7,6,13,4,4,2,6,8],[5,4,3,5,5,3,28,5],[1,4,6,2,9,5,9,3]],"101": [[-2,5,1,9,-2,7,-35,9],[2,3,-9,3,-4,8,-4,6],[1,7,36,7,-6,2,-8,7],[5,6,38,8,-5,4,-3,2],[3,5,-7,3,3,2,-21,9],[-5,8,-8,8,-1,8,68,8],[-1,2,-34,8,-2,6,-7,4],[7,4,6,5,-7,5,6,5],[-2,3,-4,9,1,7,-55,9],[-8,8,3,4,-6,3,22,8],[1,9,9,4,-5,8,-33,3],[2,7,5,2,-5,7,27,6],[1,8,-21,7,2,8,-1,8],[6,7,-8,5,3,2,-53,5],[-6,2,1,4,4,7,2,8],[1,2,-25,9,-5,2,2,9],[8,7,43,3,-5,6,1,2],[1,2,-6,5,-6,6,54,5],[-5,3,-4,6,5,3,-24,6],[-3,4,-48,4,-6,5,9,6]],"110": [[5,3,9,2,9,5,42,9],[3,7,21,8,4,9,8,3],[6,4,4,2,3,4,4,3],[9,6,7,3,5,3,22,9],[2,8,38,9,1,3,8,2],[1,6,9,2,1,7,40,9],[7,5,29,8,4,3,8,2],[4,6,8,3,3,5,5,2],[6,7,9,2,2,3,24,5],[8,6,8,2,7,5,37,9],[8,5,5,2,3,4,6,2],[1,2,7,8,1,3,8,9],[1,4,6,2,3,5,22,7],[4,5,7,2,8,9,8,2],[2,4,3,5,5,6,1,2],[3,2,8,2,9,4,37,8],[6,7,7,2,8,9,31,9],[4,2,8,2,9,5,22,6],[6,4,9,3,7,2,8,2],[9,7,8,3,9,6,6,2]],"111": [[9,8,-3,3,5,3,-3,2],[7,5,22,7,7,4,6,2],[4,5,-7,2,5,7,-24,7],[-6,4,-1,6,-7,4,-1,3],[-7,3,7,8,-9,4,5,6],[-2,3,5,2,-3,5,7,4],[-3,4,-4,2,-2,2,-19,8],[-1,2,-5,9,-2,2,-2,5],[7,5,6,2,8,5,26,9],[-2,4,-11,4,-6,9,-8,3],[2,3,4,9,3,5,1,3],[1,2,-26,6,4,7,-9,2],[-8,2,-12,4,-9,2,-4,3],[8,7,-7,8,9,8,-8,9],[2,4,3,2,7,2,8,2],[-5,2,-31,7,-8,3,-9,2],[6,5,7,3,4,3,23,9],[2,8,1,2,1,7,2,5],[9,8,7,6,4,3,4,3],[7,2,47,9,9,2,9,2]]}}
    `);

    // pick either integers or fractions if both was selected
    if (solution_form === 'both') solution_form = H.randFromList(['integers','fractions']);

    // pick a random template from begin, inter, or advan if "All" of a category was selected
    if (lin_eq_equation_form === 'all_begin') lin_eq_equation_form = H.randFromList(['begin_1', 'begin_2', 'begin_3', 'begin_4', 'begin_5', 'begin_6', 'begin_7', 'begin_8', 'begin_9', 'begin_10', 'begin_11', 'begin_12', 'begin_13']);
    else if (lin_eq_equation_form === 'all_inter') lin_eq_equation_form = H.randFromList(['inter_1', 'inter_2', 'inter_3', 'inter_4', 'inter_5', 'inter_6', 'inter_7', 'inter_8', 'inter_9', 'inter_10', 'inter_11', 'inter_12', 'inter_13', 'inter_14', 'inter_15', 'inter_16']);
    else if (lin_eq_equation_form === 'all_advan') lin_eq_equation_form = H.randFromList(['advan_1', 'advan_2', 'advan_3', 'advan_4', 'advan_5', 'advan_6', 'advan_7', 'advan_8', 'advan_9', 'advan_10', 'advan_11', 'advan_12', 'advan_13']);
    
    // final checks/changes with the settings for edge cases and conflicts (comment out up until 'let solution_size' for json generation)
    // force integers on EQs that can't have fractional sols like x+a=b
    if (equations[lin_eq_equation_form].no_fractions) { 
        solution_form = 'integers';
        settings.solution_form = 'integers';
    }

    // specific edge case in inter_15
    if (
        lin_eq_equation_form === 'inter_15' &&
        solution_size_range === 'single_digit' &&
        solution_form === 'fractions' &&
        force_positive_coefs === 'yes' 
    ) {
        solution_size_range = 'multi_digit';
        settings.solution_size_range = 'multi_digit';
    }

    // specific edge case in advan_8
    if (lin_eq_equation_form === 'advan_8') {
        force_positive_coefs = 'no';
        settings.force_positive_coefs = 'no';
    }

    // specific edge case in advan_13
    if (
        lin_eq_equation_form === 'advan_13' &&
        solution_form === 'fractions'
    ) {
        solution_size_range = 'multi_digit';
        settings.solution_size_range = 'multi_digit';
    }


    let solution_size; // the (+-) size of integer solutions OR the numer and denom of fractional solutions
    if (solution_size_range === 'single_digit') {
        solution_size = 9;
    }
    else if (solution_size_range === 'multi_digit') {
        solution_size = 99;
    }

    // create different functions to verify the solution and to process the sol object for fractions and integers
    let solutionIsValid;
    let processSolObj;
    if (solution_form === 'integers') { // Note: 'solution_obj' below is {raw_value, numer, denom}
        solutionIsValid = function(solution_obj) { // ensure the sol is between (+ or -) solution_size AND sol is an int
            let raw_sol_value = solution_obj.raw_value;
            
            return (
                (raw_sol_value | 0) === raw_sol_value &&
                raw_sol_value <= solution_size &&
                raw_sol_value >= (-1)*solution_size
            );
        }

        processSolObj = function(solution_obj) {
            return solution_obj.raw_value;
        }
    }
    else if (solution_form === 'fractions') {
        solutionIsValid = function(solution_obj) { // ensure the numer and denom are within (+ or -) solution_size AND sol is NOT an int
            let raw_sol_value = solution_obj.raw_value;
            let sol_numer = solution_obj.numer;
            let sol_denom = solution_obj.denom;
            
            return (
                (raw_sol_value | 0) !== raw_sol_value &&
                sol_numer <= solution_size &&
                sol_numer >= (-1)*solution_size &&
                sol_denom <= solution_size &&
                sol_denom >= (-1)*solution_size
            );
        }

        processSolObj = function(solution_obj) {
            const { numer, denom } = PH.simplifyFraction(solution_obj.numer, solution_obj.denom);
            return numer + '/' + denom;
        }
    }

    // get the current equation object that will be used (this has verify_reqs, get_sol, create_prompt, absorber, number_of_coefs)
    const current_EQ_obj = equations[lin_eq_equation_form]; 

    // pick a starting range for the absorber term based on a pre-set probability distribution
    // 43% 1-20 | 31% 21-36 | 15% 37-54 | 11% 55-72
    let absorber_coef_range; // range for the absorber term
    let absorber_range_options = [[1,20],[21,36],[37,54],[55,72]]; 
    if (current_EQ_obj.absorber.length === 0) absorber_range_options = [[1,9],[1,9],[1,9],[1,9]]; // case when there's no absorber (any coef set results in an int sol like x+a=b)
    const normal_coef_range = [1,9]; // range for normal terms
    let rangePicker = H.randInt(1, 100);
    let absorber_range_index; // the index of whichever range will be picked from the array above
    if (rangePicker <= 43) {
        absorber_coef_range = absorber_range_options[0];
        absorber_range_index = 0;
    }
    else if (rangePicker <= 74) {
        absorber_coef_range = absorber_range_options[1];
        absorber_range_index = 1;
    }
    else if (rangePicker <= 89) {
        absorber_coef_range = absorber_range_options[2];
        absorber_range_index = 2;
    }
    else if (rangePicker <= 100) {
        absorber_coef_range = absorber_range_options[3];
        absorber_range_index = 3;
    }

    // generate the initial ranges for all of the coefs
    let coefficient_ranges = [];
    const number_of_coefs = current_EQ_obj.number_of_coefs;
    let absorber_index;
    if (current_EQ_obj.absorber.length !== 0) absorber_index = current_EQ_obj.absorber[0].charCodeAt(0) - 97; // turn 'a' into 0, 'b' into '1', and so on
    else absorber_index = 0; // there is no absorber (index doesn't matter as long as it's inside of the range_options array)
    for (let i = 0; i < number_of_coefs; i++) {
        if (i !== absorber_index) {
            if (force_positive_coefs === 'yes') {
                coefficient_ranges.push( // [1,...,9]
                    H.integerArray(normal_coef_range[0], normal_coef_range[1])
                );
            }
            else if (force_positive_coefs === 'no') {
                coefficient_ranges.push( // [-9,...,-1,1,...,9]
                    H.integerArray((-1)*normal_coef_range[1], (-1)*normal_coef_range[0])
                    .concat(H.integerArray(normal_coef_range[0], normal_coef_range[1]))
                );
            }
        }
        else {
            if (force_positive_coefs === 'yes') {
                coefficient_ranges.push( // [1,...,9]
                    H.integerArray(absorber_coef_range[0], absorber_coef_range[1])
                );
            }
            else if (force_positive_coefs === 'no') {
                coefficient_ranges.push( // [-9,...,-1,1,...,9]
                    H.integerArray((-1)*absorber_coef_range[1], (-1)*absorber_coef_range[0])
                    .concat(H.integerArray(absorber_coef_range[0], absorber_coef_range[1]))
                );
            }
        }
    }

    // arrays for the last two variables
    let a_array = coefficient_ranges[number_of_coefs - 2];
    let b_array = coefficient_ranges[number_of_coefs - 1];

    // create all the possibilities for the last two variables and randomize their order
    let AB_pairs = [];
    for (let value_a of a_array) {
        for (let value_b of b_array) {
            AB_pairs.push([value_a, value_b]);
        }
    }
    AB_pairs = H.randomizeList(AB_pairs);
    let len_of_AB_pairs = AB_pairs.length;
    
    // variables and indices for the while loops below
    let sol_is_found = false;
    let coef_arr = []; // starts off with everything but the last two ('a' and 'b' in a,b,c,d for example), and gets the last two later
    let coef_index = 0; // the index of whichever coef we're on
    let current_sol_obj;
    const solGetter = current_EQ_obj.get_sol;
    const coefVerifier = current_EQ_obj.verify_reqs;
    let run_counter = 0;

    // solution search 
    while (!sol_is_found && run_counter < 500) {
        // pick every coef besides the last two
        while (coef_index < number_of_coefs - 2) {
            coef_arr[coef_index] = H.randFromList(coefficient_ranges[coef_index]); // pick the value for the coef
            coef_index++;
        }

        // pick the last two coefs, check conditions with all coefs, then pick another last two, and repeat
        for (let i = 0; i < len_of_AB_pairs; i++) {
            coef_arr[number_of_coefs - 2] = AB_pairs[i][0];
            coef_arr[number_of_coefs - 1] = AB_pairs[i][1];
            current_sol_obj = solGetter(...coef_arr);

            // now check the conditions
            if (solutionIsValid(current_sol_obj) && coefVerifier(...coef_arr)) {
                sol_is_found = true;
                break;
            }
        }
        coef_index = 0;
        run_counter++;
    }

    if (!sol_is_found) { // a solution wasn't found in time (we need to use a backup template)
        let setting_permuation = []; // the current config of sol_size, sol_type, and coef_sign (represented like 010, 110, etc)

        if (solution_size_range === 'single_digit') setting_permuation.push(0);
        else if (solution_size_range === 'multi_digit') setting_permuation.push(1);

        if (solution_form === 'integers') setting_permuation.push(0);
        else if (solution_form === 'fractions') setting_permuation.push(1);

        if (force_positive_coefs === 'yes') setting_permuation.push(0);
        else if (force_positive_coefs === 'no') setting_permuation.push(1);

        // now setting_permuation looks something like [0,1,0] or [1,0,1] (an array of 3 0s or 1s)
        let setting_type = setting_permuation.join(''); // turn [0,1,0] into "010";

        // set the coef array to a random backup coef array
        coef_arr = [...H.randFromList(backups[lin_eq_equation_form][setting_type])];
    }


    // final coefs and sol
    let final_coef_array = [...coef_arr];
    let final_solution = current_EQ_obj.get_sol(...final_coef_array).raw_value;

    // process the solution into math 
    if (solution_form === 'fractions') {
        let sol_obj = current_EQ_obj.get_sol(...final_coef_array);
        let sol_fraction = PH.simplifyFraction(sol_obj.numer, sol_obj.denom);
        let sol_numer = sol_fraction.numer;
        let sol_denom = sol_fraction.denom;

        if (sol_numer > 0) final_solution = '\\frac{' + sol_numer + '}{' + sol_denom + '}';
        else if (sol_numer < 0) final_solution = '-\\frac{' + (-1)*sol_numer + '}{' + sol_denom + '}';
    }
    final_solution = variable_letter + '=' + final_solution;

    // create the equation with the user-selected variable letter and the final coefs
    let final_prompt = current_EQ_obj.create_prompt(variable_letter, ...final_coef_array);

    if (flip_equation === 'yes') { // flip the equation if specified
        let [ left_side, right_side ] = final_prompt.split('=');
        final_prompt = right_side + '=' + left_side;
    }


    // hackfix to get error_locations back to main
    let error_locations = [];
    if (settings.error_locations.length > 0) {
        if (settings.error_locations.indexOf('variable_letter') !== -1) error_locations.push('variable_letter');
    }


    return {
        question: final_prompt,
        answer: final_solution,
        settings: settings,
        error_locations: error_locations
    }
}

export const settings_fields = [
    'solution_size_range',
    'lin_eq_equation_form',
    'solution_form',
    'variable_letter',
    'flip_equation',
    'force_positive_coefs'
];

export function get_presets() {
    return {
        solution_size_range: 'single_digit', 
        lin_eq_equation_form: 'all_begin',
        solution_form: 'integers',
        variable_letter: 'x',
        flip_equation: 'no',
        force_positive_coefs: 'no'
    };
}

export function get_rand_settings() {
    return {
        solution_size_range: H.randFromList(['single_digit','multi_digit']), 
        lin_eq_equation_form: H.randFromList(['begin_1', 'begin_2', 'begin_3', 'begin_4', 'begin_5', 'begin_6', 'begin_7', 'begin_8', 'begin_9', 'begin_10', 'begin_11', 'begin_12', 'begin_13', 'inter_1', 'inter_2', 'inter_3', 'inter_4', 'inter_5', 'inter_6', 'inter_7', 'inter_8', 'inter_9', 'inter_10', 'inter_11', 'inter_12', 'inter_13', 'inter_14', 'inter_15', 'inter_16', 'advan_1', 'advan_2', 'advan_3', 'advan_4', 'advan_5', 'advan_6', 'advan_7', 'advan_8', 'advan_9', 'advan_10', 'advan_11', 'advan_12', 'advan_13', 'all_begin', 'all_inter', 'all_advan']),
        solution_form: H.randFromList(['integers','fractions','both']),
        variable_letter: "abcdfghjkmnpqrstuvwxyz"[Math.floor(Math.random() * 22)], // rand alphabet letter excluding e,i,o,l
        flip_equation: H.randFromList(['yes','no']),
        force_positive_coefs: H.randFromList(['yes','no'])
    }; 
}