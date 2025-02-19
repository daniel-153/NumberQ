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

    if (solution_form === 'both') solution_form = H.randFromList('integers','fractions')

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
            number_of_coefs: 2
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
            number_of_coefs: 2
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
            number_of_coefs: 2
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
                    c === d 
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
                    c === d 
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
            number_of_coefs: 3
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
            number_of_coefs: 3
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
            number_of_coefs: 3
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
            absorber: [H.randFromList(['b','c'])],
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
                let x_on_a = MH.start_frac(vl, a);
                let x_on_b = MH.middle_frac(vl, b);
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
                let x_on_a = MH.start_frac(a, vl);
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
                    e === f ||
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
                    a < 0 ||
                    d < 0 ||
                    f < 0 ||
                    h < 0 ||
                    a === 1 ||
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
    while (!sol_is_found) {
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
        solution_size_range: 'multi_digit', // (+ or -) whatever value is here
        lin_eq_equation_form: 'inter_1', // need the ability to 'select all' from begin, inter, or advan
        solution_form: 'integers',
        variable_letter: 'x',
        flip_equation: 'no',
        force_positive_coefs: 'no'
    };
}




