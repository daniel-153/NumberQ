import * as H from '../helper-modules/gen-helpers.js';
import * as PH from '../helper-modules/polynom-helpers.js';

const settings = {
    factor_size: 5, // (+ or -) whatever value is here
    leading_coef: 1,
    type_of_quadratic: ['two_integer_factors','two_non_integer_factors','perf_square','diff_squares','no_c_term','not_factorable','complex_roots'],
    quadratic_prompt_type: H.randFromList(['expression','equation']),
    qf_answer_type: H.randFromList(['single_expression','comma_seperated_values'])
};

// Note: When the QF is needed, factor_size is instead used as coefficient_size
// Note: When the QF is needed, automatically force the prompt type to be 'equation'
// Note: you should still have the option to factor complex ones where the QF ISN'T needed (like x^2+1 -> (x+i)(x-i)) 

// IMPORTANT: global convention is factors mean 'a' in (x-a) (so the 'factor' is also the solution to the eq)

export default function genFacQuad(formObj) {
    const settings = processSettings(formObj);
    const {factor_size, leading_coef, type_of_quadratic, quadratic_prompt_type} = settings;
    
    // These DO NOT include the leading coefficient (that has to be added later)
    let global_A, global_B, global_C; // a, b, and c in the final expression (ax^2+bx+c) no matter which type of quadratic it is
    
    // if the answer is a trinomial in factored form, assign it to this; otherwise, use global_A,B,C to put the answer in equation form
    let global_factored_form;

    // convert the leading coef to math (use this in string handling and leading_coef for calculations)
    let leading_coef_in_math = leading_coef;
    if (leading_coef_in_math === 1) leading_coef_in_math = '';
    else if (leading_coef_in_math === -1) leading_coef_in_math = '-';

    const nz_factor_array = H.removeFromArray(0, H.integerArray((-1)*factor_size, factor_size)); // non-zero array to chose factors from


    // in the cases below, first find what global_A,B,andC should be (based on the type), then assign a factored form if applicable
    if (type_of_quadratic === 'two_integer_factors') {
        let first_factor = H.randFromList(nz_factor_array);

        // remove -first_factor and first_factor from possible factors so the trinomial doesn't become perfect square or diff of squares
        let reduced_factor_array = H.removeFromArray([(-1)*first_factor, first_factor], nz_factor_array);
        let second_factor = H.randFromList(reduced_factor_array);


        // assign global A, B, and C
        global_A = 1;
        global_B = (-1)*(first_factor + second_factor);
        global_C = first_factor * second_factor;


        // convert the factors to math by switching from positive to negative (account for minus in (x-a))
        first_factor = (-1)*first_factor;
        second_factor = (-1)*second_factor;
        if (first_factor > 0) first_factor = '+' + first_factor;
        if (second_factor > 0) second_factor = '+' + second_factor;

        global_factored_form = leading_coef_in_math + '(x' + first_factor + ')(x' + second_factor + ')';
    }
    else if (type_of_quadratic === 'two_non_integer_factors') {
        let a,b,c,d;
        // ensure neither (a) nor (c) can be negative (take only the positive part of the factor array)
        let a_arr = H.integerArray(1, factor_size);
        let c_arr = H.integerArray(1, factor_size);

        // ensure that (a) or (c) != 1
        let switcher = H.randInt(0, 1); // 0->(a) can't be 1 | 1->(c) can't be 1
        if (switcher === 0) {
            a_arr = H.removeFromArray(1, nz_factor_array);
        }
        else if (switcher === 1) {
            c_arr = H.removeFromArray(1, nz_factor_array);
        }

        // ensure that (a and b) and (c and d) are comprime but that (a and b) and (c and d) are still treated equally
        switcher = H.randInt(0, 1);
        if (switcher === 0) {
            switcher = H.randInt(0, 1);
            if (switcher === 0) {
                a = H.randFromList(a_arr);
                b = H.randFromList(PH.keepCoprimesFromList(a, nz_factor_array));
            }
            else if (switcher === 1) {
                b = H.randFromList(nz_factor_array);
                a = H.randFromList(PH.keepCoprimesFromList(b, a_arr));
            }
            switcher = H.randInt(0, 1);
            if (switcher === 0) {
                c = H.randFromList(c_arr);
                d = H.randFromList(removeFromArray([(b*c)/a, ((-1)*b*c)/a], PH.keepCoprimesFromList(c, nz_factor_array)));
            }
            else if (switcher === 1) {
                d = H.randFromList(nz_factor_array);
                c = H.randFromList(removeFromArray([(a*d)/b, ((-1)*a*d)/b], PH.keepCoprimesFromList(d, c_arr)));
            }
        }
        else if (switcher === 1) {
            switcher = H.randInt(0, 1);
            if (switcher === 0) {
                c = H.randFromList(c_arr);
                d = H.randFromList(PH.keepCoprimesFromList(c, nz_factor_array));
            }
            else if (switcher === 1) {
                d = H.randFromList(nz_factor_array);
                c = H.randFromList(PH.keepCoprimesFromList(d, c_arr));
            }
            switcher = H.randInt(0, 1);
            if (switcher === 0) {
                a = H.randFromList(a_arr);
                b = H.randFromList(removeFromArray([(a*d)/c, ((-1)*a*d)/c], PH.keepCoprimesFromList(a, nz_factor_array)));
            }
            else if (switcher === 1) {
                b = H.randFromList(nz_factor_array);
                a = H.randFromList(removeFromArray([(b*c)/d, ((-1)*b*c)/d], PH.keepCoprimesFromList(b, a_arr)));
            }
        }


        // assign global A, B, and C
        global_A = a*c;
        global_B = (-1)*(a*d + b*c);
        global_C = b*d;


        // convert to math (keep in mind that (a) and (c) are certainly positive at this point)
        if (a === 1) a = '';
        if (c === 1) c = '';
        b = (-1) * b;
        d = (-1) * d;
        if (b > 0) b = '+' + b;
        if (d > 0) d = '+' + d;

        global_factored_form = leading_coef_in_math + '(' + a + 'x' + b + ')(' + c + 'x' + d + ')';
    }
    else if (type_of_quadratic === 'perf_square') {
        let a = H.randFromList(nz_factor_array);

        // assign global A, B, and C
        global_A = 1;
        global_B = (-2)*a;
        global_C = a**2;

        // convert to math
        a = (-1)*a;
        if (a > 0) a = '+' + a;

        global_factored_form = leading_coef_in_math + '(x' + a + ')^2';
    }
    else if (type_of_quadratic === 'diff_squares') {
        // ensure (a) is positive because negative solution is impossible here (negative is lost in x^2-a^2)
        let a = H.randFromList(H.integerArray(1, factor_size)); 

        // assign global A, B, and C
        global_A = 1;
        global_B = 0;
        global_C = (-1)*a**2;

        // conversion to math happens here
        global_factored_form = leading_coef_in_math + '(x+' + a + ')(x-' + a + ')';
    }
    else if (type_of_quadratic === 'no_c_term') {
        // ensure (a) and (b) are treated equally
        const switcher = H.randInt(0, 1);
        if (switcher === 0) {
            // pick a positive number
            let a = H.randFromList(H.integerArray(1, factor_size));

            // pick a number that's comprime (so we know nothing factors out of the base ax^2-bx expression)
            let b = H.randFromList(PH.keepCoprimesFromList(a, nz_factor_array));
        }
        else if (switcher === 1) {
            // pick a positive number
            let b = H.randFromList(H.integerArray(1, factor_size));

            // pick a number that's comprime (so we know nothing factors out of the base ax^2-bx expression)
            let a = H.randFromList(PH.keepCoprimesFromList(b, nz_factor_array));
        } // From here, (a) must be positive and (b) could be positive or negative


        // assign global A, B, and C
        global_A = a;
        global_B = (-1)*b;
        global_C = 0;

        // conversion to math
        b = (-1)*b;
        if (b > 0) b = '+' + b;
        a = a * leading_coef; // multiply (a) by the leading coefficient

        // not using lead_coef_in_math here because it's already included in (a) (above^)
        global_factored_form = a + 'x(x' + b + ')'
    }
    else if (type_of_quadratic === 'not_factorable') {
        





    }
    else if (type_of_quadratic === 'complex_roots') {

    }











}





