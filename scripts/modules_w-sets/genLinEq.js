import * as H from '../helper-modules/gen-helpers.js';
import * as PH from '../helper-modules/polynom-helpers.js';
import * as SH from '../helper-modules/settings-helpers.js';

function searchSols() {
    let range = 20;
    let x;

    let solutions = [];
    for (let a = 1; a <= range; a++) {
        for (let b = 1; b <= range; b++) {
            for (let c = -range; c <= range; c++) {
                x = a*b*c / (a + b);
                if (
                    a === 1 || a === -1 ||
                    b === 1 || b === -1 ||
                    a === b ||
                    a === (-1)*b ||
                    a*b*c === 0 ||
                    !Number.isInteger(x) ||
                    x > 20 ||
                    x < -20
                ) {
                    continue;
                }
                solutions.push({a, b, c, x});
            }
        }
    }

    console.table(solutions);
}


// pickEq(veryify_reqs(), get_sol(), create_prompt())

// Global convention: in the verify_reqs function, the conditions are every way that a solution could fail. In other words, you are saying
// 'If this, or this, or this, or this, or this is true, the set of numbers won't work' -> then you negate that to turn it into && 

const equation_templates = {
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
        create_prompt(a, b) {
            if (a === -1) a = '-'
            return a + 'x=' + b;
        },
        number_of_coefs: 2
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
        create_prompt(a, b, c, d) {
            if (a === 1) a = '';
            else if (a === -1) a = '-';

            if (c === 1) c = '';
            else if (c === -1) a = '-'; 

            if (b > 0) b = '+' + b;
            if (d > 0) d = '+' + d;

            return a + 'x' + b + '=' + c + 'x' + d;
        },
        number_of_coefs: 4
    },
    advan_1: {
        verify_reqs(a, b, c, d, e, f, g) {
            return !(
                b === 1,
                e === 1,
                (b * c) === (e * f) ||
                !Number.isInteger(this.get_sol(a,b,c,d,e,f,g).raw_value)
            );
        },
        get_sol(a,b) {
            return {
                raw_value: ((e*g) - a - (b*d)) / ((b*c) - (e*f)),
                numer: ((e*g) - a - (b*d)),
                denom: ((b*c) - (e*f))
            };
        },
        create_prompt(a, b) {
            if (b === 1) b = '+';
            else if (b === -1) b = '-';
            else if (b > 0) b = '+' + b;

            // maybe add helper functions? you're going to need to repeat the above like 100 times...



            return a + b + '(' + c + 'x' + d + ')=' + e +'(' + f + 'x' + g + ')';
        },
        number_of_coefs: 7
    },

};