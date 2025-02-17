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
    
            return a;
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
    
            return a; 
        },
        middle_var(a) { // a variable term in the middle of an expression
            if (a === 1) a = '+';
            else if (a === -1) a  = '-';
            else if (a > 0) a = '+' + a;
    
            return a;
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
                a = MH.middle_const(a);
    
                return a + vl + '=' + b;
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
                b = MH.middle_var(b);
    
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
                let x_on_b = MH.middle_denom(b, vl);
    
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
                b = MH.middle_var(b);
                c = MH.start_var(c);
                d = MH.middle_const(d);
    
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
                let x_on_a = MH.start_frac(a, vl);
                let x_on_b = MH.middle_frac(b, vl);
    
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
                d = middle_const(d);
    
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

    // create a function that checks if the answer is within range for integer solutions and fractional solutions
    let solutionIsValid;
    if (solution_form === 'integers') { // Note: 'solution_obj' below is {raw_value, numer, denom}
        solutionIsValid = function(solution_obj, sol_size_max) { // ensure the sol is between (+ or -) solution_size AND sol is an int
            let raw_sol_value = solution_obj.raw_value;
            
            return (
                (raw_sol_value | 0) === raw_sol_value &&
                raw_sol_value <= sol_size_max &&
                raw_sol_value >= (-1)*sol_size_max
            );
        }
    }
    else if (solution_form === 'fractions') {
        solutionIsValid = function(solution_obj, sol_size_max) { // ensure the numer and denom are within (+ or -) solution_size AND sol is NOT an int
            let raw_sol_value = solution_obj.raw_value;
            let sol_numer = solution_obj.numer;
            let sol_denom = solution_obj.denom;
            
            return (
                (raw_sol_value | 0) !== raw_sol_value &&
                sol_numer <= sol_size_max &&
                sol_numer >= (-1)*sol_size_max &&
                sol_denom <= sol_size_max &&
                sol_denom >= (-1)*sol_size_max
            );
        }
    }

    // get the current equation object that will be used (this has verify_reqs, get_sol, create_prompt, absorber, number_of_coefs)
    const current_EQ_obj = equations[lin_eq_equation_form]; 

    // pick a starting range for the absorber term based on a pre-set probability distribution
    // 35% 1-20 | 25% 21-36 | 20% 37-54 | 20% 55-72
    let absorber_coef_range; // range for the absorber term
    let absorber_range_options = [[1,20],[21,36],[37,54],[55,72]]; 
    if (current_EQ_obj.absorber.length === 0) absorber_range_options = [[-9,9],[-9,9][-9,9],[-9,9]]; // case when there's no absorber (any coef set results in an int sol like x+a=b)
    const normal_coef_range = [-9,9]; // range for normal terms
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
        if (i !== absorber_index) coefficient_ranges.push(normal_coef_range);
        else coefficient_ranges.push(absorber_coef_range)
    }

    let List_of_sols = [];
    





    

    // final coefs and sol 
    let final_coef_array = possible_sols[0].slice(1);
    let final_solution = possible_sols[0][0];
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

    console.log('sol list: ',list_of_sols)
    console.log('% of Coefs that were viable: ' + (list_of_sols.length / initial_coef_list.length) * 100 + '%')

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
        solution_size_range: 'single_digit', // (+ or -) whatever value is here
        lin_eq_equation_form: 'inter_1', // need the ability to 'select all' from begin, inter, or advan
        solution_form: 'integers',
        variable_letter: 'x',
        flip_equation: 'no',
        force_positive_coefs: 'no'
    };
}

