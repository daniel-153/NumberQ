import * as H from '../helpers/gen-helpers.js';
import { sumEx, prodEx, fracEx, randomizeSumExTermOrder, simplifiedExpressionString } from '../helpers/polynom-helpers.js';

export function validateSettings(form_obj, error_locations) {
    // if the var to solve for is 'always x', but match form is 'yes' and the eq form is potentially a topic form, switch always_x to any
    if (
        form_obj.var_iso_solving_var === 'always_x' &&
        form_obj.var_iso_match_form === 'yes' &&
        form_obj.var_iso_eq_type !== 'pure_var_random_forms' &&
        form_obj.var_iso_eq_type !== 'numerical_random_forms'
    ) {
        form_obj.var_iso_solving_var = 'any';
    }

    // if there are a restrictions on the number of variables, open up the eq types to all forms (some forms have very little of 2-3 letter forms)
    if (form_obj.var_iso_num_vars !== 'random') {
        form_obj.var_iso_eq_type = 'random';
    }
}

export const VIH = { // genVarIso helpers
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
            c:(a,b) => `\\frac{${b}}{${a}}`
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
            c:(a,b,d,e) => `\\frac{${a} - ${b}${d} - ${b}${e}}{${d} + ${e}}`,
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
            d:(a,b,c,e) => `${a}${e} - ${b} - ${c}`,
            e:(a,b,c,d) => `\\frac{${b} + ${c} + ${d}}{${a}}`
        },
        {
            base_form:(a,b,c,d) => `\\frac{${a}}{${a} + ${c}}=\\frac{${b}}{${c} + ${d}}`,
            a:(b,c,d) => `\\frac{${b}${c}}{${c} + ${d} - ${b}}`,
            b:(a,c,d) => `\\frac{${a}${c} + ${a}${d}}{${a} + ${c}}`,
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
            b:(a,c,d) => `\\frac{${a}${c}}{${c} + ${d} - ${a}}`,
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
            base_form:(a,b,c,d,e) => `\\frac{${a} + ${b}}{${c}}=\\frac{${d}}{${c} + ${e}}`,
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
            b:(a,c,d,e) => `\\frac{${a}${c}${d}}{${d}${e}} - \\frac{${c}}{${d}}`,
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
            c:(a,b,d,e) => `\\frac{${a}${e}}{${b} + ${d} - ${a}${d}}`,
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
            b:(a,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(A,a), prodEx(-B)], [prodEx(a)])])
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
            b:(a,A,B,C,D) => VIH.buildEx([VIH.buildFrac([prodEx(A,a), prodEx(B - D)], [prodEx(C)])]),
            conditions_met:(A,B,C,D) => (
                B !== D
            )
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
            a:(b,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(A*B), prodEx(-A,b)], [prodEx(B)])]),
            b:(a,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(A*B), prodEx(-B,a)], [prodEx(A)])])     
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
            b:(a,A,B,C,D) => VIH.buildEx([VIH.buildFrac([prodEx(C,a), prodEx(B*C - A*D)], [prodEx(A)])]),
            conditions_met:(A,B,C,D) => (
                A*D !== B*C
            )
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
            c:(a,b,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(A,a,b), prodEx(B,b)], [prodEx(1 - B), prodEx(-A,a)])]),
            conditions_met:(A,B) => (
                B !== 1
            )
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
            base_form:(a,b,c,A,B) => VIH.buildEq([VIH.buildFrac([prodEx(A)], [prodEx(a)]), prodEx(b)], [VIH.buildFrac([prodEx(B)], [prodEx(c)])]),
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
            a:(b,c,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(B,b), prodEx(B,c)], [prodEx(1), prodEx(-A,b), prodEx(-A,c)])]),
            b:(a,c,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(a), prodEx(-A,a,c), prodEx(-B,c)], [prodEx(A,a), prodEx(B)])]),
            c:(a,b,A,B) => VIH.buildEx([VIH.buildFrac([prodEx(a), prodEx(-A,a,b), prodEx(-B,b)], [prodEx(A,a), prodEx(B)])])
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
            d:(a,b,c,A,B) => VIH.buildEx([prodEx(A - B,c), VIH.buildFrac([prodEx(b,c)], [prodEx(a)])]),
            conditions_met:(A,B) => (
                A !== B
            )
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
            b:(a) => `\\sqrt{\\frac{${a}}{\\pi}}`,
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
            preset_letter_mapping: ['F_{\\small{G}}','G','m','M','r'],
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
            preset_letter_mapping: ['D','C','\\rho ','A','v'],
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
            preset_letter_mapping: ['U_{\\small{G}}','G','m','M','r'],
            base_form: 'a',
            a:(b,c,d,e) => `-\\frac{${b}${c}${d}}{${e}}`,
            b:(a,c,d,e) => `-\\frac{${a}${e}}{${c}${d}}`,
            c:(a,b,d,e) => `-\\frac{${a}${e}}{${b}${d}}`,
            d:(a,b,c,e) => `-\\frac{${a}${e}}{${b}${c}}`,
            e:(a,b,c,d) => `-\\frac{${b}${c}${d}}{${a}}`,
            exclusion_tags: ['subscripts']
        },
        {
            preset_letter_mapping: ['U_{\\small{S}}','k','x'],
            base_form: 'a',
            a:(b,c) => `\\frac{${b}${c}^{2}}{2}`,
            b:(a,c) => `\\frac{2${a}}{${c}^{2}}`,
            c:(a,b) => `\\sqrt{\\frac{2${a}}{${b}}}`,
            exclusion_tags: ['numerical_coefs','contains_exponents','subscripts','sign_restrictions'],
            non_negative_vars: ['c']
        },
        {
            preset_letter_mapping: ['\\omega ','k','m'],
            base_form: 'a',
            a:(b,c) => `\\sqrt{\\frac{${b}}{${c}}}`,
            b:(a,c) => `${c}${a}^{2}`,
            c:(a,b) => `\\frac{${b}}{${a}^{2}}`,
            exclusion_tags: ['sign_restrictions','contains_exponents'],
            non_negative_vars: 'a'
        },
        {
            preset_letter_mapping: ['\\omega ','m','g','d','I'],
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
            preset_letter_mapping: ['\\rho ','P','M','R','T'],
            base_form: 'a',
            a:(b,c,d,e) => `\\frac{${b}${c}}{${d}${e}}`,
            b:(a,c,d,e) => `\\frac{${a}${d}${e}}{${c}}`,
            c:(a,b,d,e) => `\\frac{${a}${d}${e}}{${b}}`,
            d:(a,b,c,e) => `\\frac{${b}${c}}{${a}${e}}`,
            e:(a,b,c,d) => `\\frac{${b}${c}}{${a}${d}}`
        }
    ],
    getNumberOfVars: function(eq_form) { // assumes vars is [a,z]
        let num_vars;

        for (let ascii_int = 122; ascii_int >= 97; ascii_int--) {
            if (eq_form[String.fromCharCode(ascii_int)] === undefined) continue;
            else {
                num_vars = (ascii_int - 97) + 1;
                break;
            }
        }

        return num_vars;
    },
    pickRandEqTopic: function() { // get a random topic from the (2 rand forms + 4 topic forms)
        const topic_proportions = {}; // what proportional of all the equations each topic takes up (like chemistry: 7/112)
        let start_form_number = 1;
        ['pure_var_random_forms', 'numerical_random_forms', 'algebra_forms', 'geometry_forms', 'physics_forms', 'chemistry_forms'].forEach(form_array_name => {
            topic_proportions[form_array_name] = [start_form_number, start_form_number + VIH[form_array_name].length - 1];
            start_form_number += VIH[form_array_name].length;
        }); // example -> pure_var: [1,30], alg: [31,42], geo: [43,50], ...

        // randomly select a topic while maintaining size representation fairness
        const last_form_number = start_form_number - 1;
        const rand_form_number = H.randInt(1, last_form_number);

        // determine which topic the rand number landed on
        let selected_topic;
        for (const [topic_name, topic_proportion_arr] of Object.entries(topic_proportions)) {
            if (rand_form_number >= topic_proportion_arr[0] && rand_form_number <= topic_proportion_arr[1]) {
                selected_topic = topic_name;
                break;
            }
        }

        return selected_topic;
    },
    getRandEqForm: function(settings) {
        // first, narrow down the eq-types to just one form array (random, algebra, geometry, etc)
        let form_array;
        let chosen_topic;
        if (settings.var_iso_eq_type === 'random') {
            chosen_topic = VIH.pickRandEqTopic();
            form_array = VIH[chosen_topic];
        }
        else {
            chosen_topic = settings.var_iso_eq_type;
            form_array = VIH[chosen_topic];
        }

        // next, narrow down that form array to only equations that meet the settings requirements
        let numVarsIsValid;
        if (settings.var_iso_num_vars === 'random') {
            numVarsIsValid = () => true;
        }
        else if (settings.var_iso_num_vars === 'two_or_three') {
            numVarsIsValid = (eq_form) => {
                const num_vars = VIH.getNumberOfVars(eq_form);
                return (num_vars === 2 || num_vars === 3);
            };
        }
        else if (settings.var_iso_num_vars === 'four_or_five_plus') {
            numVarsIsValid = (eq_form) => {
                const num_vars = VIH.getNumberOfVars(eq_form);
                return (num_vars >= 4);
            };
        }

        const otherRestictionsMet = (eq_form) => {
            if (eq_form.exclusion_tags === undefined) return true; // no restrictions present on form
            else if (
                (settings.var_iso_allow_exponents === 'no' && eq_form.exclusion_tags.includes('contains_exponents')) ||
                (settings.var_iso_allow_sign_rest === 'no' && eq_form.exclusion_tags.includes('sign_restrictions'))
            ) {
                return false;
            }
            else return true;
        }

        const valid_eq_forms = [];
        form_array.forEach(eq_form => {
            if (numVarsIsValid(eq_form) && otherRestictionsMet(eq_form)) valid_eq_forms.push(eq_form);
        });

        return {
            topic: chosen_topic,
            form: H.randFromList(valid_eq_forms)
        };
    },
    getStartingAsciiIndex: function(lower_or_upper) {
        if (lower_or_upper === 'lower') {
            return 97;
        }
        else if (lower_or_upper === 'upper') {
            return 65;
        }
    },
    getAToZArray: function(lower_or_upper) {
        const ascii_index = VIH.getStartingAsciiIndex(lower_or_upper);

        const letter_array = [];
        for (let i = ascii_index; i < ascii_index + 26; i++) {
            letter_array.push(String.fromCharCode(i));
        }

        return letter_array;
    },
    getRandLetterArrWithExlcusions: function(num_letters, lower_or_upper, exlcuded_letters_array) {
        let letter_array = VIH.getAToZArray(lower_or_upper);
        letter_array = H.removeFromArray(exlcuded_letters_array, letter_array);

        const selected_letters = [];
        for (let i = 0; i < num_letters; i++) {
            const rand_index = H.randInt(0, letter_array.length - 1);
            
            // push the selected letter, then remove it (to avoid repeats)
            selected_letters.push(letter_array[rand_index]);
            letter_array.splice(rand_index, 1);
        }

        H.randomizeList(selected_letters);
        
        return selected_letters;
    },
    getRandLetterArrAny: function(num_letters) {
        const letter_array = VIH.getAToZArray('lower').concat(VIH.getAToZArray('upper')).filter(letter => letter !== 'o' && letter !== 'O');

        const selected_letters = [];
        for (let i = 0; i < num_letters; i++) {
            const rand_index = H.randInt(0, letter_array.length - 1);
            
            // push the selected letter, then remove it (to avoid repeats)
            const current_letter = letter_array[rand_index];
            selected_letters.push(current_letter);
            letter_array.splice(rand_index, 1);

            // make sure to also remove the upper/lower case version of the current letter (to avoid things like 'C' and 'c' in the same EQ)
            const lower_index = letter_array.indexOf(current_letter.toLowerCase());
            const upper_index = letter_array.indexOf(current_letter.toUpperCase());

            if (lower_index !== -1) letter_array.splice(lower_index, 1);
            else if (upper_index !== -1) letter_array.splice(upper_index, 1);
        }

        H.randomizeList(selected_letters);

        return selected_letters;
    },
    getLetterSequenceAlphabetic: function(num_letters, lower_or_upper) {
        const starting_ascii_index = VIH.getStartingAsciiIndex(lower_or_upper);

        const letter_array = [];
        for (let i = starting_ascii_index; i < starting_ascii_index + num_letters; i++) {
            letter_array.push(String.fromCharCode(i))
        }

        return letter_array;
    },
    getRandLetterProgress: function(num_letters, lower_or_upper) {
        const ascii_index = VIH.getStartingAsciiIndex(lower_or_upper);

        const o_index = 14;
        const z_index = 25;
        const pre_o_limit = o_index  - num_letters; // the highest *index* below 'o' (24) that the progression can start
        const pre_z_limit = (z_index + 1) - num_letters; // the highest *index* below 'z' (25 + 1 - z is inclusive) that the progression can start

        // ensures no progression ever contains 'o' or goes past 'z'
        const valid_starting_indices = H.integerArray(0, pre_o_limit).concat(H.integerArray(o_index + 1, pre_z_limit));
        const chosen_starting_index = H.randFromList(valid_starting_indices);

        const letter_array = [];
        for (let i = chosen_starting_index; i < chosen_starting_index + num_letters; i++) {
            letter_array.push(String.fromCharCode(ascii_index + i));
        }

        return letter_array;
    },
    getVarLetters: function(number_required, settings) {        
        let initial_letter_array;
        if (settings.var_iso_var_letters === 'lower_rand_progress') {
            initial_letter_array = VIH.getRandLetterProgress(number_required, 'lower');
        }
        else if (settings.var_iso_var_letters === 'upper_rand_progess') {
            initial_letter_array = VIH.getRandLetterProgress(number_required, 'upper');
        }
        else if (settings.var_iso_var_letters === 'rand_lower_except') {
            initial_letter_array = VIH.getRandLetterArrWithExlcusions(number_required, 'lower', ['e','i','l','o','s','z']);
        }
        else if (settings.var_iso_var_letters === 'rand_upper_except') {
            initial_letter_array = VIH.getRandLetterArrWithExlcusions(number_required, 'upper', ['I','O','S','Z']); 
        }
        else if (settings.var_iso_var_letters === 'rand_any') {
            initial_letter_array = VIH.getRandLetterArrAny(number_required);
        }
        else if (settings.var_iso_var_letters === 'alpha_lower') {
            initial_letter_array = VIH.getLetterSequenceAlphabetic(number_required, 'lower');
        }
        else if (settings.var_iso_var_letters === 'alpha_upper') {
            initial_letter_array = VIH.getLetterSequenceAlphabetic(number_required, 'upper');
        }

        // handle the 'always_x' requirement (lowercase 'x' needs to be included in the letter array)
        if (settings.var_iso_solving_var === 'always_x') {
            if (!initial_letter_array.includes('x')) { // change is needed (letter array doesn't already include 'x')
                if (initial_letter_array.includes('X')) { // includes an uppercase 'X' (change that to lowercase 'x' to avoid having 'x' and 'X' in the same eq)
                    initial_letter_array[initial_letter_array.indexOf('X')] = 'x';
                }
                else { // doesn't include 'x' or 'X' -> pick an entry at a random index to overwrite to 'x'
                    const chosen_index = H.randInt(0, initial_letter_array.length - 1);

                    initial_letter_array[chosen_index] = 'x';
                }
            }  
        }

        return initial_letter_array;
    },
    getArgIndexFromLetter: function(a_to_z_char) {
        const a_to_z_arr = VIH.getAToZArray('lower');

        return a_to_z_arr.indexOf(a_to_z_char);
    },
    getEqPropAsFullEqFunc: function(eq_form, prop_name) {
        let fullFunc;
        if (prop_name === 'base_form') {
            if (typeof(eq_form.base_form) === 'function') { // function of all vars
                fullFunc = eq_form.base_form;
            }
            else if (typeof(eq_form.base_form) === 'string' && eq_form.base_form.includes('flipped')) { // string in the form '{letter}-flipped'
                const eq_letter = eq_form.base_form.split('-')[0];

                const arg_index = VIH.getArgIndexFromLetter(eq_letter);
                
                fullFunc = function(...args) {
                    const lhs_var = args.splice(arg_index, 1)[0];
                    
                    return `${eq_form[eq_letter](...args)}=${lhs_var}`; // flip the eq
                }
            }
            else if (typeof(eq_form.base_form) === 'string') { // string in the form '{letter}'
                const arg_index = VIH.getArgIndexFromLetter(eq_form.base_form);
    
                fullFunc = function(...args) {
                    const lhs_var = args.splice(arg_index, 1)[0];
                    
                    return `${lhs_var}=${eq_form[eq_form.base_form](...args)}`;
                }
            }
        }
        else { // 'a','b','c', etc
            const arg_index = VIH.getArgIndexFromLetter(prop_name);
    
            fullFunc = function(...args) {
                const lhs_var = args.splice(arg_index, 1)[0];
                
                return `${lhs_var}=${eq_form[prop_name](...args)}`;
            }
        }

        return fullFunc;
    },
    getRandomLetter: function(num_vars) {
        const rand_index = H.randInt(0, num_vars - 1);

        return String.fromCharCode(97 +rand_index);
    },
    allVarsAreSolvable: function(eq_form) {
        const num_vars = VIH.getNumberOfVars(eq_form);
        const props = VIH.getLetterSequenceAlphabetic(num_vars, 'lower');

        // check if all the letters from 'a' to Char(num_vars) exist on the form (if not, *not* all vars are solvable - have solutions)
        let all_props_exist = true;
        for (let i = 0; i < props.length; i++) {
            const prop_letter = props[i];
            if (eq_form[prop_letter] === undefined) {
                all_props_exist = false;
                break;
            }
        }

        return all_props_exist;
    },
    getBaseFormLetter: function(eq_form) {
        if (eq_form.base_form === undefined || typeof(eq_form.base_form) === 'function') return;
        else if (eq_form.base_form.includes('flipped')) return eq_form.base_form.split('-')[0]; // 'a-flipped'
        else return eq_form.base_form; // 'a'
    },
    getRandomPromptAnswerProps: function(eq_form, num_vars, has_base_form, base_form_frequency, force_solve_x = false, letter_array = null) {
        // first, determine whether the prompt will be a base form or not (a letter form) (this info is needed for the following handling)
        const rand_selector = Math.random();
        const prompt_is_base_form = ((rand_selector <= base_form_frequency && has_base_form) || eq_form.force_base_form === true);
        
        // solvable indices in the letter array (ex: [1,3,4,6] -> 'a','c','d','f' solvable, 'b','e' not solvable -- in [a,b,c,d,e,f])
        let solvable_indices = H.integerArray(0, num_vars - 1); // starts off assuming all are solvable, but can change with the handling below

        // this is needed because it's possible that not all vars are solvable on the current form (it has non_simple_solvable_vars)
        const all_vars_solvable = VIH.allVarsAreSolvable(eq_form);
        if (!all_vars_solvable) { // eq form has non_simple_solvable_vars
            const non_solvable_indices = eq_form.non_simple_solvable_vars.map(a_to_z_char => VIH.getArgIndexFromLetter(a_to_z_char));
            solvable_indices = solvable_indices.filter(
                index => !non_solvable_indices.includes(index)
            );
        }

        // promptable indices are a snapshot of solvable indices at this point
        let promptable_indices = JSON.parse(JSON.stringify(solvable_indices)); // any letter that is listed (all except the non_simple_solvables, which were filtered above)

        // this is needed for base forms like 'a' and 'a-flipped' to ensure that variable ('a' in this example) isn't solved for (resulting in a 0-step problem)
        const base_form_is_letter = (typeof(eq_form.base_form) === 'string');
        if (base_form_is_letter && prompt_is_base_form) { // 'a' or 'a-flipped' case detected
            const base_form_letter_index = VIH.getArgIndexFromLetter(VIH.getBaseFormLetter(eq_form));
            solvable_indices = solvable_indices.filter(index => index !== base_form_letter_index); // remove that index from the list of solvable ones
        }

        // this ensures that if 'x' is being force solved, it's position in the letter array is valid (solvable), or moved to be valid
        let x_index;
        if (force_solve_x) { // need to handle + potentially change the index of 'x'
            x_index = letter_array.indexOf('x');

            if (!solvable_indices.includes(x_index)) { // x is in a *non* solvable position (needs to be moved)
                // swap x with a random index that is solvable
                const rand_solvable_index = H.randFromList(solvable_indices);

                const temp = letter_array[x_index];
                letter_array[x_index] = letter_array[rand_solvable_index];
                letter_array[rand_solvable_index] = temp;

                x_index = rand_solvable_index;
            }
        }

        let prompt, answer;
        if (prompt_is_base_form) { // base_form_frequency*100%
            prompt = 'base_form';

            if (force_solve_x) { // must solve for the form corresponding to 'x' -> ['k','j','x','m'] | ['a','b','c','d'] -> 'c'
                answer = String.fromCharCode(97 + x_index);
            }
            else { // can solve for any letter
                answer = String.fromCharCode(97 + H.randFromList(solvable_indices));
            }
        }
        else { // prompt is an isolated letter form (1 - base_form_frequency)*100%
            if (force_solve_x) { // prompt must not be isolated for x, and the answer must be x solved 
                promptable_indices = promptable_indices.filter(index => index !== x_index); // anything but x
                const prompt_index = H.randFromList(promptable_indices);
                
                prompt = String.fromCharCode(97 + prompt_index);
                answer = String.fromCharCode(97 + x_index);
            }
            else { // random prompt and answer (and letters)
                const prompt_index = H.randFromList(promptable_indices);
                solvable_indices = solvable_indices.filter(index => index !== prompt_index);
                const answer_index = H.randFromList(solvable_indices);
                prompt = String.fromCharCode(97 + prompt_index);
                answer = String.fromCharCode(97 + answer_index);
            }
        }

        return {
            prompt,
            answer
        };
    },
    appendRandsToArray: function(arr, num_entries_to_add, rand_limit) {
        for (let i = 0; i < num_entries_to_add; i++) {
            arr.push((-1)**(H.randInt(0, 1)) * H.randInt(1, rand_limit));
        }
    },
    getNumberOfCoefs: function(eq_form) {
        const num_symbols = VIH.getNumberOfVars(eq_form);
        return (eq_form['a'].length + 1) - num_symbols; // (total_num_args - num_symbol_args) = num_coef_args
    }
};
export default function genVarIso(settings) {    
    // first, pick a random equation form based on settings
    const new_eq_form_obj = VIH.getRandEqForm(settings);
    const eq_form = new_eq_form_obj.form;
    const eq_topic = new_eq_form_obj.topic;
    const has_base_form = (eq_form.base_form === undefined)? false : true;
    const num_vars = VIH.getNumberOfVars(eq_form);
    
    // constants for random selection
    const base_form_frequency = 0.3;
    const coef_size = 7;

    // preliminary (can be overwritten in specific topic equations)
    let var_letter_array = VIH.getVarLetters(num_vars, settings);
    
    let new_prompt_and_answer;
    if (settings.var_iso_solving_var === 'any') {
        new_prompt_and_answer = VIH.getRandomPromptAnswerProps(eq_form, num_vars, has_base_form, base_form_frequency);
    }
    else if (settings.var_iso_solving_var === 'always_x') {
        new_prompt_and_answer = VIH.getRandomPromptAnswerProps(eq_form, num_vars, has_base_form, base_form_frequency, true, var_letter_array);
    }
    const prompt_func = VIH.getEqPropAsFullEqFunc(eq_form, new_prompt_and_answer.prompt);
    const answer_func = VIH.getEqPropAsFullEqFunc(eq_form, new_prompt_and_answer.answer);

    let eq_args; // args to be supplied to eq_form[props above^]
    if (eq_topic === 'pure_var_random_forms') {
        eq_args = [...var_letter_array];
    }
    else if (eq_topic === 'numerical_random_forms') {
        eq_args = [...var_letter_array]; // just symbols at this point

        // get an array of random coefs + ensure it meets the requirements
        const num_coefs = VIH.getNumberOfCoefs(eq_form);
        let coef_array;
        if (eq_form.conditions_met !== undefined) { // coefs must meet certain conditions
            do {
                coef_array = [];
                VIH.appendRandsToArray(coef_array, num_coefs, coef_size); // get the random coefs
            } while (!eq_form.conditions_met(...coef_array));
        }
        else { // no conditions provided
            coef_array = [];
            VIH.appendRandsToArray(coef_array, num_coefs, coef_size);
        }
        
        eq_args = eq_args.concat(coef_array); // add the coef args onto the symbol args
    }
    else { // specific topic (algebra, geometry, etc)
        if (settings.var_iso_match_form === 'yes') { // use the vars from the topic form (like y,m,x,b in y=mx+b)
            var_letter_array = [...eq_form.preset_letter_mapping];
            eq_args = [...var_letter_array];
        }
        else if (settings.var_iso_match_form === 'no') { // use the vars necessitated by the other settings
            eq_args = [...var_letter_array];
        }
    }

    // build the prompt and answer strings
    const prompt_eq = prompt_func(...eq_args);
    const answer_eq = answer_func(...eq_args);

    const letter_to_solve = var_letter_array[VIH.getLetterSequenceAlphabetic(num_vars, 'lower').indexOf(new_prompt_and_answer.answer)];

    // determine whether the chosen variable to solve for is sign restricted (must be >= 0)
    let is_sign_restricted = false;    
    if (
        eq_form.exclusion_tags !== undefined && 
        eq_form.exclusion_tags.includes('sign_restrictions') &&
        eq_form.non_negative_vars.includes(new_prompt_and_answer.answer)
    ) {
        is_sign_restricted = true;
    }

    let sign_restriction = '';
    if (is_sign_restricted) sign_restriction = '\\geq 0';


    const prompt_string = `{\\small \\text{Solve for}~${letter_to_solve}${sign_restriction}}\\text{:}~~${prompt_eq}`;

    return {
        question: prompt_string,
        answer: answer_eq
    };
}

