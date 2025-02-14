import * as H from '../helper-modules/gen-helpers.js';
import * as PH from '../helper-modules/polynom-helpers.js';
import * as SH from '../helper-modules/settings-helpers.js';

const settings = {
    solution_size_range: 'single_digit', // ['single_digit', 'multi_digit']
    lin_eq_equation_form: 'begin_1', // begin, inter, and advan
    solution_form: 'integers', // ['integers', 'fractions', 'both']
    variable_letter: 'x', // and capital or lowercase char
    flip_equation: 'no', // yes or no
    force_positive_coefs: 'yes' // yes or no
};

export default function genLinEq(formObj) {
    const settings = processSettings(formObj);
    let { solution_size_range, lin_eq_equation_form, solution_form, variable_letter, flip_equation, force_positive_coefs } = settings;

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
                    a === 1 ||
                    !Number.isInteger(this.get_sol(a,b).raw_value)
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
            number_of_coefs: 2
        },
        begin_5: {
            verify_reqs(a, b, c) {
                return !(
                    a === 1 ||
                    !Number.isInteger(this.get_sol(a,b,c).raw_value)
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
            number_of_coefs: 3
        },
        begin_6: {
            verify_reqs(a, b, c) {
                return !(
                    b === 1 ||
                    !Number.isInteger(this.get_sol(a,b,c).raw_value)
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
            number_of_coefs: 3
        },
        begin_7: {
            verify_reqs(a, b, c) {
                return !(
                    a === b ||
                    !Number.isInteger(this.get_sol(a,b,c).raw_value)
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
        begin_8: {
            verify_reqs(a, b, c, d) {
                return !(
                    b < 0 ||
                    d < 0 ||
                    b === 1 ||
                    d === 1 ||
                    a === b ||
                    c === d ||
                    !Number.isInteger(this.get_sol(a,b,c, d).raw_value)
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
                    c === d ||
                    !Number.isInteger(this.get_sol(a,b,c, d).raw_value)
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
            number_of_coefs: 3
        },
        inter_1: {
            verify_reqs(a, b, c, d) {
                return !(
                    a === c ||
                    !Number.isInteger(this.get_sol(a,b,c,d).raw_value)
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
            number_of_coefs: 4
        },
        inter_2: {
            verify_reqs(a, b, c, d) {
                return !(
                    b === c ||
                    !Number.isInteger(this.get_sol(a,b,c,d).raw_value)
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
            number_of_coefs: 4
        },
        inter_3: {
            verify_reqs(a, b, c) {
                return !(
                    a === 1 ||
                    !Number.isInteger(this.get_sol(a, b, c).raw_value)
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
            number_of_coefs: 3
        },
        inter_4: {
            verify_reqs(a, b, c, d) {
                return !(
                    a === 1 ||
                    b === 1 ||
                    !Number.isInteger(this.get_sol(a,b,c,d).raw_value)
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
            number_of_coefs: 4
        },
        inter_5: {
            verify_reqs(a, b, c, d, e) {
                return !(
                    b === 1 ||
                    !Number.isInteger(this.get_sol(a,b,c,d,e).raw_value)
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
            number_of_coefs: 5
        },
        inter_6: {
            verify_reqs(a, b, c, d, e) {
                return !(
                    a === 1 ||
                    !Number.isInteger(this.get_sol(a,b,c,d,e).raw_value)
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
            number_of_coefs: 5
        },
        inter_7: {
            verify_reqs(a, b, c, d, e) {
                return !(
                    b === 1 ||
                    a === (-1)*b*c ||
                    !Number.isInteger(this.get_sol(a,b,c,d,e).raw_value)
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
            number_of_coefs: 5
        },
        inter_8: {
            verify_reqs(a, b, c, d, e) {
                return !(
                    a === 1 ||
                    d === (-1)*a*b ||
                    !Number.isInteger(this.get_sol(a,b,c,d,e).raw_value)
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
            number_of_coefs: 5
        },
        inter_9: {
            verify_reqs(a, b, c, d, e) {
                return !(
                    a === 1 ||
                    e === a*b ||
                    !Number.isInteger(this.get_sol(a,b,c,d,e).raw_value)
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
            number_of_coefs: 5
        },
        inter_10: {
            verify_reqs(a, b, c, d, e, f) {
                return !(
                    a === 1 ||
                    d === 1 ||
                    a*b === d*e ||
                    !Number.isInteger(this.get_sol(a,b,c,d,e,f).raw_value)
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
            number_of_coefs: 6
        },
        inter_11: {
            verify_reqs(a, b, c, d, e) {
                return !(
                    c === 1 ||
                    c < 0 ||
                    a === c*d ||
                    !Number.isInteger(this.get_sol(a,b,c,d,e).raw_value)
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
            number_of_coefs: 5
        },
        inter_12: {
            verify_reqs(a, b, c) {
                return !(
                    a === 1 ||
                    a === -1 ||
                    b === 1 ||
                    b === -1 ||
                    a === (-1)*b ||
                    !Number.isInteger(this.get_sol(a,b,c).raw_value)
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
            number_of_coefs: 3
        },
        inter_13: {
            verify_reqs(a, b, c, d) {
                return !(
                    a === -1 ||
                    a === 1 ||
                    (a*c) === 1 ||
                    !Number.isInteger(this.get_sol(a,b,c,d).raw_value)
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
            number_of_coefs: 4
        },
        inter_14: {
            verify_reqs(a, b, c, d) {
                return !(
                    a === 1 ||
                    b === 1 ||
                    b === -1 ||
                    !Number.isInteger(this.get_sol(a,b,c,d).raw_value)
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
            number_of_coefs: 4
        },
        inter_15: {
            verify_reqs(a, b, c, d) {
                return !(
                    a === 1 ||
                    a === -1 ||
                    c === 1 ||
                    c === -1 ||
                    a === c ||
                    !Number.isInteger(this.get_sol(a,b,c,d).raw_value)
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
            number_of_coefs: 4
        },
        inter_16: {
            verify_reqs(a, b, c, d, e) {
                return !(
                    a === (d - c) ||
                    !Number.isInteger(this.get_sol(a,b,c,d,e).raw_value)
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
            number_of_coefs: 5
        },
        advan_1: {
            verify_reqs(a, b, c, d, e, f, g) {
                return !(
                    b === 1 ||
                    e === 1 ||
                    (b * c) === (e * f) ||
                    !Number.isInteger(this.get_sol(a,b,c,d,e,f,g).raw_value)
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
            number_of_coefs: 7
        },
        advan_2: {
            verify_reqs(a, b, c, d, e, f, g) {
                return !(
                    b === 1 ||
                    e === 1 ||
                    a === (e*f) - (b*c) ||
                    !Number.isInteger(this.get_sol(a,b,c,d,e,f,g).raw_value)
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
            number_of_coefs: 7
        },
        advan_3: {
            verify_reqs(a, b, c, d, e, f, g, h) {
                return !(
                    b === 1 ||
                    f === 1 ||
                    (b*c) === e + (f*g) ||
                    !Number.isInteger(this.get_sol(a,b,c,d,e,f,g,h).raw_value)
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
            number_of_coefs: 8
        },
        advan_4: {
            verify_reqs(a, b, c, d, e, f, g) {
                return !(
                    a === 1 ||
                    d === 1 ||
                    (a*b) === (-1)*d*e ||
                    !Number.isInteger(this.get_sol(a,b,c,d,e,f,g).raw_value)
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
            number_of_coefs: 7
        },
        advan_5: {
            verify_reqs(a, b, c, d, e, f) {
                return !(
                    c < 0 ||
                    f < 0 ||
                    c === 1 ||
                    f === 1 ||
                    (a*f) === (c*d) ||
                    !Number.isInteger(this.get_sol(a,b,c,d,e,f).raw_value)
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
            number_of_coefs: 6
    
        },
        advan_6: {
            verify_reqs(a, b, c, d, e, f, g) {
                return !(
                    c < 0 ||
                    f < 0 ||
                    c === 1 ||
                    f === 1 ||
                    (a*f) === (-1)*(c*d) ||
                    !Number.isInteger(this.get_sol(a,b,c,d,e,f,g).raw_value)
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
            number_of_coefs: 7
        },
        advan_7: {
            verify_reqs(a, b, c, d, e, f, g) {
                return !(
                    c < 0 ||
                    g < 0 ||
                    c === 1 ||
                    g === 1 ||
                    (a*g) === (c*e) ||
                    !Number.isInteger(this.get_sol(a,b,c,d,e,f,g).raw_value)
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
            number_of_coefs: 7
        },
        advan_8: {
            verify_reqs(a, b, c, d, e, f) {
                return !(
                    c === 1 ||
                    d === 1 ||
                    c > 0 ||
                    a === (c*d*e) ||
                    !Number.isInteger(this.get_sol(a,b,c,d,e,f).raw_value)
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
            number_of_coefs: 6
        },
        advan_9: {
            verify_reqs(a, b, c, d, e, f) {
                return !(
                    c === 1 ||
                    c < 0 ||
                    a === (c*e) - (c*d) ||
                    !Number.isInteger(this.get_sol(a,b,c,d,e,f).raw_value)
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
                    (a*c*f) === (b*e*g) ||
                    !Number.isInteger(this.get_sol(a,b,c,d,e,f,g,h).raw_value)
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
                    (a*e) === (b*d) ||
                    !Number.isInteger(this.get_sol(a,b,c,d,e,f).raw_value)
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
            number_of_coefs: 6
        },
        advan_12: {
            verify_reqs(a, b, c, d, e, f, g, h, i) {
                return !(
                    a === 1 ||
                    d === 1 ||
                    g === 1 ||
                    (a*b) === (g*h) - (d*e) ||
                    !Number.isInteger(this.get_sol(a,b,c,d,e,f,g,h,i).raw_value)
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
            number_of_coefs: 9
        },
        advan_10: {
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
                    (a*d*f*h) === (b*d*e*h) ||
                    !Number.isInteger(this.get_sol(a,b,c,d,e,f,g,h).raw_value)
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

    


}






