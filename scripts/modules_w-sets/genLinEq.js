import * as H from '../helper-modules/gen-helpers.js';
import * as PH from '../helper-modules/polynom-helpers.js';
import * as SH from '../helper-modules/settings-helpers.js';

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

// NOTE: need the ability to 'select all' from begin, inter, or advan


export default function genLinEq(formObj) {
    const settings = processSettings(formObj);
    let { solution_size_range, lin_eq_equation_form, solution_form, variable_letter, flip_equation, force_positive_coefs } = settings;

    // helpers for verifying and constucting the equations
    const MH = { 
        middle_const(a) { // a constant term in the middle of an expression
            if (a > 0) a = '+' + a;
    
            return a + '';
        },
        start_frac(a, b) { // assumes the fraction is non-zero, non-undefined, and reduced
            if (a < 0) return '-\\frac{' + (-1)*a + '}{' + b + '}';
            return '\\frac{' + a + '}{' + b + '}';
        },
        middle_frac(a, b) {
            if (a < 0) return '-\\frac{' + (-1)*a + '}{' + b + '}';
            return '+\\frac{' + a + '}{' + b + '}';
        },
        start_var(a) { // a variable term at the start of an expression
            if (a === 1) a = '';
            else if (a === -1) a = '-';
    
            return a + ''; 
        },
        middle_var(a) { // a variable term in the middle of an expression
            if (a === 1) a = '+';
            else if (a === -1) a  = '-';
            else if (a > 0) a = '+' + a;
    
            return a + '';
        },
        start_denom(a, numer_expression) { // an expression with a numerical denom like x/a or sin(x)/a
            let k = ''; // this is what will be in front of the frac (like k(x/a))
            if (a < 0) { 
                a = (-1)*a;
                k = '-'
            }
    
            return k + '\\frac{' + numer_expression + '}{' + a + '}';
        },
        middle_denom(a, numer_expression) {
            let k; // this is what will be in front of the frac (like k(x/a))
            if (a < 0) { 
                a = (-1)*a;
                k = '-'
            }
            else k = '+';
    
            return k + '\\frac{' + numer_expression + '}{' + a + '}';
        }
    };
    
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
                c = MH.start_var(a);
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
                    raw_value: ((c*f) - (b*g) - (c*d*g)) / ((a*g) + (c*e)),
                    numer: ((c*f) - (b*g) - (c*d*g)),
                    denom: ((a*g) + (c*e))
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
                    c > 0 ||
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
    const backups = JSON.parse(`{"begin_1": {
            "000": [[6,42],[6,54],[9,54],[2,8],[5,25],[9,63],[4,36],[9,72],[2,14],[5,45],[2,4],[8,40],[7,56],[6,48],[6,6],[9,72],[8,8],[4,28],[9,54],[7,35]],"001": [[-3,18],[-2,2],[-7,-63],[-4,-24],[4,20],[7,-14],[-6,-6],[-7,-56],[-7,-56],[7,56],[8,-56],[-2,2],[3,15],[-9,-18],[9,63],[8,48],[4,8],[5,-40],[-5,40],[-5,-5]],"010": [[2,1],[2,9],[4,7],[9,7],[5,1],[7,6],[2,9],[2,7],[8,4],[6,5],[5,2],[6,2],[8,4],[4,2],[7,9],[8,4],[3,8],[7,2],[6,3],[4,9]],"011": [[-6,-8],[-2,-9],[3,8],[-5,-1],[-7,-2],[-8,3],[-8,-1],[9,5],[-2,-5],[4,-3],[7,-4],[-4,-2],[-2,-9],[-2,-1],[7,1],[8,-5],[5,7],[3,8],[3,8],[7,-8]],"100": [[2,54],[6,66],[2,58],[2,18],[4,8],[3,12],[7,63],[5,10],[3,48],[2,24],[7,35],[3,57],[3,48],[9,9],[9,45],[2,2],[2,6],[9,36],[7,42],[4,28]],"101": [[-5,10],[4,-36],[-1,-24],[9,27],[-3,42],[-3,-30],[5,35],[9,9],[4,60],[-5,5],[8,24],[-8,32],[-1,-69],[2,30],[-1,19],[-2,-16],[-4,4],[-2,6],[-2,2],[-1,7]],"110": [[5,48],[6,2],[3,25],[6,13],[8,45],[2,23],[9,69],[7,67],[7,3],[2,47],[2,71],[4,47],[3,22],[3,41],[7,54],[8,15],[3,16],[9,8],[7,53],[9,53]],"111": [[5,61],[-4,33],[-5,26],[-9,17],[4,-5],[-8,-12],[5,-64],[2,-15],[7,71],[9,42],[-8,-52],[9,28],[8,-47],[-5,32],[-8,-42],[-5,-11],[9,62],[-7,30],[9,20],[6,-14]]},"begin_2": {"000": [[8,3],[4,2],[3,3],[5,4],[1,7],[6,8],[1,3],[8,2],[1,9],[8,2],[9,4],[4,3],[7,9],[2,9],[9,6],[3,3],[8,4],[4,5],[7,4],[1,9]],"001": [[1,-8],[-5,-1],[-2,-8],[-3,-5],[-2,-7],[-9,-6],[-8,-5],[-1,1],[9,2],[3,2],[8,3],[-3,-1],[-9,-1],[-1,-1],[9,3],[4,2],[3,1],[-8,-8],[5,9],[5,7]],"010": [null],"011": [null],"100": [[2,5],[3,7],[2,1],[2,1],[4,3],[7,6],[1,3],[2,3],[7,9],[3,4],[5,5],[4,6],[2,5],[3,9],[9,5],[7,6],[1,6],[1,8],[3,2],[8,5]],"101": [[1,-7],[9,3],[2,9],[4,-4],[-4,-1],[-3,-4],[3,-5],[4,6],[3,8],[9,7],[-2,5],[-6,1],[7,2],[8,-8],[-3,-7],[-9,-6],[8,-4],[-6,-2],[5,-3],[-9,9]],"110": [null],"111": [null]},"begin_3": {"000": [[2,5],[3,5],[3,5],[7,4],[5,3],[1,4],[9,4],[5,2],[5,2],[9,2],[7,9],[2,8],[6,4],[9,4],[3,3],[4,2],[4,6],[8,1],[2,6],[3,5]],"001": [[-7,-4],[4,3],[-1,-5],[-3,4],[2,5],[-3,6],[-5,-1],[3,-5],[4,-5],[4,3],[-6,-8],[-9,-2],[-3,-2],[4,-2],[7,9],[-4,5],[2,3],[1,5],[-3,1],[6,3]],"010": [null],"011": [null],"100": [[1,8],[7,4],[6,1],[7,8],[5,7],[3,4],[6,3],[1,5],[9,5],[5,2],[9,8],[9,5],[5,2],[3,9],[8,4],[6,3],[5,9],[1,4],[2,7],[6,1]],"101": [[9,6],[2,-1],[-2,5],[-1,3],[-8,-7],[-2,-3],[-5,4],[-4,6],[-4,7],[-3,1],[-3,-6],[4,9],[8,6],[3,9],[-4,4],[7,-8],[5,-5],[7,9],[-4,-1],[-2,-3]],"110": [null],"111": [null]},"begin_4": {"000": [[5,1],[2,1],[9,1],[3,3],[3,3],[6,1],[2,1],[2,4],[3,3],[2,3],[6,1],[4,1],[3,2],[2,2],[3,3],[9,1],[3,1],[4,1],[2,4],[8,1]],"001": [[5,1],[2,-2],[-6,-1],[-4,1],[-2,1],[3,3],[2,1],[6,-1],[2,2],[-4,2],[5,1],[-2,-4],[-7,1],[9,-1],[4,-1],[5,-1],[-4,-1],[3,2],[-2,1],[9,1]],"010": [null],"011": [null],"100": [[8,6],[2,2],[6,3],[8,6],[9,8],[5,3],[4,9],[8,8],[6,7],[7,5],[9,7],[4,5],[6,5],[2,1],[3,5],[7,2],[9,8],[6,8],[3,6],[7,7]],"101": [[8,-3],[7,1],[2,-8],[-6,-7],[5,8],[9,-9],[6,-5],[6,2],[3,-4],[-5,-4],[-9,8],[9,7],[4,8],[-9,2],[4,4],[7,9],[4,-3],[6,6],[-2,-5],[5,-1]],"110": [null],"111": [null]},"begin_5": {"000": [[6,8,62],[8,8,72],[4,9,17],[5,53,8],[5,1,6],[3,4,25],[4,6,2],[8,7,7],[8,4,60],[8,4,44],[6,2,50],[8,19,3],[9,4,58],[4,8,8],[2,2,20],[3,8,11],[2,15,9],[6,56,2],[7,8,1],[6,6,60]],"001": [[-4,20,4],[-2,5,21],[6,4,-26],[-7,-31,4],[5,2,32],[2,25,9],[-8,68,-4],[-8,-36,-4],[-2,-1,-3],[6,45,-3],[7,-7,49],[8,49,-7],[7,-6,-41],[-9,71,8],[7,51,9],[-6,31,-5],[-5,-26,9],[6,-8,-44],[8,2,-6],[8,-1,-25]],"010": [[5,2,4],[7,3,5],[5,8,6],[7,8,16],[6,8,6],[8,1,8],[5,4,3],[4,6,1],[6,5,12],[5,16,8],[2,12,5],[9,15,7],[7,6,5],[5,10,6],[4,3,1],[5,3,9],[3,10,9],[3,6,4],[6,8,3],[4,14,9]],"011": [[6,2,-2],[3,-6,-7],[5,-8,-15],[5,-10,-6],[-2,7,16],[3,4,9],[-4,12,5],[4,4,9],[-3,-6,-1],[-6,-18,-9],[2,4,9],[8,6,-1],[2,-1,2],[-8,-2,-7],[-8,5,2],[-5,5,13],[9,-4,-3],[-4,-9,-10],[4,-1,-6],[6,2,-5]],"100": [[7,37,9],[3,62,8],[2,6,34],[6,9,57],[6,47,5],[3,33,3],[5,2,2],[9,14,5],[5,9,4],[5,9,64],[7,2,51],[7,7,35],[6,3,45],[6,5,23],[6,5,35],[7,31,3],[2,56,4],[7,6,6],[8,27,3],[5,1,26]],"101": [[-2,1,-57],[-7,-33,-5],[8,-54,-6],[-2,-61,7],[5,-9,1],[-5,-11,-6],[5,-26,-6],[8,1,-7],[-9,50,5],[9,22,4],[-7,-1,-29],[7,-1,-8],[2,-18,6],[-9,-5,-41],[-4,26,2],[2,10,-2],[5,-2,53],[-5,9,9],[-1,-3,-50],[-1,-9,9]],"110": [[5,2,5],[6,3,28],[5,9,66],[2,7,10],[3,15,1],[4,7,24],[7,3,9],[9,6,38],[8,32,2],[2,52,1],[3,3,8],[3,51,7],[2,72,9],[3,37,5],[2,52,9],[7,10,6],[6,19,4],[5,50,4],[9,25,9],[7,4,12]],"111": [[-5,-1,-4],[4,-5,-4],[-5,1,-27],[-6,-31,-8],[7,-64,1],[5,10,-1],[-5,23,-9],[-6,6,8],[2,27,-6],[8,-51,9],[-9,-33,9],[-9,-9,13],[2,-51,-2],[2,9,20],[4,-3,48],[3,9,-26],[-2,20,3],[3,4,39],[-2,56,9],[-2,-7,-18]]},"begin_6": {"000": [[6,4,22],[1,9,64],[38,4,2],[48,5,8],[26,4,6],[41,8,9],[1,8,41],[1,8,41],[10,4,2],[8,6,38],[5,9,23],[35,4,7],[6,3,3],[33,8,1],[8,6,8],[17,5,2],[16,3,4],[9,8,65],[7,8,23],[4,8,68]],"001": [[-26,-9,-8],[3,4,-17],[6,-5,31],[6,6,60],[-7,-1,-13],[7,-6,49],[10,-4,-6],[8,-4,-8],[1,-7,-62],[-9,-3,-33],[12,7,5],[-8,8,-16],[7,2,21],[-3,-5,-13],[-7,3,2],[-2,7,5],[49,7,7],[-60,-6,-6],[23,-5,8],[-32,5,-7]],"010": [[16,7,8],[6,3,5],[9,7,17],[3,2,10],[10,4,3],[1,4,10],[1,7,2],[6,7,10],[12,3,4],[14,6,5],[9,8,15],[18,2,9],[9,5,3],[13,8,9],[9,5,18],[1,9,3],[10,7,9],[5,8,1],[13,3,9],[14,4,7]],"011": [[4,-3,-4],[15,3,7],[3,-5,-3],[4,6,9],[17,7,8],[-9,-7,-8],[-12,2,-9],[1,2,6],[8,5,2],[-3,-7,5],[-7,-5,-11],[4,4,2],[-4,-5,-2],[-2,-5,4],[4,-6,7],[6,-9,-1],[5,-8,-2],[-9,2,-2],[-7,-6,-4],[15,-3,7]],"100": [[35,2,3],[9,6,3],[7,4,11],[8,6,20],[51,3,9],[6,2,38],[2,3,5],[8,2,16],[17,3,5],[55,2,1],[4,3,7],[9,2,35],[1,3,7],[20,2,6],[6,2,64],[70,2,4],[19,4,3],[23,4,3],[4,3,16],[3,3,36]],"101": [[-8,2,-2],[4,9,4],[4,-7,53],[-8,-3,-62],[-9,-1,-48],[-5,-1,6],[-36,-1,4],[-54,-1,-4],[3,2,1],[-22,-5,8],[44,-2,6],[4,-6,-14],[53,-5,3],[-62,-5,-2],[6,-4,18],[-4,2,66],[4,2,-2],[-5,-5,-20],[-6,6,-24],[-1,-4,-13]],"110": [[9,3,64],[4,9,9],[54,7,6],[4,6,11],[4,8,65],[3,9,1],[8,6,43],[7,6,65],[51,9,9],[28,7,8],[3,5,15],[4,8,50],[4,6,19],[35,3,3],[31,7,4],[70,4,1],[11,9,6],[2,6,1],[8,3,22],[4,7,61]],"111": [[3,5,10],[1,8,5],[2,-3,9],[1,-7,-15],[-20,-6,-7],[-6,4,-36],[4,6,-22],[45,4,-4],[8,2,29],[9,-6,-41],[-9,-3,-14],[2,4,-17],[3,-8,-8],[-1,6,-22],[-28,-5,6],[33,-6,5],[-22,-3,-2],[11,-5,5],[5,-3,46],[-7,9,-26]]},"begin_7": {"000": [[1,9,8],[6,5,8],[6,1,45],[9,2,56],[8,4,20],[1,6,35],[9,1,56],[2,7,40],[5,1,32],[7,9,4],[3,9,30],[4,1,24],[3,7,36],[2,9,63],[6,2,36],[9,2,28],[2,9,63],[9,2,56],[2,9,42],[7,6,4]],"001": [[2,-4,-36],[-8,1,27],[1,7,-48],[6,4,6],[8,-2,-20],[3,9,-24],[3,-5,-72],[-5,-2,-3],[5,-3,64],[-7,2,-72],[-8,-7,4],[-9,-8,9],[-4,-9,-25],[9,8,9],[8,-1,63],[-6,6,-72],[-2,7,-63],[-1,-3,-8],[-9,-5,-12],[3,8,-40]],"010": [[7,1,7],[1,3,3],[4,8,7],[9,2,4],[4,9,9],[1,6,4],[3,8,8],[1,4,4],[9,6,2],[1,8,3],[3,7,3],[3,5,3],[5,7,5],[5,7,5],[6,9,8],[3,5,7],[3,5,5],[3,7,7],[7,1,7],[7,5,7]],"011": [[9,3,-2],[3,-6,1],[3,1,-1],[9,5,9],[-3,-8,2],[6,1,-7],[-4,3,-5],[-6,-2,9],[-7,-5,1],[-1,-5,7],[-9,-3,5],[8,2,7],[6,1,-8],[6,9,-1],[1,5,9],[-5,3,-2],[5,3,7],[-5,-9,-9],[4,9,6],[1,-6,8]],"100": [[5,6,5],[9,6,3],[9,8,38],[3,4,9],[4,5,61],[8,9,14],[4,3,18],[7,8,42],[7,2,20],[2,1,70],[3,7,44],[4,8,8],[7,8,5],[8,2,66],[5,6,2],[1,4,3],[7,5,34],[7,8,61],[4,3,3],[1,3,32]],"101": [[3,4,-58],[4,2,-64],[-2,-5,-21],[-5,-1,4],[7,6,38],[-6,-4,40],[4,1,51],[7,6,-63],[-3,1,68],[-1,1,4],[-5,-6,1],[-5,-4,-46],[-1,-2,45],[9,6,30],[9,8,-28],[3,2,-33],[-2,-5,36],[8,5,-3],[9,5,-12],[-3,-2,41]],"110": [[8,3,66],[3,5,67],[8,2,1],[8,3,29],[1,4,46],[2,7,41],[1,9,57],[3,7,53],[2,4,25],[6,9,22],[2,7,33],[5,7,21],[1,9,42],[9,4,1],[3,8,34],[6,9,8],[6,2,19],[1,3,15],[4,6,3],[5,9,26]],"111": [[7,-6,55],[4,6,-13],[2,-5,45],[6,3,35],[-6,6,46],[1,-2,-16],[-5,9,59],[8,-5,10],[-4,-2,33],[7,5,-9],[-1,7,-66],[8,-3,-48],[-4,-7,22],[-5,-3,-5],[-2,-9,51],[5,-7,-46],[3,-6,7],[-2,-9,33],[8,4,-33],[-9,-3,11]]},"begin_8": {"000": [[2,64,1,4],[3,54,1,6],[4,7,24,6],[5,2,70,7],[9,60,6,8],[5,12,5,6],[4,18,6,3],[4,6,48,8],[5,6,40,8],[4,72,3,9],[2,4,8,4],[9,2,72,4],[5,49,5,7],[7,5,7,5],[4,7,36,7],[5,70,3,6],[9,6,9,6],[9,6,45,5],[6,9,8,2],[3,45,2,5]],"001": [[8,6,-4,3],[-6,5,6,5],[-3,12,3,2],[-5,64,5,8],[-3,8,27,8],[-6,30,-3,5],[6,56,6,7],[-7,5,42,6],[8,6,24,6],[-6,3,-12,6],[4,48,3,9],[-4,7,-36,7],[6,7,6,7],[7,28,-3,4],[-6,8,-54,8],[5,49,5,7],[-3,2,60,5],[-4,12,-6,9],[5,7,40,8],[-4,3,64,8]],"010": [[2,7,1,3],[4,6,1,2],[3,9,1,2],[4,3,1,2],[3,4,2,3],[3,6,1,3],[3,8,1,2],[4,5,1,2],[3,8,1,3],[2,9,1,4],[1,7,1,8],[2,3,1,2],[2,3,3,4],[1,5,1,2],[2,7,1,2],[2,4,1,3],[2,5,1,4],[1,3,1,6],[2,9,1,4],[4,6,1,2]],"011": [[3,2,-1,3],[-2,9,1,3],[-1,8,1,6],[1,7,1,2],[-1,9,1,5],[-2,5,1,3],[-3,8,-1,2],[-4,3,-3,2],[-2,3,1,2],[4,6,-1,2],[3,5,1,3],[-4,6,-1,2],[2,7,-1,4],[3,7,1,3],[-1,8,-1,9],[1,5,-1,2],[1,6,1,4],[-1,2,-4,3],[4,9,-1,2],[-2,4,-1,3]],"100": [[7,8,21,2],[4,55,4,5],[2,4,16,4],[2,6,42,7],[2,3,16,4],[3,5,6,2],[8,3,48,6],[9,3,54,6],[2,39,8,4],[7,16,7,4],[1,5,8,4],[3,13,6,2],[4,25,8,2],[1,3,20,5],[8,22,8,2],[7,35,4,5],[7,66,7,6],[4,7,32,8],[2,19,8,4],[9,30,6,2]],"101": [[8,28,2,7],[8,16,-9,6],[2,6,-25,3],[1,2,32,2],[-4,6,-56,7],[2,9,-18,9],[2,5,-28,2],[-9,60,9,5],[3,30,-4,5],[-8,64,1,2],[-9,5,-18,2],[-5,9,-20,2],[-5,9,55,3],[3,56,6,4],[-2,9,26,9],[2,56,6,8],[1,2,-9,3],[-2,48,5,4],[-4,8,24,6],[-5,3,-30,3]],"110": [[9,66,1,5],[3,9,9,8],[6,10,8,2],[3,2,26,8],[6,19,4,7],[6,4,22,5],[4,35,1,6],[5,22,3,5],[8,69,1,6],[4,3,18,7],[8,31,2,5],[5,58,1,9],[3,8,11,6],[8,27,3,4],[3,19,4,3],[3,2,36,9],[8,2,2,4],[1,7,1,5],[8,48,1,7],[5,30,2,7]],"111": [[7,11,5,6],[4,2,-45,3],[-6,36,2,5],[-7,2,-33,4],[8,43,-2,7],[-2,16,-1,6],[9,49,1,3],[5,4,-24,5],[-3,37,1,4],[-3,2,38,9],[1,47,1,8],[-1,40,1,7],[-2,6,-11,8],[-3,20,-2,6],[8,20,3,2],[9,52,-1,4],[1,3,-26,5],[-8,32,1,9],[-5,28,1,7],[-7,2,-41,5]]},"begin_9": {"000": [[6,3,35,5],[45,7,3,7],[16,9,7,9],[15,2,9,6],[4,3,30,9],[54,6,8,4],[2,8,5,4],[4,7,46,7],[1,7,22,7],[8,6,31,3],[5,6,5,6],[69,9,6,9],[2,4,45,6],[55,9,1,9],[3,7,31,7],[50,9,5,9],[6,9,69,9],[3,4,39,4],[52,8,3,2],[8,5,48,5]],"001": [[-7,6,47,6],[-21,8,3,8],[-50,7,6,7],[2,9,29,9],[-34,8,3,4],[-16,6,-6,9],[5,6,59,6],[1,9,1,9],[-27,9,8,2],[4,3,-2,3],[-57,7,-8,7],[5,8,-19,8],[-39,6,5,2],[1,5,-9,5],[-56,7,-8,4],[25,6,1,6],[-51,9,-6,9],[36,8,4,8],[57,7,-6,7],[3,6,-51,6]],"010": [[16,4,9,2],[8,3,6,2],[9,2,21,4],[4,3,2,3],[7,4,4,2],[9,2,21,4],[9,2,21,4],[3,4,1,2],[5,2,5,3],[7,3,5,3],[9,2,21,4],[5,4,4,2],[4,2,9,4],[21,4,9,2],[9,2,21,4],[8,3,4,2],[9,2,21,4],[8,2,8,3],[7,4,5,2],[8,3,4,2]],"011": [[-5,2,-7,3],[1,4,-1,2],[-9,4,-4,2],[21,4,9,2],[-9,3,-5,2],[-21,4,-9,2],[-9,2,-21,4],[-8,4,-5,2],[3,4,3,2],[-13,4,-8,2],[-16,3,-8,2],[-2,3,-3,2],[-8,4,-5,2],[1,3,2,3],[-14,3,-9,2],[21,4,9,2],[-3,4,-1,2],[12,2,9,2],[7,3,4,2],[-21,4,-9,2]],"100": [[1,4,2,8],[55,3,4,3],[46,3,7,3],[58,7,2,7],[54,9,6,3],[9,6,65,2],[5,3,10,6],[31,5,1,5],[3,5,8,5],[8,4,12,4],[7,6,49,6],[4,8,37,2],[67,5,7,5],[32,6,1,3],[65,2,2,4],[5,3,5,3],[8,4,6,2],[8,5,23,5],[3,2,69,6],[4,5,59,5]],"101": [[19,8,3,8],[-51,8,5,8],[-62,9,-8,9],[7,6,55,6],[6,3,-49,7],[26,5,1,5],[3,9,68,6],[4,3,13,3],[19,5,9,5],[3,7,-46,7],[5,8,21,8],[34,8,-6,8],[8,9,-10,9],[1,4,10,8],[-9,5,6,5],[-28,4,-8,4],[6,5,-39,5],[-16,7,5,7],[17,8,9,8],[43,9,7,9]],"110": [[9,3,59,9],[47,7,9,2],[6,5,8,6],[52,7,5,2],[9,3,35,2],[2,5,21,7],[4,3,39,7],[31,3,9,3],[16,4,2,6],[35,2,8,2],[5,6,21,6],[8,3,21,9],[57,2,8,2],[36,2,9,2],[57,6,6,2],[5,6,22,8],[23,7,9,2],[4,2,56,6],[70,5,9,2],[72,5,9,2]],"111": [[-6,8,5,3],[-6,4,-37,9],[-9,2,-56,2],[-7,9,-3,9],[-15,5,4,3],[-9,2,-30,7],[-4,9,-2,8],[64,7,5,2],[41,5,3,2],[-3,2,-56,7],[30,9,1,2],[-6,2,-67,8],[-50,2,-1,2],[56,2,7,2],[5,4,9,2],[-46,7,1,2],[9,8,21,8],[-1,8,11,2],[64,9,4,2],[-7,5,3,8]]},"begin_10": {"000": [[5,2,3],[7,2,8],[7,3,3],[1,5,2],[8,2,2],[8,8,2],[2,9,1],[3,2,3],[5,7,1],[3,8,1],[8,2,1],[5,2,4],[3,4,1],[1,2,5],[3,4,3],[4,2,5],[9,2,4],[9,3,3],[7,9,1],[4,4,3]],"001": [[7,5,1],[-7,8,-2],[3,-2,-5],[-9,4,-3],[-9,2,-6],[3,-2,1],[3,7,1],[7,-2,-4],[-6,-3,1],[-6,3,-3],[-6,-3,1],[2,-2,2],[8,-2,-5],[3,-8,-1],[3,2,1],[-5,3,-2],[2,-5,-2],[7,2,8],[8,4,1],[1,3,1]],"010": [null],"011": [null],"100": [[3,2,6],[5,8,6],[1,2,8],[9,3,5],[5,7,5],[4,5,6],[5,3,8],[2,4,6],[3,6,2],[9,4,9],[9,3,1],[6,7,7],[6,6,3],[2,9,4],[2,9,7],[2,7,6],[4,5,9],[4,5,7],[2,6,1],[5,3,5]],"101": [[2,4,-6],[-9,-4,-2],[6,-3,-6],[8,-5,-4],[7,-8,-8],[-7,5,-5],[8,-3,2],[9,9,7],[-5,-8,-4],[-1,-7,8],[5,-6,5],[-4,-6,-8],[2,-6,1],[-2,9,-1],[8,-9,-1],[9,3,9],[7,8,5],[-9,-2,5],[3,5,-7],[7,9,4]],"110": [null],"111": [null]},"begin_11": {"000": [[2,5,8],[8,8,8],[8,4,4],[2,6,2],[7,4,3],[9,3,2],[6,4,4],[3,6,5],[3,8,9],[8,7,6],[8,2,3],[6,1,2],[4,3,1],[2,5,2],[8,6,7],[4,4,4],[6,7,8],[2,1,3],[5,6,5],[8,2,3]],"001": [[-9,-2,-2],[8,-5,-4],[-2,6,4],[-3,-6,-5],[-9,5,5],[3,-9,-7],[-3,-1,1],[4,1,1],[6,7,7],[3,-7,-7],[-2,-2,-3],[2,-6,-5],[-3,-6,-6],[4,4,2],[-7,6,5],[5,-3,-4],[6,1,2],[3,3,2],[-6,8,9],[-9,7,7]],"010": [null],"011": [null],"100": [[3,3,3],[8,5,3],[8,7,8],[5,5,4],[9,2,5],[9,3,2],[2,7,8],[9,2,6],[3,6,9],[4,4,3],[6,9,1],[2,2,1],[4,1,2],[5,9,9],[7,9,4],[3,6,2],[7,2,7],[2,1,7],[5,7,3],[9,7,3]],"101": [[6,-2,5],[-7,2,-7],[-2,-4,2],[-2,7,-1],[2,-6,9],[3,-1,7],[-2,7,9],[9,-1,-1],[-5,5,3],[2,-8,4],[-6,-7,-8],[5,-5,9],[3,-9,-9],[8,7,3],[-6,-1,3],[-3,-7,5],[-4,5,1],[9,4,1],[-4,1,2],[2,9,-8]],"110": [null],"111": [null]},"begin_12": {"000": [[8,8,7],[5,3,7],[4,4,4],[2,6,2],[5,3,2],[7,4,8],[9,6,8],[9,9,9],[6,3,8],[7,2,5],[6,2,6],[2,6,3],[2,4,1],[7,7,7],[8,9,7],[3,2,5],[4,4,4],[1,8,2],[8,9,8],[1,2,3]],"001": [[-2,3,-5],[4,8,4],[-6,9,-7],[-9,-8,-8],[-3,2,-3],[-1,9,-2],[7,-8,6],[8,-8,7],[-9,2,-5],[9,9,8],[-7,-7,-8],[3,3,4],[-5,9,-4],[2,2,1],[9,6,9],[-5,-5,-6],[-5,2,-4],[1,-6,1],[-9,2,-9],[-4,2,-2]],"010": [null],"011": [null],"100": [[1,7,3],[9,5,5],[7,6,6],[9,3,3],[7,3,1],[3,7,7],[7,7,8],[2,2,1],[3,7,3],[8,4,6],[8,8,8],[9,6,1],[4,2,6],[7,7,2],[1,5,9],[5,9,4],[7,8,9],[2,3,2],[9,4,4],[9,8,8]],"101": [[-1,6,3],[3,4,-2],[-6,5,-3],[-4,5,-1],[9,-4,4],[-4,-8,-2],[-8,-8,-8],[-5,-4,5],[8,-6,-2],[-4,8,-4],[-5,-3,-3],[2,5,2],[2,5,2],[-1,-8,-3],[4,-8,3],[8,-4,-1],[-8,-7,-5],[8,3,8],[3,-4,6],[8,-7,5]],"110": [null],"111": [null]},"begin_13": {"000": [[6,6,36],[9,3,12],[8,2,60],[7,2,45],[1,4,35],[5,8,13],[8,3,33],[2,2,32],[2,8,20],[8,4,12],[2,6,24],[8,4,48],[8,9,34],[1,8,54],[9,4,13],[6,9,60],[8,8,32],[5,2,7],[2,1,18],[6,6,48]],"001": [[8,8,16],[4,-3,-7],[1,7,64],[-4,-4,-48],[1,-6,-40],[-1,8,-28],[5,-1,-24],[7,-9,-10],[3,-5,-2],[5,-6,5],[-5,-1,36],[-4,9,40],[1,-9,-56],[2,7,63],[5,7,-12],[-5,6,3],[-9,-7,-16],[9,-1,40],[6,-2,16],[7,-8,2]],"010": [[8,1,5],[1,8,2],[6,1,8],[8,1,3],[1,5,7],[6,1,3],[3,4,9],[1,7,7],[4,5,7],[6,3,4],[3,1,9],[1,4,2],[1,8,1],[3,5,9],[1,3,3],[2,5,2],[7,1,4],[4,4,6],[4,5,8],[2,2,7]],"011": [[-5,7,7],[4,-8,2],[-9,4,3],[3,4,9],[-9,5,1],[-1,-3,-9],[6,-1,-1],[8,-3,-2],[-2,7,-8],[-9,3,-1],[1,3,-7],[-2,-1,7],[-8,5,-5],[6,1,-6],[-2,7,-2],[4,-7,-5],[9,-1,-5],[-5,2,8],[8,-3,4],[2,-8,1]],"100": [[5,9,14],[6,2,8],[2,8,10],[2,3,15],[9,8,17],[9,6,15],[2,6,24],[7,5,12],[9,2,55],[6,7,13],[9,8,34],[8,2,70],[6,1,14],[7,1,32],[8,3,11],[8,1,36],[9,7,32],[2,9,55],[2,7,27],[6,9,60]],"101": [[5,-3,-4],[4,-3,21],[3,-4,36],[7,-4,-36],[-7,5,34],[-2,-1,9],[-6,5,33],[-3,2,-31],[7,-9,-56],[3,-7,-52],[7,1,48],[7,-6,-65],[-9,8,65],[-2,-5,21],[8,6,-42],[3,-5,52],[1,6,-21],[3,6,-36],[4,-5,6],[9,2,22]],"110": [[8,3,68],[7,8,29],[8,9,3],[9,6,34],[9,2,8],[9,9,26],[9,1,32],[3,1,35],[7,6,51],[5,1,55],[1,3,14],[7,1,43],[7,9,62],[7,1,55],[7,1,12],[4,3,6],[9,6,13],[8,2,68],[9,9,43],[6,9,17]],"111": [[-3,-1,-26],[-9,2,57],[2,9,65],[3,7,56],[-1,6,-1],[6,4,-27],[1,2,-20],[-6,4,-57],[-4,-4,42],[-1,-4,26],[9,3,-29],[-9,-6,44],[-5,-4,48],[1,4,46],[-8,6,15],[-6,3,5],[7,2,34],[4,2,38],[-2,8,-63],[3,-9,-69]]},"inter_1": {"000": [[6,4,1,49],[5,2,7,18],[1,19,4,7],[9,6,6,33],[4,8,7,35],[9,25,1,1],[3,8,9,62],[2,70,9,7],[5,3,9,39],[1,44,5,8],[4,6,3,11],[8,3,2,27],[5,6,2,27],[3,47,9,5],[6,38,2,2],[8,3,2,21],[8,6,9,5],[2,8,9,64],[1,6,6,26],[4,2,8,30]],"001": [[-4,6,2,-42],[7,23,-7,9],[-8,72,2,2],[7,-7,4,-1],[-7,6,-4,6],[1,6,8,-1],[3,-38,-5,-6],[-2,-34,-9,-6],[3,-3,9,-51],[9,-34,3,8],[-3,-1,4,-1],[-3,-41,5,7],[3,11,-6,2],[5,-7,-3,-39],[-2,-33,-7,-8],[-8,8,2,68],[-4,-7,-6,-1],[-4,-4,-7,8],[-5,42,5,-8],[-7,-3,-4,-21]],"010": [[3,15,6,8],[7,1,1,5],[6,7,9,9],[4,2,9,9],[3,1,6,3],[1,7,3,12],[3,14,8,5],[9,14,4,8],[6,10,9,5],[7,4,5,7],[9,8,1,2],[2,13,5,5],[9,10,5,1],[2,16,7,8],[7,10,9,9],[9,8,2,3],[1,17,6,8],[2,6,8,3],[3,10,6,3],[2,5,8,1]],"011": [[-9,-3,-3,-6],[-5,7,-2,8],[2,-4,-6,-6],[3,-2,7,3],[-5,3,-2,5],[6,16,-2,7],[-4,8,-8,-1],[-4,-10,5,-6],[2,-4,-1,-6],[4,-8,-5,-4],[2,16,4,9],[3,-10,6,-3],[-5,-6,3,-4],[-8,-8,-1,-17],[-6,-13,-1,-9],[2,1,-5,2],[-7,-9,-3,-3],[-3,2,-8,3],[-7,-10,2,-5],[-7,-2,-2,-1]],"100": [[1,64,2,3],[1,9,3,45],[7,3,8,35],[7,6,8,65],[1,6,4,69],[5,8,4,47],[9,6,2,6],[2,25,1,3],[9,5,6,5],[1,4,2,54],[3,3,1,9],[3,53,2,1],[3,7,1,5],[6,37,5,3],[1,8,9,8],[1,6,8,69],[9,4,7,52],[3,20,1,2],[5,9,7,13],[2,64,3,9]],"101": [[8,34,4,-2],[3,70,-1,-2],[-3,-2,-5,72],[-4,-6,4,2],[8,1,9,4],[-2,-2,-8,64],[5,22,7,-4],[-7,-7,-8,38],[4,-66,5,5],[9,-7,8,69],[-9,9,-8,1],[2,7,5,16],[6,9,7,64],[-4,21,-2,-9],[3,4,4,6],[-9,-28,-7,-8],[-1,-3,-6,47],[5,5,-1,41],[6,6,4,8],[-6,1,-7,9]],"110": [[2,4,9,68],[5,4,8,51],[2,31,9,9],[2,8,7,1],[5,15,9,5],[4,12,9,1],[7,51,2,7],[8,5,3,8],[7,3,9,60],[9,35,6,9],[8,8,6,9],[8,13,3,6],[6,18,9,8],[1,21,8,2],[1,4,5,58],[1,43,8,7],[1,7,9,9],[2,68,8,9],[9,7,4,68],[9,41,6,1]],"111": [[7,55,-4,9],[5,-15,-4,1],[9,19,-1,-3],[1,-2,8,-15],[-1,-46,-5,3],[2,28,7,-9],[-1,-61,-7,-5],[8,-8,2,-5],[1,-24,-2,1],[3,52,-8,3],[8,-72,5,4],[-5,32,-9,-2],[5,9,-6,2],[-6,32,7,3],[-8,-69,8,-7],[-8,9,-4,54],[5,-21,-4,-7],[6,-5,-4,-11],[-2,5,2,-6],[9,35,-2,4]]},"inter_2": {"000": [[2,9,2,2],[7,5,1,43],[5,1,6,45],[9,9,2,16],[36,4,7,9],[24,2,5,3],[15,8,5,3],[4,9,6,28],[44,2,7,4],[1,8,2,55],[72,9,1,8],[50,7,1,8],[9,9,1,65],[55,7,1,7],[7,3,7,39],[62,1,7,8],[7,2,6,7],[6,6,8,24],[5,4,7,5],[20,4,6,8]],"001": [[-3,-4,-8,1],[10,7,9,-6],[-17,-8,-6,-7],[-8,7,-6,57],[4,-4,3,67],[-5,-2,7,31],[7,4,-5,-29],[4,-2,8,-66],[8,8,3,53],[-67,7,-5,-7],[-50,4,-7,-6],[3,-1,-8,-25],[-9,5,-5,41],[24,1,7,6],[-8,4,8,-24],[-25,3,5,-7],[-5,9,-2,-27],[-61,9,-6,-1],[67,1,-6,4],[3,-8,-4,3]],"010": [[3,8,1,8],[5,9,3,2],[3,3,8,9],[14,1,9,7],[3,8,4,6],[18,1,9,9],[8,7,2,12],[11,7,2,9],[7,3,8,5],[10,5,8,6],[3,5,3,10],[12,3,9,5],[13,4,7,8],[4,3,7,3],[1,3,5,4],[10,9,2,8],[6,4,6,11],[14,9,1,7],[12,9,5,3],[5,2,7,1]],"011": [[-1,-7,-4,7],[17,4,8,8],[-5,1,4,-6],[-5,2,-7,-8],[-2,1,6,-4],[8,5,-1,1],[-9,5,8,-1],[5,-6,-3,7],[3,8,-1,-3],[5,-4,-9,2],[1,-5,-7,6],[7,9,7,8],[4,-4,-6,7],[2,3,-1,-4],[17,6,8,8],[-8,-2,4,-13],[-14,7,2,-8],[10,1,7,1],[-6,2,-7,-13],[8,-1,-7,16]],"100": [[2,8,7,65],[1,4,5,35],[5,9,1,37],[2,6,2,6],[7,9,5,51],[66,9,1,2],[2,4,7,20],[4,3,4,11],[2,8,9,64],[9,7,6,8],[31,5,3,1],[3,7,1,69],[2,5,2,26],[43,2,3,9],[39,8,7,5],[62,1,6,7],[4,6,1,54],[54,8,4,6],[30,7,8,6],[31,7,9,9]],"101": [[71,-1,2,-4],[12,1,-6,-9],[-6,-9,-3,60],[-11,8,-1,-2],[-8,7,-3,12],[-59,5,-8,6],[3,-1,2,12],[16,5,7,-4],[-39,3,-4,-4],[-8,3,2,25],[-21,-6,-7,-5],[6,8,6,-62],[6,3,2,28],[-52,6,5,9],[-72,8,9,8],[-8,2,1,4],[-6,9,-3,-6],[-66,7,9,-6],[-9,-9,-4,-4],[-4,2,-6,-20]],"110": [[26,6,8,9],[1,8,3,23],[25,6,8,2],[2,2,4,63],[4,9,6,26],[6,2,9,29],[29,6,9,1],[1,2,8,2],[9,9,5,18],[1,5,1,52],[27,5,2,5],[7,4,6,54],[65,1,6,6],[15,2,9,4],[9,9,3,18],[8,2,7,21],[1,1,6,50],[6,4,7,8],[5,6,2,72],[2,6,4,55]],"111": [[-37,4,-1,-4],[-66,4,1,1],[-9,-1,-8,7],[-33,-2,6,-6],[-7,-1,-6,-19],[-55,-4,-9,3],[-2,7,-6,-4],[-7,-8,5,5],[-8,-8,5,-32],[-8,-8,7,-9],[5,5,-7,-47],[-12,9,-5,6],[-14,8,-8,7],[4,-1,5,3],[8,3,8,1],[-9,-8,5,-8],[5,1,-8,-18],[6,3,9,1],[-6,-5,5,38],[61,9,5,-1]]},"inter_3": {"000": [[4,8,64],[3,3,6],[6,5,18],[7,3,49],[8,3,40],[7,1,35],[9,9,27],[9,5,27],[3,8,42],[9,1,18],[6,6,54],[3,9,42],[5,5,15],[9,3,18],[2,5,18],[4,8,40],[8,7,40],[7,9,56],[5,9,45],[8,5,56]],"001": [[5,9,10],[5,-8,-25],[-7,4,-70],[-8,-3,-32],[-9,1,9],[-1,-9,6],[3,-9,-51],[-9,-7,18],[-3,-2,21],[-4,5,-56],[6,-1,-12],[9,3,63],[6,-5,-54],[8,-8,-40],[2,-5,-10],[8,7,40],[-8,3,-56],[-2,9,-22],[7,3,28],[3,1,-15]],"010": [[4,9,43],[3,4,11],[9,4,44],[2,7,21],[3,5,11],[8,2,22],[3,1,11],[3,3,2],[9,2,15],[5,1,11],[6,1,1],[4,9,39],[2,9,27],[7,9,55],[3,9,31],[6,7,35],[6,2,4],[2,5,19],[9,4,31],[9,8,67]],"011": [[-6,4,-19],[6,9,63],[7,1,5],[9,-5,-46],[6,2,21],[4,9,43],[-6,-2,10],[6,-2,-17],[-4,-8,26],[4,4,15],[-9,5,-50],[-9,-4,31],[-5,-2,4],[7,-8,-58],[-9,-1,6],[9,8,70],[6,9,56],[4,-5,-21],[-7,-8,64],[-4,-1,-3]],"100": [[9,8,54],[6,4,72],[5,3,40],[5,4,15],[2,7,14],[9,2,27],[5,4,5],[7,4,21],[7,2,7],[6,9,6],[8,5,16],[4,9,8],[8,5,72],[2,8,12],[2,2,24],[4,6,20],[4,6,56],[5,9,20],[4,5,60],[5,7,60]],"101": [[-5,-9,60],[6,-1,66],[-7,1,-21],[-2,6,12],[8,3,56],[3,1,15],[-8,3,16],[6,6,12],[-6,2,24],[7,6,-14],[-4,-1,-12],[-9,2,-27],[2,-5,54],[3,6,39],[6,-5,-60],[4,8,68],[-5,-7,25],[-2,7,-24],[-9,-2,72],[9,5,9]],"110": [[4,2,6],[8,5,17],[8,3,47],[6,4,3],[5,3,23],[8,2,69],[5,5,14],[2,4,3],[3,8,34],[6,7,26],[3,4,50],[5,7,6],[8,2,43],[2,8,65],[5,2,43],[3,2,14],[3,2,31],[8,3,43],[9,9,4],[7,4,23]],"111": [[2,5,-47],[-8,-8,7],[-2,-4,-21],[7,-9,-9],[-5,3,66],[-7,1,-60],[7,-2,59],[8,3,28],[-5,-6,-56],[-5,8,-56],[-3,-1,-8],[3,-9,14],[2,-3,-71],[3,-6,-17],[8,3,2],[8,-6,-18],[-8,8,31],[-9,-4,-11],[-7,-6,51],[-7,7,15]]},"inter_4": {"000": [[3,8,5,15],[3,9,37,3],[4,4,38,8],[2,4,8,72],[7,8,9,7],[2,2,9,38],[7,6,55,7],[5,9,55,5],[5,3,8,10],[2,4,9,10],[3,9,3,63],[6,8,2,60],[7,2,9,35],[5,8,57,5],[9,4,33,9],[7,8,3,21],[5,7,4,55],[3,3,9,45],[9,8,3,27],[5,3,4,20]],"001": [[6,7,-8,-6],[-3,-7,60,9],[-4,8,58,-8],[3,-7,55,-3],[4,-1,5,8],[-6,7,1,-6],[-6,-8,47,6],[8,7,3,-32],[-8,9,-64,8],[-9,-8,9,-9],[-2,-6,6,-12],[-1,-5,8,27],[-6,8,71,6],[9,-7,-1,-72],[-8,4,1,56],[8,-3,9,48],[-2,5,-17,-6],[4,-5,28,-8],[-8,-3,-7,32],[9,-8,-8,72]],"010": [[4,2,4,7],[3,2,6,27],[3,2,3,6],[3,3,8,26],[2,3,3,3],[4,2,7,37],[4,2,9,41],[3,2,3,5],[2,2,6,15],[4,2,1,3],[4,2,8,37],[4,2,2,6],[2,2,3,4],[3,2,6,9],[2,4,9,24],[4,2,8,39],[4,2,8,36],[2,4,8,22],[2,4,6,5],[4,2,8,37]],"011": [[-1,-9,-14,6],[-1,-2,-1,8],[-8,-1,-1,11],[3,-2,1,10],[-9,-1,1,-3],[-1,7,3,-6],[-8,-1,8,-70],[2,-2,6,21],[3,2,-2,-9],[-2,-2,4,-3],[-4,-2,2,-12],[2,-2,-8,-21],[7,-1,9,58],[8,-1,6,45],[-9,-1,-3,29],[8,-1,6,52],[4,2,8,38],[8,-1,8,65],[-5,-1,1,4],[-8,-1,-7,60]],"100": [[5,2,3,15],[5,5,26,5],[6,5,56,6],[5,4,8,60],[8,7,7,56],[5,5,21,5],[6,2,35,6],[6,4,61,6],[8,3,3,72],[3,6,1,21],[3,6,21,9],[5,5,3,40],[6,6,1,6],[6,3,34,6],[6,5,9,24],[6,6,25,6],[4,6,3,60],[5,8,3,15],[3,8,8,72],[6,3,2,12]],"101": [[-2,2,-6,-40],[-2,-4,-9,-38],[-4,3,-4,-8],[2,7,-64,-2],[7,-3,-64,-7],[7,-3,2,-49],[5,7,-50,-5],[7,2,5,-21],[-4,2,3,28],[5,-4,-7,5],[-9,-1,16,-9],[7,9,1,-56],[-7,-5,-1,-28],[-6,5,-1,36],[-8,8,55,8],[3,6,7,-15],[7,7,-5,14],[-1,7,-4,-3],[2,-2,10,4],[8,-9,-2,56]],"110": [[5,4,8,2],[2,6,24,3],[3,5,31,8],[2,3,6,46],[3,6,8,71],[7,6,5,11],[4,5,5,8],[4,5,27,9],[5,3,21,6],[2,6,29,7],[6,2,14,3],[3,9,27,9],[4,8,8,12],[9,9,8,37],[7,9,7,62],[4,6,23,5],[2,4,19,2],[2,8,39,2],[3,5,2,11],[2,7,48,2]],"111": [[5,-4,-5,-16],[-5,-5,-21,8],[3,-9,-4,-36],[2,-4,-3,-5],[-7,-1,1,47],[6,-3,6,67],[-3,-9,8,9],[-3,8,6,-72],[6,3,-1,4],[-1,7,-35,1],[3,-3,5,3],[-1,9,-56,-9],[3,9,6,-7],[-2,-8,41,-3],[2,8,-4,28],[3,3,-24,-2],[-1,-3,-18,1],[-5,7,13,4],[6,-8,8,56],[-1,4,67,7]]},"inter_5": {"000": [[3,3,7,8,69],[6,3,2,4,18],[1,4,6,6,1],[8,9,7,3,35],[7,3,9,8,58],[6,9,6,3,33],[5,5,6,12,5],[69,4,4,4,5],[63,4,4,6,7],[6,7,3,8,20],[8,2,7,7,22],[39,2,7,5,7],[1,9,9,36,1],[2,6,7,7,2],[2,6,7,57,8],[1,5,8,33,6],[46,3,9,5,7],[8,3,2,5,5],[67,7,8,7,4],[9,9,2,8,9]],"001": [[72,2,-8,8,8],[7,-2,-8,2,-29],[9,-5,-1,-7,59],[11,-7,9,2,-3],[-8,-8,4,-6,8],[8,8,-5,43,-8],[8,-8,6,2,-8],[5,-9,-8,24,5],[-2,6,3,9,-2],[4,-6,3,3,4],[7,2,9,9,-47],[25,3,-9,7,-8],[5,7,-6,4,-9],[5,-7,-3,-3,5],[-9,6,-7,-9,21],[-5,-7,7,61,9],[9,6,-9,62,3],[6,-2,3,-3,66],[-9,7,-3,-3,-9],[-41,-3,3,-4,7]],"010": [[6,6,1,1,8],[3,2,4,3,6],[7,4,2,1,16],[1,4,1,6,28],[9,2,3,7,26],[7,7,1,1,6],[9,3,1,2,22],[7,7,1,1,8],[9,2,1,1,6],[7,9,1,1,14],[2,2,3,2,3],[8,3,2,3,8],[6,3,2,2,4],[5,3,3,1,7],[2,8,1,1,6],[7,6,1,1,5],[1,5,1,1,8],[1,5,1,2,4],[10,7,1,1,8],[3,3,1,4,20]],"011": [[4,-9,1,-4,47],[-35,-4,1,-7,-5],[-5,-9,1,-2,7],[5,-3,1,4,-11],[4,-8,-1,1,1],[-8,-1,-4,-23,6],[5,-1,-4,21,-9],[-53,9,-1,5,-4],[7,5,-1,-3,-5],[8,6,-1,-9,-48],[-9,4,1,2,-3],[40,-6,1,7,7],[9,7,-1,9,64],[5,-5,1,2,-9],[3,-9,-1,7,-66],[-1,9,1,-1,-12],[7,-1,-8,22,-6],[4,7,1,-3,-26],[-8,-1,7,-21,4],[12,2,-4,-5,-7]],"100": [[8,2,6,42,8],[3,3,1,3,9],[3,3,8,17,6],[58,2,6,3,4],[1,6,7,56,1],[67,9,9,2,4],[6,2,7,8,8],[6,9,3,5,24],[12,6,1,1,6],[13,4,1,8,5],[7,8,2,1,47],[9,3,8,55,6],[8,5,6,54,8],[8,6,6,23,2],[9,9,2,2,9],[8,7,8,7,1],[3,8,7,28,3],[25,6,8,4,1],[5,7,6,9,26],[22,5,4,8,2]],"101": [[-3,-8,1,9,-67],[-15,4,-2,-2,1],[-7,-3,3,7,62],[-4,2,8,62,8],[-4,5,-1,-1,-64],[7,-7,7,-63,7],[3,-4,-8,34,-5],[-72,2,6,-9,-6],[-4,3,-7,8,-64],[7,-2,-8,-6,-61],[-14,5,1,-3,-4],[-8,-7,-1,-19,6],[8,-1,-1,-51,7],[-2,2,-6,9,16],[5,-6,9,9,59],[17,-3,-1,-7,-1],[13,5,-3,3,-2],[-6,5,-9,19,-1],[52,6,-4,-6,-8],[-38,6,-1,-2,-8]],"110": [[2,3,5,31,7],[2,3,1,4,4],[45,4,6,9,7],[4,8,9,5,1],[71,2,3,3,8],[3,4,4,12,4],[3,7,2,5,9],[7,4,4,21,5],[1,5,8,3,6],[9,3,3,5,54],[3,8,7,1,1],[4,7,2,2,40],[8,2,8,41,5],[9,2,1,48,8],[6,5,5,1,72],[5,2,6,21,7],[3,5,2,9,25],[7,9,7,6,2],[9,3,6,9,1],[9,5,5,5,1]],"111": [[-58,-7,1,-6,2],[-50,8,-5,-6,-7],[7,5,-3,-5,-54],[-3,5,6,21,3],[7,7,4,-15,-3],[-32,8,-8,-5,-6],[-46,4,-6,9,-5],[3,2,-1,-3,-4],[9,-7,-3,5,1],[1,-4,2,8,28],[15,3,5,-1,-8],[-1,-5,8,21,-8],[-64,-6,6,-5,7],[-4,-4,5,-8,-10],[4,8,-8,-13,-6],[9,-3,-2,37,-7],[-6,2,-1,55,9],[1,6,-9,3,26],[-8,-9,-2,1,8],[6,-1,-8,34,-7]]},"inter_6": {"000": [[4,4,3,6,66],[7,4,4,3,3],[3,7,4,1,13],[2,9,3,2,8],[8,8,7,9,1],[6,6,5,7,1],[9,1,2,22,4],[4,2,1,44,8],[4,9,55,3,7],[8,9,54,6,6],[2,3,31,1,9],[2,8,4,29,5],[5,2,4,67,7],[6,1,8,2,32],[8,5,6,8,56],[8,7,4,9,41],[4,7,8,33,9],[8,6,42,7,7],[2,8,72,6,6],[5,5,8,8,23]],"001": [[-5,7,37,7,-3],[-2,-4,9,-32,-2],[-9,8,-9,-4,5],[-4,6,26,-8,8],[-3,7,7,3,66],[-2,2,1,6,-16],[-1,-5,-1,-55,-9],[-4,-4,-39,-4,8],[2,-8,27,9,-1],[5,-7,4,55,5],[-7,-1,-2,1,15],[4,-4,-6,14,6],[3,-9,-4,-14,1],[-6,1,-1,7,7],[-1,6,1,9,-40],[-3,-3,-5,-5,19],[-9,5,-7,-15,3],[-1,-2,1,8,1],[-1,8,-69,-7,-2],[5,-6,1,3,-22]],"010": [[5,1,8,3,36],[9,1,6,1,58],[5,1,8,6,47],[5,1,6,8,31],[4,2,4,2,12],[7,1,6,2,36],[3,2,1,9,21],[4,1,4,2,9],[2,3,3,5,6],[3,3,6,1,15],[2,4,8,2,12],[2,2,1,11,4],[6,1,8,7,57],[4,2,2,6,7],[4,2,1,6,3],[7,1,2,3,8],[4,1,3,2,12],[3,3,2,1,9],[2,3,3,5,15],[4,1,6,9,42]],"011": [[9,1,-5,8,-35],[9,-1,-9,3,-70],[3,-1,8,8,40],[8,-1,-6,33,-8],[-1,-9,-7,-13,-9],[-5,-1,9,-9,-58],[-3,2,2,-9,-20],[6,1,8,6,63],[-1,-5,-7,2,6],[8,1,-7,64,6],[2,2,-13,8,-9],[4,1,1,5,2],[-8,-1,-7,-61,-1],[-3,1,-3,-21,-4],[4,1,-7,-4,-29],[6,1,6,6,41],[-9,-1,7,66,1],[-4,2,1,-4,-4],[-2,-1,-9,-8,5],[9,1,4,-38,-1]],"100": [[7,1,3,13,6],[4,5,6,5,9],[2,3,8,66,4],[2,5,3,5,61],[4,1,6,35,7],[9,6,9,32,5],[6,5,8,46,4],[6,5,19,9,3],[4,7,27,5,1],[8,7,1,1,9],[6,3,6,45,9],[3,6,12,2,2],[7,3,3,3,3],[5,4,8,6,6],[8,3,11,9,1],[7,2,9,16,9],[8,3,46,1,9],[2,8,7,4,2],[3,2,1,41,2],[7,4,13,2,9]],"101": [[5,-9,10,2,7],[7,-4,-3,-8,-29],[2,9,6,-14,-2],[-8,-7,-4,-5,-29],[-9,7,2,23,5],[-3,3,28,4,1],[-1,-1,-38,-1,4],[5,-5,3,-48,-8],[-2,-5,-6,-41,1],[5,-8,4,-22,-2],[-5,1,47,3,-2],[-1,-9,-8,-8,-9],[-9,-9,8,-7,2],[2,9,3,4,10],[8,9,-2,23,7],[-8,-7,-4,4,-20],[-2,-2,-6,-1,-45],[5,-7,-7,-37,-2],[5,8,6,17,7],[-6,-3,-2,-7,5]],"110": [[2,2,14,8,3],[7,5,1,9,12],[8,2,1,5,21],[2,4,3,71,9],[2,9,7,64,4],[3,1,5,8,43],[6,4,7,51,9],[7,7,3,58,5],[8,2,4,4,16],[4,8,1,20,4],[6,8,1,16,9],[4,6,11,3,4],[2,6,5,7,3],[2,8,2,57,2],[7,9,2,9,10],[4,6,9,7,12],[9,7,7,38,3],[3,9,7,9,39],[9,6,3,5,49],[8,8,3,3,24]],"111": [[-5,-3,1,2,21],[2,-5,50,-6,-1],[2,8,-29,-8,4],[2,-7,10,6,7],[-4,-9,-12,3,-9],[4,-7,-9,2,-53],[-1,-8,4,-9,25],[-6,1,-9,-27,4],[-6,-3,4,2,-8],[2,-1,38,-8,9],[-2,2,37,7,-6],[2,5,-2,-5,-7],[3,-2,-3,66,-1],[-1,-2,-22,-3,8],[3,-2,6,9,-28],[4,-9,6,9,60],[-4,9,16,4,3],[-2,-9,-1,3,6],[-2,2,1,-34,9],[-2,1,7,-5,-16]]},"inter_7": {"000": [[5,2,1,14,7],[1,8,9,19,6],[2,7,9,2,14],[5,6,2,20,1],[8,4,7,64,4],[1,8,6,43,1],[6,5,2,3,63],[7,4,7,7,28],[8,9,2,21,7],[3,6,7,16,6],[9,7,4,7,12],[9,9,2,7,9],[1,5,6,50,2],[6,4,6,4,16],[7,8,9,40,4],[6,7,8,3,21],[9,5,6,8,1],[6,2,7,42,4],[4,8,1,5,52],[3,2,2,31,6]],"001": [[9,9,-9,-47,9],[-5,-5,7,6,10],[-1,-7,8,64,8],[4,-4,-8,-9,-36],[5,-6,-6,60,9],[8,-3,5,17,-9],[6,8,9,69,6],[4,4,4,-7,12],[1,2,9,-47,1],[-8,2,-3,10,6],[2,-3,-8,37,-7],[7,-9,8,-2,-47],[6,-1,1,-29,9],[-8,-3,-9,-56,-3],[-7,-4,-4,9,-9],[-2,-5,2,-8,-32],[7,-4,6,-38,-1],[2,5,8,5,-59],[2,5,3,-29,-9],[-7,-6,-9,-15,-4]],"010": [[3,4,1,3,9],[3,5,1,2,1],[2,2,3,4,12],[1,3,2,9,32],[5,4,1,2,11],[2,6,1,1,15],[1,2,2,4,5],[3,2,1,2,7],[1,8,1,7,58],[1,4,2,6,27],[1,5,1,8,44],[4,2,1,9,16],[6,3,1,2,9],[3,3,2,2,2],[2,2,2,1,9],[1,7,1,7,56],[6,2,1,1,1],[3,2,2,1,5],[4,3,1,3,5],[3,4,1,9,40]],"011": [[-5,-1,2,1,1],[-8,6,2,-9,-59],[-1,3,2,8,21],[7,-1,-1,-6,7],[6,5,-2,7,42],[4,2,-5,9,25],[1,7,1,-1,-4],[-5,5,2,1,9],[-2,-1,2,-8,1],[-5,2,6,9,20],[2,-5,1,2,-8],[-9,5,1,-9,-43],[-1,8,-1,-1,-15],[8,2,-1,5,3],[9,-5,3,-1,2],[4,-6,2,-1,5],[8,6,-1,1,-1],[-4,-3,-3,6,-26],[5,-4,-1,1,-3],[-1,2,-1,-3,-2]],"100": [[1,8,7,43,2],[7,7,8,46,7],[5,4,4,9,57],[7,7,7,65,7],[8,3,9,13,4],[1,5,2,54,6],[7,6,9,3,18],[8,9,7,5,45],[3,5,5,3,71],[4,6,2,9,22],[2,6,3,67,2],[2,8,5,3,66],[6,5,4,4,46],[8,6,6,8,4],[5,4,8,7,28],[4,7,4,46,2],[3,6,4,1,33],[3,5,6,34,5],[8,4,9,2,8],[7,9,6,7,2]],"101": [[-2,2,5,-5,22],[-2,2,5,5,-22],[6,8,9,29,-2],[4,7,-2,17,-1],[-3,-3,-6,-27,6],[1,-3,3,-32,8],[6,-6,-8,-7,-12],[3,-1,9,-5,23],[9,-9,3,9,-9],[1,2,-9,-7,71],[-3,-6,-4,7,21],[-8,-5,6,-9,7],[-4,3,2,7,-3],[9,-7,5,9,15],[-2,-3,8,-4,-14],[7,2,-5,-54,6],[2,4,-5,-11,-8],[-1,-8,1,-18,-9],[8,-4,3,8,16],[-9,7,5,9,-67]],"110": [[3,2,3,37,6],[5,7,8,9,6],[8,8,6,10,5],[6,8,6,8,23],[1,6,6,2,5],[2,3,1,20,1],[9,4,8,1,10],[3,5,9,19,4],[1,8,5,1,19],[2,7,7,3,55],[2,3,1,9,35],[9,9,7,3,48],[5,5,5,2,50],[7,6,5,6,4],[5,6,3,4,50],[2,2,2,8,2],[1,4,1,1,38],[3,3,4,3,36],[6,3,4,6,9],[2,6,6,1,15]],"111": [[-2,2,-2,39,2],[3,-2,-9,-8,-2],[-1,8,-7,-9,14],[8,2,7,-5,-19],[-2,-5,2,5,9],[-5,7,-5,4,12],[-6,3,-1,-7,-4],[-4,-9,-8,3,-4],[3,4,5,-24,-6],[2,-8,-9,8,-65],[-4,-1,-7,40,-6],[1,-6,-4,2,-4],[-2,-7,-3,7,20],[-2,4,-5,24,2],[-8,-5,-3,-21,9],[-4,-4,6,24,-7],[-8,8,-8,-7,-9],[-6,5,-1,21,7],[5,9,-5,-8,-17],[-9,-1,6,-26,-2]]},"inter_8": {"000": [[7,2,8,4,2],[8,8,61,5,5],[9,2,7,4,41],[9,3,5,6,12],[3,5,4,7,56],[4,8,65,4,8],[2,9,24,5,2],[7,5,26,9,6],[8,1,6,7,3],[3,2,3,7,9],[6,7,71,5,3],[2,2,16,4,8],[4,3,6,9,3],[3,6,51,1,1],[3,7,42,9,6],[7,1,7,1,25],[3,3,19,7,9],[3,8,28,1,9],[3,2,9,1,62],[7,4,14,2,8]],"001": [[-1,-2,-6,-8,-42],[-1,9,64,-8,4],[3,-5,-3,2,-48],[3,6,-15,-8,-5],[9,7,45,-4,-8],[7,-5,29,-7,-7],[5,-9,-1,9,67],[-1,-1,-39,-5,7],[8,-1,6,4,56],[-4,-9,4,7,27],[-5,4,8,4,56],[2,1,-5,5,53],[3,7,67,3,9],[9,-7,-8,-7,-2],[9,3,-10,6,9],[3,-8,-66,-3,-9],[5,3,-2,-2,-36],[-1,-4,9,6,1],[3,6,51,8,-3],[-7,1,13,-8,-1]],"010": [[3,1,6,5,9],[2,4,1,1,4],[2,2,8,5,9],[8,1,2,1,8],[2,2,2,4,3],[4,1,2,4,4],[2,1,8,6,7],[2,1,9,6,17],[8,1,6,1,56],[2,2,7,5,8],[7,1,9,1,54],[3,1,1,3,6],[2,4,5,1,2],[7,1,4,1,37],[4,2,9,1,43],[4,2,3,1,8],[2,2,3,1,5],[4,2,4,1,9],[2,3,8,2,25],[4,1,9,1,44]],"011": [[-6,2,5,9,-37],[-1,-7,-4,-3,9],[5,-1,-4,1,-17],[8,-2,9,8,65],[4,4,1,-7,10],[-3,3,-5,7,6],[2,-6,7,5,23],[2,-5,3,5,2],[2,7,5,-8,9],[5,3,2,-9,2],[-6,1,-9,1,62],[3,-5,-4,7,-7],[-5,3,6,9,-37],[-4,2,-2,3,5],[-9,-1,8,-3,-65],[2,-5,-2,1,-6],[-2,3,-6,8,21],[-8,2,-8,7,70],[-3,1,6,5,-9],[-1,-7,-5,2,9]],"100": [[2,4,46,3,4],[9,6,68,1,7],[2,1,38,3,6],[6,4,37,3,6],[6,7,50,7,6],[4,8,35,2,4],[9,1,9,5,67],[2,2,6,3,19],[7,1,8,5,32],[6,8,71,5,2],[7,2,49,2,7],[7,1,9,2,9],[2,5,10,9,1],[4,9,13,8,8],[3,1,8,1,68],[5,7,2,1,10],[8,1,7,7,41],[6,4,33,8,6],[5,6,27,2,7],[4,4,3,7,12]],"101": [[-7,-1,-12,8,-6],[-6,2,3,5,-60],[-9,6,5,3,6],[9,4,-45,-2,3],[3,8,23,9,3],[9,8,6,4,-22],[2,7,3,-7,6],[8,-4,-8,-3,6],[2,-9,-9,-3,45],[3,-7,-6,5,-34],[-7,3,-6,8,3],[2,-7,5,5,19],[-1,9,4,3,-4],[-5,7,1,-2,69],[-3,9,-28,-3,-6],[-3,-4,10,-7,5],[3,2,-2,-5,25],[-7,5,8,2,43],[-6,-4,7,-7,-8],[8,2,13,9,4]],"110": [[8,7,7,1,30],[5,1,13,3,8],[9,5,5,7,9],[5,3,9,6,12],[3,2,5,9,9],[2,5,29,6,2],[9,9,9,7,37],[6,7,16,2,3],[3,2,22,5,2],[7,8,2,4,2],[2,1,44,9,2],[3,8,2,7,1],[7,1,2,5,53],[2,3,50,7,3],[2,9,51,5,7],[7,4,2,7,57],[4,3,3,2,1],[7,4,4,1,67],[4,7,26,1,9],[6,3,1,6,49]],"111": [[-4,6,1,-4,49],[-1,3,37,-3,-5],[2,3,17,-1,-9],[-4,-2,22,8,-4],[-1,-2,-71,-8,8],[6,-9,1,6,39],[-1,-5,-67,5,1],[-3,2,9,1,12],[-4,-7,-10,-8,-7],[-3,6,-2,7,-32],[7,6,8,-1,47],[-1,1,4,-8,63],[3,-7,-5,-8,28],[2,7,-34,7,-7],[-1,9,44,1,-9],[-3,8,7,3,-55],[-1,2,61,6,-4],[-1,8,63,-6,-3],[-2,8,-45,-4,-5],[-2,-5,40,2,-9]]},"inter_9": {"000": [[4,9,3,16,8],[3,5,8,40,7],[5,6,11,1,2],[9,2,5,11,4],[5,6,37,4,3],[4,6,8,2,7],[3,4,29,3,2],[3,6,6,6,6],[6,7,19,9,1],[6,3,3,27,9],[8,8,62,8,8],[6,5,2,9,9],[3,4,1,32,7],[7,8,38,4,2],[8,6,9,6,9],[2,9,3,54,8],[9,8,64,9,7],[8,2,5,25,3],[9,6,9,72,3],[9,2,1,3,6]],"001": [[2,5,9,38,2],[-6,8,7,-46,-4],[5,6,7,17,4],[5,-3,1,-33,-1],[-2,1,32,8,5],[-9,-9,4,36,8],[7,-8,-35,5,-8],[-1,5,-70,2,3],[5,4,-9,-7,7],[-4,5,22,3,-3],[-2,9,-72,8,1],[-9,4,-19,-3,-8],[-2,-7,-15,-5,9],[-6,-5,10,-2,-1],[-7,4,8,-64,2],[7,3,7,-1,9],[-3,6,-62,-4,8],[-4,8,6,-3,-5],[8,5,-54,9,-7],[8,5,-3,-10,6]],"010": [[3,6,2,2,9],[2,7,3,1,9],[4,1,2,1,8],[3,4,1,3,5],[2,5,2,1,2],[2,2,2,4,7],[3,5,2,2,8],[2,5,2,5,8],[7,1,1,2,5],[4,3,2,1,5],[2,1,1,1,8],[2,9,2,3,9],[2,2,2,3,6],[2,6,1,1,7],[2,7,3,3,9],[5,3,1,3,9],[2,4,2,5,1],[4,4,2,1,8],[6,1,1,1,3],[7,2,1,1,5]],"011": [[3,-6,-7,28,-9],[-8,2,-6,-57,-9],[3,-4,-3,3,-5],[5,-1,4,-18,-8],[-2,7,7,5,-7],[-2,9,-2,2,-9],[-3,-6,5,21,9],[5,-1,1,1,4],[-9,1,9,72,-7],[-8,-1,7,60,1],[-1,3,-17,-8,-8],[6,2,-1,-1,3],[4,-2,3,-5,-4],[-9,1,7,59,-1],[6,-1,2,-21,-1],[3,4,4,-15,5],[-2,-5,-8,-23,4],[-2,-9,-4,-2,9],[-1,8,4,3,-3],[4,3,-2,7,6]],"100": [[7,9,50,4,4],[2,2,4,8,5],[5,5,1,31,7],[9,4,18,6,8],[4,9,2,20,8],[4,1,3,18,3],[4,4,27,2,6],[2,1,35,2,5],[4,4,8,64,4],[7,6,2,19,9],[6,2,23,2,8],[8,1,58,1,3],[7,3,3,24,6],[8,6,3,19,5],[8,7,5,54,9],[3,7,9,18,6],[3,6,38,3,5],[6,2,7,6,9],[9,6,8,20,8],[5,1,57,7,1]],"101": [[-3,9,5,43,1],[8,-8,-26,-2,6],[-1,-8,-6,-21,3],[8,-6,54,9,1],[-4,-7,2,-60,-6],[-8,5,4,32,-9],[-2,-4,8,-17,9],[-8,5,8,-50,-2],[-1,2,-7,-57,-1],[-3,7,-2,23,8],[-2,8,-9,30,8],[4,6,-28,-4,-5],[-6,-6,9,54,-4],[9,6,-56,-9,-3],[3,-5,-46,-5,-4],[5,6,-60,3,-3],[-5,-2,-28,4,2],[9,9,1,-9,-9],[4,2,30,8,-8],[-7,-7,38,-4,-5]],"110": [[3,6,22,4,6],[4,8,24,3,8],[2,2,41,7,8],[2,6,7,28,4],[2,3,48,1,8],[9,6,8,27,5],[2,2,29,6,9],[2,4,44,4,5],[7,7,2,62,7],[4,7,8,6,1],[3,7,7,72,9],[5,5,8,2,1],[2,1,5,65,9],[8,6,6,12,3],[9,5,8,9,2],[2,9,49,1,2],[7,9,1,22,5],[5,1,8,59,9],[2,9,39,8,7],[2,7,4,2,1]],"111": [[-1,1,-60,-9,-7],[-8,9,1,10,6],[3,9,6,47,-7],[8,9,-2,-10,-4],[-9,-2,7,-34,7],[-1,4,45,-7,-1],[-3,-4,28,-9,7],[2,-9,3,-55,-7],[7,5,6,-44,7],[-1,4,66,5,-9],[4,-7,-2,7,-3],[3,1,8,8,-7],[8,8,3,-22,-4],[-7,5,-11,-5,-2],[-9,3,4,-47,8],[-2,9,9,38,3],[-1,8,55,-4,7],[2,1,50,-5,-1],[-4,-4,3,58,-9],[2,-5,44,3,-4]]},"inter_10": {"000": [[7,3,51,9,7,7],[4,6,7,4,3,31],[7,4,48,7,9,3],[5,8,45,9,2,3],[6,5,31,2,2,2],[2,2,63,3,8,2],[6,1,9,4,2,9],[8,8,9,5,1,38],[3,8,1,5,3,15],[9,7,8,9,2,38],[6,8,32,8,3,6],[2,9,70,5,9,1],[6,6,20,2,5,8],[6,3,8,7,3,9],[6,9,4,3,1,25],[4,2,9,3,7,38],[9,2,8,8,2,7],[2,9,69,7,6,6],[3,1,5,3,2,12],[6,9,9,3,8,58]],"001": [[8,-6,12,-4,7,1],[-7,-3,-3,8,9,-42],[6,5,-36,7,-9,9],[7,-6,-30,-9,-6,2],[-6,9,1,2,-2,-3],[-3,3,7,3,-2,-9],[-5,7,58,-4,-3,2],[3,8,20,3,6,2],[7,5,-40,9,-1,8],[2,-2,-8,6,-8,56],[-6,3,20,-7,-7,-2],[-7,7,-8,2,-9,-65],[-5,1,-6,8,-9,54],[4,3,27,-6,8,-8],[-2,-7,57,2,-8,3],[3,-3,-47,8,-8,3],[6,-5,8,2,-8,-11],[6,9,-2,3,-9,50],[9,2,4,-2,-8,-27],[-3,8,-15,5,3,9]],"010": [[2,7,14,4,5,9],[6,6,7,7,6,7],[5,8,2,6,6,2],[8,2,7,2,4,30],[8,3,9,2,9,40],[9,1,9,2,8,36],[6,2,9,2,4,26],[9,1,9,2,7,36],[8,2,8,3,3,22],[3,4,2,2,9,7],[9,3,9,4,9,22],[4,1,3,2,4,9],[4,3,9,2,9,22],[2,1,16,7,1,4],[8,3,9,2,9,38],[4,5,2,9,3,1],[2,7,40,9,1,8],[9,3,9,2,9,38],[2,3,25,9,1,6],[6,4,2,2,9,7]],"011": [[2,6,31,-8,-1,-7],[2,-9,25,5,-3,9],[-8,3,1,6,-5,-2],[-1,5,-31,-7,2,-4],[4,3,-9,-1,-9,34],[4,6,-1,2,8,-4],[4,-3,9,-1,5,-44],[-1,8,71,-7,2,9],[-6,7,-2,5,-8,3],[-3,4,14,-9,2,5],[9,-1,9,3,-5,30],[-1,-3,-71,-9,-1,-7],[5,-5,8,4,-8,8],[6,-5,9,4,-6,14],[-5,9,15,8,-5,-9],[-7,3,9,2,-9,-28],[-1,4,-64,7,-1,8],[5,-1,-6,-1,2,38],[-1,-5,-27,9,1,4],[5,2,-6,-1,-7,38]],"100": [[3,7,7,4,2,67],[6,7,4,3,9,58],[5,4,6,7,2,36],[3,7,6,4,1,64],[9,3,4,6,5,29],[2,2,31,9,1,8],[4,5,16,4,4,9],[3,1,50,7,1,6],[5,7,37,3,6,5],[2,4,5,7,1,9],[8,7,5,4,2,10],[5,8,47,3,6,5],[6,4,1,9,7,57],[6,3,33,4,5,1],[8,4,61,6,9,8],[9,1,6,3,4,69],[5,5,9,5,3,13],[7,4,8,4,6,21],[9,4,1,5,3,6],[2,4,5,9,1,10]],"101": [[-5,5,5,-4,-1,57],[2,-9,-13,5,-2,-2],[8,-4,35,-5,-5,1],[9,9,-61,-9,8,-7],[8,2,-18,3,3,1],[5,-7,-32,-2,8,4],[7,3,9,-7,-4,41],[7,-6,4,7,-4,64],[-6,-5,-18,-1,3,-9],[2,5,35,-9,-1,-2],[3,-9,4,3,-6,10],[8,2,42,-7,4,-4],[3,5,-7,-7,-1,-21],[6,-4,8,-9,-6,-40],[-8,-1,-3,2,5,7],[-6,-7,8,-3,4,70],[4,6,-5,7,5,60],[6,-7,-11,-5,1,-9],[-8,2,-3,-4,5,-67],[-6,7,-7,7,-7,44]],"110": [[6,9,3,2,6,45],[2,2,23,6,6,5],[9,2,2,5,3,23],[7,6,7,6,3,13],[3,9,3,4,5,7],[9,2,6,7,7,5],[8,4,5,9,2,2],[4,7,7,3,5,34],[6,6,5,8,5,16],[6,3,19,7,5,3],[2,9,7,9,1,11],[2,3,56,4,3,6],[9,3,5,3,2,24],[6,5,5,2,5,10],[3,5,45,9,3,9],[4,7,14,7,1,3],[9,5,8,4,7,32],[3,8,33,3,1,7],[9,2,7,3,4,26],[5,5,9,2,2,65]],"111": [[9,-3,9,2,-9,14],[2,3,-62,7,-9,-9],[2,4,-8,-1,7,67],[9,4,7,4,-1,39],[-1,4,71,7,6,-8],[-1,3,-34,-2,8,-9],[4,9,6,-5,5,-18],[5,-1,-6,-6,-9,2],[5,-2,-4,-2,1,56],[-3,6,-2,-4,-5,10],[-6,3,-3,2,4,49],[-2,-3,-22,-2,9,-6],[-2,4,-57,4,6,6],[8,-2,3,-4,-4,5],[4,-5,-6,-1,1,-47],[9,-1,-3,-2,-7,30],[6,5,9,-2,7,-47],[4,6,-33,-6,-6,9],[-2,-9,-5,9,9,-7],[-8,-1,-8,-1,-4,-61]]},"inter_11": {"000": [[5,8,4,9,64],[3,4,4,8,59],[5,8,8,9,68],[2,43,3,9,6],[1,8,5,4,32],[9,1,4,8,52],[5,29,6,3,7],[1,18,7,1,6],[4,7,5,9,26],[4,50,3,3,5],[8,30,2,7,3],[4,24,7,2,2],[6,24,9,1,1],[4,3,3,9,47],[9,21,3,8,2],[1,39,8,2,3],[1,9,8,8,9],[3,15,6,6,8],[2,2,6,7,7],[3,42,6,8,7]],"001": [[-6,3,7,-5,17],[6,9,3,6,-25],[8,-2,5,-5,-40],[-2,9,5,7,61],[-1,-5,9,-5,19],[3,-3,8,-3,-24],[-7,58,6,-2,8],[-4,-13,7,-2,1],[5,33,4,7,-9],[8,6,9,8,-42],[-8,-38,6,-3,2],[1,3,7,1,-3],[-7,-62,8,1,-4],[-1,18,3,-7,6],[-4,-10,5,-1,-2],[4,3,7,7,-6],[3,2,2,2,-3],[1,9,7,8,-38],[-1,-46,3,-4,3],[-7,-1,3,8,72]],"010": [[6,50,7,2,8],[1,19,7,1,2],[1,35,4,2,9],[8,4,4,4,2],[9,34,5,3,7],[7,33,5,1,8],[7,20,5,1,3],[1,4,5,1,1],[3,17,3,3,6],[7,3,7,2,1],[7,8,5,3,2],[4,53,7,1,7],[8,12,7,2,2],[7,46,8,2,5],[7,4,4,4,3],[4,24,3,4,5],[6,65,7,2,8],[2,4,8,1,1],[1,9,6,1,3],[4,49,7,1,6]],"011": [[1,18,6,1,2],[-2,-1,3,-3,-1],[5,15,2,-1,7],[4,5,4,-1,-1],[2,58,8,1,7],[2,24,3,3,9],[1,23,3,-1,8],[9,-43,7,2,-5],[8,-18,2,6,-8],[-6,5,6,-2,1],[-3,7,2,-4,-1],[5,-64,8,1,-9],[5,57,8,1,7],[8,-21,5,2,-4],[7,-3,7,2,-1],[-6,-21,8,-1,-3],[1,14,8,-1,2],[-9,-37,8,-2,-5],[9,-30,8,2,-4],[-5,65,8,-1,8]],"100": [[5,59,6,1,8],[1,64,7,1,4],[8,9,5,1,27],[3,4,8,6,23],[5,6,9,5,14],[1,53,8,1,4],[3,2,8,3,16],[5,4,7,1,8],[8,5,9,1,5],[5,68,3,2,5],[7,46,5,5,2],[4,9,9,2,15],[2,6,2,2,7],[3,14,4,1,7],[4,8,4,2,72],[5,4,6,3,70],[9,66,5,2,2],[9,41,4,1,9],[1,3,3,1,9],[2,44,2,2,2]],"101": [[-8,-16,9,-1,-2],[7,8,4,3,12],[2,8,2,3,24],[-2,-28,9,1,3],[7,-1,2,9,-61],[7,-8,4,-1,-68],[9,-18,2,4,-8],[2,-71,5,2,-3],[7,-28,9,1,-8],[9,16,8,1,2],[-9,9,4,-5,-50],[-2,-11,7,5,9],[-8,-3,7,4,-57],[1,9,8,3,-65],[-9,63,7,-9,9],[5,-6,7,4,9],[7,-4,2,7,-37],[2,2,5,8,46],[-2,-4,5,1,-61],[6,26,2,7,-7]],"110": [[3,3,7,1,4],[2,20,5,2,8],[7,46,5,1,1],[8,4,3,9,21],[7,4,4,5,21],[8,7,2,2,9],[9,5,2,8,49],[3,60,6,8,5],[2,7,2,4,9],[6,18,7,5,1],[1,20,7,3,4],[5,30,4,9,6],[5,9,3,4,18],[9,3,5,7,14],[4,21,6,2,1],[2,8,3,3,30],[1,30,6,8,8],[8,15,8,3,7],[8,9,4,3,27],[8,62,3,5,1]],"111": [[-1,4,7,9,1],[-3,5,2,-8,52],[8,-10,2,-8,5],[-1,-29,4,-9,7],[-5,13,6,4,-9],[1,4,2,-3,39],[4,28,7,-1,2],[5,-30,5,6,3],[8,-9,2,5,-37],[8,-45,8,-4,-3],[-8,-21,5,-7,2],[5,-1,2,4,21],[3,26,2,-6,-6],[-7,-1,5,7,-8],[-7,30,4,4,-6],[1,-1,2,-6,-11],[4,28,8,-6,-1],[-4,-68,2,-4,1],[3,1,4,6,22],[3,-5,3,-6,-34]]},"inter_12": {"000": [[8,8,2],[2,2,5],[5,5,2],[6,6,1],[2,4,6],[6,3,1],[7,7,2],[8,2,5],[7,7,2],[9,3,4],[7,7,2],[6,2,4],[4,2,6],[9,9,2],[7,7,2],[8,4,3],[7,7,2],[2,2,4],[6,6,1],[9,3,4]],"001": [[-4,8,1],[-8,4,-1],[7,7,-2],[6,3,-1],[-4,8,1],[4,4,-2],[9,3,-4],[9,3,4],[-4,-4,2],[5,5,2],[4,2,-6],[8,4,3],[-6,2,-1],[-4,-4,4],[7,7,-2],[-8,-4,-3],[8,2,5],[6,-2,-3],[9,-3,-2],[-2,6,-1]],"010": [[2,3,1],[4,2,1],[4,2,1],[4,2,1],[4,2,1],[4,2,1],[3,2,1],[4,2,1],[3,3,1],[2,4,1],[4,2,1],[2,4,1],[4,2,1],[2,4,1],[3,2,1],[3,3,1],[4,2,1],[4,2,1],[4,2,1],[2,3,1]],"011": [[2,4,1],[-4,-2,-1],[-4,-2,1],[-2,-4,-1],[-4,-2,-1],[-2,-3,1],[-4,-2,1],[-4,-2,1],[3,3,1],[2,4,-1],[-4,-2,1],[4,2,-1],[2,3,1],[-3,-3,-1],[2,4,-1],[4,2,1],[-4,-2,-1],[4,2,-1],[2,4,-1],[2,4,-1]],"100": [[6,2,34],[6,6,6],[4,6,40],[9,3,40],[7,2,54],[4,2,63],[4,3,56],[9,2,55],[7,2,54],[6,6,29],[9,2,55],[7,4,33],[4,2,63],[7,8,15],[8,3,11],[2,3,65],[9,2,55],[9,2,55],[3,6,38],[6,2,58]],"101": [[-8,3,-15],[2,6,60],[8,2,-55],[2,-4,9],[5,2,-63],[7,2,-36],[-3,-6,1],[8,8,-13],[-9,-2,-55],[-9,-9,-12],[4,2,60],[8,9,-17],[6,2,-44],[8,-5,-3],[5,5,28],[-6,-2,-38],[9,2,55],[7,2,-18],[4,4,45],[4,6,-40]],"110": [[3,2,9],[3,8,1],[4,5,3],[4,9,1],[6,2,1],[2,7,1],[7,4,2],[9,4,2],[7,4,2],[2,7,1],[9,5,2],[7,3,4],[3,4,3],[2,7,3],[3,2,7],[5,6,3],[4,3,3],[9,4,1],[7,2,6],[2,9,5]],"111": [[7,2,3],[-3,-5,-4],[6,7,1],[4,9,2],[7,-2,2],[-7,2,-4],[-4,-2,10],[-4,7,-2],[9,-2,-5],[-3,-4,1],[-5,-8,1],[8,3,2],[8,-2,-2],[2,7,-1],[4,6,4],[-2,-5,9],[6,4,2],[3,4,6],[7,-3,3],[4,3,-8]]},"inter_13": {"000": [[6,9,9,62],[8,8,3,31],[8,8,4,39],[7,8,8,63],[9,35,3,9],[7,11,1,5],[4,6,7,6],[8,60,7,5],[6,8,8,55],[9,5,6,5],[3,5,7,65],[8,61,7,6],[6,20,3,3],[5,5,3,19],[6,13,1,8],[9,6,2,23],[4,63,7,9],[5,7,4,7],[9,4,4,4],[3,4,3,20]],"001": [[8,-54,8,9],[9,1,6,1],[-7,47,6,4],[-6,34,4,9],[8,1,9,-70],[6,-1,5,-30],[9,-2,-6,53],[6,-6,-9,49],[-7,2,1,2],[8,-9,4,22],[3,-8,6,43],[9,-6,6,-59],[-7,17,2,2],[4,-16,-2,2],[-7,-8,2,7],[9,54,-5,8],[5,-17,3,-3],[9,54,-6,-1],[-5,-2,-9,-2],[-5,30,-8,-9]],"010": [[8,1,1,2],[9,7,1,8],[4,1,1,2],[2,8,5,5],[2,5,4,4],[8,6,1,7],[9,10,1,9],[3,2,2,4],[2,8,4,9],[5,1,2,2],[8,9,1,8],[4,3,2,4],[9,9,1,8],[4,8,1,7],[6,8,1,9],[8,2,1,1],[9,8,1,7],[2,2,3,6],[4,5,1,6],[7,8,1,7]],"011": [[-4,8,-2,6],[-3,6,2,8],[8,2,-1,3],[9,-8,1,-9],[4,6,1,8],[-4,5,-1,6],[3,-1,-2,2],[-3,-5,2,-8],[9,6,1,7],[-8,10,-1,9],[2,-2,-2,-1],[9,-2,1,-1],[9,-1,1,-2],[-3,-2,-3,-4],[-8,1,1,2],[-8,10,-1,9],[-5,4,1,5],[6,1,1,2],[-7,-8,-1,-7],[5,-7,-1,-6]],"100": [[6,3,6,3],[3,8,4,63],[2,1,4,57],[7,3,2,16],[7,18,1,6],[7,68,3,8],[9,1,2,1],[8,4,5,43],[8,58,7,3],[3,54,9,2],[7,71,1,5],[5,33,1,9],[2,33,1,2],[8,5,6,5],[9,65,1,1],[7,8,8,8],[5,5,1,61],[9,3,4,38],[9,6,7,6],[4,7,3,7]],"101": [[-2,-24,-5,3],[-7,-6,-2,33],[-2,-32,2,-7],[6,64,4,-5],[6,4,-6,-70],[2,1,2,19],[-8,18,1,-9],[-8,7,-4,38],[7,-6,-2,-6],[-2,-2,2,-22],[2,8,1,12],[-7,48,-2,9],[4,-4,-7,25],[9,-2,1,-66],[8,23,-1,5],[2,1,2,-65],[7,-8,1,22],[9,61,-6,6],[5,-52,1,-8],[8,-1,1,41]],"110": [[7,5,9,14],[6,14,4,5],[3,9,4,2],[3,3,5,15],[2,55,5,8],[2,57,9,9],[2,58,6,9],[2,56,2,9],[3,42,8,9],[2,55,8,9],[2,18,3,4],[3,34,3,3],[2,6,6,48],[4,22,5,6],[3,40,8,9],[8,12,5,7],[2,58,3,9],[2,55,9,7],[7,8,1,21],[4,21,9,8]],"111": [[2,1,-8,-39],[2,-3,-6,-48],[-2,-6,8,-55],[4,21,-8,4],[2,57,-8,8],[2,-44,9,-9],[9,12,-5,5],[2,58,6,9],[-2,-7,-6,23],[2,8,6,57],[-2,44,5,1],[-9,4,5,-4],[3,-8,-3,8],[4,11,7,-8],[8,19,3,8],[2,2,8,-47],[3,17,-6,-6],[-8,-1,-9,-3],[-8,4,4,3],[4,8,-6,20]]},"inter_14": {"000": [[4,9,7,24],[4,27,1,4],[9,25,1,9],[6,61,1,6],[5,4,4,15],[4,66,1,4],[7,3,3,28],[3,2,8,12],[9,8,2,27],[6,5,2,6],[4,4,5,22],[3,34,1,3],[8,2,3,8],[8,7,3,16],[7,2,4,7],[7,24,1,7],[8,65,1,8],[8,27,1,8],[6,17,1,6],[7,2,4,7]],"001": [[4,9,-1,-8],[2,-4,-4,-11],[-4,-3,1,-8],[-4,-67,2,-8],[7,-58,1,7],[8,3,4,40],[2,5,-2,-4],[-3,-34,2,-6],[-9,-7,2,-9],[4,-9,-1,-4],[-6,4,1,3],[7,-2,2,-7],[-5,-5,2,-1],[-1,20,8,-8],[-3,30,2,-6],[-9,-6,-1,6],[3,-13,-2,-6],[5,31,-1,-5],[8,9,-3,-16],[7,-5,2,7]],"010": [[6,7,9,55],[8,5,1,9],[8,4,1,7],[5,7,2,9],[4,9,2,7],[8,6,1,7],[8,9,3,25],[7,2,2,16],[3,5,5,16],[9,7,1,8],[6,2,9,56],[4,7,1,3],[4,2,7,25],[6,9,1,7],[8,2,5,39],[3,7,1,4],[9,4,3,29],[6,8,6,35],[6,5,8,49],[9,4,7,65]],"011": [[-5,-3,1,-3],[-6,-7,1,-5],[6,9,6,37],[6,-5,-1,-7],[-5,6,3,-14],[8,-2,3,26],[9,-6,1,8],[9,-6,-1,-8],[9,-4,-5,-46],[4,-2,1,7],[-9,8,1,-8],[-4,-3,-2,5],[4,3,4,14],[2,3,-5,-9],[-3,-7,1,-4],[6,2,1,4],[-8,-3,1,-10],[7,-5,6,43],[6,4,1,4],[-6,-9,-1,5]],"100": [[4,2,42,4],[6,3,9,18],[3,2,5,9],[5,4,21,5],[9,6,2,9],[7,31,2,7],[3,23,6,9],[2,17,2,6],[8,5,7,40],[8,7,5,48],[6,3,6,46],[7,9,8,21],[8,57,1,8],[2,9,9,34],[5,5,21,9],[7,29,3,7],[3,5,2,9],[3,3,6,69],[2,7,15,8],[5,4,25,5]],"101": [[-2,-6,-6,38],[-1,-2,-55,7],[7,6,-8,7],[-9,-2,-21,9],[6,6,9,3],[-2,-2,8,37],[3,9,9,5],[8,-4,9,-48],[5,19,3,-5],[-2,-2,-45,-2],[4,-4,4,-51],[3,56,-2,-6],[-1,6,2,-6],[-8,-2,-25,8],[-8,47,-3,8],[-2,-25,-5,8],[-2,-8,-4,-8],[9,3,5,30],[9,5,-3,27],[6,2,2,66]],"110": [[8,39,1,6],[8,9,2,9],[2,3,21,9],[7,3,2,3],[5,3,6,31],[5,3,4,6],[9,32,1,7],[4,15,1,7],[3,4,9,4],[3,5,1,14],[3,25,2,4],[7,4,5,11],[8,6,6,55],[9,25,1,6],[3,2,3,55],[7,4,4,9],[7,3,4,5],[3,4,8,14],[6,3,6,41],[6,7,5,21]],"111": [[9,41,1,7],[3,29,2,7],[6,-51,-1,-7],[7,-39,1,9],[8,53,1,7],[5,31,-1,-8],[-4,-21,-3,9],[-7,-2,8,-23],[-8,2,7,-7],[-5,-71,1,-4],[9,-8,1,7],[-2,-3,21,-9],[7,5,1,18],[2,3,-8,-47],[-8,58,-1,7],[8,-19,1,5],[5,9,5,24],[4,-6,9,49],[4,-10,2,9],[9,3,1,31]]},"inter_15": {"000": [[2,5,4,5],[2,2,9,2],[3,9,2,9],[8,11,2,8],[4,8,8,9],[2,9,3,8],[8,5,4,5],[8,11,2,8],[3,8,6,7],[6,4,2,3],[5,5,8,5],[4,1,8,1],[4,8,8,9],[4,9,3,9],[2,7,6,9],[4,6,2,4],[8,10,2,7],[2,6,8,6],[6,6,4,6],[6,12,2,9]],"001": [[-7,-1,7,-3],[-9,9,8,9],[-6,7,-2,9],[6,-4,2,-7],[-7,8,4,8],[-4,2,-2,3],[-3,-5,-6,-4],[7,-1,8,-1],[9,4,2,4],[5,9,-5,7],[-6,-2,5,-2],[-5,8,-9,8],[-8,9,-4,10],[-8,-7,8,-9],[8,2,2,2],[-3,9,9,9],[7,6,8,6],[-9,-2,-5,-2],[-2,13,2,6],[-5,-9,2,-9]],"010": [null],"011": [[2,5,-3,4],[4,7,-2,6],[-2,-2,3,-3],[4,8,-2,9],[3,-2,-2,-3],[2,8,-4,7],[-3,-8,3,-7],[4,-8,-2,-7],[-3,-7,3,-8],[-4,-3,2,-4],[-2,3,4,2],[4,-8,-2,-7],[3,-9,-2,-10],[3,6,-2,7],[-2,-10,3,-9],[4,4,-2,3],[3,-5,-3,-6],[-3,-3,3,-2],[-2,3,4,4],[-3,9,2,8]],"100": [[9,31,3,9],[2,40,9,5],[2,3,3,9],[4,1,2,22],[6,4,2,37],[9,3,6,7],[6,6,2,27],[3,11,9,1],[2,3,4,21],[3,30,9,8],[9,6,2,41],[6,1,2,11],[5,26,2,2],[9,44,2,9],[8,24,2,9],[4,4,3,2],[3,2,2,14],[2,8,6,38],[9,4,8,3],[4,5,8,3]],"101": [[7,-5,8,-4],[-8,1,3,45],[-8,-58,2,-8],[5,-4,-5,26],[2,-9,6,-30],[9,-51,-2,4],[-2,-9,8,-64],[-5,28,5,-8],[4,-5,2,17],[-9,5,-6,2],[6,14,-5,-8],[4,4,-4,47],[-5,-47,5,-9],[-8,35,5,9],[3,9,-2,59],[-8,6,4,9],[4,-9,8,-7],[-3,44,2,4],[-3,5,6,34],[8,-30,-6,-9]],"110": [[5,6,3,5],[2,16,5,9],[8,5,2,10],[4,4,7,6],[7,3,5,2],[8,10,2,5],[7,12,2,6],[5,8,3,7],[8,8,2,3],[3,4,8,8],[9,1,2,5],[2,4,5,2],[2,9,7,2],[2,9,9,8],[5,14,2,6],[7,9,3,8],[4,5,9,7],[2,2,7,4],[5,4,8,5],[2,6,7,9]],"111": [[-6,-1,5,-3],[2,-21,-3,-7],[-4,-5,3,-6],[-8,13,2,7],[-6,-1,5,2],[3,2,-5,8],[2,8,-3,22],[-4,-1,3,3],[-9,-3,-3,-6],[2,-7,-3,-20],[9,-2,-2,-5],[2,-21,-3,-8],[-5,-11,8,-9],[-2,-8,3,-22],[-3,8,2,22],[-9,-7,-3,-8],[-2,-1,3,6],[-8,-5,-5,-6],[-9,-6,-3,-5],[-2,5,3,21]]},"inter_16": {"000": [[9,2,1,3,23],[8,59,4,2,9],[8,9,3,7,5],[5,40,4,4,5],[5,72,3,1,9],[3,8,9,4,72],[6,6,6,3,15],[9,5,7,5,5],[8,67,4,2,7],[7,3,5,4,11],[6,8,1,4,8],[2,7,7,4,7],[4,6,8,7,21],[7,38,4,6,8],[1,60,7,2,6],[8,5,3,9,21],[7,13,7,4,3],[9,2,2,3,66],[3,57,7,4,3],[2,9,8,2,41]],"001": [[-8,1,1,4,67],[-1,59,7,-5,-7],[6,-5,8,3,-5],[-6,-31,9,-3,-7],[9,1,6,6,19],[-4,-60,2,9,6],[1,1,8,7,-1],[-2,23,-4,2,-1],[-2,-3,-6,4,21],[-2,-9,-8,2,39],[2,-9,8,1,9],[-1,-2,3,-6,54],[8,3,-7,3,3],[-5,-9,-7,5,8],[1,-5,-1,1,-14],[-7,-8,-2,-2,-1],[-6,-4,-7,-5,-4],[-9,-9,3,-7,-1],[3,1,-2,4,-23],[2,-38,-6,-9,-3]],"010": [[8,2,3,8,7],[8,6,9,8,14],[4,9,5,7,4],[6,7,3,5,14],[9,7,7,9,12],[4,7,9,4,8],[3,9,1,8,6],[1,1,9,3,2],[3,5,3,8,2],[1,12,3,9,8],[7,3,6,4,4],[3,2,2,2,3],[2,9,3,1,6],[3,18,7,8,9],[6,8,7,8,11],[7,14,5,9,6],[5,7,9,8,8],[1,5,6,3,6],[1,7,1,6,10],[4,9,3,1,8]],"011": [[-2,8,3,4,1],[9,-1,3,6,7],[-9,-2,-5,-8,-10],[9,-18,-3,8,-9],[7,4,7,5,2],[5,1,-6,-6,7],[6,6,-6,6,3],[-1,2,-7,-5,-3],[3,-12,-3,-8,-8],[5,-3,4,7,-6],[-2,-5,9,5,-12],[-2,-1,-2,1,3],[-3,-9,6,1,-14],[-7,4,1,-4,13],[6,-15,7,5,-6],[-8,12,1,1,6],[-5,-6,-2,1,-3],[-3,4,-1,-2,5],[-9,4,-2,-6,6],[5,3,-3,6,-3]],"100": [[6,2,1,6,34],[6,9,2,6,19],[2,5,4,7,14],[3,68,1,9,3],[8,7,1,7,3],[2,5,1,8,45],[1,25,6,8,1],[6,7,1,5,3],[2,1,7,2,8],[7,10,6,5,2],[4,6,4,9,9],[3,21,6,6,3],[9,8,3,6,8],[7,41,9,8,9],[3,16,9,9,1],[9,68,5,5,5],[4,52,8,7,2],[6,9,2,4,49],[9,7,9,6,7],[2,1,5,4,1]],"101": [[-1,21,-3,6,1],[4,8,1,4,-47],[-2,-6,9,6,-5],[-5,-6,-1,-7,19],[1,55,-3,1,1],[-7,-45,2,-6,9],[-5,9,-5,-9,-5],[5,-3,-9,2,-9],[8,39,1,5,3],[-5,-3,-3,-2,-9],[9,5,-9,-1,5],[4,-2,4,1,5],[6,-4,6,2,-44],[6,12,8,-6,-8],[-3,12,8,2,-6],[9,-2,-1,9,-22],[-9,9,8,1,-9],[6,4,5,7,-44],[-7,1,-2,-8,31],[-1,5,-7,-5,-4]],"110": [[1,8,8,1,47],[6,1,5,1,9],[6,24,8,7,1],[1,9,5,3,44],[7,8,5,2,32],[6,9,7,3,56],[4,4,4,5,14],[8,24,3,9,5],[4,7,2,9,5],[9,33,1,3,1],[2,16,7,6,2],[3,28,6,6,3],[4,53,7,1,8],[2,63,3,8,1],[1,17,5,8,4],[1,8,6,5,33],[1,1,3,7,32],[8,6,4,2,51],[8,67,9,4,3],[3,37,9,7,5]],"111": [[-1,71,2,7,4],[6,6,-6,4,-5],[5,9,2,1,-4],[-9,1,-6,-9,-22],[-6,-3,1,2,-26],[-2,5,6,-1,-3],[-2,11,-6,2,3],[5,58,-2,7,-4],[2,-25,3,-8,3],[1,-26,-8,-1,6],[-1,-7,-7,5,1],[-2,-6,-2,-6,-3],[8,-3,-6,7,-66],[9,-48,-5,7,4],[2,-49,3,-3,4],[6,2,4,1,-22],[-1,-7,3,-5,9],[-5,-17,-6,-2,4],[-4,72,-4,-1,-9],[8,1,-7,7,-44]]},"advan_1": {"000": [[42,7,8,7,9,7,7],[9,6,4,4,9,9,48],[1,8,5,7,3,9,32],[69,4,1,3,3,8,7],[7,7,7,7,9,1,24],[4,6,6,9,5,6,2],[2,2,6,1,4,9,55],[22,2,6,2,7,6,8],[9,4,1,4,7,7,55],[65,8,1,9,7,6,5],[2,4,2,3,3,9,11],[6,8,8,2,7,2,46],[2,7,5,11,9,1,3],[2,9,2,8,8,6,13],[9,9,8,67,2,3,9],[9,3,5,68,6,6,4],[58,5,2,6,8,2,8],[5,4,3,30,5,7,2],[41,3,1,6,7,1,9],[7,9,7,5,4,3,64]],"001": [[1,-4,3,-55,7,3,8],[-2,2,7,1,8,-2,15],[7,7,-8,7,6,8,-8],[7,7,-5,-3,4,2,-25],[-2,-1,4,-4,9,1,-7],[-2,-2,9,5,6,3,46],[6,9,-6,-6,-8,9,-3],[2,-3,8,7,7,-2,-7],[6,-1,-8,-3,-9,9,-1],[-3,5,6,-23,4,-2,-1],[2,5,-7,-65,8,1,8],[2,-7,-5,39,-1,-5,1],[-1,-3,-5,8,-8,-9,-4],[24,9,7,5,-6,-8,1],[-4,-2,-1,3,-1,-4,20],[-34,6,-8,-5,-7,9,-8],[-16,-2,-5,7,-6,-9,5],[8,2,-2,36,3,5,-5],[6,9,-5,-35,-4,-4,1],[54,-3,5,-4,-1,-5,-6]],"010": [[5,2,9,30,9,3,8],[2,5,1,2,3,3,6],[4,2,9,39,9,3,9],[30,3,5,2,7,3,5],[16,4,2,3,5,3,5],[5,9,1,6,3,2,20],[58,4,5,4,8,3,9],[1,5,1,10,6,2,9],[9,4,8,9,8,3,5],[4,2,9,32,8,3,8],[1,2,2,37,8,1,9],[3,9,3,5,2,9,25],[63,2,3,7,9,1,9],[6,5,1,9,2,4,28],[6,7,4,8,3,8,23],[8,8,1,8,2,7,37],[5,7,6,2,9,4,2],[2,2,3,7,3,4,3],[1,9,4,8,6,5,13],[34,4,2,3,7,2,7]],"011": [[4,-2,2,17,9,-1,-3],[6,6,1,9,-1,1,-55],[3,-9,1,-7,2,-1,37],[7,3,3,2,8,2,1],[-29,3,9,7,-9,-2,1],[12,-9,-9,-3,9,8,5],[-57,-8,4,4,9,-3,-9],[5,2,-5,20,-6,3,-9],[-2,-4,-1,8,-1,-7,42],[-9,2,-9,5,3,-8,-1],[-1,-1,-5,58,-7,-1,8],[-5,6,9,-1,-8,-7,2],[5,6,-1,-9,-1,2,46],[6,3,3,-4,-5,-1,3],[-32,-8,-4,2,-6,-4,7],[47,5,-4,-7,6,-4,3],[-6,-1,-9,-68,7,1,9],[37,7,-1,-1,-9,1,-3],[1,8,2,-6,-1,-9,55],[3,9,-6,-5,-5,9,10]],"100": [[4,9,4,29,7,4,7],[8,8,2,69,6,8,8],[63,5,1,4,3,2,6],[6,7,5,5,2,7,52],[5,4,4,7,9,6,29],[4,4,3,8,5,2,8],[58,5,2,6,9,1,6],[4,3,2,6,2,4,2],[5,5,8,4,7,6,29],[9,6,2,32,7,5,9],[28,6,3,5,8,3,2],[5,9,7,4,4,5,64],[9,8,2,19,9,2,1],[60,2,4,9,6,3,8],[48,3,8,5,7,9,9],[1,9,1,8,8,2,24],[1,4,3,14,9,1,4],[5,7,5,2,4,8,1],[7,8,9,2,7,8,1],[4,8,6,60,4,7,6]],"101": [[-44,-1,-1,-8,4,1,-3],[-7,4,-1,9,-3,1,21],[47,3,-9,1,-5,8,3],[-5,4,-6,6,-7,3,-43],[-7,-5,-1,-3,2,-1,-38],[-5,7,-4,45,-6,4,1],[-6,4,-5,-32,6,-3,-8],[-4,7,5,34,-9,-2,8],[-4,-7,4,5,5,-3,-65],[-9,-5,-9,-1,-7,-8,-34],[-9,-7,-7,-2,-1,-8,36],[3,4,-9,-9,3,-5,-46],[4,9,-5,8,-8,5,8],[8,-8,-9,3,7,9,8],[-64,8,5,6,-2,-1,8],[-4,2,1,6,4,-2,-63],[68,3,-9,-7,4,-6,-7],[6,3,2,-6,-5,-1,2],[-8,3,1,-58,-5,-1,-2],[5,7,6,-9,-5,-9,-34]],"110": [[9,5,2,8,7,8,21],[7,3,5,6,9,3,8],[3,8,3,2,2,1,43],[4,8,1,15,3,6,9],[9,6,7,7,7,5,6],[7,9,9,8,8,4,7],[8,9,1,16,7,5,8],[36,4,3,8,3,9,4],[5,9,7,12,6,7,6],[2,2,8,56,7,9,6],[3,4,4,8,3,7,14],[3,5,8,21,7,6,7],[4,4,1,6,5,8,23],[16,7,1,1,5,1,2],[6,7,1,16,3,4,8],[2,5,4,9,2,2,65],[24,6,2,5,3,9,9],[7,3,7,6,2,5,34],[2,3,9,43,5,2,9],[1,7,7,9,8,5,6]],"111": [[3,-1,7,-52,3,-8,3],[1,3,-9,-8,7,5,-8],[-3,-6,9,5,-1,5,-62],[-6,5,4,-17,5,-9,-1],[18,8,1,4,-3,-9,6],[1,-7,-3,9,-3,4,53],[-3,-3,7,41,-9,8,5],[4,-1,4,3,-1,9,-67],[7,-6,3,8,-1,-8,-57],[-41,-9,4,-1,5,1,3],[-9,5,-2,2,-2,-4,25],[4,-3,9,-1,-6,-6,4],[-2,7,4,-5,-2,5,-17],[-3,-1,-9,13,8,-6,9],[-3,-3,5,-30,9,8,1],[-7,-7,6,2,-1,-7,54],[-64,-2,-5,9,5,-4,-7],[-10,6,-2,-2,4,-6,-4],[4,-2,7,-67,-5,5,-9],[-3,6,3,-4,6,1,-2]]},"advan_2": {"000": [[8,6,4,3,5,9,14],[9,9,2,7,6,5,11],[7,8,8,20,8,7,5],[8,9,1,5,7,1,5],[1,8,5,2,5,5,16],[7,9,2,4,4,7,6],[2,3,5,48,6,6,5],[2,9,4,2,5,3,45],[9,5,4,4,3,5,2],[4,7,9,3,8,6,24],[2,9,9,3,6,9,19],[3,5,4,2,8,3,2],[3,4,1,39,3,8,1],[5,6,7,15,3,7,4],[3,2,4,2,5,6,35],[5,4,6,7,6,3,12],[8,3,3,7,8,9,37],[4,3,3,63,6,5,6],[6,5,6,14,7,5,9],[3,3,6,9,2,3,51]],"001": [[-5,5,-1,58,-9,6,2],[6,-7,-1,-16,5,7,-4],[3,6,-8,-7,4,8,28],[-9,2,2,-21,-2,9,-5],[-8,-6,-1,-6,6,4,-33],[7,3,-6,2,-7,8,57],[-3,5,6,51,7,-6,-3],[6,4,1,-72,8,9,-5],[6,-3,5,-1,6,-4,18],[4,8,-1,7,7,-2,18],[8,5,1,1,-2,-5,5],[1,-6,2,4,5,-1,-12],[-1,-5,7,12,2,-6,6],[2,4,-8,3,9,2,-20],[-1,6,-1,5,-4,3,-5],[4,-3,-7,-50,7,6,2],[-3,-6,-5,9,-8,-1,21],[-8,-1,-9,-1,-8,-7,48],[-7,6,4,3,5,2,12],[-6,7,7,40,-4,9,9]],"010": [[9,3,7,9,5,5,4],[4,2,1,22,9,1,4],[3,7,2,3,6,4,5],[9,2,2,40,8,1,9],[3,8,6,2,6,9,3],[1,9,2,8,2,6,39],[8,2,4,24,6,4,9],[7,2,1,35,8,2,9],[9,9,2,9,2,9,38],[8,2,2,44,9,1,9],[2,2,2,5,2,6,7],[6,2,2,34,8,2,9],[7,8,8,2,7,9,3],[4,8,5,7,7,7,9],[9,9,2,9,2,9,37],[8,7,5,3,9,5,2],[4,5,2,14,9,2,7],[1,5,1,5,7,2,3],[2,9,7,5,8,7,5],[8,7,3,8,3,8,21]],"011": [[-8,-5,-8,-5,7,5,3],[9,4,8,8,-8,-4,-5],[-4,9,3,-7,2,8,-36],[-5,-9,-2,-7,-1,-8,-54],[9,-1,1,-39,-5,-2,-8],[-3,2,7,-31,7,1,-8],[6,-7,3,-9,2,-6,32],[8,-2,7,4,7,-2,-1],[1,-8,5,-2,8,-4,1],[1,-4,4,-4,-4,2,-2],[5,5,-3,-6,-1,3,38],[-8,2,7,-7,6,2,-3],[5,-8,-2,-9,-2,-6,-39],[-6,-9,-1,-4,2,-1,22],[-5,-1,-8,54,-5,-1,9],[-2,-6,-9,2,9,5,-1],[-2,-2,4,36,7,-2,-9],[-5,-1,-5,-66,9,1,7],[-9,-2,-4,16,-6,1,4],[1,8,2,-6,2,7,-23]],"100": [[9,3,4,8,6,4,7],[3,5,6,7,5,6,19],[3,2,5,5,6,3,30],[9,6,7,9,5,9,12],[1,3,6,43,9,3,9],[1,6,4,39,6,5,4],[2,9,7,15,4,7,6],[2,2,5,4,2,8,16],[7,7,1,48,9,2,8],[1,9,2,9,2,5,18],[1,4,8,8,5,6,58],[4,2,9,6,2,8,36],[2,8,4,29,8,3,9],[6,6,6,7,6,9,71],[1,9,6,31,2,8,3],[7,8,5,4,3,8,3],[7,3,1,46,9,1,6],[9,5,3,8,7,3,13],[6,2,9,14,2,9,2],[4,7,1,6,4,3,24]],"101": [[-8,6,5,-1,7,3,11],[3,4,3,-20,2,8,8],[-2,-7,-9,23,-3,3,7],[4,7,-5,-41,9,-4,-3],[9,-7,9,4,-5,7,-40],[-2,-8,-9,-19,-6,-5,8],[8,-9,4,-56,4,-5,-8],[7,-7,-3,-18,5,5,9],[8,-8,1,-9,-4,-1,35],[-8,9,1,-14,6,4,2],[3,-2,3,1,-8,2,49],[-9,-1,-1,41,3,-9,-1],[7,-8,-6,-38,8,1,-9],[-9,-2,-4,6,-3,-1,68],[-2,8,1,-72,8,2,-7],[4,-1,-3,-5,-3,-4,-30],[1,6,-5,-38,-3,5,-8],[5,6,-2,-1,-9,-2,9],[4,5,5,-29,-6,-4,5],[-4,-9,-1,63,-9,6,4]],"110": [[8,2,7,45,6,3,8],[2,2,3,1,3,7,26],[1,2,8,33,8,8,4],[1,3,8,25,6,6,6],[6,5,9,4,2,8,55],[2,4,8,16,7,7,5],[8,2,8,39,5,7,1],[4,5,8,8,2,8,28],[3,3,1,16,2,9,7],[7,2,1,9,9,5,11],[1,8,5,9,8,2,21],[7,8,3,9,2,8,24],[8,8,2,4,3,6,42],[9,6,5,9,5,6,29],[4,2,2,65,6,6,9],[1,3,5,4,9,7,3],[4,2,4,12,7,4,5],[4,7,2,9,2,1,71],[9,2,6,47,3,4,5],[2,9,1,6,2,1,49]],"111": [[5,-1,6,-6,-1,-7,-65],[-8,9,1,8,-1,6,-45],[2,-8,5,21,9,-6,-9],[-3,-4,-7,-8,-9,7,1],[-5,-3,-1,-38,-5,-9,-8],[9,2,7,-43,-5,2,8],[2,9,2,-6,-5,-6,26],[-1,9,3,-8,-2,-9,55],[-4,-1,9,56,-8,-7,-4],[-5,-3,2,-26,-3,2,1],[3,-5,1,25,-7,8,6],[6,6,3,9,3,-5,45],[-1,-5,9,26,-9,8,5],[5,3,2,37,6,9,9],[2,3,-4,-6,4,-8,-26],[3,-5,5,2,2,-3,-25],[7,-7,2,-4,5,-7,8],[-4,-3,7,-7,-2,-8,39],[2,-9,8,-8,2,-7,41],[-3,8,-3,-1,-1,5,5]]},"advan_3": {"000": [[2,8,5,24,6,7,2,2],[4,9,3,6,3,2,3,29],[4,4,3,60,7,9,4,3],[8,2,2,9,3,5,9,58],[8,8,8,4,9,6,3,56],[20,5,9,9,2,7,6,8],[17,5,2,9,9,2,7,5],[5,2,9,20,2,7,5,1],[6,6,8,3,2,7,4,6],[6,6,2,5,9,7,6,33],[2,4,8,8,8,2,9,2],[31,5,3,1,9,9,1,6],[1,8,3,4,9,2,3,48],[9,3,4,5,1,4,7,6],[1,7,9,9,9,2,7,32],[4,4,7,8,8,4,1,45],[7,9,2,2,7,6,8,35],[58,4,9,8,3,3,2,3],[4,7,4,2,2,5,9,34],[9,8,5,3,4,3,8,7]],"001": [[1,-7,-4,63,5,4,-9,8],[-8,7,-6,9,-5,-3,-8,2],[-4,-4,6,-4,-6,-4,6,9],[2,7,-9,-32,-4,-6,5,8],[-3,7,3,-5,2,4,-6,12],[-3,-2,-1,36,-6,-5,1,2],[6,7,8,2,1,6,3,-46],[43,3,-8,-3,8,3,-8,-2],[1,-1,-3,2,-1,-5,9,59],[-9,-4,-2,-1,-5,-1,-7,-19],[-2,-6,-2,-6,9,8,-6,-34],[-8,4,6,9,-7,-2,-9,-53],[-9,-5,-1,-55,-5,8,-4,7],[5,-4,1,11,2,3,6,3],[-8,-2,4,5,-9,-8,-2,-9],[8,3,8,-39,4,-1,6,5],[8,-5,-7,11,-5,7,-3,2],[8,-7,4,-8,1,-6,3,-7],[-1,6,8,-28,-2,7,5,-7],[-3,-2,-7,-1,-3,5,3,1]],"010": [[9,9,2,1,2,2,4,12],[3,6,7,13,6,8,4,9],[1,7,4,6,3,2,9,23],[4,5,4,1,5,3,3,4],[3,2,8,23,5,6,3,9],[1,5,6,8,9,8,2,4],[6,2,2,37,5,8,1,9],[6,9,5,6,3,4,9,14],[24,2,2,6,1,5,1,9],[18,8,5,1,4,6,7,3],[24,2,4,5,8,3,1,9],[3,2,6,42,1,9,2,9],[3,2,8,22,1,8,1,6],[4,9,9,9,3,9,9,9],[3,2,6,1,2,2,1,2],[3,5,3,2,1,4,5,2],[30,9,8,1,8,7,8,5],[5,2,2,9,3,6,1,5],[56,4,4,2,9,8,2,9],[9,5,6,8,7,2,7,28]],"011": [[-4,-4,-7,9,-2,-6,-6,8],[9,-5,-5,1,-3,-5,-7,-2],[35,9,-2,-1,2,7,-4,4],[-8,2,-6,7,-6,-2,5,-2],[27,5,-7,1,-5,3,-8,9],[-1,-1,8,7,9,-2,6,1],[5,-2,-6,-32,5,8,2,8],[5,-2,4,16,-4,-2,1,9],[-1,8,1,-8,-4,-3,-7,23],[-8,4,-7,-3,1,-5,5,3],[-7,-1,-3,49,-7,-9,-2,6],[71,6,-5,-4,6,8,-4,5],[-6,8,1,-6,1,7,2,-9],[44,-3,5,-8,-4,-8,2,-8],[-16,-1,-4,9,7,5,-2,-6],[-38,2,8,2,-7,4,5,-9],[-4,-9,-3,-9,2,-4,-7,-21],[51,-8,-6,6,-5,-6,-8,1],[-7,8,-3,-9,-4,-2,9,42],[9,-4,-3,5,-1,5,1,-1]],"100": [[2,8,4,8,2,9,4,20],[9,2,1,14,1,2,1,6],[9,6,5,18,7,4,5,9],[1,9,7,15,8,7,8,8],[8,8,7,8,9,7,7,8],[32,2,3,5,5,3,1,6],[2,5,8,3,5,8,3,42],[7,9,6,42,1,5,3,1],[6,4,2,3,3,9,1,10],[9,8,9,3,3,8,2,24],[2,3,3,5,1,3,3,4],[5,5,5,1,7,4,4,23],[8,2,4,9,7,3,5,60],[7,3,4,5,9,7,1,2],[3,6,9,8,3,7,7,3],[70,2,7,7,6,6,1,8],[5,4,4,6,5,9,3,21],[2,6,3,21,4,2,2,4],[8,9,4,17,5,9,5,7],[5,3,1,11,1,6,3,9]],"101": [[-8,-8,-5,-47,6,-6,-2,1],[8,9,-3,7,-9,7,-2,-27],[-3,-5,-7,-46,1,-1,-6,-3],[9,3,2,1,4,5,-3,50],[1,-1,4,-9,9,5,2,2],[-55,-8,1,1,7,-6,9,4],[-22,-5,-6,-8,7,3,8,3],[8,7,4,11,9,-5,-4,-4],[-25,3,2,-4,8,5,-1,-8],[-8,-2,1,3,-3,9,1,-38],[-9,4,9,-5,1,-2,-2,-32],[-35,-9,7,-3,-4,-6,9,8],[30,7,4,8,-3,-6,-5,-5],[-10,-6,4,2,5,3,-9,-4],[8,-2,9,19,7,-6,4,-3],[19,-2,-5,-5,-1,7,1,3],[3,-4,4,-35,-9,-4,4,7],[6,-5,4,-23,4,-1,6,5],[5,9,2,6,-2,-1,-3,9],[71,-5,9,1,7,6,-6,-5]],"110": [[2,7,3,6,9,9,7,9],[9,2,7,69,4,8,8,9],[8,9,2,9,7,5,9,37],[4,3,2,48,7,8,8,7],[29,5,1,1,2,6,1,8],[2,6,9,9,7,2,9,67],[39,6,2,2,3,3,6,4],[1,2,3,41,2,6,5,4],[5,6,7,1,7,7,4,1],[28,5,9,9,2,5,2,1],[2,5,4,8,8,6,5,17],[7,9,8,8,5,5,1,2],[9,4,2,28,5,6,5,7],[2,8,2,7,2,3,4,45],[7,2,2,66,5,8,2,6],[1,6,7,10,1,3,3,1],[9,3,6,39,4,8,7,5],[2,5,4,9,1,5,6,26],[6,5,7,1,5,4,4,7],[8,2,6,21,4,7,4,6]],"111": [[-9,3,-1,-5,-7,-5,5,14],[-5,4,-1,-9,1,7,4,-7],[4,3,8,-2,3,-8,-6,4],[-1,-3,-6,-5,-5,-1,5,-66],[-55,-3,-1,-6,1,3,-4,3],[8,-4,6,-19,-5,-9,-8,-6],[3,-2,3,56,5,4,2,-6],[22,-5,-6,4,-5,-8,8,3],[9,-3,-8,-50,1,-9,-5,-8],[68,-1,-6,7,-9,3,-7,-8],[-5,-8,-6,1,6,2,8,8],[5,-3,8,57,-5,9,4,-9],[-16,8,3,7,8,-9,3,4],[-41,8,-7,3,4,-1,-8,7],[-4,-2,-3,-57,8,-5,1,-3],[-4,2,4,27,5,-5,9,4],[23,2,4,-2,4,4,6,-6],[-4,8,-4,-1,8,-3,-4,37],[7,-2,2,-55,-4,6,7,7],[-68,-5,5,2,5,3,6,5]]},"advan_4": {"000": [[4,3,9,3,2,5,69],[9,5,5,9,3,7,36],[7,3,8,5,8,2,5],[3,8,28,8,6,8,4],[2,7,2,4,9,26,8],[4,1,5,9,7,28,4],[5,4,1,8,1,25,9],[3,5,2,6,7,6,42],[3,4,15,7,6,2,5],[2,1,8,9,2,1,5],[6,4,6,9,8,3,63],[2,1,55,4,3,1,2],[7,8,6,9,3,9,40],[8,6,6,9,6,8,18],[9,6,8,8,3,3,18],[7,5,2,5,5,1,19],[9,3,63,8,9,4,5],[6,9,7,9,4,16,6],[8,5,5,2,6,7,2],[8,9,6,2,5,21,8]],"001": [[-7,2,-6,-1,3,-3,62],[7,7,8,7,1,31,-7],[-9,-1,-6,6,1,-7,-3],[5,7,8,-5,-7,-1,-25],[-6,4,-25,-1,-6,-3,-9],[-8,1,-9,9,-6,6,64],[-6,-8,-8,7,-2,-32,-6],[4,6,8,-9,-6,-32,8],[-1,-4,64,3,9,9,-6],[5,-3,3,6,-9,-24,9],[-6,6,-5,4,-3,1,-14],[-4,-4,50,-5,7,-5,-4],[-1,4,4,4,8,7,52],[-5,-9,7,3,-4,-6,-20],[2,9,3,-2,7,3,-4],[-4,2,-8,-4,-7,-4,8],[-9,4,3,2,6,35,-5],[6,9,-33,-1,6,-7,1],[-1,-3,-2,2,-1,6,23],[7,-4,-6,-1,-1,67,-1]],"010": [[3,1,1,2,1,2,3],[5,1,9,2,2,5,52],[4,1,5,5,1,2,23],[2,2,9,4,1,9,59],[2,1,7,4,1,1,9],[2,1,5,2,3,3,9],[2,1,1,2,1,2,9],[2,2,7,2,2,2,9],[2,2,1,2,1,6,16],[2,2,6,2,2,1,10],[4,1,4,2,1,7,37],[2,3,3,3,1,1,6],[4,1,6,3,1,1,33],[3,1,1,2,2,6,9],[7,1,8,2,1,2,66],[2,2,9,2,1,5,20],[3,1,4,2,2,3,12],[2,1,5,6,1,1,9],[2,1,4,3,2,2,7],[3,2,1,2,1,3,4]],"011": [[5,-2,4,6,3,-3,-4],[-1,4,-48,-4,-2,8,9],[-4,-4,-5,3,-4,-6,-1],[5,-3,-6,-1,-6,-17,-9],[-8,5,3,5,9,-1,-26],[-9,2,5,4,4,-5,-58],[-6,-6,1,6,-7,1,-4],[2,7,3,3,-6,-3,4],[-1,4,58,5,2,9,-4],[7,3,6,2,-8,-24,-7],[-9,-1,-7,3,-2,-22,-7],[-1,8,-61,6,2,-9,-2],[7,-3,-1,2,9,-7,-28],[-1,4,-51,5,-1,-8,3],[8,6,-5,8,-7,5,2],[-2,5,40,7,1,9,-9],[9,-3,-1,-9,-4,-1,-1],[7,-1,-5,8,2,-3,-60],[-1,1,9,3,-2,-1,-9],[2,-5,-4,3,6,1,2]],"100": [[8,9,1,2,4,2,12],[6,3,2,7,5,14,4],[7,6,4,5,3,30,7],[5,1,68,9,5,7,3],[3,4,5,4,4,1,47],[2,1,72,6,2,7,4],[3,7,8,6,3,4,48],[8,2,66,4,5,5,8],[7,6,6,8,7,8,8],[8,1,2,4,4,4,8],[8,3,4,2,5,20,4],[7,5,9,5,5,5,28],[4,4,5,5,7,59,9],[9,1,1,9,7,8,9],[2,6,38,6,3,8,4],[8,6,5,7,5,7,6],[9,2,8,4,1,5,4],[2,1,61,6,8,6,8],[4,7,13,7,1,3,3],[3,3,34,2,4,3,6]],"101": [[-9,3,-3,8,6,10,2],[-8,9,-2,-5,-1,-64,1],[-2,-9,-51,2,2,1,-6],[5,1,-9,-4,3,-19,-4],[-8,1,61,-9,9,-5,2],[-5,7,49,3,-7,8,3],[3,6,-5,7,-4,-14,-3],[-4,-6,-7,4,-8,6,4],[7,-6,-9,-5,-3,24,6],[-7,-1,-3,7,3,72,-7],[6,-6,-47,-7,4,6,-4],[-8,4,4,5,-9,-72,-7],[-1,4,-6,-5,3,5,57],[6,-5,7,-6,-7,-5,36],[7,5,1,8,4,-5,-33],[3,9,5,-4,2,8,21],[7,-7,-53,5,-9,-2,-5],[-1,7,38,-1,-8,-3,-7],[3,-4,8,-3,-8,7,-21],[-9,-6,-3,6,3,33,9]],"110": [[6,5,13,4,2,6,8],[9,5,3,6,9,7,57],[4,9,2,2,6,40,4],[2,9,50,5,8,1,8],[8,2,5,6,7,3,10],[3,1,22,8,9,3,4],[3,7,26,7,1,4,9],[2,4,3,9,9,9,36],[8,1,7,9,4,8,33],[2,8,36,8,2,2,8],[6,3,2,7,9,9,8],[6,6,2,8,5,4,3],[2,6,50,5,6,1,8],[9,2,5,4,6,10,5],[6,3,9,4,2,3,2],[3,9,9,2,2,39,6],[2,6,6,9,2,2,8],[2,5,6,2,3,23,9],[6,4,7,8,9,1,3],[9,7,1,2,5,39,4]],"111": [[-7,-4,-3,-1,-6,-8,64],[-4,2,3,-4,7,-22,-5],[6,-5,-7,-2,2,-52,-3],[-7,-4,-4,6,-5,-21,-3],[-6,-8,-4,-2,8,-8,-10],[9,7,2,-3,4,-3,42],[-3,2,2,-5,2,4,9],[-5,6,-9,-1,9,61,-8],[7,-1,-6,-2,7,-26,-6],[-9,-1,6,-8,8,3,-2],[2,5,-68,4,-3,9,-1],[3,-6,-2,-1,1,-65,-5],[9,-8,-4,9,5,-2,-3],[-3,3,31,9,3,9,3],[2,-3,69,-6,-9,7,8],[-8,4,-9,7,9,6,31],[-5,-9,-2,6,7,-2,16],[-2,9,6,2,-3,37,5],[7,8,-5,5,6,24,-3],[-1,-5,8,-3,-7,-16,6]]},"advan_5": {"000": [[6,2,6,4,2,3],[5,1,2,5,66,7],[2,29,3,4,6,2],[7,31,9,9,7,5],[3,4,8,6,38,4],[3,66,9,8,5,5],[3,6,3,9,38,5],[5,14,6,3,7,5],[1,8,9,2,3,5],[1,6,9,3,2,3],[5,5,9,4,8,8],[1,3,2,4,13,6],[7,2,9,3,2,3],[9,9,5,4,38,6],[7,7,8,7,28,5],[1,59,9,2,6,2],[2,36,7,8,6,5],[4,4,9,4,4,3],[5,24,9,6,8,6],[8,46,9,2,8,4]],"001": [[9,-1,5,-6,38,2],[3,37,8,8,-1,4],[8,-2,8,-2,35,4],[6,3,6,-7,68,4],[-4,28,7,5,8,2],[1,-6,4,6,-40,8],[-4,-8,3,1,64,7],[-5,1,3,-4,68,8],[5,3,7,9,12,6],[-1,57,7,2,5,3],[-7,28,3,-2,8,4],[-5,68,4,-7,-2,2],[6,5,4,-8,30,8],[-2,1,3,3,3,9],[-4,72,4,6,9,3],[1,-20,4,-2,-8,8],[-9,-3,5,-9,-27,9],[3,-5,4,3,6,6],[-8,54,6,-1,-3,4],[6,5,5,-3,-45,6]],"010": [[9,43,9,3,9,2],[3,7,6,4,8,7],[3,6,3,4,9,6],[4,6,2,8,21,6],[8,24,5,5,9,2],[2,24,7,1,7,2],[1,9,2,9,43,9],[1,9,2,5,28,6],[3,7,3,7,21,8],[5,2,9,3,1,5],[2,8,2,6,40,9],[7,7,5,9,7,6],[2,18,3,2,9,2],[1,8,2,2,39,9],[6,10,3,3,4,2],[9,3,9,5,1,4],[1,8,2,7,40,9],[1,5,2,8,22,9],[1,9,2,1,41,9],[8,22,5,2,8,2]],"011": [[2,-8,2,6,-40,9],[-1,8,3,-1,21,8],[-8,30,9,-2,9,3],[-4,-7,5,-1,-5,3],[-4,-34,7,-2,-9,2],[1,-13,3,-2,-8,2],[-7,-25,9,-1,-6,2],[5,8,3,9,21,7],[-4,-19,6,-1,-9,3],[-7,42,9,-1,9,2],[1,9,2,4,22,5],[3,-2,9,2,-1,7],[4,28,6,2,9,2],[-9,-32,7,-2,-9,2],[-2,9,2,-8,39,9],[1,9,2,7,23,5],[-9,-2,9,-2,-1,3],[-1,7,3,-2,21,8],[9,37,9,3,8,2],[5,-6,8,6,-7,9]],"100": [[9,36,8,9,9,9],[4,52,2,3,9,4],[8,4,6,6,8,7],[3,31,3,6,6,9],[8,19,3,9,2,4],[2,22,5,5,1,8],[8,5,9,2,41,3],[6,59,5,8,2,6],[3,24,6,1,1,3],[1,6,7,6,3,9],[1,5,9,2,54,6],[2,36,3,5,2,6],[3,5,8,1,8,9],[9,23,4,9,3,6],[5,9,2,9,9,3],[1,58,5,5,2,7],[9,1,2,5,35,8],[3,7,3,7,13,6],[7,4,9,2,24,6],[4,2,8,5,4,4]],"101": [[-4,5,9,2,4,2],[-2,52,5,-4,8,8],[2,-2,5,-5,5,6],[4,-4,9,-6,6,2],[-9,-1,2,7,-2,4],[-6,5,4,6,-62,8],[9,-9,4,7,10,5],[3,-5,4,-9,71,2],[9,-6,7,-9,-48,2],[4,-1,5,7,-58,8],[7,4,8,-7,-37,3],[-6,36,4,-4,-4,2],[-8,-5,6,9,-32,4],[9,24,5,-2,7,3],[-2,46,6,8,5,3],[-5,-1,3,-8,68,4],[1,-15,4,4,6,8],[-4,5,2,-3,-60,4],[4,-2,3,-2,8,9],[7,-5,2,3,-51,6]],"110": [[5,8,2,6,65,8],[4,41,8,5,9,3],[3,37,3,9,1,2],[3,8,2,9,3,5],[5,59,7,1,3,2],[8,5,6,1,22,9],[9,56,8,4,6,2],[4,8,5,7,6,3],[3,9,3,4,55,9],[6,9,7,9,6,2],[5,8,3,5,40,7],[3,2,9,7,3,7],[9,1,7,4,4,8],[3,3,3,6,1,4],[9,20,5,6,1,2],[9,58,7,4,7,2],[6,4,2,7,61,7],[7,72,6,8,8,2],[1,4,9,9,13,6],[5,8,3,4,46,7]],"111": [[-7,-31,5,-4,-9,4],[-5,5,6,6,22,7],[-8,10,2,-5,-7,5],[-7,-10,8,2,-6,9],[3,20,9,-1,7,3],[3,-7,2,-8,-64,7],[-8,8,7,4,-5,3],[4,-17,7,-9,4,4],[-3,-8,2,-6,-8,3],[-5,-12,6,-8,1,4],[6,-6,7,7,-9,4],[-2,3,8,-9,4,2],[-6,4,4,-6,28,5],[-4,31,7,-4,2,2],[8,-3,7,-7,-11,5],[-8,5,6,5,9,5],[9,5,4,9,-8,9],[4,-9,9,4,5,6],[-3,-5,5,4,-23,8],[-5,1,4,-6,11,8]]},"advan_6": {"000": [[3,7,5,2,4,3,4],[2,8,7,8,10,7,4],[7,37,4,3,2,7,3],[2,2,6,5,2,3,13],[4,70,9,8,1,3,5],[2,22,8,4,3,7,4],[2,6,9,1,9,2,3],[1,39,4,8,8,8,7],[1,33,2,7,8,4,5],[4,37,5,8,3,5,8],[9,5,5,6,20,4,6],[5,1,4,4,6,3,10],[2,2,6,7,13,6,4],[2,4,9,3,6,9,5],[5,6,3,7,5,2,51],[7,14,8,8,4,8,6],[4,3,2,9,7,2,57],[3,33,2,2,1,2,2],[7,8,7,2,9,7,5],[4,5,4,3,49,4,3]],"001": [[-5,24,5,3,-7,5,5],[6,9,9,8,4,4,-22],[-8,4,4,-8,6,2,58],[-4,47,4,-3,-3,8,-1],[-9,12,3,1,6,2,7],[-3,8,3,4,3,3,4],[8,3,5,8,3,7,12],[5,28,3,7,2,6,4],[3,18,7,-1,4,7,2],[-6,-43,9,8,7,9,-6],[-5,8,6,-6,-6,2,6],[1,-19,6,4,-1,3,-2],[6,5,4,3,-26,4,6],[-7,5,3,-1,42,3,5],[5,2,5,5,-57,5,-1],[4,9,7,9,-2,5,8],[9,2,7,-8,6,2,25],[2,-6,9,9,6,8,-8],[-9,52,6,4,5,6,7],[1,-24,9,-8,9,3,8]],"010": [[1,3,6,1,8,2,4],[2,5,3,1,8,2,5],[3,9,2,1,10,2,9],[2,1,2,1,23,3,8],[2,21,4,1,7,2,9],[1,2,2,3,23,3,9],[2,8,2,1,4,2,7],[1,1,3,1,39,5,8],[1,2,5,1,2,2,2],[2,8,2,1,1,2,5],[2,12,2,1,7,3,8],[1,20,6,1,6,2,6],[1,7,3,2,19,3,9],[1,7,6,1,10,2,6],[2,3,3,1,14,3,6],[1,6,5,1,8,2,5],[1,27,6,1,1,3,5],[1,25,4,1,8,3,9],[2,20,3,1,5,2,9],[1,51,7,1,1,2,8]],"011": [[-5,-55,7,4,4,5,-7],[-6,-8,9,4,-16,5,-4],[3,1,3,-5,-25,8,-3],[8,4,7,-6,-57,6,-9],[7,59,7,-5,3,4,9],[-9,-1,6,9,-61,7,-9],[-8,43,4,8,-3,3,9],[-2,2,2,6,-58,9,-5],[8,53,7,-8,-5,8,7],[9,3,6,-3,26,3,9],[-6,32,9,1,-9,2,-1],[2,1,3,-3,-30,7,-4],[-3,44,8,2,3,7,6],[4,47,8,-4,-5,6,5],[3,-8,7,-3,-56,8,-8],[2,9,2,-1,-6,3,2],[-6,-26,4,9,2,5,-6],[1,-58,8,-1,9,2,-3],[-4,-39,7,1,7,4,-4],[9,-5,7,-5,8,3,2]],"100": [[7,3,6,9,7,3,7],[4,8,7,8,8,2,60],[4,9,9,9,62,3,1],[8,4,8,5,63,4,5],[5,3,9,7,66,3,5],[7,55,9,6,6,9,1],[5,23,4,5,3,8,8],[7,19,9,8,5,9,6],[1,30,4,9,3,5,4],[1,5,6,5,33,8,1],[5,9,4,5,6,8,3],[5,14,7,2,7,7,3],[1,6,2,8,26,4,7],[3,4,8,9,9,4,8],[9,5,8,2,4,7,28],[6,3,5,6,46,7,1],[1,1,2,2,3,2,53],[9,8,2,1,20,2,4],[4,2,6,8,28,4,2],[9,68,5,7,6,2,6]],"101": [[-7,-2,7,6,-43,7,-2],[-7,57,3,-5,-3,2,3],[-9,-69,2,-4,4,8,6],[9,-4,6,1,4,6,30],[8,64,7,6,3,5,-9],[-8,-2,3,9,8,8,-49],[-7,26,9,3,6,4,5],[-5,6,7,2,-61,7,-1],[-9,8,3,-7,-41,3,5],[-4,-7,4,-6,-5,4,7],[-6,54,3,3,-6,6,-7],[5,8,7,8,1,7,-21],[9,32,5,9,-8,5,-6],[-8,-50,2,-6,2,4,-8],[2,6,5,7,-56,5,-1],[-3,3,9,-5,-8,6,-1],[-4,8,3,7,5,2,3],[-3,-9,2,-2,-1,7,-60],[-7,71,4,8,-9,4,-6],[5,5,3,-9,7,3,20]],"110": [[8,4,2,6,8,7,4],[7,3,8,1,5,2,8],[6,10,3,5,4,8,7],[3,29,7,2,8,2,3],[8,3,4,1,72,9,8],[3,64,4,6,5,2,8],[1,64,5,1,3,2,5],[1,6,5,8,9,2,6],[5,9,3,8,3,2,21],[1,3,7,6,57,9,7],[8,1,2,6,2,2,23],[8,3,6,1,7,2,3],[9,9,3,3,7,2,21],[5,36,5,6,7,8,8],[5,14,7,5,3,8,1],[4,1,2,7,46,9,5],[5,24,4,5,9,3,8],[7,5,6,6,5,2,3],[1,1,2,7,10,7,8],[6,6,3,5,9,2,21]],"111": [[-6,-7,2,-6,-4,8,-8],[-4,21,6,3,-7,5,5],[-3,3,2,-6,-11,5,-7],[1,-2,6,1,-2,4,2],[-2,-7,4,2,51,9,4],[5,-71,7,8,-5,4,-9],[-5,-5,8,8,-4,3,-2],[-6,71,3,-2,-6,2,6],[-2,5,9,7,-35,8,-5],[-3,-55,6,5,-6,2,-9],[-7,-4,4,1,-72,9,-7],[-6,4,5,-2,-2,2,6],[-5,8,3,-5,5,2,21],[-7,56,7,-7,9,4,8],[-7,56,3,6,-1,2,3],[-1,-4,6,1,-1,2,-7],[-1,-9,7,5,-21,5,-3],[-3,-2,9,8,-4,2,-5],[-8,-8,5,-5,8,6,-1],[3,27,4,7,-7,3,-2]]},"advan_7": {"000": [[5,7,8,1,2,20,2],[4,6,6,9,6,30,6],[1,6,3,7,8,9,3],[8,55,4,4,1,8,4],[2,21,9,4,7,3,9],[4,1,9,4,4,58,6],[1,7,7,1,6,21,7],[8,3,6,8,2,1,6],[3,17,3,1,8,9,9],[8,5,6,4,1,2,6],[9,9,2,6,5,21,2],[9,2,7,3,4,8,6],[9,25,8,4,9,3,2],[6,3,2,4,9,33,6],[4,6,4,2,9,6,6],[4,1,7,3,3,22,7],[1,9,9,8,2,36,4],[6,4,2,17,7,9,3],[5,7,3,2,3,2,8],[6,6,4,46,7,5,2]],"001": [[1,-41,9,5,-9,4,9],[5,2,3,-22,6,-3,9],[1,-1,3,9,8,22,6],[-3,9,2,39,-8,-1,2],[-7,-6,8,-9,8,-30,4],[6,-1,4,8,-6,50,8],[-8,-1,6,33,-8,-9,2],[-5,5,6,4,6,39,9],[-7,55,2,-7,-2,5,2],[-9,7,4,-10,9,3,7],[-8,19,3,-6,-2,-9,3],[-6,-7,2,4,-6,-16,4],[-8,-4,2,-36,-5,2,2],[3,56,8,-9,2,-1,4],[4,-4,3,-7,-5,-19,3],[9,-6,7,1,4,20,2],[-9,-5,2,-62,-5,-3,2],[4,-5,5,7,3,-7,4],[-9,8,2,-66,-8,-5,2],[-1,9,4,-31,6,-8,2]],"010": [[1,3,2,2,3,9,2],[1,1,2,8,1,47,5],[1,7,4,1,1,7,3],[1,2,6,8,1,26,3],[1,8,3,9,1,58,5],[1,1,7,3,1,6,2],[1,5,2,6,1,22,3],[1,1,2,6,2,9,2],[2,5,2,5,1,25,3],[1,1,2,5,1,40,7],[1,4,4,2,1,5,2],[2,16,5,2,1,9,2],[1,5,3,2,2,9,2],[1,2,6,9,1,27,3],[1,5,2,9,2,58,5],[1,7,3,7,1,54,6],[3,2,3,5,1,9,2],[2,11,5,1,1,6,2],[1,3,3,4,2,8,2],[2,2,3,1,1,6,3]],"011": [[-7,-1,9,-1,1,-3,2],[-1,-9,5,-8,1,-68,7],[2,-4,3,-3,-7,-33,7],[-5,-9,4,-7,5,-35,4],[-8,-59,8,9,6,8,5],[3,3,3,-8,-3,-18,3],[-7,-51,9,7,4,7,6],[-8,-2,2,-1,5,-6,2],[1,-6,3,6,-3,5,2],[3,8,4,-2,-3,-2,6],[9,-7,3,8,-8,9,2],[6,5,5,-2,-2,-2,3],[5,-64,8,8,-6,-1,9],[3,-7,5,9,-5,55,7],[-5,1,5,-6,3,-22,4],[9,13,6,-4,-9,-8,5],[1,-4,3,-7,-3,-40,5],[-4,8,2,6,8,23,2],[9,44,5,-7,-5,3,2],[8,30,8,-1,-2,6,2]],"100": [[3,3,6,4,3,17,5],[9,9,8,4,4,20,6],[3,7,2,6,2,6,8],[8,4,2,24,9,3,8],[3,6,6,25,2,4,8],[1,7,5,4,6,41,5],[1,67,3,3,8,8,4],[2,37,2,3,2,2,8],[1,37,8,4,5,3,8],[7,3,8,3,6,1,8],[3,4,4,65,4,8,8],[3,6,9,4,5,2,3],[4,17,8,9,5,8,8],[7,4,9,9,7,36,2],[2,3,9,7,6,2,3],[9,1,9,60,2,2,9],[2,5,2,3,4,56,8],[2,67,8,7,4,3,8],[3,2,2,9,4,32,8],[6,8,6,3,2,2,6]],"101": [[-4,-6,7,33,3,9,3],[5,9,8,-8,-6,15,8],[-2,-63,2,1,5,-7,2],[-4,7,7,8,-6,-12,6],[-2,-9,5,-5,-9,10,5],[-7,-69,4,6,4,4,6],[7,-34,6,-1,8,-3,2],[-7,-7,7,3,-7,67,2],[-3,-9,8,57,-8,-2,7],[-8,-6,6,-11,5,6,8],[5,-8,2,3,-8,-26,4],[-3,7,5,-72,3,-8,2],[7,-5,6,9,9,-15,6],[6,-9,6,-19,-5,-8,2],[-6,-3,2,-49,-2,-6,4],[-6,3,6,-6,-6,-67,2],[-3,-3,9,-3,-1,-32,6],[7,3,9,6,8,-33,9],[1,-16,5,-1,-6,4,4],[-4,-1,4,12,-7,4,8]],"110": [[8,5,8,4,5,44,7],[4,3,2,27,8,8,2],[8,4,4,10,3,9,2],[7,5,8,7,6,44,6],[1,3,2,21,8,8,2],[8,6,4,3,1,3,5],[2,2,4,9,1,30,3],[2,4,2,2,2,63,8],[9,9,5,6,3,24,2],[6,7,2,22,1,3,2],[7,72,9,1,9,8,2],[3,58,7,1,7,5,2],[7,5,9,3,8,4,3],[5,14,7,3,2,9,3],[7,12,2,6,1,6,4],[8,4,7,2,3,8,2],[1,27,9,7,3,9,2],[8,9,2,6,8,49,4],[5,11,4,6,4,6,2],[9,3,9,1,1,7,5]],"111": [[-1,-2,6,9,5,27,5],[8,1,4,-4,3,-58,9],[-2,5,2,-22,-7,4,2],[8,28,4,8,7,6,2],[8,-15,4,-8,8,-8,2],[1,19,5,4,4,9,2],[-9,23,4,4,8,8,2],[2,4,6,-1,8,3,9],[7,22,8,3,-4,7,3],[2,55,5,-9,5,1,3],[4,-9,4,3,-2,12,5],[2,-16,6,9,4,9,2],[6,-8,3,-1,9,-57,9],[-6,-6,2,28,-4,2,2],[-1,-3,5,-3,7,-9,3],[2,3,3,7,3,-7,3],[-6,-3,9,6,8,5,2],[3,2,6,7,-4,14,3],[7,-2,7,8,4,9,2],[-4,70,8,1,6,8,2]]},"advan_8": {"000": [null],"001": [[-5,-4,-7,-3,-2,-9],[3,8,-8,-1,-4,-34],[-7,-6,-4,-9,-8,-47],[-2,70,-8,7,-1,6],[-2,-6,-2,-1,-7,45],[-7,-63,-3,-6,-1,2],[-7,-7,-7,3,-7,-7],[6,-51,-7,9,-5,-9],[8,-68,-1,-7,1,-9],[1,24,-2,2,8,-6],[-5,-25,-9,4,1,5],[5,-4,-2,-8,1,-3],[-1,-4,-4,-8,-9,-36],[-6,-6,-5,3,2,10],[-5,16,-7,3,-6,-7],[-9,8,-5,-4,6,52],[-5,-61,-8,-2,1,8],[5,1,-8,-3,6,29],[-6,-24,-3,-7,-1,1],[1,-3,-6,5,-1,3]],"010": [null],"011": [[-5,2,-2,-3,-2,1],[-8,5,-1,-5,-3,2],[-6,17,-1,4,2,-2],[-5,30,-2,-6,-1,3],[-7,-26,-1,8,2,3],[-6,-4,-2,-3,-2,-1],[2,-46,-1,8,-1,6],[-9,3,-1,5,1,-1],[2,15,-1,-5,-1,4],[5,-6,-2,-3,2,-2],[9,-68,-9,2,-1,4],[6,8,-2,2,-3,-1],[6,63,-3,5,-1,-4],[4,35,-5,2,-1,-4],[-4,-18,-1,-5,1,-4],[-9,-25,-2,-7,-1,-2],[1,15,-1,4,-2,-5],[-8,7,-1,3,5,-2],[1,-9,-1,-2,-2,-3],[-2,5,-1,4,1,-3]],"100": [null],"101": [[5,32,-4,4,3,-2],[7,-8,-3,5,6,7],[1,1,-9,-4,1,36],[-1,-54,-3,4,1,-1],[1,-2,-5,-6,5,-10],[1,-50,-9,-6,-2,-9],[-5,1,-6,-1,-2,27],[-7,-1,-2,-2,8,68],[-2,-16,-5,7,1,8],[3,-3,-7,3,-9,71],[-8,46,-2,5,2,-7],[2,34,-8,-3,1,-5],[1,-5,-9,-9,1,-5],[2,-6,-7,2,-3,-31],[2,5,-5,-3,-8,41],[3,9,-3,-4,-5,6],[-5,-8,-9,-4,3,50],[-6,-3,-1,9,-2,-69],[-7,-2,-8,8,4,-70],[-3,30,-9,3,-8,7]],"110": [null],"111": [[-8,-6,-4,-1,4,-22],[-4,1,-1,-1,9,38],[6,9,-4,7,-3,3],[-9,-3,-6,6,-2,-1],[-7,-28,-4,8,-2,1],[-8,-34,-5,-6,-3,-2],[-6,40,-9,2,3,-5],[-1,-5,-1,-7,5,8],[-6,4,-1,2,-8,46],[-2,2,-8,-5,2,-1],[-1,-24,-8,8,-1,1],[-5,-5,-7,-8,1,-1],[-2,-72,-2,5,9,-1],[9,1,-1,3,3,9],[5,6,-5,9,2,-1],[-5,-3,-2,-1,-9,-48],[7,-9,-1,-7,-4,-11],[-4,1,-1,-6,-5,-1],[-9,9,-5,-3,-2,-4],[-8,1,-4,9,-2,-2]]},"advan_9": {"000": [[3,24,9,7,8,2],[2,44,7,8,7,5],[3,3,4,8,9,3],[6,17,7,7,6,8],[1,2,6,4,5,7],[1,1,4,8,8,2],[1,68,8,3,3,8],[3,27,7,8,9,9],[2,2,9,7,2,42],[1,26,8,3,4,5],[9,29,4,6,9,2],[1,4,8,3,5,8],[9,1,2,4,1,68],[6,12,3,8,9,1],[6,40,2,3,8,6],[4,3,3,6,1,58],[9,33,5,9,8,1],[1,47,4,6,5,8],[2,4,3,1,9,60],[7,4,5,1,3,2]],"001": [[-5,-5,7,-5,-6,1],[-8,-8,7,-5,1,-44],[-5,-6,8,6,7,9],[-9,48,4,7,3,-2],[2,-5,3,-6,-4,1],[-4,4,6,4,8,-18],[7,9,6,-5,-7,11],[7,6,5,7,2,14],[9,-5,4,-9,-2,-25],[-9,5,4,-2,-5,2],[-8,-2,9,-7,1,62],[-5,49,4,3,-1,-7],[-3,3,2,1,8,-24],[9,-1,5,-4,5,-65],[-5,6,9,-6,4,64],[4,-36,6,3,4,-7],[-3,1,8,9,-4,-63],[6,8,7,6,6,8],[8,-29,5,-6,-5,-1],[-3,33,2,7,9,-1]],"010": [[6,15,5,2,4,4],[3,31,3,1,5,8],[3,43,9,4,4,4],[9,21,7,1,1,4],[9,60,8,7,7,8],[3,11,4,9,8,2],[5,1,4,8,7,2],[4,34,9,8,8,4],[5,19,6,5,5,2],[6,28,5,6,6,6],[7,3,6,3,5,1],[4,7,4,2,1,3],[3,6,7,4,4,1],[9,52,7,3,3,7],[5,60,7,4,4,9],[4,8,3,8,7,2],[1,42,6,5,6,6],[7,11,4,2,2,4],[7,8,9,8,8,1],[2,6,4,4,3,1]],"011": [[-2,-5,3,-5,-4,-1],[9,-1,5,4,5,1],[6,6,5,8,8,3],[3,-16,8,7,7,-1],[1,-5,2,-3,-7,-4],[9,10,5,-2,-2,3],[-1,-31,9,-1,-2,-4],[7,-21,4,4,7,-3],[1,8,6,-8,-9,1],[-8,11,7,3,3,1],[4,-3,8,-9,-8,-1],[1,9,8,5,4,2],[-3,6,6,7,5,2],[-1,4,9,7,6,1],[-6,5,2,-6,-5,-1],[5,21,3,-6,-3,8],[4,9,4,1,3,2],[-3,-26,9,-5,-6,-2],[-1,-60,9,-5,-6,-6],[2,70,8,8,9,9]],"100": [[3,7,5,1,1,8],[7,7,7,7,3,26],[7,3,3,8,9,21],[8,10,5,4,6,4],[4,25,5,6,7,8],[6,9,3,6,1,3],[6,56,8,7,1,7],[1,1,6,9,9,16],[2,3,7,4,5,49],[3,8,7,4,5,48],[9,1,8,9,8,66],[2,2,7,8,7,44],[9,2,4,7,8,48],[7,1,3,6,8,13],[5,23,8,7,8,7],[7,50,6,5,4,4],[1,16,5,3,3,1],[4,8,9,6,8,32],[7,53,8,3,4,7],[5,9,3,2,5,59]],"101": [[-1,60,8,-4,-1,-5],[-4,2,7,-8,1,29],[6,3,5,-5,-9,-41],[-4,14,6,5,5,1],[1,-9,9,5,-7,-1],[5,-12,2,8,-3,-6],[6,-6,9,3,4,1],[-5,-6,7,2,1,-22],[1,60,7,9,9,3],[1,36,7,9,8,4],[-5,5,9,-9,-5,37],[-9,21,6,-4,-5,-8],[4,23,7,3,3,-7],[2,-28,4,-8,6,-7],[-7,-44,2,6,2,-7],[4,24,8,-6,-6,1],[-5,30,3,-5,-3,-1],[3,2,7,4,3,56],[-8,18,7,5,3,6],[-8,-1,5,-3,-4,-2]],"110": [[8,72,5,6,8,1],[6,5,3,3,3,5],[7,7,4,8,3,21],[7,41,3,8,4,9],[9,9,2,9,4,49],[4,69,6,5,6,1],[6,33,6,8,2,7],[8,24,2,5,5,6],[3,5,8,1,4,1],[9,9,3,2,8,7],[9,71,8,7,2,5],[9,20,8,2,8,2],[6,1,2,8,7,45],[7,35,4,7,3,7],[3,6,4,1,3,22],[5,14,8,6,8,5],[7,62,3,7,5,8],[4,57,6,5,6,7],[6,9,6,8,1,9],[8,12,4,9,8,2]],"111": [[2,-6,2,8,5,-52],[-4,7,9,-9,-9,4],[2,32,6,-9,3,8],[6,-8,7,5,-4,-8],[-9,53,4,-8,-2,-6],[-1,9,2,-6,-4,3],[-1,-36,2,5,3,5],[-9,3,4,-7,5,-22],[6,8,2,-8,-2,-42],[-1,6,2,-8,7,-44],[-5,26,4,5,2,9],[6,-4,2,7,-7,25],[-6,-6,2,-1,9,-51],[-2,26,8,3,-6,2],[-4,55,9,-1,1,2],[5,-1,2,2,8,40],[6,44,6,7,3,8],[-8,7,4,1,-6,26],[-4,7,4,1,4,11],[2,2,2,1,-7,-39]]},"advan_10": {"000": [[9,5,7,7,3,5,5,69],[3,9,7,31,2,4,7,9],[5,7,4,1,3,7,4,23],[7,6,4,8,3,9,7,7],[1,6,1,9,4,5,7,63],[2,5,1,6,2,4,9,13],[7,5,9,38,7,2,6,8],[9,6,2,4,4,8,1,57],[2,9,4,9,3,7,5,31],[6,4,9,33,5,3,5,8],[3,4,3,6,1,5,3,72],[1,7,4,8,3,8,4,8],[4,3,6,9,2,7,3,17],[1,3,2,16,4,7,1,9],[5,6,2,5,3,4,4,2],[2,8,5,35,7,3,1,7],[1,8,6,2,7,4,2,8],[5,9,4,6,5,3,9,48],[4,2,3,3,4,5,8,11],[4,8,9,20,8,5,2,3]],"001": [[8,4,-1,-66,9,2,8,-4],[1,4,8,-16,-8,7,-8,-9],[1,3,-3,-6,-7,6,8,16],[5,7,-5,-5,-1,4,9,9],[8,4,-6,-6,1,6,-6,-72],[5,2,-7,56,1,3,1,-8],[4,8,3,3,-6,2,5,49],[-1,2,-4,7,-5,4,7,-66],[-5,2,6,8,-7,9,3,-72],[-9,6,-5,-24,2,6,5,3],[7,9,-3,-36,-7,8,-4,-8],[2,9,-2,-16,-9,5,-1,-8],[-3,2,-7,-9,2,3,4,-15],[-2,6,3,56,8,9,1,-4],[1,5,-6,-59,-3,6,-4,-2],[6,3,-9,-4,7,6,2,28],[-2,5,-1,-39,6,5,-2,6],[9,7,6,70,-3,7,6,6],[2,5,2,-4,-8,6,6,21],[-5,8,-5,21,5,9,4,-9]],"010": [[2,5,6,10,7,9,3,5],[1,8,9,25,3,5,2,5],[3,4,8,2,4,3,4,1],[1,2,1,25,4,2,1,6],[1,2,4,6,3,8,6,9],[5,9,4,2,9,8,2,1],[2,4,2,21,4,2,1,5],[9,5,4,2,8,9,8,4],[7,6,3,14,8,2,1,4],[7,4,4,2,6,7,8,4],[1,2,5,38,9,2,1,4],[7,3,1,7,2,7,9,56],[5,4,3,1,4,6,6,2],[7,3,1,9,2,4,4,41],[4,2,6,7,5,3,8,8],[3,4,5,2,6,9,6,2],[8,4,1,6,1,5,8,61],[1,3,9,69,9,2,1,5],[9,8,7,13,8,5,5,9],[1,7,6,10,2,8,4,6]],"011": [[-2,3,-3,-1,-5,8,-3,-1],[-2,5,-2,6,-2,7,-2,9],[6,9,-5,-8,1,2,-6,-11],[-4,6,1,-2,-1,2,2,-3],[2,5,-1,-6,2,6,-2,-7],[7,8,-9,7,8,9,-9,7],[2,4,-2,-8,-1,7,5,27],[-1,9,-9,22,-1,3,-2,8],[1,4,-8,-26,4,3,-2,-5],[-1,5,-9,8,2,8,8,-6],[1,5,7,-68,7,4,1,-8],[1,2,1,3,4,7,2,3],[-1,6,4,-2,-1,8,4,-3],[1,8,-7,50,7,9,-1,8],[-1,2,1,22,-5,4,1,8],[2,8,2,7,1,6,4,10],[1,7,4,44,-3,4,-1,-8],[-5,4,4,9,-2,4,9,22],[2,7,3,3,1,8,8,6],[1,8,5,-22,-5,9,-1,5]],"100": [[8,2,3,1,7,6,3,18],[9,4,2,33,1,4,9,9],[4,9,1,24,4,6,1,3],[2,5,9,7,7,8,4,12],[6,2,3,22,4,5,9,6],[5,9,5,8,4,3,8,27],[2,5,9,22,1,4,4,4],[3,2,9,9,9,3,4,1],[8,9,3,6,3,5,7,60],[1,9,1,64,1,3,7,8],[3,5,8,38,2,5,3,3],[9,4,2,4,6,4,2,6],[8,6,5,2,1,2,7,18],[5,3,4,34,3,4,8,8],[2,8,6,6,3,9,4,6],[3,4,6,8,8,7,6,30],[4,7,8,7,8,6,1,54],[2,3,8,3,8,4,2,53],[1,2,5,7,7,8,2,58],[1,7,5,46,4,7,1,7]],"101": [[-7,3,6,18,-8,7,1,3],[-7,5,-5,5,-9,8,-8,-72],[-4,9,4,-71,1,6,3,-2],[1,3,-1,-7,6,3,2,27],[-5,7,-1,-9,8,6,1,-4],[-4,2,-3,-5,-3,9,-1,-30],[-5,9,5,-9,-7,2,3,-61],[-3,8,4,-18,-3,4,1,4],[1,4,1,53,6,8,1,9],[4,5,7,-2,5,7,4,-56],[3,5,-9,-67,3,2,-4,6],[6,9,-5,-1,-1,5,8,-14],[-4,3,-8,-7,4,7,7,-7],[2,9,5,31,-1,4,-3,-3],[-8,7,-3,-6,7,8,5,63],[-7,2,2,9,9,6,8,-21],[9,5,3,8,-9,8,-8,32],[7,9,7,5,-3,6,9,32],[7,3,7,8,6,4,5,-70],[-3,4,-2,4,-7,6,1,-34]],"110": [[7,3,7,3,9,2,5,5],[5,4,2,9,1,6,2,45],[6,9,5,7,1,6,9,38],[7,3,9,7,8,2,9,1],[3,6,3,1,1,5,6,6],[8,7,3,1,3,6,6,1],[8,2,2,1,6,3,7,4],[2,9,5,7,2,4,2,5],[3,8,5,6,8,7,3,1],[1,2,7,8,2,3,3,23],[4,5,5,13,7,3,4,2],[1,2,1,4,1,3,3,55],[1,8,4,44,4,5,3,7],[5,8,9,8,4,3,2,2],[2,6,7,13,8,6,3,4],[1,7,1,66,5,6,2,9],[2,9,1,46,4,2,1,7],[2,7,2,59,7,3,1,6],[8,5,4,6,6,9,9,14],[3,6,6,28,9,2,2,4]],"111": [[-3,5,-1,48,-8,2,1,9],[1,3,-8,-9,1,7,-8,-27],[3,2,-5,-3,-1,2,9,53],[9,7,2,7,-1,3,2,-24],[5,2,5,9,3,4,6,36],[1,6,-6,61,-7,2,1,-3],[-6,5,-4,26,9,3,2,-9],[3,2,7,3,1,3,-2,60],[1,8,-8,5,-7,5,-1,1],[-3,4,9,3,1,3,-7,-31],[-3,5,1,2,-1,2,-4,22],[-4,2,-1,-4,3,9,2,39],[-3,2,-1,-8,-5,3,-2,-9],[1,7,3,-71,-3,4,3,9],[5,3,1,-6,-1,3,-1,56],[1,2,-9,-9,1,4,1,-49],[8,9,3,-7,-6,4,-2,5],[4,7,-6,-5,-1,5,4,22],[-2,8,-8,24,8,9,3,-7],[-4,8,8,-17,6,4,-1,7]]},"advan_11": {"000": [[2,3,51,8,2,9],[6,9,4,2,9,10],[2,7,16,6,7,6],[2,7,29,9,7,6],[8,4,8,2,7,38],[2,7,38,8,4,8],[7,9,6,7,3,4],[2,5,40,8,4,9],[8,2,8,2,8,47],[2,2,30,8,4,7],[8,6,9,2,7,36],[9,4,8,2,8,39],[2,3,39,7,3,9],[3,5,25,9,5,9],[9,4,4,2,8,24],[9,4,7,3,8,26],[9,4,9,6,2,13],[7,3,9,2,3,39],[2,4,40,7,2,8],[5,4,5,9,6,3]],"001": [[9,9,-6,2,-2,-35],[-4,6,-9,2,9,22],[-9,-6,8,-2,9,36],[-8,8,3,-5,6,5],[9,-4,6,-1,-2,-65],[-2,2,-56,8,2,9],[2,5,21,6,-4,7],[-1,5,48,6,3,-8],[7,-4,-6,-1,-8,57],[3,8,27,6,-2,9],[2,9,-42,-8,4,8],[3,-2,-29,8,-2,-9],[8,-7,-8,-2,-7,37],[-8,-9,-5,-1,-4,-40],[9,-7,-8,2,-7,-40],[6,5,-4,4,3,-6],[6,-9,8,-3,-3,-21],[-5,-4,-5,5,2,3],[-6,-8,9,-1,2,59],[-1,-2,50,6,-3,-5]],"010": [[2,2,4,5,2,2],[7,3,7,2,2,25],[5,3,5,2,2,12],[6,2,8,7,3,7],[8,3,2,3,2,5],[8,3,8,3,2,21],[5,2,4,7,4,3],[8,3,2,3,2,5],[7,2,3,4,2,5],[7,3,4,3,2,9],[5,2,1,4,3,1],[2,2,4,5,2,2],[7,3,7,2,2,25],[8,3,8,3,2,21],[5,3,11,7,3,8],[5,3,7,6,2,6],[5,3,5,3,3,8],[5,2,9,2,2,23],[2,2,3,5,2,1],[5,3,1,2,2,3]],"011": [[5,3,-9,-1,-2,44],[-5,-4,-5,-1,-2,-26],[5,4,-4,-1,-2,21],[-1,2,29,-4,3,7],[-1,-3,23,-3,-3,8],[-1,2,25,-3,-3,8],[5,-3,-9,-2,2,23],[5,4,4,-1,-2,-21],[-5,-4,5,-4,-2,6],[-6,3,-4,-1,2,-25],[5,4,7,-1,-2,-34],[3,2,-1,2,3,-1],[5,3,-7,3,3,-12],[-3,-3,2,-5,-3,1],[-1,3,-11,3,-2,4],[-1,-2,26,5,4,-5],[-1,-2,-21,4,3,5],[-1,3,-22,3,-3,7],[-1,-2,-29,-4,-2,-7],[-1,-2,5,6,3,-1]],"100": [[9,2,7,4,2,52],[2,9,3,8,2,39],[4,6,1,3,2,28],[3,6,70,8,2,7],[4,3,25,9,9,8],[5,9,19,5,3,3],[9,4,9,2,4,65],[9,6,6,7,7,1],[7,5,15,6,3,9],[3,3,7,8,6,2],[4,9,22,5,4,6],[5,9,46,6,2,9],[6,4,5,8,9,1],[4,4,60,9,3,8],[7,4,3,2,8,66],[8,5,4,3,2,8],[5,4,9,3,8,43],[7,2,1,7,9,15],[6,2,7,2,2,57],[2,6,26,4,4,6]],"101": [[-1,9,-47,-4,9,-6],[-6,-6,7,5,-2,56],[2,8,8,-3,2,-59],[-6,4,6,-8,8,8],[-4,-3,-33,9,3,8],[9,-2,9,4,-2,-1],[9,-8,-45,7,2,-5],[-2,2,6,-5,-2,50],[-9,9,-2,3,-9,-8],[6,4,-5,-2,4,-29],[-3,-7,-9,2,-8,42],[-3,-8,-43,-2,2,-4],[-2,3,13,7,-3,-3],[-9,-3,-2,-9,-9,-2],[-9,7,-6,-9,-3,-46],[8,7,-1,5,-9,-23],[-7,-3,-8,6,9,6],[-3,9,-3,4,2,25],[9,3,67,9,-2,-8],[6,-4,6,7,-2,30]],"110": [[2,3,6,8,7,1],[2,9,27,7,3,8],[8,2,8,2,2,42],[7,3,8,3,2,24],[2,9,32,9,3,7],[2,8,25,7,2,7],[2,8,37,8,5,9],[3,2,24,7,2,7],[9,7,8,2,4,37],[7,2,8,2,2,40],[2,4,21,6,2,8],[4,5,9,7,2,6],[6,2,9,3,3,21],[8,3,8,3,4,22],[7,3,8,3,8,19],[7,4,4,4,3,8],[8,9,7,2,5,29],[7,3,9,2,2,39],[2,2,41,8,2,9],[4,9,1,5,4,1]],"111": [[2,-4,27,9,2,7],[-9,-7,-8,2,-2,39],[7,-3,1,8,8,1],[-8,3,-5,-1,2,-56],[-2,-3,9,-9,3,3],[-1,-9,58,7,-2,-8],[-6,9,9,-1,7,55],[-8,4,-7,2,-4,26],[-6,-3,8,-1,-6,46],[-2,-3,-39,-8,-4,-9],[-1,-2,57,8,9,-7],[-2,7,-38,8,3,9],[9,3,7,-1,-5,-57],[8,-4,-6,-1,-3,47],[-9,-4,-9,3,6,26],[2,-8,3,4,5,2],[-1,3,-55,-9,-7,-6],[-1,6,-63,-8,2,-7],[4,4,2,-7,8,-1],[9,-8,8,2,2,35]]},"advan_12": {"000": [[4,1,5,6,9,1,8,5,1],[7,7,5,8,3,56,4,2,7],[5,9,61,4,8,7,5,1,9],[6,4,5,6,6,3,4,9,18],[3,1,9,7,7,3,6,1,54],[5,8,6,8,5,27,2,2,9],[7,3,18,7,7,7,5,4,5],[7,6,4,9,8,8,7,9,7],[7,8,7,6,1,1,5,7,38],[9,1,9,9,7,7,2,4,8],[6,3,8,8,8,3,3,2,24],[5,8,8,8,8,2,9,1,59],[4,2,3,8,8,45,5,3,6],[5,4,1,3,7,22,6,1,6],[4,8,1,7,2,2,2,5,27],[7,7,3,2,2,5,7,1,57],[5,8,4,2,3,53,3,4,8],[3,7,2,9,7,2,8,3,3],[2,5,8,2,7,22,2,9,9],[6,9,6,2,5,31,2,8,1]],"001": [[9,2,-5,7,-6,-5,-7,-3,50],[9,4,-30,-8,-2,-6,5,2,6],[-4,-6,9,7,-2,2,-1,-6,18],[5,2,16,2,-9,1,-9,8,-2],[-6,-2,-7,-7,1,53,-7,7,-7],[2,-3,9,-9,-8,5,-5,-7,-38],[3,3,-60,2,-9,-3,6,-9,-1],[6,-7,-29,-4,3,2,-7,5,7],[3,8,6,-6,4,-5,-3,-6,2],[-4,2,1,-4,-5,-5,-1,-7,19],[6,-2,10,-7,9,3,-8,9,-3],[8,-3,-45,7,-6,8,-8,4,4],[-7,-5,-65,9,1,1,-8,3,-7],[-1,-9,8,5,-4,-34,5,7,-8],[-1,-4,-6,3,-9,29,-9,1,-1],[-1,6,24,-3,-1,-9,-2,2,1],[-6,5,-5,-4,-4,-2,-1,-2,-6],[-2,8,3,8,-9,3,-9,7,-27],[4,6,-6,6,-8,2,4,-1,-28],[-4,-7,-9,-3,-5,-20,4,6,5]],"010": [[2,7,2,5,2,9,8,4,6],[9,2,9,4,6,1,4,9,22],[5,1,4,3,6,9,9,2,5],[7,1,2,9,6,1,8,7,2],[8,1,2,2,9,1,7,5,3],[5,4,8,2,3,3,2,9,26],[5,8,4,9,5,7,9,9,9],[3,8,21,6,7,1,9,8,8],[2,7,11,5,2,3,5,6,7],[2,3,33,2,1,6,8,2,9],[2,5,2,2,7,35,9,2,9],[5,2,8,2,7,2,2,9,23],[2,2,9,2,9,32,9,2,9],[2,3,3,7,3,9,2,9,32],[9,5,6,8,1,2,9,5,7],[5,5,5,9,3,9,5,9,23],[3,2,2,7,3,7,2,9,28],[3,5,22,7,8,2,9,7,9],[2,9,38,2,9,1,9,3,8],[2,8,40,2,6,2,9,4,9]],"011": [[-6,-2,-7,2,4,-30,-6,-4,2],[3,8,1,7,6,10,8,9,8],[-3,-1,-2,7,1,3,2,8,11],[-6,-4,16,7,4,4,-7,-8,9],[-4,6,-5,-4,-1,-1,5,-5,3],[4,7,1,-3,-9,7,-7,-7,2],[6,2,3,-1,8,55,6,1,-7],[-8,1,-7,-2,4,9,3,-7,14],[2,5,6,7,-8,-6,5,-8,-7],[-9,3,-7,-1,-3,41,-9,3,-2],[4,3,-8,-2,1,1,6,1,-6],[-2,-8,-2,9,-4,-9,-2,8,42],[6,-1,4,-1,-8,50,-4,-2,7],[-9,6,2,4,-2,5,-7,8,1],[-2,1,-24,-4,-4,4,9,1,4],[-9,-2,-7,-3,6,-8,-2,4,-45],[8,4,9,2,-8,-64,6,2,-9],[-4,7,3,-7,-3,-8,-2,1,-23],[-1,9,-2,-1,6,8,4,-3,-2],[5,-4,-2,-4,-5,7,-1,-5,34]],"100": [[9,1,9,8,4,53,7,1,9],[2,4,7,6,2,22,3,9,2],[5,7,8,4,4,49,8,6,4],[3,9,27,3,4,5,4,9,6],[3,1,8,8,5,47,5,7,8],[8,3,1,8,4,9,4,9,50],[6,3,9,9,3,28,8,5,2],[3,5,2,2,2,1,3,8,6],[7,5,16,9,2,4,4,5,4],[3,2,5,4,1,11,9,1,7],[8,5,6,7,6,15,7,8,7],[9,4,49,9,6,9,8,5,9],[6,4,69,8,1,9,9,3,9],[6,7,3,9,6,6,2,3,36],[6,3,7,6,8,9,2,9,72],[9,6,4,5,7,7,2,8,72],[3,5,12,7,1,4,7,3,2],[2,1,5,9,5,9,5,9,3],[7,7,2,5,8,63,3,4,7],[2,3,31,4,4,4,9,5,1]],"101": [[9,-3,31,2,-9,-9,6,-7,-3],[2,-9,-3,7,-1,4,-7,4,5],[3,-5,6,3,-1,8,8,-2,9],[4,-7,-3,-2,2,9,-5,6,-26],[-4,-3,-6,-9,6,5,-1,-1,-65],[4,9,-9,2,7,-1,-1,9,-21],[-7,-6,3,-3,-3,3,-2,-2,62],[5,-9,7,9,8,-9,4,7,3],[-4,1,10,-8,-9,-3,-2,-9,8],[6,8,-10,4,4,-3,-2,-3,7],[3,-7,9,2,-8,-61,4,-9,-2],[-6,-6,1,-8,-2,33,6,6,3],[-2,-7,-58,-8,-4,2,-5,-9,-7],[4,-4,7,-9,-7,48,6,2,-9],[-2,-2,29,-9,3,-4,4,-7,-3],[-1,-8,-1,6,4,9,-1,-4,-27],[-3,-4,-5,-7,8,-2,-5,6,39],[-8,-5,4,-3,3,58,-1,4,-4],[-5,9,8,-3,6,8,-4,2,-39],[-6,3,-6,-9,2,-9,-5,4,63]],"110": [[3,5,23,3,1,5,6,9,9],[8,2,16,3,3,9,8,8,8],[7,3,9,7,5,4,5,7,7],[2,5,59,6,6,7,9,4,9],[3,9,22,6,7,3,5,1,2],[2,1,62,2,1,1,4,2,8],[9,1,4,6,7,1,7,2,8],[7,3,9,9,2,3,9,9,1],[2,8,58,4,3,3,4,4,9],[2,8,65,4,1,2,6,7,9],[6,5,7,7,9,6,4,6,1],[8,4,8,2,2,4,3,4,38],[3,2,8,7,6,7,7,8,22],[7,9,2,8,5,3,6,2,22],[2,6,6,2,5,8,4,1,1],[3,7,29,7,8,6,6,9,5],[3,2,8,4,4,5,6,7,23],[3,9,3,4,9,19,9,3,4],[2,9,53,7,5,2,7,5,5],[9,8,1,2,7,33,6,6,2]],"111": [[3,3,3,5,-2,9,2,6,56],[9,-4,-3,-1,2,-55,-1,-9,-7],[8,-7,27,-7,8,9,6,-3,9],[-6,-1,-5,-6,-6,4,-7,-3,-11],[6,3,31,5,-5,-7,8,7,9],[-2,-5,6,-8,-1,9,4,7,-37],[7,1,1,-8,1,-4,-1,-6,33],[7,3,3,5,-4,-6,4,-6,-26],[-9,3,-9,-7,-4,-1,-3,7,-59],[-8,-4,4,-9,-5,5,-6,-1,7],[-8,1,2,-1,-2,-46,5,9,9],[9,9,5,5,7,12,-5,-4,-9],[-6,4,3,6,2,3,-1,8,55],[-2,2,2,2,5,-47,-5,8,7],[3,-8,52,-8,9,1,-9,7,-8],[2,5,10,8,7,-6,-9,1,-4],[8,-7,7,3,-2,5,2,-9,45],[-1,2,-20,-3,-8,3,-5,-8,9],[2,5,25,8,-1,2,-7,7,1],[-3,7,32,4,-4,4,8,6,-9]]},"advan_13": {"000": [[8,5,8,7,1,6,8,7],[8,7,21,7,7,9,6,2],[7,2,23,6,2,6,6,9],[6,9,30,7,4,2,2,7],[9,2,7,2,3,8,40,2],[1,3,25,8,2,3,1,8],[1,3,32,4,7,3,4,2],[1,8,3,6,8,5,2,4],[7,4,37,8,9,8,8,2],[4,3,35,7,4,5,7,3],[8,7,4,7,9,6,8,4],[3,6,27,9,6,8,9,4],[8,7,6,2,5,7,42,7],[8,6,44,8,8,2,1,6],[6,3,72,7,8,2,2,7],[3,9,45,6,4,2,5,6],[3,6,30,5,6,7,7,2],[9,7,2,4,6,2,50,4],[4,8,4,5,7,2,19,5],[5,6,7,8,6,2,7,8]],"001": [[3,8,-3,6,-8,6,-43,4],[8,4,-9,7,1,7,30,7],[7,5,6,3,5,4,22,8],[4,3,2,6,-1,9,54,6],[-1,5,-4,3,3,6,-8,6],[3,9,30,6,6,8,5,4],[1,4,-44,4,9,4,-9,3],[2,9,7,4,-5,6,-62,8],[-5,5,-66,4,9,8,3,6],[-3,3,6,2,4,3,23,3],[-3,6,2,6,-8,4,11,6],[7,4,-1,2,-4,7,29,7],[-1,6,-1,4,3,6,23,4],[1,3,-33,9,-5,8,-7,4],[5,6,-31,4,3,2,-7,4],[-8,6,7,8,-2,7,7,8],[-6,4,-9,4,7,9,-9,4],[4,5,-26,5,1,4,-6,2],[1,6,-42,6,6,4,-3,9],[6,2,-35,6,8,2,-5,6]],"010": [null],"011": [null],"100": [[7,6,3,6,5,2,27,6],[3,2,5,2,3,9,65,5],[7,2,1,7,1,2,1,7],[5,3,8,2,6,5,66,6],[8,4,39,6,9,3,9,2],[4,6,25,3,7,9,7,3],[2,3,1,5,5,9,1,5],[9,4,1,2,2,6,70,2],[3,7,7,2,1,2,59,7],[5,2,2,9,1,9,58,3],[5,7,2,7,2,7,40,5],[4,5,26,4,4,3,7,6],[3,7,5,8,3,4,5,8],[4,3,47,6,6,3,3,6],[4,2,6,2,3,4,66,2],[5,4,72,8,9,6,9,2],[3,6,9,5,1,7,9,5],[6,7,12,6,3,2,4,2],[2,4,18,3,8,3,5,3],[5,2,8,4,6,7,60,7]],"101": [[9,4,-5,6,6,7,56,3],[-4,6,51,5,1,6,1,5],[-9,2,-4,3,-8,3,7,3],[-4,9,-5,3,3,7,70,2],[-3,4,-2,8,-7,8,-43,8],[-9,6,-29,4,-3,6,7,4],[5,6,2,8,-1,7,1,4],[-4,9,6,7,9,3,6,7],[8,9,-60,4,9,2,-5,9],[-5,3,22,4,-2,8,8,3],[9,3,-65,6,9,4,7,6],[9,7,-8,3,-6,3,-8,3],[-1,8,34,8,-8,2,-7,2],[1,3,-21,7,-5,7,-9,3],[8,9,8,6,7,4,-36,4],[4,5,-12,7,3,7,-3,5],[-8,3,-48,5,-6,5,-4,5],[-5,5,-19,2,7,4,9,6],[8,4,-66,8,2,5,-1,4],[9,4,-2,8,-6,5,-70,4]],"110": [[7,3,38,9,4,2,9,2],[5,2,6,2,7,2,25,7],[1,2,10,9,1,7,3,2],[1,4,9,2,3,7,40,9],[2,5,5,2,1,3,8,3],[7,2,40,9,8,2,8,2],[3,2,7,2,7,5,25,7],[3,8,2,3,4,6,1,2],[8,3,6,5,9,3,4,5],[4,8,4,9,3,7,1,2],[7,6,13,6,4,3,9,4],[6,2,1,2,4,2,13,8],[4,5,7,2,1,2,28,7],[1,2,46,8,3,2,9,2],[2,8,37,8,1,6,9,2],[5,4,7,2,5,2,4,2],[4,2,2,4,8,3,2,5],[5,4,9,2,9,7,21,5],[6,8,6,2,3,6,8,3],[1,6,10,3,1,2,9,2]],"111": [[4,2,-6,7,8,5,-3,3],[-4,4,8,2,-1,7,9,2],[5,9,12,7,4,7,7,4],[8,6,9,2,7,6,37,8],[2,8,28,6,2,5,9,2],[2,9,6,4,1,5,8,5],[8,5,-10,8,4,2,-3,3],[-1,2,33,6,-5,4,9,2],[6,7,7,6,1,2,3,2],[-3,3,-24,7,-2,3,-9,3],[6,9,-7,2,3,7,-11,3],[-3,3,9,4,1,3,7,2],[2,3,13,8,5,9,3,2],[-2,2,8,2,-7,6,27,7],[1,2,15,7,1,8,4,2],[-9,8,9,2,-3,5,10,2],[6,3,25,4,1,2,9,2],[5,7,5,9,5,6,1,2],[-4,2,1,8,-7,3,1,6],[-4,4,9,2,1,5,10,2]]}
    }`);

    // final checks/changes with the settings for edge cases and conflicts
    // pick either integers or fractions if both was selected
    if (solution_form === 'both') solution_form = H.randFromList(['integers','fractions']);

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
    // 35% 1-20 | 25% 21-36 | 20% 37-54 | 20% 55-72
    let absorber_coef_range; // range for the absorber term
    let absorber_range_options = [[1,20],[21,36],[37,54],[55,72]]; 
    if (current_EQ_obj.absorber.length === 0) absorber_range_options = [[1,9],[1,9],[1,9],[1,9]]; // case when there's no absorber (any coef set results in an int sol like x+a=b)
    const normal_coef_range = [1,9]; // range for normal terms
    let rangePicker = H.randInt(1, 100);
    let absorber_range_index; // the index of whichever range will be picked from the array above
    if (rangePicker <= 35) {
        absorber_coef_range = absorber_range_options[0];
        absorber_range_index = 0;
    }
    else if (rangePicker <= 60) {
        absorber_coef_range = absorber_range_options[1];
        absorber_range_index = 1;
    }
    else if (rangePicker <= 80) {
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

const settings = {
    solution_size_range: 'single_digit', // ['single_digit', 'multi_digit']
    lin_eq_equation_form: 'begin_1', // begin, inter, and advan
    solution_form: 'integers', // ['integers', 'fractions', 'both']
    variable_letter: 'x', // any capital or lowercase char
    flip_equation: 'no', // yes or no
    force_positive_coefs: 'yes' // yes or no
};

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
        lin_eq_equation_form: 'inter_1', // need the ability to 'select all' from begin, inter, or advan
        solution_form: 'integers',
        variable_letter: 'x',
        flip_equation: 'no',
        force_positive_coefs: 'no'
    };
}

export function get_rand_settings() {
    return {
        solution_size_range: H.randFromList(['single_digit','multi_digit']), 
        lin_eq_equation_form: 'inter_1', // need the ability to 'select all' from begin, inter, or advan
        solution_form: H.randFromList(['integers','fractions','both']),
        variable_letter: "abcdfghjkmnpqrstuvwxyz"[Math.floor(Math.random() * 22)], // rand alphabet letter excluding e,i,o,l
        flip_equation: H.randFromList(['yes','no']),
        force_positive_coefs: H.randFromList(['yes','no'])
    }; 
}




