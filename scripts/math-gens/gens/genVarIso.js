import * as H from '../helpers/gen-helpers.js';
import * as SH from '../helpers/settings-helpers.js';
import { sumEx, prodEx, fracEx, randomizeSumExTermOrder, simplifiedExpressionString } from '../helpers/polynom-helpers.js';

export function validateSettings(form_obj, error_locations) {

}

const VIH = { // genVarIso helpers
    buildEq: function(lhs_arr, rhs_arr) {
        const lhs_sum_ex = sumEx(...lhs_arr);
        const rhs_sum_ex = sumEx(...rhs_arr);

        // randomize the order of the terms on each side
        randomizeSumExTermOrder(lhs_sum_ex);
        randomizeSumExTermOrder(rhs_sum_ex);

        // randomly swap the sides of the equation
        if (H.randInt(0, 1) === 0) {
            return `${simplifiedExpressionString(lhs_sum_ex)}=${simplifiedExpressionString(rhs_sum_ex)}`;
        }
        else {
            return `${simplifiedExpressionString(rhs_sum_ex)}=${simplifiedExpressionString(lhs_sum_ex)}`;
        }
        
    },
    buildEx: function(ex_arr) {
        return simplifiedExpressionString(sumEx(...ex_arr));
    },
    buildFrac: function(numer_arr, denom_arr, randomize_term_order = false) {
        const num_sum_ex = sumEx(...numer_arr);
        const den_sum_ex = sumEx(...denom_arr);
        if (randomize_term_order) {
            randomizeSumExTermOrder(num_sum_ex);
            randomizeSumExTermOrder(den_sum_ex);
        } 

        return fracEx(num_sum_ex, den_sum_ex);
    },
    pure_var_random_forms: [
        {
            a:(b,c) => `${b} + ${c}`,
            b:(a,c) => `${a} - ${c}`,
            c:(a,b) => `${a} - ${b}`
        },
        {
            a:(b,c) => `${b}${c}`,
            b:(a,c) => `\\frac{${a}}{${c}}`,
            c:(a,b) => `\\frac{${a}}{${b}}`
        },
        {
            base_form:(a,b,c,d) => `${a}${b}=${c}${d}`,
            a:(b,c,d) => `\\frac{${c}${d}}{${b}}`,
            b:(a,c,d) => `\\frac{${c}${d}}{${a}}`,
            c:(a,b,d) => `\\frac{${a}${b}}{${d}}`,
            d:(a,b,c) => `\\frac{${a}${b}}{${c}}`
        },
        {
            base_form:(a,b,c,d) => `${a} + ${b}=${c} + ${d}`,
            a:(b,c,d) => `${c} + ${d} - ${b}`,
            b:(a,c,d) => `${c} + ${d} - ${a}`,
            c:(a,b,d) => `${a} + ${b} - ${d}`,
            d:(a,b,c) => `${a} + ${b} - ${c}`
        },
        {
            base_form:(a,b,c,d) => `${a}${b}=${c} + ${d}`,
            a:(b,c,d) => `\\frac{${c} + ${d}}{${b}}`,
            b:(a,c,d) => `\\frac{${c} + ${d}}{${a}}`,
            c:(a,b,d) => `${a}${b} - ${d}`,
            d:(a,b,c) => `${a}${b} - ${c}`
        },
        {
            base_form: 'd-flipped',
            a:(b,c,d) => `\\frac{${d} - ${c}}{${b}}`,
            b:(a,c,d) => `\\frac{${d} - ${c}}{${a}}`,
            c:(a,b,d) => `${d} - ${a}${b}`,
            d:(a,b,c) => `${a}${b} + ${c}`
        },
        {
            a:(b,c) => `\\frac{${b}}{${c}}`,
            b:(a,c) => `${a}${c}`,
            c:(b,a) => `\\frac{${b}}{${a}}`
        },
        {
            base_form:(a,b,c,d) => `\\frac{${a}}{${b}}=\\frac{${c}}{${d}}`,
            a:(b,c,d) => `\\frac{${b}${c}}{${d}}`,
            b:(a,c,d) => `\\frac{${a}${d}}{${c}}`,
            c:(a,b,d) => `\\frac{${a}${d}}{${b}}`,
            d:(a,b,c) => `\\frac{${b}${c}}{${a}}`
        },
        {
            base_form: 'd-flipped',
            a:(b,c,d) => `${d} - \\frac{${b}}{${c}}`,
            b:(a,c,d) => `${c}${d} - ${a}${c}`,
            c:(a,b,d) => `\\frac{${b}}{${d} - ${a}}`,
            d:(a,b,c) => `${a} + \\frac{${b}}{${c}}`
        },
        {
            a:(b,c,d) => `\\frac{${b}}{${c} + ${d}}`,
            b:(a,c,d) => `${a}${c} + ${a}${d}`,
            c:(a,b,d) => `\\frac{${b} - ${a}${d}}{${a}}`,
            d:(a,b,c) => `\\frac{${b} - ${a}${c}}{${a}}`
        },
        {
            base_form:(a,b,c,d) => `${a} + ${b}=\\frac{${c}}{${d}}`,
            a:(b,c,d) => `\\frac{${c}}{${d}} - ${b}`,
            b:(a,c,d) => `\\frac{${c}}{${d}} - ${a}`,
            c:(a,b,d) => `${a}${d} + ${b}${d}`,
            d:(a,b,c) => `\\frac{${c}}{${a} + ${b}}`
        },
        {   
            base_form:(a,b,c,d,e) => `\\frac{${a}}{${b} + ${c}}=${d} + ${e}`,
            a:(b,c,d,e) => `${b}${d} + ${b}${e} + ${c}${d} + ${c}${e}`,
            b:(a,c,d,e) => `\\frac{${a} - ${c}${d} - ${c}${e}}{${d} + ${e}}`,
            c:(a,b,d,e) => `\\frac{${a} - ${b}${d} - ${d}${e}}{${d} + ${e}}`,
            d:(a,b,c,e) => `\\frac{${a} - ${b}${e} - ${c}${e}}{${b} + ${c}}`,
            e:(a,b,c,d) => `\\frac{${a} - ${b}${d} - ${c}${d}}{${b} + ${c}}`
        },
        {
            base_form: 'e-flipped',
            a:(b,c,d,e) => `${b}${e} - \\frac{${b}${c}}{${d}}`,
            b:(a,c,d,e) => `\\frac{${a}${d}}{${d}${e} - ${c}}`,
            c:(a,b,d,e) => `${d}${e} - \\frac{${a}${d}}{${b}}`,
            d:(a,b,c,e) => `\\frac{${b}${c}}{${b}${e} - ${a}}`,
            e:(a,b,c,d) => `\\frac{${a}}{${b}} + \\frac{${c}}{${d}}`
        },
        {
            base_form:(a,b,c,d,e) => `${a} + ${b} + ${c}=${d} + ${e}`,
            a:(b,c,d,e) => `${d} + ${e} - ${b} - ${c}`,
            b:(a,c,d,e) => `${d} + ${e} - ${a} - ${c}`,
            c:(a,b,d,e) => `${d} + ${e} - ${a} - ${b}`,
            d:(a,b,c,e) => `${a} + ${b} + ${c} - ${e}`,
            e:(a,b,c,d) => `${a} + ${b} + ${c} - ${d}` 
        },
        {
            a:(b,c,d,e) => `\\frac{${b} + ${c} + ${d}}{${e}}`,
            b:(a,c,d,e) => `${a}${e} - ${c} - ${d}`,
            c:(a,b,d,e) => `${a}${e} - ${b} - ${d}`,
            d:(a,b,c,e) => `${b} + ${c} - ${a}${e}`,
            e:(a,b,c,d) => `\\frac{${b} + ${c} + ${d}}{${a}}`
        },
        {
            base_form:(a,b,c,d) => `\\frac{${a}}{${a} + ${c}}=\\frac{${b}}{${c} + ${d}}`,
            a:(b,c,d) => `\\frac{${b}${c}}{${c} + ${d} - ${b}}`,
            b:(a,c,d) => `\\frac{${a}${c} + ${a}${d}}{${a}${c}}`,
            c:(a,b,d) => `\\frac{${a}${b} - ${a}${d}}{${a} - ${b}}`,
            d:(a,b,c) => `\\frac{${a}${b} + ${b}${c} - ${a}${c}}{${a}}`
        },
        {
            base_form:(a,b,c,d,e) => `${a}${b} + ${c}=${d}${e}`,
            a:(b,c,d,e) => `\\frac{${d}${e} - ${c}}{${b}}`,
            b:(a,c,d,e) => `\\frac{${d}${e} - ${c}}{${a}}`,
            c:(a,b,d,e) => `${d}${e} - ${a}${b}`,
            d:(a,b,c,e) => `\\frac{${a}${b} + ${c}}{${e}}`,
            e:(a,b,c,d) => `\\frac{${a}${b} + ${c}}{${d}}`
        },
        {
            a:(b,c,d,e) => `${b}${c}${d}${e}`,
            b:(a,c,d,e) => `\\frac{${a}}{${c}${d}${e}}`,
            c:(a,b,d,e) => `\\frac{${a}}{${b}${d}${e}}`,
            d:(a,b,c,e) => `\\frac{${a}}{${b}${c}${e}}`,
            e:(a,b,c,d) => `\\frac{${a}}{${b}${c}${d}}`
        },
        {
            base_form:(a,b,c,d,e) => `${a}${b}=${c}${d}${e}`,
            a:(b,c,d,e) => `\\frac{${c}${d}${e}}{${b}}`,
            b:(a,c,d,e) => `\\frac{${c}${d}${e}}{${a}}`,
            c:(a,b,d,e) => `\\frac{${a}${b}}{${d}${e}}`,
            d:(a,b,c,e) => `\\frac{${a}${b}}{${c}${e}}`,
            e:(a,b,c,d) => `\\frac{${a}${b}}{${c}${d}}`
        },
        {
            base_form:(a,b,c,d) => `${a}${b} + ${a}${c}=${b}${c} + ${b}${d}`,
            a:(b,c,d) => `\\frac{${b}${c} + ${b}${d}}{${b} + ${c}}`,
            b:(a,c,d) => `\\frac{${a}${d} - ${a}${c}}{${a} - ${c}}`,
            c:(a,b,d) => `\\frac{${b}${d} - ${a}${b}}{${a} - ${b}}`,
            d:(a,b,c) => `\\frac{${a}${b} + ${a}${c} - ${b}${c}}{${b}}`
        },
        {
            base_form:(a,b,c,d,e) => `\\frac{${a}${b}}{${c}}=${d}${e}`,
            a:(b,c,d,e) => `\\frac{${c}${d}${e}}{${b}}`,
            b:(a,c,d,e) => `\\frac{${c}${d}${e}}{${a}}`,
            c:(a,b,d,e) => `\\frac{${a}${b}}{${d}${e}}`,
            d:(a,b,c,e) => `\\frac{${a}${b}}{${c}${e}}`,
            e:(a,b,c,d) => `\\frac{${a}${b}}{${c}${d}}`
        },
        {
            base_form:(a,b,c,d,e) => `\\frac{${a} + ${b}}{${c}}=${d}${e}`,
            a:(b,c,d,e) => `${c}${d}${e} - ${b}`,
            b:(a,c,d,e) => `${c}${d}${e} - ${a}`,
            c:(a,b,d,e) => `\\frac{${a} + ${b}}{${d}${e}}`,
            d:(a,b,c,e) => `\\frac{${a} + ${b}}{${c}${e}}`,
            e:(a,b,c,d) => `\\frac{${a} + ${b}}{${c}${d}}`
        },
        {
            a:(b,c,d,e) => `\\frac{${b}}{${c} + ${d} + ${e}}`,
            b:(a,c,d,e) => `${a}${c} + ${a}${d} + ${a}${e}`,
            c:(a,b,d,e) => `\\frac{${b} - ${a}${d} - ${a}${e}}{${a}}`,
            d:(a,b,c,e) => `\\frac{${b} - ${a}${c} - ${a}${e}}{${a}}`,
            e:(a,b,c,d) => `\\frac{${b} - ${a}${c} - ${a}${d}}{${a}}`
        },
        {
            a:(b,c,d,e) => `\\frac{${b} + ${c}}{${d}${e}}`,
            b:(a,c,d,e) => `${a}${d}${e} - ${c}`,
            c:(a,b,d,e) => `${a}${d}${e} - ${b}`,
            d:(a,b,c,e) => `\\frac{${b} + ${c}}{${a}${e}}`,
            e:(a,b,c,d) => `\\frac{${b} + ${c}}{${a}${d}}`
        },
        {
            base_form:(a,b,c,d,e) => `${a} + ${b} + ${c}=${d}${e}`,
            a:(b,c,d,e) => `${d}${e} - ${b} - ${c}`,
            b:(a,c,d,e) => `${d}${e} - ${a} - ${c}`,
            c:(a,b,d,e) => `${d}${e} - ${a} - ${b}`,
            d:(a,b,c,e) => `\\frac{${a} + ${b} + ${c}}{${e}}`,
            e:(a,b,c,d) => `\\frac{${a} + ${b} + ${c}}{${d}}`
        },
        {
            base_form:(a,b,c,d,e) => `\\frac{${a} + ${b}}{c}=\\frac{${d}}{${c} + ${e}}`,
            a:(b,c,d,e) => `\\frac{${c}${d}}{${c} + ${e}} - ${b}`,
            b:(a,c,d,e) => `\\frac{${c}${d}}{${c} + ${e}} - ${a}`,
            c:(a,b,d,e) => `\\frac{${a}${e} + ${b}${e}}{${d} - ${a} - ${b}}`,
            d:(a,b,c,e) => `\\frac{${a}${c} + ${b}${c} + ${a}${e} + ${b}${e}}{${c}}`,
            e:(a,b,c,d) => `\\frac{${c}${d} - ${a}${c} - ${b}${c}}{${a} + ${b}}`
        },
        {
            base_form:(a,b,c,d,e) => `\\frac{${a}${b} + ${c}${d}}{${d}}=${c}${e}`,
            a:(b,c,d,e) => `\\frac{${c}${d}${e} - ${c}${d}}{${b}}`,
            b:(a,c,d,e) => `\\frac{${c}${d}${e} - ${c}${d}}{${a}}`,
            c:(a,b,d,e) => `\\frac{${a}${b}}{${d}${e} - ${d}}`,
            d:(a,b,c,e) => `\\frac{${a}${b}}{${c}${e} - ${c}}`,
            e:(a,b,c,d) => `\\frac{${a}${b} + ${c}${d}}{${c}${d}}`
        },
        {
            base_form:(a,b,c,d,e) => `\\frac{${a}${d}}{${b}${d} + ${c}}=\\frac{${e}}{${c}}`,
            a:(b,c,d,e) => `\\frac{${b}${d}${e} + ${c}${e}}{${c}${d}}`,
            b:(a,c,d,e) => `\\frac{${a}${c}${d}}{$${d}${e}} - \\frac{${c}}{${d}}`,
            c:(a,b,d,e) => `\\frac{${b}${d}${e}}{${a}${d} - ${e}}`,
            d:(a,b,c,e) => `\\frac{${c}${e}}{${a}${c} - ${b}${e}}`,
            e:(a,b,c,d) => `\\frac{${a}${c}${d}}{${b}${d} + ${c}}`
        },
        {
            base_form:(a,b,c,d,e) => `${a}${b} + ${b}${c}=${c}${d} + ${d}${e}`,
            a:(b,c,d,e) => `\\frac{${c}${d} + ${d}${e} - ${b}${c}}{${b}}`,
            b:(a,c,d,e) => `\\frac{${c}${d} + ${d}${e}}{${a} + ${c}}`,
            c:(a,b,d,e) => `\\frac{${a}${b} - ${d}${e}}{${d} - ${b}}`,
            d:(a,b,c,e) => `\\frac{${a}${b} + ${b}${c}}{${c} + ${e}}`,
            e:(a,b,c,d) => `\\frac{${a}${b} + ${b}${c} - ${c}${d}}{${d}}`
        },
        {
            a:(b,c,d,e) => `\\frac{${b}${c} + ${c}${d}}{${e} + ${c}${d}}`,
            b:(a,c,d,e) => `\\frac{${a}${e} + ${a}${c}${d} - ${c}${d}}{${c}}`,
            c:(a,b,d,e) => `\\frac{${a}${e}}{${b} + ${d} + ${a}${d}}`,
            d:(a,b,c,e) => `\\frac{${b}${c} - ${a}${e}}{${a}${c} - ${c}}`,
            e:(a,b,c,d) => `\\frac{${b}${c} + ${c}${d} - ${a}${c}${d}}{${a}}`
        }
    ],
    numerical_random_forms: [
        {
            base_form:(a,b,A,B,C) => VIH.buildEq([prodEx(A,a), prodEx(B,b)], [prodEx(C)]),
            a:(b,A,B,C) => VIH.buildEx([VIH.buildFrac([prodEx(C), prodEx(-B,b)], [prodEx(A)])]),
            b:(a,A,B,C) => VIH.buildEx([VIH.buildFrac([prodEx(C), prodEx(-A,a)], [prodEx(B)])])
        },
        {
            a:(b,A,B) => VIH.buildEx([prodEx(A,b), prodEx(B)]),
            b:(a,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(a), prodEx(-B)], [prodEx(A)])])
        },
        {
            base_form:(a,b,A,B) => VIH.buildEq([prodEx(A,a)], [prodEx(a,b), prodEx(B)]),
            a:(b,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(B)], [prodEx(A), prodEx(-1,b)])]),
            b:(a,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(a,A), prodEx(-B)], [prodEx(a)])])
        },
        {
            base_form:(a,b,c,A,B,C) => VIH.buildEq([prodEx(a), prodEx(A)], [prodEx(B,b), prodEx(C,c)]),
            a:(b,c,A,B,C) => VIH.buildEx([prodEx(B,b), prodEx(C,c), prodEx(-A)]),
            b:(a,c,A,B,C) => VIH.buildEx([VIH.buildFrac([prodEx(a), prodEx(A), prodEx(-C,c)], [prodEx(B)])]),
            c:(a,b,A,B,C) => VIH.buildEx([VIH.buildFrac([prodEx(a), prodEx(A), prodEx(-B,b)], [prodEx(C)])])
        },
        {
            base_form:(a,b,A,B,C,D) => VIH.buildEq([prodEx(A,a), prodEx(B)], [prodEx(C,b), prodEx(D)]),
            a:(b,A,B,C,D) => VIH.buildEx([VIH.buildFrac([prodEx(C,b), prodEx(D - B)], [prodEx(A)])]),
            b:(a,A,B,C,D) => VIH.buildEx([VIH.buildFrac([prodEx(A,a), prodEx(B - D)], [prodEx(C)])])
        },
        {
            base_form:(a,b,c) => VIH.buildEq([prodEx(a,b,c)], [prodEx(a), prodEx(b), prodEx(c)]),
            a:(b,c) => VIH.buildEx([VIH.buildFrac([prodEx(b), prodEx(c)], [prodEx(b,c), prodEx(-1)])]),
            b:(a,c) => VIH.buildEx([VIH.buildFrac([prodEx(a), prodEx(c)], [prodEx(a,c), prodEx(-1)])]),
            c:(a,b) => VIH.buildEx([VIH.buildFrac([prodEx(a), prodEx(b)], [prodEx(a,b), prodEx(-1)])])
        },
        {
            force_base_form: true,
            base_form:(a,b,A,B) => VIH.buildEq([VIH.buildFrac([prodEx(a)], [prodEx(b)])], [VIH.buildFrac([prodEx(a), prodEx(A)], [prodEx(b), prodEx(B)], true)]),
            a:(b,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(A,b)], [prodEx(B)])]),
            b:(a,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(B,a)], [prodEx(A)])])
        },
        {
            force_base_form: true,
            base_form:(a,b,A,B) => VIH.buildEq([VIH.buildFrac([prodEx(a), prodEx(b)], [prodEx(A)], true)], [prodEx(B)]),
            a:(b,A,B) => VIH.buildEx([prodEx(A*B), prodEx(-1, b)]),
            b:(a,A,B) => VIH.buildEx([prodEx(A*B), prodEx(-1, a)])
        },
        {
            a:(b,A,B) => VIH.buildEx([prodEx(A,b), prodEx(B)]),
            b:(a,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(a), prodEx(-B)], [prodEx(A)])])
        },
        {
            base_form:(a,b,A,B) => VIH.buildEq([VIH.buildFrac([prodEx(a)], [prodEx(A)]), VIH.buildFrac([prodEx(b)], [prodEx(B)])], [prodEx(1)]),
            a:(b,A,B) => VIH.buildEx(VIH.buildFrac([prodEx(A*B), prodEx(-A,b)], [prodEx(B)])),
            b:(a,A,B) => VIH.buildEx(VIH.buildFrac([prodEx(A*B), prodEx(-B,a)], [prodEx(A)]))     
        },
        {
            base_form:(a,b,c,d,A,B,C,D) => VIH.buildEq([prodEx(A,a), prodEx(B,b)], [prodEx(C,c), prodEx(D,d)]),
            a:(b,c,d,A,B,C,D) => VIH.buildEx([VIH.buildFrac([prodEx(C,c), prodEx(D,d), prodEx(-B,b)], [prodEx(A)])]),
            b:(a,c,d,A,B,C,D) => VIH.buildEx([VIH.buildFrac([prodEx(C,c), prodEx(D,d), prodEx(-A,a)], [prodEx(B)])]),
            c:(a,b,d,A,B,C,D) => VIH.buildEx([VIH.buildFrac([prodEx(A,a), prodEx(B,b), prodEx(-D,d)], [prodEx(C)])]),
            d:(a,b,c,A,B,C,D) => VIH.buildEx([VIH.buildFrac([prodEx(A,a), prodEx(B,b), prodEx(-C,c)], [prodEx(D)])])
        },
        {
            base_form:(a,b,A,B,C,D) => VIH.buildEq([VIH.buildFrac([prodEx(A)], [prodEx(a), prodEx(B)], true)], [VIH.buildFrac([prodEx(C)], [prodEx(b), prodEx(D)], true)]),
            a:(b,A,B,C,D) => VIH.buildEx([VIH.buildFrac([prodEx(A,b), prodEx(A*D - B*C)], [prodEx(C)])]),
            b:(a,A,B,C,D) => VIH.buildEx([VIH.buildFrac([prodEx(C,a), prodEx(B*C - A*D)], [prodEx(A)])])
        },
        {
            base_form:(a,b,A,B,C) => VIH.buildEq([VIH.buildFrac([prodEx(A)], [prodEx(a)]), VIH.buildFrac([prodEx(b)], [prodEx(B)])], [prodEx(C)]),
            a:(b,A,B,C) => VIH.buildEx([VIH.buildFrac([prodEx(A*B)], [prodEx(B*C), prodEx(-1, b)])]),
            b:(a,A,B,C) => VIH.buildEx([prodEx(B*C), VIH.buildFrac([prodEx(-A*B)], [prodEx(a)])]) 
        },
        {
            base_form:(a,b,c,A,B) => VIH.buildEq([prodEx(A,a), prodEx(B)], [VIH.buildFrac([prodEx(c)], [prodEx(b), prodEx(c)])]),
            a:(b,c,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(c)], [prodEx(A,b), prodEx(A,c)]), VIH.buildFrac([prodEx(-B)], [prodEx(A)])]),
            b:(a,c,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(1 - B,c), prodEx(-A,a,c)], [prodEx(A,a), prodEx(B)])]),
            c:(a,b,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(A,a,b), prodEx(B,b)], [prodEx(1 - B), prodEx(-A,a)])])
        },
        {
            a:(b,c,A) => VIH.buildEx([VIH.buildFrac([prodEx(c), prodEx(-A)], [prodEx(b)])]),
            b:(a,c,A) => VIH.buildEx([VIH.buildFrac([prodEx(c), prodEx(-A)], [prodEx(a)])]),
            c:(a,b,A) => VIH.buildEx([prodEx(a,b), prodEx(A)])
        },
        {
            base_form:(a,b,c,A,B) => VIH.buildEq([VIH.buildFrac([prodEx(A)], [prodEx(a,b)]), prodEx(c)], [prodEx(B)]),
            a:(b,c,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(A)], [prodEx(B,b), prodEx(-1,b,c)])]),
            b:(a,c,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(A)], [prodEx(B,a), prodEx(-1,a,c)])]),
            c:(a,b,A,B) => VIH.buildEx([prodEx(B), VIH.buildFrac([prodEx(-A)], [prodEx(a,b)])])
        },
        {
            a:(b,c,A) => VIH.buildEx([VIH.buildFrac([prodEx(A)], [prodEx(b), prodEx(c)])]),
            b:(a,c,A) => VIH.buildEx([VIH.buildFrac([prodEx(A), prodEx(-1,a,c)], [prodEx(a)])]),
            c:(a,b,A) => VIH.buildEx([VIH.buildFrac([prodEx(A), prodEx(-1,a,b)], [prodEx(a)])])
        },
        {
            base_form:(a,b,c,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(A)], [prodEx(a)]), prodEx(b)], [VIH.buildFrac([prodEx(B)], [prodEx(c)])]),
            a:(b,c,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(A,c)], [prodEx(B), prodEx(-1,b,c)])]),
            b:(a,c,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(B)], [prodEx(c)]), VIH.buildFrac([prodEx(-A)], [prodEx(a)])]),
            c:(a,b,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(B,a)], [prodEx(A), prodEx(a,b)])])
        },
        {
            force_base_form: true,
            base_form:(a,b,c,d,A,B) => VIH.buildEq([VIH.buildFrac([prodEx(A)], [prodEx(a), prodEx(b)])], [VIH.buildFrac([prodEx(B)], [prodEx(c), prodEx(d)])]),
            a:(b,c,d,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(A,c), prodEx(A,d), prodEx(-B,b)], [prodEx(B)])]),
            b:(a,c,d,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(A,c), prodEx(A,d), prodEx(-B,a)], [prodEx(B)])]),
            c:(a,b,d,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(B,a), prodEx(B,b), prodEx(-A,d)], [prodEx(A)])]),
            d:(a,b,c,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(B,a), prodEx(B,b), prodEx(-A,c)], [prodEx(A)])])
        },
        {
            base_form:(a,b,c,A,B) => VIH.buildEq([VIH.buildFrac([prodEx(a)], [prodEx(b), prodEx(c)])], [prodEx(A,a), prodEx(B)]),
            a:(b,c,A,B) => VIH.buildEq([VIH.buildFrac([prodEx(B,b), prodEx(B,c)], [prodEx(1), prodEx(-A,b), prodEx(-A,c)])]),
            b:(a,c,A,B) => VIH.buildEq([VIH.buildFrac([prodEx(a), prodEx(-A,a,c), prodEx(-B,c)], [prodEx(A,a), prodEx(B)])]),
            c:(a,b,A,B) => VIH.buildEq([VIH.buildFrac([prodEx(a), prodEx(-A,a,b), prodEx(-B,b)], [prodEx(A,a), prodEx(B)])])
        },
        {
            base_form:(a,b,c,A) => VIH.buildEq([prodEx(A,a)], [prodEx(a,b), prodEx(b,c)]),
            a:(b,c,A) => VIH.buildEx([VIH.buildFrac([prodEx(b,c)], [prodEx(A), prodEx(-1,b)])]),
            b:(a,c,A) => VIH.buildEx([VIH.buildFrac([prodEx(A,a)], [prodEx(a), prodEx(c)])]),
            c:(a,b,A) => VIH.buildEx([VIH.buildFrac([prodEx(A,a), prodEx(-1,a,b)], [prodEx(b)])])
        },
        {
            base_form:(a,b,c,d,A,B) => VIH.buildEq([prodEx(A,a,b)], [prodEx(B,c,d)]),
            a:(b,c,d,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(B,c,d)], [prodEx(A,b)])]),
            b:(a,c,d,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(B,c,d)], [prodEx(A,a)])]),
            c:(a,b,d,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(A,a,b)], [prodEx(B,d)])]),
            d:(a,b,c,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(A,a,b)], [prodEx(B,c)])])
        },
        {
            base_form:(a,b,c,d,A,B) => VIH.buildEq([prodEx(A), VIH.buildFrac([prodEx(b)], [prodEx(a)])], [prodEx(B), VIH.buildFrac([prodEx(d)], [prodEx(c)])]),
            a:(b,c,d,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(b,c)], [prodEx(B - A,c), prodEx(d)])]),
            b:(a,c,d,A,B) => VIH.buildEx([prodEx(B - A,a), VIH.buildFrac([prodEx(a,d)], [prodEx(c)])]),
            c:(a,b,d,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(a,d)], [prodEx(A - B,a), prodEx(b)])]),
            d:(a,b,c,A,B) => VIH.buildEx([prodEx(A - B,c), VIH.buildFrac([prodEx(b,c)], [prodEx(a)])])
        },
        {
            base_form:(a,b,c,d) => VIH.buildEq([prodEx(a), prodEx(b,c), prodEx(c,d)], [prodEx(d)]),
            a:(b,c,d) => VIH.buildEx([prodEx(d), prodEx(-1,b,c), prodEx(-1,c,d)]),
            b:(a,c,d) => VIH.buildEx([VIH.buildFrac([prodEx(d), prodEx(-1,c,d), prodEx(-1,a)], [prodEx(c)])]),
            c:(a,b,d) => VIH.buildEx([VIH.buildFrac([prodEx(d), prodEx(-1, a)], [prodEx(b), prodEx(d)])]),
            d:(a,b,c) => VIH.buildEx([VIH.buildFrac([prodEx(a), prodEx(b,c)], [prodEx(1), prodEx(-1,c)])]) 
        },
        {
            base_form:(a,b,c,A,B,C) => VIH.buildEq([prodEx(A,a,b,c)], [prodEx(B,a), prodEx(C,b)]),
            a:(b,c,A,B,C) => VIH.buildEx([VIH.buildFrac([prodEx(C,b)], [prodEx(A,b,c), prodEx(-B)])]),
            b:(a,c,A,B,C) => VIH.buildEx([VIH.buildFrac([prodEx(B,a)], [prodEx(A,a,c), prodEx(-C)])]),
            c:(a,b,A,B,C) => VIH.buildEx([VIH.buildFrac([prodEx(B,a), prodEx(C,b)], [prodEx(A,a,b)])])
        },
        {
            base_form:(a,b,c,A,B,C) => VIH.buildEq([prodEx(a,b,c)], [prodEx(A,a), prodEx(B,b), prodEx(C,c)]),
            a:(b,c,A,B,C) => VIH.buildEx([VIH.buildFrac([prodEx(B,b), prodEx(C,c)], [prodEx(b,c), prodEx(-A)])]),
            b:(a,c,A,B,C) => VIH.buildEx([VIH.buildFrac([prodEx(A,a), prodEx(C,c)], [prodEx(a,c), prodEx(-B)])]),
            c:(a,b,A,B,C) => VIH.buildEx([VIH.buildFrac([prodEx(A,a), prodEx(B,b)], [prodEx(a,b), prodEx(-C)])])
        },
        {
            base_form:(a,b,c,A) => VIH.buildEq([VIH.buildFrac([prodEx(a), prodEx(b), prodEx(c)], [prodEx(a), prodEx(b)])], [prodEx(A,c)]),
            a:(b,c,A) => VIH.buildEx([VIH.buildFrac([prodEx(A,b,c), prodEx(-1,b), prodEx(-1,c)], [prodEx(1), prodEx(-A,c)])]),
            b:(a,c,A) => VIH.buildEx([VIH.buildFrac([prodEx(A,a,c), prodEx(-1,a), prodEx(-1,c)], [prodEx(1), prodEx(-A,c)])]),
            c:(a,b,A) => VIH.buildEx([VIH.buildFrac([prodEx(a), prodEx(b)], [prodEx(A,a), prodEx(A,b), prodEx(-1)])])
        },
        {
            base_form:(a,b,c,A) => VIH.buildEq([prodEx(a), prodEx(a,b,c)], [prodEx(A,b), prodEx(c)]),
            a:(b,c,A) => VIH.buildEx([VIH.buildFrac([prodEx(A,b), prodEx(c)], [prodEx(1), prodEx(b,c)])]),
            b:(a,c,A) => VIH.buildEx([VIH.buildFrac([prodEx(c), prodEx(-1,a)], [prodEx(a,c), prodEx(-A)])]),
            c:(a,b,A) => VIH.buildEx([VIH.buildFrac([prodEx(A,b), prodEx(-1,a)], [prodEx(a,b), prodEx(-1)])])
        },
        {
            base_form:(a,b,A,B) => VIH.buildEq([VIH.buildFrac([prodEx(a,b)], [prodEx(A)]), prodEx(a)], [prodEx(B,b)]),
            a:(b,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(A*B,b)], [prodEx(b), prodEx(A)])]),
            b:(a,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(A,a)], [prodEx(A*B), prodEx(-1,a)])])
        },
        {
            base_form:(a,b,c,A,B) => VIH.buildEq([VIH.buildFrac([prodEx(A)], [prodEx(a)]), VIH.buildFrac([prodEx(B)], [prodEx(b)])], [VIH.buildFrac([prodEx(c)], [prodEx(a,b)])]),
            a:(b,c,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(c), prodEx(-A,b)], [prodEx(B)])]),
            b:(a,c,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(c), prodEx(-B,a)], [prodEx(A)])]),
            c:(a,b,A,B) => VIH.buildEx([prodEx(A,b), prodEx(B,a)])
        }
    ],
    algebra_forms: [
        { // slope
            preset_letter_mapping: ['m', 'y_{2}', 'y_{1}', 'x_{2}', 'x_{1}'],
            base_form: 'a',
            a:(b,c,d,e) => `\\frac{${b} - ${c}}{${d} - ${e}}`,
            b:(a,c,d,e) => `${a}${d} - ${a}${e} + ${c}`,
            c:(a,b,d,e) => `${b} - ${a}${d} + ${a}${e}`,
            d:(a,b,c,e) => `\\frac{${b} - ${c} + ${a}${e}}{${a}}`,
            e:(a,b,c,d) => `\\frac{${a}${d} - ${b} + ${c}}{${a}}`,
            exclusion_tags: ['subscripts']
        },
        { // point slope line
            preset_letter_mapping: ['y', 'y_{1}', 'm', 'x', 'x_{1}'],
            base_form:(a,b,c,d,e) => `${a} - ${b}=${c}(${d} - ${e})`,
            a:(b,c,d,e) => `${b} + ${c}(${d} - ${e})`,
            b:(a,c,d,e) => `${a} - ${c}(${d} - ${e})`,
            c:(a,b,d,e) => `\\frac{${a} - ${b}}{${d} - ${e}}`,
            d:(a,b,c,e) => `\\frac{${a} - ${b}}{${c}} + ${e}`,
            e:(a,b,c,d) => `${d} - \\frac{${a} - ${b}}{${c}}`,
            exclusion_tags: ['subscripts']
        },
        { // standard line
            preset_letter_mapping: ['A', 'x', 'B', 'y', 'C'],
            base_form: 'e-flipped',
            a:(b,c,d,e) => `\\frac{${e} - ${c}${d}}{${b}}`,
            b:(a,c,d,e) => `\\frac{${e} - ${c}${d}}{${a}}`,
            c:(a,b,d,e) => `\\frac{${e} - ${a}${b}}{${d}}`,
            d:(a,b,c,e) => `\\frac{${e} - ${a}${b}}{${c}}`,
            e:(a,b,c,d) => `${a}${b} + ${c}${d}`
        },
        { // y-int line
            preset_letter_mapping: ['y','m','x','b'],
            base_form: 'a',
            a:(b,c,d) => `${b}${c} + ${d}`,
            b:(a,c,d) => `\\frac{${a} - ${d}}{${c}}`,
            c:(a,b,d) => `\\frac{${a} - ${d}}{${b}}`,
            d:(a,b,c) => `${a} - ${b}${c}`
        },
        { // two intercepts line
            preset_letter_mapping: ['x','a','y','b'],
            base_form:(a,b,c,d) => `\\frac{${a}}{${b}} + \\frac{${c}}{${d}}=1`,
            a:(b,c,d) => `${b} - \\frac{${b}${c}}{${d}}`,
            b:(a,c,d) => `\\frac{${a}${d}}{${d} - ${c}}`,
            c:(a,b,d) => `${d} - \\frac{${a}${d}}{${b}}`,
            d:(a,b,c) => `\\frac{${b}${c}}{${b} - ${a}}`,
            exclusion_tags: ['numerical_coefs']
        },
        { // quadratic standard
            preset_letter_mapping: ['y','a','x','b','c'],
            base_form: 'a',
            non_simple_solvable_vars: ['c'],
            a:(b,c,d,e) => `${b}${c}^{2} + ${d}${c} + ${e}`,
            b:(a,c,d,e) => `\\frac{${a} - ${d}${c} - ${e}}{${c}^{2}}`,
            d:(a,b,c,e) => `\\frac{${a} - ${b}${c}^{2} - ${e}}{${c}}`,
            e:(a,b,c,d) => `${a} - ${b}${c}^{2} - ${d}${c}`,
            exclusion_tags: ['contains_exponents']
        },
        { // quadratic vertex
            preset_letter_mapping: ['y','a','x','h','k'],
            base_form: 'a',
            non_simple_solvable_vars: ['c','d'],
            a:(b,c,d,e) => `${b}(${c} - ${d})^{2} + ${e}`,
            b:(a,c,d,e) => `\\frac{${a} - ${e}}{(${c} - ${d})^{2}}`,
            e:(a,b,c,d) => `${a} - ${b}(${c} - ${d})^{2}`,
            exclusion_tags: ['contains_exponents']
        },
        { // combined rate
            preset_letter_mapping: ['A','B','T'],
            base_form:(a,b,c) => `\\frac{1}{${a}} + \\frac{1}{${b}}=\\frac{1}{${c}}`,
            a:(b,c) => `\\frac{${b}${c}}{${b} - ${c}}`,
            b:(a,c) => `\\frac{${a}${c}}{${a} - ${c}}`,
            c:(a,b) => `\\frac{${a}${b}}{${a} + ${b}}`,
            exclusion_tags: ['numerical_coefs']
        }
    ],
    geometry_forms: [
        { // midpoint x-cord
            preset_letter_mapping: ['x_{m}', 'x_{1}', 'x_{2}'],
            base_form: 'a',
            a:(b,c) => `\\frac{${b} + ${c}}{2}`,
            b:(a,c) => `2${a} - ${c}`,
            c:(a,b) => `2${a} - ${b}`,
            exclusion_tags: ['subscripts', 'numerical_coefs']
        },
        { // midpoint y-cord
            preset_letter_mapping: ['y_{m}', 'y_{1}', 'y_{2}'],
            base_form: 'a',
            a:(b,c) => `\\frac{${b} + ${c}}{2}`,
            b:(a,c) => `2${a} - ${c}`,
            c:(a,b) => `2${a} - ${b}`,
            exclusion_tags: ['subscripts', 'numerical_coefs']
        },
        { // triangle area
            preset_letter_mapping: ['A','b','h'],
            base_form: 'a',
            a:(b,c) => `\\frac{${b}${c}}{2}`,
            b:(a,c) => `\\frac{2${a}}{${c}}`,
            c:(a,b) => `\\frac{2${a}}{${b}}`,
            exclusion_tags: ['numerical_coefs']
        },
        { // pythagorean theorem
            preset_letter_mapping: ['a','b','c'],
            base_form:(a,b,c) => `${a}^{2}+${b}^{2}=${c}^{2}`,
            a:(b,c) => `\\sqrt{${c}^{2} - ${b}^{2}}`,
            b:(a,c) => `\\sqrt{${c}^{2} - ${a}^{2}}`,
            c:(a,b) => `\\sqrt{${a}^{2} + ${b}^{2}}`,
            exclusion_tags: ['contains_exponents', 'sign_restrictions'],
            non_negative_vars: ['a','b','c']
        },
        { // triangle angle sum
            preset_letter_mapping: ['A','B','C'],
            base_form:(a,b,c) => `${a} + ${b} + ${c}=180`,
            a:(b,c) => `180 - ${b} - ${c}`,
            b:(a,c) => `180 - ${a} - ${c}`,
            c:(a,b) => `180 - ${a} - ${b}`,
            exclusion_tags: ['numerical_coefs']
        },
        { // rectangle area
            preset_letter_mapping: ['A','l','w'],
            base_form: 'a',
            a:(b,c) => `${b}${c}`,
            b:(a,c) => `\\frac{${a}}{${c}}`,
            c:(a,b) => `\\frac{${a}}{${b}}`
        },
        { // square area
            preset_letter_mapping: ['A','s'],
            base_form: 'a',
            a:(b) => `${b}^{2}`,
            b:(a) => `\\sqrt{${a}}`,
            exclusion_tags: ['contains_exponents', 'sign_restrictions'],
            non_negative_vars: ['b']
        },
        { // trapezoid area
            preset_letter_mapping: ['A','h','a','b'],
            base_form: 'a',
            a:(b,c,d) => `\\frac{${b}(${c} + ${d})}{2}`,
            b:(a,c,d) => `\\frac{2${a}}{${c} + ${d}}`,
            c:(a,b,d) => `\\frac{2${a} - ${b}${d}}{${b}}`,
            d:(a,b,c) => `\\frac{2${a} - ${b}${c}}{${b}}`,
            exclusion_tags: ['numerical_coefs']
        },
        { // sum of interior polygon angles
            preset_letter_mapping: ['S','n'],
            base_form: 'a',
            a:(b) => `180(${b} - 2)`,
            b:(a) => `\\frac{${a}}{180} + 2`,
            exclusion_tags: ['numerical_coefs']
        },
        { // regular polygon interior angle
            preset_letter_mapping: ['A','n'],
            base_form: 'a',
            a:(b) => `\\frac{180(${b} - 2)}{${b}}`,
            b:(a) => `\\frac{360}{180 - ${a}}`,
            exclusion_tags: ['numerical_coefs']
        },
        { // circle circumference
            preset_letter_mapping: ['C','r'],
            base_form: 'a',
            a:(b) => `2\\pi ${b}`,
            b:(a) => `\\frac{${a}}{2\\pi}`,
            exclusion_tags: ['numerical_coefs']
        },
        { // circle area
            preset_letter_mapping: ['A','r'],
            base_form: 'a',
            a:(b) => `\\pi ${b}^{2}`,
            b:(a) => `\\frac{${a}}{\\pi}`,
            exclusion_tags: ['numerical_coefs', 'contains_exponents', 'sign_restrictions'],
            non_negative_vars: ['b']
        },
        { // sector arc length
            preset_letter_mapping: ['L','r','\\theta'],
            base_form: 'a',
            a:(b,c) => `\\frac{\\pi ${b}${c}}{180}`,
            b:(a,c) => `\\frac{180${a}}{\\pi ${c}}`,
            c:(a,b) => `\\frac{180${a}}{\\pi ${b}}`,
            exclusion_tags: ['numerical_coefs']
        },
        { // sector area
            preset_letter_mapping: ['A','\\theta','r'],
            base_form: 'a',
            a:(b,c) => `\\frac{${b}\\pi ${c}^{2}}{360}`,
            b:(a,c) => `\\frac{360${a}}{\\pi ${c}^{2}}`,
            c:(a,b) => `\\sqrt{\\frac{360${a}}{\\pi ${b}}}`,
            exclusion_tags: ['numerical_coefs', 'contains_exponents', 'sign_restrictions'],
            non_negative_vars: ['c']
        },
        { // rectangular prism volume
            preset_letter_mapping: ['V','l','w','h'],
            base_form: 'a',
            a:(b,c,d) => `${b}${c}${d}`,
            b:(a,c,d) => `\\frac{${a}}{${c}${d}}`,
            c:(a,b,d) => `\\frac{${a}}{${b}${d}}`,
            d:(a,b,c) => `\\frac{${a}}{${b}${c}}`
        },
        { // cube volume
            preset_letter_mapping: ['V','s'],
            base_form: 'a',
            a:(b) => `${b}^{3}`,
            b:(a) => `\\sqrt[3]{${a}}`,
            exclusion_tags: ['contains_exponents']
        },
        { // cylinder volume
            preset_letter_mapping: ['V','r','h'],
            base_form: 'a',
            a:(b,c) => `\\pi ${b}^{2}${c}`,
            b:(a,c) => `\\sqrt{\\frac{${a}}{\\pi ${c}}}`,
            c:(a,b) => `\\frac{${a}}{\\pi ${b}^{2}}`,
            exclusion_tags: ['contains_exponents', 'numerical_coefs', 'sign_restrictions'],
            non_negative_vars: ['b']
        },
        { // cone volume
            preset_letter_mapping: ['V','r','h'],
            base_form: 'a',
            a:(b,c) => `\\frac{\\pi ${b}^{2}${c}}{3}`,
            b:(a,c) => `\\sqrt{\\frac{3${a}}{\\pi ${c}}}`,
            c:(a,b) => `\\frac{3${a}}{\\pi ${b}^{2}}`,
            exclusion_tags: ['contains_exponents', 'numerical_coefs', 'sign_restrictions'],
            non_negative_vars: ['b']
        },
        { // sphere volume
            preset_letter_mapping: ['V','r'],
            base_form: 'a',
            a:(b) => `\\frac{4\\pi ${b}^{3}}{3}`,
            b:(a) => `\\sqrt[3]{\\frac{3${a}}{4\\pi}}`,
            exclusion_tags: ['numerical_coefs', 'contains_exponents']
        },
        { // pyramid volume
            preset_letter_mapping: ['V','l','w','h'],
            base_form: 'a',
            a:(b,c,d) => `\\frac{${b}${c}${d}}{3}`,
            b:(a,c,d) => `\\frac{3${a}}{${c}${d}}`,
            c:(a,b,d) => `\\frac{3${a}}{${b}${d}}`,
            d:(a,b,c) => `\\frac{3${a}}{${b}${c}}`,
            exclusion_tags: ['numerical_coefs']
        },
        { // rectangular prism surface area
            preset_letter_mapping: ['A','l','w','h'],
            base_form: 'a',
            a:(b,c,d) => `2${b}${c} + 2${b}${d} + 2${c}${d}`,
            b:(a,c,d) => `\\frac{${a} - 2${c}${d}}{2${c} + 2${d}}`,
            c:(a,b,d) => `\\frac{${a} - 2${b}${d}}{2${b} + 2${d}}`,
            d:(a,b,c) => `\\frac{${a} - 2${b}${c}}{2${b} + 2${c}}`,
            exclusion_tags: ['numerical_coefs']
        },
        { // cylinder surface area
            preset_letter_mapping: ['A','r','h'],
            base_form: 'a',
            non_simple_solvable_vars: ['b'],
            a:(b,c) => `2\\pi ${b}^{2} + 2\\pi ${b}${c}`,
            c:(a,b) => `\\frac{${a} - 2\\pi ${b}^{2}}{2\\pi ${b}}`,
            exclusion_tags: ['numerical_coefs', 'contains_exponents']
        },
        { // sphere surface area
            preset_letter_mapping: ['A','r'],
            base_form: 'a',
            a:(b) => `4\\pi ${b}^{2}`,
            b:(a) => `\\sqrt{\\frac{${a}}{4\\pi}}`,
            exclusion_tags: ['numerical_coefs', 'contains_exponents','sign_restrictions'],
            non_negative_vars: ['b']
        }, 
        { // cone surface area
            preset_letter_mapping: ['A','r','l'],
            base_form: 'a',
            non_simple_solvable_vars: ['b'],
            a:(b,c) => `\\pi ${b}^{2} + \\pi ${b}${c}`,
            c:(a,b) => `\\frac{${a} - \\pi ${b}^{2}}{\\pi ${b}}`,
            exclusion_tags: ['numerical_coefs','contains_exponents']
        }
    ],
    physics_forms: [
        {
           preset_letter_mapping: ['v','v_{0}','a','t'],
           base_form: 'a',
           a:(b,c,d) => `${b} + ${c}${d}`,
           b:(a,c,d) => `${a} - ${c}${d}`,
           c:(a,b,d) => `\\frac{${a} - ${b}}{${d}}`,
           d:(a,b,c) => `\\frac{${a} - ${b}}{${c}}`,
           exclusion_tags: ['subscripts'] 
        },
        {
            preset_letter_mapping: ['x','x_{0}','a','t'],
            base_form: 'a',
            a:(b,c,d) => `${b} + \\frac{1}{2}${c}${d}^{2}`,
            b:(a,c,d) => `${a} - \\frac{1}{2}${c}${d}^{2}`,
            c:(a,b,d) => `\\frac{2(${a} - ${b})}{${d}^{2}}`,
            d:(a,b,c) => `\\sqrt{\\frac{2(${a} - ${b})}{${c}}}`,
            exclusion_tags: ['numerical_coefs','contains_exponents','subscripts','sign_restrictions'],
            non_negative_vars: ['d']
        },
        {
            preset_letter_mapping: ['v','v_{0}','a','x','x_{0}'],
            base_form:(a,b,c,d,e) => `${a}^{2}=${b}^{2} + 2${c}(${d} - ${e})`,
            a:(b,c,d,e) => `\\sqrt{${b}^{2} + 2${c}(${d} - ${e})}`,
            b:(a,c,d,e) => `\\sqrt{${a}^{2} - 2${c}(${d} - ${e})}`,
            c:(a,b,d,e) => `\\frac{${a}^{2} - ${b}^{2}}{2(${d} - ${e})}`,
            d:(a,b,c,e) => `\\frac{${a}^{2} - ${b}^{2}}{2${c}} + ${e}`,
            e:(a,b,c,d) => `${d} - \\frac{${a}^{2} - ${b}^{2}}{2${c}}`,
            exclusion_tags: ['numerical_coefs','contains_exponents','subscripts','sign_restrictions'],
            non_negative_vars: ['a','b']
        },
        {
            preset_letter_mapping: ['v','r','T'],
            base_form: 'a',
            a:(b,c) => `\\frac{2\\pi ${b}}{${c}}`,
            b:(a,c) => `\\frac{${a}${c}}{2\\pi}`,
            c:(a,b) => `\\frac{2\\pi ${b}}{${a}}`,
            exclusion_tags: ['numerical_coefs']
        },
        {
            preset_letter_mapping: ['a_{c}','v','r'],
            base_form: 'a',
            a:(b,c) => `\\frac{${b}^{2}}{${c}}`,
            b:(a,c) => `\\sqrt{${a}${c}}`,
            c:(a,b) => `\\frac{${b}^{2}}{${a}}`,
            exclusion_tags: ['contains_exponents','subscripts','sign_restrictions'],
            non_negative_vars: ['b']
        },
        {
            preset_letter_mapping: ['F_{G}','G','m','M','r'],
            base_form: 'a',
            a:(b,c,d,e) => `\\frac{${b}${c}${d}}{${e}^{2}}`,
            b:(a,c,d,e) => `\\frac{${a}${e}^{2}}{${c}${d}}`,
            c:(a,b,d,e) => `\\frac{${a}${e}^{2}}{${b}${d}}`,
            d:(a,b,c,e) => `\\frac{${a}${e}^{2}}{${b}${c}}`,
            e:(a,b,c,d) => `\\sqrt{\\frac{${b}${c}${d}}{${a}}}`,
            exclusion_tags: ['contains_exponents','subscripts','sign_restrictions'],
            non_negative_vars: ['e']
        },
        {
            preset_letter_mapping: ['D','C','\\rho','A','v'],
            base_form: 'a',
            a:(b,c,d,e) => `\\frac{1}{2}${b}${c}${d}${e}^{2}`,
            b:(a,c,d,e) => `\\frac{2${a}}{${c}${d}${e}^{2}}`,
            c:(a,b,d,e) => `\\frac{2${a}}{${b}${d}${e}^{2}}`,
            d:(a,b,c,e) => `\\frac{2${a}}{${b}${c}${e}^{2}}`,
            e:(a,b,c,d) => `\\sqrt{\\frac{2${a}}{${b}${c}${d}}}`,
            exclusion_tags: ['numerical_coefs','contains_exponents','sign_restrictions'],
            non_negative_vars: ['e']
        },
        {
            preset_letter_mapping: ['K','m','v'],
            base_form: 'a',
            a:(b,c) => `\\frac{1}{2}${b}${c}^{2}`,
            b:(a,c) => `\\frac{2${a}}{${c}^{2}}`,
            c:(a,b) => `\\sqrt{\\frac{2${a}}{${b}}}`,
            exclusion_tags: ['numerical_coefs','contains_exponents','sign_restrictions'],
            non_negative_vars: ['c']
        },
        {
            preset_letter_mapping: ['U_{g}','m','g','y'],
            base_form: 'a',
            a:(b,c,d) => `${b}${c}${d}`,
            b:(a,c,d) => `\\frac{${a}}{${c}${d}}`,
            c:(a,b,d) => `\\frac{${a}}{${b}${d}}`,
            d:(a,b,c) => `\\frac{${a}}{${b}${c}}`,
            exclusion_tags: ['numerical_coefs','subscripts']
        },
        {
            preset_letter_mapping: ['U_{G}','G','m','M','r'],
            base_form: 'a',
            a:(b,c,d,e) => `-\\frac{${b}${c}${d}}{${e}}`,
            b:(a,c,d,e) => `-\\frac{${a}${e}}{${c}${d}}`,
            c:(a,b,d,e) => `-\\frac{${a}${e}}{${b}${d}}`,
            d:(a,b,c,e) => `-\\frac{${a}${e}}{${b}${c}}`,
            e:(a,b,c,d) => `-\\frac{${b}${c}${d}}{${a}}`,
            exclusion_tags: ['subscripts']
        },
        {
            preset_letter_mapping: ['U_{S}','k','x'],
            base_form: 'a',
            a:(b,c) => `\\frac{${b}${c}^{2}}{2}`,
            b:(a,c) => `\\frac{2${a}}{${c}^{2}}`,
            c:(a,b) => `\\sqrt{\\frac{2${a}}{${b}}}`,
            exclusion_tags: ['numerical_coefs','contains_exponents','subscripts','sign_restrictions'],
            non_negative_vars: ['c']
        },
        {
            preset_letter_mapping: ['\\omega','k','m'],
            base_form: 'a',
            a:(b,c) => `\\sqrt{\\frac{${b}}{${c}}}`,
            b:(a,c) => `${c}${a}^{2}`,
            c:(a,b) => `\\frac{${b}}{${a}^{2}}`,
            exclusion_tags: ['sign_restrictions','contains_exponents'],
            non_negative_vars: 'a'
        },
        {
            preset_letter_mapping: ['\\omega','m','g','d','I'],
            base_form: 'a',
            a:(b,c,d,e) => `\\sqrt{\\frac{${b}${c}${d}}{${e}}}`,
            b:(a,c,d,e) => `\\frac{${e}${a}^{2}}{${c}${d}}`,
            c:(a,b,d,e) => `\\frac{${e}${a}^{2}}{${b}${d}}`,
            d:(a,b,c,e) => `\\frac{${e}${a}^{2}}{${b}${c}}`,
            e:(a,b,c,d) => `\\frac{${b}${c}${d}}{${a}^{2}}`,
            exclusion_tags: ['sign_restrictions','contains_exponents'],
            non_negative_vars: 'a'
        }
    ],
    chemistry_forms: [
        {
            preset_letter_mapping: ['n','m','M'],
            base_form: 'a',
            a:(b,c) => `\\frac{${b}}{${c}}`,
            b:(a,c) => `${a}${c}`,
            c:(a,b) => `\\frac{${b}}{${a}}`,
        },
        {
            preset_letter_mapping: ['P','V','n','R','T'],
            base_form:(a,b,c,d,e) => `${a}${b}=${c}${d}${e}`,
            a:(b,c,d,e) => `\\frac{${c}${d}${e}}{${b}}`,
            b:(a,c,d,e) => `\\frac{${c}${d}${e}}{${a}}`,
            c:(a,b,d,e) => `\\frac{${a}${b}}{${d}${e}}`,
            d:(a,b,c,e) => `\\frac{${a}${b}}{${c}${e}}`,
            e:(a,b,c,d) => `\\frac{${a}${b}}{${c}${d}}`
        },
        {
            preset_letter_mapping: ['P_{1}','V_{1}','P_{2}','V_{2}'],
            base_form:(a,b,c,d) => `${a}${b}=${c}${d}`,
            a:(b,c,d) => `\\frac{${c}${d}}{${b}}`,
            b:(a,c,d) => `\\frac{${c}${d}}{${a}}`,
            c:(a,b,d) => `\\frac{${a}${b}}{${d}}`,
            d:(a,b,c) => `\\frac{${a}${b}}{${c}}`,
            exclusion_tags: ['subscripts']
        },
        {
            preset_letter_mapping: ['V_{1}','T_{1}','V_{2}','T_{2}'],
            base_form:(a,b,c,d) => `\\frac{${a}}{${b}}=\\frac{${c}}{${d}}`,
            a:(b,c,d) => `\\frac{${b}${c}}{${d}}`,
            b:(a,c,d) => `\\frac{${a}${d}}{${c}}`,
            c:(a,b,d) => `\\frac{${a}${d}}{${b}}`,
            d:(a,b,c) => `\\frac{${b}${c}}{${a}}`,
            exclusion_tags: ['subscripts']
        },
        {
            preset_letter_mapping: ['P_{1}','T_{1}','P_{2}','T_{2}'],
            base_form:(a,b,c,d) => `\\frac{${a}}{${b}}=\\frac{${c}}{${d}}`,
            a:(b,c,d) => `\\frac{${b}${c}}{${d}}`,
            b:(a,c,d) => `\\frac{${a}${d}}{${c}}`,
            c:(a,b,d) => `\\frac{${a}${d}}{${b}}`,
            d:(a,b,c) => `\\frac{${b}${c}}{${a}}`,
            exclusion_tags: ['subscripts']
        },
        {
            preset_letter_mapping: ['P_{1}','V_{1}','T_{1}','P_{2}','V_{2}','T_{2}'],
            base_form:(a,b,c,d,e,f) => `\\frac{${a}${b}}{${c}}=\\frac{${d}${e}}{${f}}`,
            a:(b,c,d,e,f) => `\\frac{${c}${d}${e}}{${b}${f}}`,
            b:(a,c,d,e,f) => `\\frac{${c}${d}${e}}{${a}${f}}`,
            c:(a,b,d,e,f) => `\\frac{${a}${b}${f}}{${d}${e}}`,
            d:(a,b,c,e,f) => `\\frac{${a}${b}${f}}{${c}${e}}`,
            e:(a,b,c,d,f) => `\\frac{${a}${b}${f}}{${c}${d}}`,
            f:(a,b,c,d,e) => `\\frac{${c}${d}${e}}{${a}${b}}`,
            exclusion_tags: ['subscripts']
        },
        {
            preset_letter_mapping: ['\\rho','P','M','R','T'],
            base_form: 'a',
            a:(b,c,d,e) => `\\frac{${b}${c}}{${d}${e}}`,
            b:(a,c,d,e) => `\\frac{${a}${d}${e}}{${c}}`,
            c:(a,b,d,e) => `\\frac{${a}${d}${e}}{${b}}`,
            d:(a,b,c,e) => `\\frac{${b}${c}}{${a}${e}}`,
            e:(a,b,c,d) => `\\frac{${b}${c}}{${a}${d}}`
        }
    ]
};
export default function genVarIso(settings) {    

    return {
        
    };
}

export const settings_fields = [
    
];

export function get_presets() {
    return {
        
    };
}

export function get_rand_settings() {
    return {
        
    }; 
}