{
    // helper function to generate the permuation of the coefficients
    function generateCombinations(ranges) {
        let values = ranges.map(([min, max]) => {
            return Array.from({ length: max - min + 1 }, (_, i) => min + i);
        });
    
        let result = [[]]; // Start with an empty combination
    
        for (let valueSet of values) {
            let temp = [];
            for (let partial of result) {
                for (let value of valueSet) {
                    temp.push([...partial, value]); // Append new values
                }
            }
            result = temp; // Update result with new combinations
        }
    
        return result;
    }
    
    // the initial list of coefs (filter ensures they are all non-zero)
    let initial_coef_list  = generateCombinations(coefficient_ranges).filter(coefs => !coefs.includes(0));
    
    // only allow positive coefs if specified
    if (force_positive_coefs === 'yes') {
        initial_coef_list = initial_coef_list.filter(coefs => !coefs.some(num => num < 0));
    }

    // start by searching all of the initial coefs, then (if no sol is found) search the next absorber range
    let current_coef_set; // the set of coefficients in the current iteration
    let current_sol_obj; // the solution obj {raw_value, numer, denom} of a given coef set
    let list_of_sols = []; // all of the solutions that were found (where entry 0 is the sol, and the rest of the entries are the coefs

    // initial_coef_list = [[-5,7,2,-35]]; // testing

    for (let i = 0; i < initial_coef_list.length; i++) {
        current_coef_set = initial_coef_list[i];
        current_sol_obj = current_EQ_obj.get_sol(...current_coef_set);
        if (
            current_EQ_obj.verify_reqs(...current_coef_set) &&
            solutionIsValid(current_sol_obj, solution_size)
        ) { // all requirements are met (coef reqs + int sol + sol within range) 
            if (solution_form === 'integers') {
                list_of_sols.push([current_sol_obj.raw_value, ...current_coef_set]);
            }
            else if (solution_form === 'fractions') {
                const fractional_sol = current_coef_set.numer + '/' + current_sol_obj.denom;
                list_of_sols.push([fractional_sol, ...current_coef_set]);
            }
        }

        i++;
    } // now, all sets of coefficients from the initial ranges have been tested

    // determine whether the initial ranges yielded any solutions
    let solution_is_found = false;
    if (list_of_sols.length > 0) {
        solution_is_found = true;
    }

    let current_search_range = (absorber_range_index + 1) % absorber_range_options.length;
    while (
        !solution_is_found && 
        current_search_range % absorber_range_options.length !== absorber_range_index
    ) { // keep running this code until we find a solution OR check all the ranges
        coefficient_ranges.splice(absorber_index, 1, absorber_range_options[current_search_range]); // switch to the new range for the absorber
        let new_coef_list = generateCombinations(coefficient_ranges).filter(coefs => !coefs.includes(0));
        
        for (let i = 0; i < new_coef_list.length; i++) {
            current_coef_set = new_coef_list[i];
            current_sol_obj = current_EQ_obj.get_sol(...current_coef_set);
            if (
                current_EQ_obj.verify_reqs(...current_coef_set) &&
                solutionIsValid(current_sol_obj)
            ) { // all requirements are met (coef reqs + int sol + sol within range) 
                if (solution_form === 'integers') {
                    list_of_sols.push([current_sol_obj.raw_value, ...current_coef_set]);
                }
                else if (solution_form === 'fractions') {
                    const fractional_sol = current_coef_set.numer + '/' + current_sol_obj.denom;
                    list_of_sols.push([fractional_sol, ...current_coef_set]);
                }
            }
    
            i++;
        } // now we've search the next range in the list (or a wrap-around)

        // determine if any solutions where found in the new range
        if (list_of_sols.length > 0) solution_is_found = true; 
        else { // move to the next range OR give an error if we searched all the ranges without finding a sol
            if (current_search_range % absorber_range_options.length !== absorber_range_index) current_search_range++
            else {
                console.error('No solutions were found for Equation_ID = ' + lin_eq_equation_form + 
                    ', with a Solution_Range of: ' + solution_size_range);
            }
        }
    } // now list_of_sols contains all the possible solutions that can be picked for this generation
        
    // helper function to remove all repeat elements from arrays
    function removeArrayRepeats(array) {
        return [...new Set(array)];
    }

    // helper function to keep all solution sets with 'element' at 'sub_index'
    function keepSolutions(element, sub_index, solution_list) {
        return solution_list.filter(subArray => subArray[sub_index] === element);
    }

    // helper function to extract a particular coefficient from the solution list
    function extractSubElements(sub_index, array) {
        return array.map(subArray => subArray[sub_index]);
    }

    // decide which order to select the coefs in ([3,1,2] means to select 'c', then 'a', then 'b')
    let coef_select_order = H.randomizeList(H.integerArray(1, number_of_coefs));

    // randomly pick a solution
    const picked_solution = H.randFromList(removeArrayRepeats(extractSubElements(0, list_of_sols)));
    let possible_sols; // list all sets of coefs that result in the given sol
    if (solution_form === 'integers') {
        possible_sols = keepSolutions(picked_solution, 0, list_of_sols);
    }
    else if (solution_form === 'fractions') {
        let [ numer, denom ] = picked_solution.split('/');
        let sol_value = Number(numer) / Number(denom);

        possible_sols = list_of_sols.filter(subArray => // filter all the fractions that have the same value as the selected solution
            (Number(subArray.split('/')[0]) / Number(subArray.split('/')[1])) === sol_value
        );
    }

    // randomly pick coefs from those that are possible
    let current_coef_index; // the index of whichever coef is being dealt with 1 -> 'a', 2 -> 'b', etc
    let current_coef; // the coefficient that is selected from all those possible (in a given loop run)
    for (let i = 0; i < coef_select_order.length; i++) {
        current_coef_index = coef_select_order[i]; // pick the coefficients in the randomize order determined by coef_select_order
        current_coef = H.randFromList(removeArrayRepeats(extractSubElements(current_coef_index, list_of_sols))); // pick a coef
        possible_sols = keepSolutions(current_coef, current_coef_index, list_of_sols); // keep only the sols with that coef in that spot
    } // now, possible sols must only contain one sub_array (like [[1,2,3]]), and this is the final set of coefs
}