export const settings_fields = [
    'var_iso_var_letters',
    'var_iso_eq_type',
    'var_iso_num_vars',
    'var_iso_solving_var',
    'var_iso_match_form',
    'var_iso_allow_exponents',
    'var_iso_allow_sign_rest'
];

export const presets = {
    default: function() {
        return {
            var_iso_var_letters: 'rand_lower_except',
            var_iso_eq_type: 'random',
            var_iso_num_vars: 'random',
            var_iso_solving_var: 'any',
            var_iso_match_form: 'yes',
            var_iso_allow_exponents: 'yes',
            var_iso_allow_sign_rest: 'yes'
        };
    },
    random: function() {
        return {
            var_iso_var_letters: '__random__',
            var_iso_eq_type: '__random__',
            var_iso_num_vars: '__random__',
            var_iso_solving_var: '__random__',
            var_iso_match_form: '__random__',
            var_iso_allow_exponents: '__random__',
            var_iso_allow_sign_rest: '__random__'
        };
    },
    topic_presets: [
        {
            title: 'Pure Variable Random Forms',
            example_problem: 'w=\\frac{r}{g} + q',
            description: 'Random equation forms with no numerical coefficients (besides 1 and -1).',
            get_settings: function() {
                return {
                    var_iso_var_letters: 'rand_lower_except',
                    var_iso_eq_type: 'pure_var_random_forms',
                    var_iso_num_vars: 'random',
                    var_iso_solving_var: 'any'
                };
            }
        },
        {
            title: 'Random Forms With Coefficients',
            example_problem: 'n=\\frac{4v}{v+2}',
            description: 'Random equation forms with numerical coefficients allowed.',
            get_settings: function() {
                return {
                    var_iso_var_letters: 'rand_lower_except',
                    var_iso_eq_type: 'numerical_random_forms',
                    var_iso_num_vars: 'random',
                    var_iso_solving_var: 'any'
                };
            }
        },
        {
            title: 'Mixed Random Forms',
            example_problem: '-6t+3n=4a+7x',
            description: 'Equation forms with and without numerical coefficients.',
            get_settings: function() {
                return {
                    var_iso_var_letters: 'rand_lower_except',
                    var_iso_eq_type: H.randFromList(['pure_var_random_forms', 'numerical_random_forms']),
                    var_iso_num_vars: 'random',
                    var_iso_solving_var: 'any'
                };
            }
        },
        {
            title: 'Algebra Formulas',
            example_problem: 'y - y_{1}=m(x - x_{1})',
            description: 'Isolate variables in common algebra formulas.',
            get_settings: function() {
                return {
                    var_iso_eq_type: 'algebra_forms',
                    var_iso_num_vars: 'random',
                    var_iso_solving_var: 'any',
                    var_iso_match_form: 'yes',
                    var_iso_allow_exponents: 'yes',
                    var_iso_allow_sign_rest: 'yes'
                };
            }
        },
        {
            title: 'Geometry Formulas',
            example_problem: 'A=\\frac{bh}{2}',
            description: 'Isolate variables in common geometry formulas.',
            get_settings: function() {
                return {
                    var_iso_eq_type: 'geometry_forms',
                    var_iso_num_vars: 'random',
                    var_iso_solving_var: 'any',
                    var_iso_match_form: 'yes',
                    var_iso_allow_exponents: 'yes',
                    var_iso_allow_sign_rest: 'yes'
                };
            }
        },
        {
            title: 'Physics Formulas',
            example_problem: 'F_{\\small{G}}=\\frac{GmM}{r^{2}}',
            description: 'Isolate variables in common physics formulas.',
            get_settings: function() {
                return {
                    var_iso_eq_type: 'physics_forms',
                    var_iso_num_vars: 'random',
                    var_iso_solving_var: 'any',
                    var_iso_match_form: 'yes',
                    var_iso_allow_exponents: 'yes',
                    var_iso_allow_sign_rest: 'yes'
                };
            }
        },
        {
            title: 'Chemistry Formulas',
            example_problem: 'P_{1}V_{1}=P_{2}V_{2}',
            description: 'Isolate variables in common chemistry formulas.',
            get_settings: function() {
                return {
                    var_iso_eq_type: 'chemistry_forms',
                    var_iso_num_vars: 'random',
                    var_iso_solving_var: 'any',
                    var_iso_match_form: 'yes',
                    var_iso_allow_exponents: 'yes',
                    var_iso_allow_sign_rest: 'yes'
                };
            }
        },
        {
            title: 'All Subject Formulas (no exponents)',
            example_problem: 'l=\\frac{V}{wh}',
            description: 'Algebra, geometry, physics, and chemistry formulas without exponents.',
            get_settings: function() {
                return {
                    var_iso_eq_type: H.randFromList(['algebra_forms', 'geometry_forms', 'physics_forms', 'chemistry_forms']),
                    var_iso_num_vars: 'random',
                    var_iso_solving_var: 'any',
                    var_iso_match_form: 'yes',
                    var_iso_allow_exponents: 'no',
                    var_iso_allow_sign_rest: 'no'
                };
            }
        },
        {
            title: 'All Subject Formulas (general)',
            example_problem: 'A=2\\pi r^{2} + 2\\pi rh',
            description: 'Algebra, geometry, physics, and chemistry formulas.',
            get_settings: function() {
                return {
                    var_iso_eq_type: H.randFromList(['algebra_forms', 'geometry_forms', 'physics_forms', 'chemistry_forms']),
                    var_iso_num_vars: 'random',
                    var_iso_solving_var: 'any',
                    var_iso_match_form: 'yes',
                    var_iso_allow_exponents: 'yes',
                    var_iso_allow_sign_rest: 'yes'
                };
            }
        },
        {
            title: 'Any Form (random letters)',
            example_problem: 'j=\\frac{3t}{\\pi a^{2}}',
            description: 'All random forms and topic forms with random letters (no restrictions).',
            get_settings: function() {
                return {
                    var_iso_var_letters: 'rand_lower_except',
                    var_iso_eq_type: 'random',
                    var_iso_num_vars: 'random',
                    var_iso_solving_var: 'any',
                    var_iso_match_form: 'no',
                    var_iso_allow_exponents: 'yes',
                    var_iso_allow_sign_rest: 'yes'
                };
            }
        },
    ]
};

export const size_adjustments = {
    width: 1.12,
    height: 1.1
};