function _genFacQuad() {
    let m,n,r,t,switcher;
    let XRange = 5; // X terms in (ax-b)(cx-d) are between -5 and 5 (inclusive)
    let ConstRange = 7; // Constant terms in (ax-b)(cx-d) are between -7 and 7 (inclusive)


    // These two loops create array to pick n and r from (ensuring they can't = 0)
    let XRangeArray = [];
    for (let i = (-1) * XRange; i <= XRange; i++) {
        XRangeArray.push(i);
    }
    XRangeArray.splice(XRangeArray.indexOf(0),1);

    let ConstRangeArray = [];
    for (let i = (-1) * ConstRange; i <= ConstRange; i++) {
        ConstRangeArray.push(i);
    }
    ConstRangeArray.splice(ConstRangeArray.indexOf(0),1);
    
    m = H.randInt((-1) * XRange, XRange);
    n = H.randFromList(ConstRangeArray);
    r = H.randFromList(XRangeArray);
    t = H.randInt((-1) * ConstRange, ConstRange);
    switcher = H.randInt(0,1);

    // Ensures m and t can't BOTH equal 0 but are still random (this was mainly/entirely for answer choices in MG)
    if ((m === 0) && (t === 0) && (switcher === 0)) m = H.randFromList(XRangeArray);
    else if ((m === 0) && (t === 0) && (switcher === 1)) t = H.randFromList(ConstRangeArray);
    //Output -> [m,n,r,t] with n,r !== 0 and m || t !== 0

    // conversion to math

    const facTemp = [m,n,r,t];
    const expandedTemp = [m*r, (-1) * (m*t + n*r), n*t];
    const finalExpanded = PH.polyTemplateToMath(expandedTemp)
    const finalFactored = PH.convertFactoredToMath(PH.factoredFormTemplate(facTemp))

    return {
        question: finalExpanded,
        answer: (PH.isFactorable(finalExpanded,finalFactored)) ? finalFactored : 'Not Factorable' 
    };
}  

