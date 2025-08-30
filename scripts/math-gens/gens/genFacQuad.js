import { qf_answer_type } from '../../templates/gen-settings.js';
import * as H from '../helpers/gen-helpers.js';
import * as PH from"../helpers/polynom-helpers.js";
import * as SH from '../helpers/settings-helpers.js';

export function validateSettings(form_obj, error_locations) {
    // make sure factor size is an integer between 1 and 10
    form_obj.factor_size = SH.val_restricted_integer(form_obj.factor_size, error_locations, 1, 10, 'factor_size');

    // make sure leading_coef is an integer between -10 and 10 but doesn't include 0
    form_obj.leading_coef = SH.val_restricted_integer(form_obj.leading_coef, error_locations, -10, 10, 'leading_coef');
    if (form_obj.leading_coef === 0) form_obj.leading_coef = 1;

    // make sure that at least one quadratic type is selected (we don't need to combine here: that happens in the gen function)
    if (form_obj.types_of_quadratics === undefined) form_obj.types_of_quadratics = [];
    if (form_obj.types_of_quadratics.length === 0) form_obj.types_of_quadratics = ['two_integer_factors'];
}

export default function genFacQuad(settings) {
    let {factor_size, types_of_quadratics, leading_coef, quadratic_prompt_type, qf_answer_type} = settings;
    const type_of_quadratic = H.randFromList([...types_of_quadratics]); 
    
    // When the QF is needed, automatically force the prompt type to be 'equation' (since we won't factor into root expressions or complex ones)
    if (
        type_of_quadratic === 'not_factorable' ||
        type_of_quadratic === 'complex_roots' ||
        type_of_quadratic === 'real_solvebyroots' ||
        type_of_quadratic === 'complex_solvebyroots'
    ) {
        quadratic_prompt_type = 'equation';
        settings.quadratic_prompt_type = 'equation';
    }

    // These DO NOT include the leading coefficient (that has to be added later)
    let global_A, global_B, global_C; // a, b, and c in the final expression (ax^2+bx+c) no matter which type of quadratic it is
    
    // if the answer is a trinomial in factored form, assign it to this; otherwise, use global_A,B,C to put the answer in equation form
    let global_factored_form;

    // convert the leading coef to math (use this in string handling and leading_coef for calculations)
    let leading_coef_in_math = leading_coef;
    if (leading_coef_in_math === 1) leading_coef_in_math = '';
    else if (leading_coef_in_math === -1) leading_coef_in_math = '-';

    let nz_factor_array = H.removeFromArray(0, H.integerArray((-1)*factor_size, factor_size)); // non-zero array to chose factors from

    // In these cases, increase factor size to 2 if it's 1 (since that would forcce it to be a perf square of diff or squares/causes problems in these cases)
    if (factor_size === 1 && (type_of_quadratic === 'two_integer_factors' || type_of_quadratic === 'two_non_integer_factors')) {
        factor_size = 2;
        settings.factor_size = 2;
        nz_factor_array = H.removeFromArray(0, H.integerArray((-1)*factor_size, factor_size)); 
    }


    // in the cases below, first find what global_A,B,andC should be (based on the type), then assign a factored form if applicable
    // IMPORTANT: global convention is factors mean 'a' in (x-a) (so the 'factor' is also the solution to the eq)
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
        // start by assigning (a) and (b) + ensure they get equal treatment in terms of comprime filtering
        let a, b;
        let switcher = H.randInt(0, 1);
        if (switcher === 0) {
            // pick a positive number
            a = H.randFromList(H.integerArray(1, factor_size));

            // pick a number that's comprime (so we know nothing factors out of the base ax^2-bx expression)
            b = H.randFromList(PH.keepCoprimesFromList(a, nz_factor_array));
        }
        else if (switcher === 1) {
            // pick a number (not necessarily positive)
            b = H.randFromList(nz_factor_array);

            // pick a *positive* number that's comprime (so we know nothing factors out of the base ax^2-bx expression)
            a = H.randFromList(PH.keepCoprimesFromList(Math.abs(b), H.integerArray(1, factor_size)));
        } // From here, (a) must be positive and (b) could be positive or negative

        // now assign (c) and (d) (with more constraints)
        let c, d;
        let c_arr = H.integerArray(1, factor_size); // the broadest possible list of values for (c)
        switcher = H.randInt(0, 1);
        if (switcher === 0) {
            // start by assigning (c) (with some conditions)
            if (a !== 1) { // assignment to (c) if (a) is not 1 (no restrictions)
                c = H.randFromList(c_arr);
            }
            else if (a === 1 && c_arr.length !== 1) { // don't let (a) && (c) equal 1
                c = H.randFromList(H.removeFromArray(1, c_arr));
            }
            else if (a === 1 && c_arr.length === 1) { // don't let (c) become undefined if (a) is 1 and the factor range is just [1]
                c = 2;
            } // now (c) is a *positive* integer from 1 to factor_size && (a) or (c) != 1


            // |d| is comprime with (c) but can have any sign (+ or -)
            let d_arr = H.removeFromArray([(b*c)/a, ((-1)*b*c)/a], PH.keepCoprimesFromList(c, H.integerArray(1, factor_size))); 

            if (d_arr.length === 0) { // if d_arr is empty, fill it with the small integer that meets all the conditions
                let d_candidate = 1;
                while (
                    PH.GCF(c, d_candidate) !== 1 ||
                    d_candidate === (b*c)/a ||
                    d_candidate === ((-1)*b*c)/a
                ) {
                    d_candidate++;
                }
                d_arr.push(d_candidate);
            }

            d = (-1)**H.randInt(0, 1) * H.randFromList(d_arr);
        }
        else if (switcher === 1) {
            // start by assigning (d) (could be positive or negative)
            d = H.randFromList(nz_factor_array);

            // assignment to (c)
            c_arr = H.removeFromArray([(a*d)/b, ((-1)*a*d)/b], PH.keepCoprimesFromList(Math.abs(d), H.integerArray(1, factor_size)));
            if (a === 1) c_arr = H.removeFromArray(1, c_arr); // don't let c=1 if a=1

            
            // handle these two cases: c_arr = [] and (c) can be 1, c_arr = [] but (c) CAN'T be 1
            if (c_arr.length === 0) {
                if (a !== 1) {
                    let c_candidate = 1;
                    while (
                        PH.GCF(d, c_candidate) !== 1 ||
                        c_candidate === (a*d)/b ||
                        c_candidate === ((-1)*a*d)/b
                    ) {
                        c_candidate++;
                    }
                    c_arr.push(c_candidate);
                }   
                else if (a === 1) {
                    let c_candidate = 2;
                    while (
                        PH.GCF(d, c_candidate) !== 1 ||
                        c_candidate === (a*d)/b ||
                        c_candidate === ((-1)*a*d)/b 
                    ) {
                        c_candidate++;
                    }
                    c_arr.push(c_candidate);
                }
            }
            
            c = H.randFromList(c_arr);
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


        // to make sure the first factor is treated equally to the second one, randomly swap them
        let factorA = '(' + a + 'x' + b + ')';
        let factorB = '(' + c + 'x' + d + ')';
        switcher = H.randInt(0, 1); 
        if (switcher === 1) { // swap if the switcher is 1
            let temp = factorA;
            factorA = factorB;
            factorB = temp;
        }


        global_factored_form = leading_coef_in_math + factorA + factorB;
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
        let a, b;
        // ensure (a) and (b) are treated equally
        const switcher = H.randInt(0, 1);
        if (switcher === 0) {
            // pick a positive number ((a) first)
            a = H.randFromList(H.integerArray(1, factor_size));

            // pick a number that's comprime and *positive* (so we know nothing factors out of the base ax^2-bx expression)
            b = H.randFromList(PH.keepCoprimesFromList(a, H.integerArray(1, factor_size)));
        }
        else if (switcher === 1) {
            // pick a positive number ((b) first)
            b = H.randFromList(H.integerArray(1, factor_size));

            // pick a *positive* number that's comprime (so we know nothing factors out of the base ax^2-bx expression)
            a = H.randFromList(PH.keepCoprimesFromList(Math.abs(b), H.integerArray(1, factor_size)));
        } // From here, (a) must be positive and (b) could be positive or negative 

        // assign global A, B, and C
        global_A = a**2;
        global_B = 0;
        global_C = (-1)*b**2;


        // conversion to math and assignment
        if (a === 1) a = '';
        global_factored_form = leading_coef_in_math + '(' + a + 'x+' + b + ')(' + a + 'x-' + b + ')';
    }
    else if (type_of_quadratic === 'no_c_term') {
        let a, b;
        // ensure (a) and (b) are treated equally
        const switcher = H.randInt(0, 1);
        if (switcher === 0) {
            // pick a positive number
            a = H.randFromList(H.integerArray(1, factor_size));

            // pick a number that's comprime (so we know nothing factors out of the base ax^2-bx expression)
            b = H.randFromList(PH.keepCoprimesFromList(a, nz_factor_array));
        }
        else if (switcher === 1) {
            // pick a number (not necessarily positive)
            b = (-1)**H.randInt(0,1) * (H.randFromList(H.integerArray(1, factor_size)));

            // pick a *positive* number that's comprime (so we know nothing factors out of the base ax^2-bx expression)
            a = H.randFromList(PH.keepCoprimesFromList(Math.abs(b), H.integerArray(1, factor_size)));
        } // From here, (a) must be positive and (b) could be positive or negative


        // assign global A, B, and C
        global_A = a;
        global_B = (-1)*b;
        global_C = 0;

        // conversion to math
        b = (-1)*b;
        if (b > 0) b = '+' + b;
        if (a === 1) a = '';

        // not using lead_coef_in_math here because it's already included in (a) (above^)
        global_factored_form = leading_coef_in_math + 'x(' + a + 'x' + b + ')'
    }
    else if (type_of_quadratic === 'not_factorable' || type_of_quadratic === 'complex_roots') { // combine cases to avoid repeated code
        let a,b,c;

        let abc_possibilities = []; // every permuation of a, b, and c given nz_factor_array (contains repeats)
        for (let i = 0; i < nz_factor_array.length; i++) {
            for (let j = 0; j < nz_factor_array.length; j++) {
                for (let k = 0; k < nz_factor_array.length; k++) {
                    abc_possibilities.push([nz_factor_array[i], nz_factor_array[j], nz_factor_array[k]]);
                }
            } 
        }

        // filter only the [a,b,c] arrays that don't have anything that can be factored out 'GCF' === 1
        abc_possibilities = abc_possibilities.filter(triplet_arr =>
            PH.factorBinomial(...triplet_arr)[0] === 1
        );


        // filter only the [a,b,c] arrays that have the 'not-factorable' condition or the 'complex_root' condition (depeding on the selection)
        if (type_of_quadratic === 'not_factorable') {
            abc_possibilities = PH.quadraticCoefFilter(abc_possibilities, 'pos_root');
        }
        else if (type_of_quadratic === 'complex_roots') {
            abc_possibilities = PH.quadraticCoefFilter(abc_possibilities, 'neg_root');
        }

        // pick a random [a,b,c] triplet and assign it into a,b, and c
        [a, b, c] = H.randFromList(abc_possibilities);

        // assign global A, B, and C
        global_A = a;
        global_B = b;
        global_C = c;
    }
    else if (type_of_quadratic === 'real_solvebyroots' || type_of_quadratic === 'complex_solvebyroots') {
        let a_arr = H.integerArray(1, factor_size).filter(num => !Number.isInteger(Math.sqrt(num))); // keep only numbers whose square roots don't reduce
        if (a_arr.length === 0) a_arr = [2]; // make sure a_arr ins't empty (in case it starts out like [-1,1])

        let a = H.randFromList(a_arr); // assign (a) in x^2(+/-)a (keep in mind that it's certainly positive and not square at this point)

        if (type_of_quadratic === 'real_solvebyroots') a = (-1)*a;
        
        // assign global A, B, and C
        global_A = 1;
        global_B = 0;
        global_C = a;
    }

    // the quadratic prompt
    let final_prompt = PH.polyTemplateToMath(PH.multiplyArray([global_A, global_B, global_C], leading_coef));
    let single_expression, comma_seperated_values; // the two forms the answer can be in

    // determine what the final answer should look like (factored form, or a version of x=)
    let final_answer;
    if (quadratic_prompt_type === 'expression') final_answer = global_factored_form;
    else if (quadratic_prompt_type === 'equation') {
        final_prompt = final_prompt + '=0'; // convert to an equation if specified

        // find neg_b, disc, and two_a in the QF: x=(neg_b +- sqrt(disc))/two_a
        let neg_b = (-1)*global_B;
        let disc = global_B**2 - 4*global_A*global_C;
        let two_a = 2*global_A;

        // assign based on the cases: factorable, not factorable, and complex
        if ((disc > 0) && (Number.isInteger(Math.sqrt(disc)))) { // the quad is factorable (everything but perfect square x^2+2ax+a^2 is here)
            let sqrt_of_disc = Math.sqrt(disc);
            let first_fraction = PH.simplifyFraction(neg_b, two_a); // -b/2a
            let second_fraction = PH.simplifyFraction(sqrt_of_disc, two_a); // sqrt(b^2-4ac)/2a


            // putting the fractions together (but with everything in simplest terms)
            let common_denom = PH.LCM(first_fraction.denom, second_fraction.denom);
            let first_numer_term = first_fraction.numer * (common_denom / first_fraction.denom);
            let second_numer_term = second_fraction.numer * (common_denom / second_fraction.denom);


            // calculation and assignment for the 'comma-seperated' case
            let sol_a_frac = [first_numer_term + second_numer_term, common_denom];
            let sol_b_frac = [first_numer_term - second_numer_term, common_denom];
            //simplify
            sol_a_frac = [PH.simplifyFraction(sol_a_frac[0], sol_a_frac[1]).numer, PH.simplifyFraction(sol_a_frac[0], sol_a_frac[1]).denom];
            sol_b_frac = [PH.simplifyFraction(sol_b_frac[0], sol_b_frac[1]).numer, PH.simplifyFraction(sol_b_frac[0], sol_b_frac[1]).denom];
            
            // create the two solutions in math
            let sol_a = (sol_a_frac[1] === 1) ? sol_a_frac[0] : '\\frac{' + sol_a_frac[0] + '}{' + sol_a_frac[1] + '}';
            let sol_b = (sol_b_frac[1] === 1) ? sol_b_frac[0] : '\\frac{' + sol_b_frac[0] + '}{' + sol_b_frac[1] + '}';
            // pull negatives out in front of fractions if needed
            if (sol_a_frac[0] < 0 && sol_a_frac[1] !== 1) sol_a = '-\\frac{' + (-1)*sol_a_frac[0] + '}{' + sol_a_frac[1] + '}';
            if (sol_b_frac[0] < 0 && sol_b_frac[1] !== 1) sol_b = '-\\frac{' + (-1)*sol_b_frac[0] + '}{' + sol_b_frac[1] + '}';



            comma_seperated_values = 'x=' + sol_a + ',\\:'  + sol_b;
            if (sol_a === sol_b) comma_seperated_values = 'x=' + sol_a;


            // now handle the case where the answer should be a 'single_expression'
            if (first_fraction.denom === 1 && second_fraction.denom === 1) { // form is x=a(+-)b
                if (first_fraction.numer === 0) first_fraction.numer = '';
                single_expression = 'x=' + first_fraction.numer + '\\pm' + Math.abs(second_fraction.numer);
                if (first_fraction.numer === '' && second_fraction.numer === 0) single_expression = 'x=0';
            }
            else { // form is x=(a(+-)b)/c
                single_expression = 'x=\\frac{' + first_numer_term + '\\pm' + Math.abs(second_numer_term) + '}{' + common_denom + '}';
                if (first_numer_term === 0) {
                    single_expression = 'x=\\pm \\frac{' + Math.abs(second_numer_term) + '}{' + common_denom + '}';
                }
            }
        }
        else if (disc === 0) { // the perfect square case (x^2+2ax+a^2)
            // this is the x-val that solves the equation in a perf square case
            let single_sol = PH.simplifyFraction(neg_b, two_a).numer; // this is an integer (pos or neg) and the denom is = 1

            comma_seperated_values = 'x=' + single_sol;
            single_expression = 'x=' + single_sol; // no need to have (+-) if there's only one sol
        }
        else { // the quad is not factorable (and is either real or complex -> both cases are handled here)
            let simplified_disc = PH.simplifySQRT(Math.abs(disc)); // make sure both real and complex cases can be handled
            let first_fraction = PH.simplifyFraction(neg_b, two_a); // -b/2a
            let second_fraction = PH.simplifyFraction(simplified_disc.numberInFront, two_a); // k*sqrt(j)/2a

            // putting the fractions together (but with everything in simplest terms)
            let common_denom = PH.LCM(first_fraction.denom, second_fraction.denom);
            let first_numer_term = first_fraction.numer * (common_denom / first_fraction.denom);
            let second_numer_term = second_fraction.numer * (common_denom / second_fraction.denom); // we know for sure this is >0 at this point


            // some of the conversion to math
            let sqrtExpression = '\\sqrt{' + simplified_disc.numberUnderRoot + '}'; // we know for sure that 'numberUnderRoot' != 1 at this point
            if (disc < 0) sqrtExpression = 'i' + sqrtExpression; // put an 'i' in front of the root if imaginary
            if (second_numer_term === 1) second_numer_term = '';
            second_numer_term = second_numer_term + sqrtExpression; // combine to only have 1 'second term' -> '2' + 'isqrt2' -> '2isqrt2'


    
            // now create the answers
            let sol_a, sol_b;
            if (first_fraction.denom === 1 && second_fraction.denom === 1) { // form is x=a(+-)b
                if (first_fraction.numer === 0) {
                    first_fraction.numer = '';

                    sol_a = second_numer_term;
                    sol_b = '-' + second_numer_term;
                }
                else {
                    sol_a = first_fraction.numer + '+' + second_numer_term;
                    sol_b = first_fraction.numer + '-' + second_numer_term;
                }
                        
                single_expression = 'x=' + first_fraction.numer + '\\pm ' + second_numer_term;
                comma_seperated_values = 'x=' + sol_a + ',\\:'  + sol_b;
            }
            else { // form is x=(a(+-)b)/c
                if (first_fraction.numer === 0) {
                    first_numer_term = '';

                    sol_a = '\\frac{' + second_numer_term + '}{' + common_denom + '}';
                    sol_b = '-\\frac{' + second_numer_term + '}{' + common_denom + '}';
                }
                else {
                    sol_a = '\\frac{' + first_numer_term + '+' + second_numer_term + '}{' + common_denom + '}';
                    sol_b = '\\frac{' + first_numer_term + '-' + second_numer_term + '}{' + common_denom + '}';
                }

                single_expression = 'x=\\frac{' + first_numer_term + '\\pm ' + second_numer_term + '}{' + common_denom + '}';
                comma_seperated_values = 'x=' + sol_a + ',\\:'  + sol_b;
            }
        }
    } // end of case handling and assignment


    if (quadratic_prompt_type === 'expression') {
        final_answer = global_factored_form;
    }
    else if (quadratic_prompt_type === 'equation') {        
        if (qf_answer_type === 'single_expression') final_answer = single_expression;
        else if (qf_answer_type === 'comma_seperated_values') final_answer = comma_seperated_values;
    }

    return {
        question: final_prompt,
        answer: final_answer
    };
}

export const settings_fields = [
    'factor_size',
    'types_of_quadratics',
    'quadratic_prompt_type',
    'qf_answer_type',
    'leading_coef'
];

export const prelocked_settings = [
    'qf_answer_type'
];

export const presets = {
    default: function() {
        return {
            factor_size: 5, // (+ or -) whatever value is here
            types_of_quadratics: ['two_integer_factors','two_non_integer_factors','perf_square','diff_squares'],
            leading_coef: 1,
            quadratic_prompt_type: '__random__',
            qf_answer_type: 'single_expression'
        };
    },
    random: function() {
        return {
            factor_size: H.randInt(2,8), // (+ or -) whatever value is here
            types_of_quadratics: '__random__',
            leading_coef: H.randFromList(H.removeFromArray(0, H.integerArray(-3,3))),
            quadratic_prompt_type: '__random__',
            qf_answer_type: '__random__'
        };
    },
    topic_presets: [
        {
            title: 'Factor a&thinsp;=&thinsp;1',
            example_problem: 'x^{2}+3x+2',
            description: 'Factor quadratics in the form (x-a)(x-b).',
            get_settings: function() {
                return {
                    factor_size: 10,
                    types_of_quadratics: ['two_integer_factors'],
                    leading_coef: 1,
                    quadratic_prompt_type: 'expression'
                };
            }
        },
        {
            title: 'Factor a&thinsp;=&thinsp;1 (with common factor)',
            example_problem: '2x^{2}+12x+16',
            description: 'Factor quadratics in the form K(x-a)(x-b).',
            get_settings: function() {
                return {
                    factor_size: 5,
                    types_of_quadratics: ['two_integer_factors'],
                    leading_coef: H.randInt(2, 5) * (-1)**H.randInt(0, 1),
                    quadratic_prompt_type: 'expression'
                };
            }
        },
        {
            title: 'Factor a&thinsp;&ne;&thinsp;1',
            example_problem: '4x^{2}+3x-10',
            description: 'Factor quadratics in the form (ax-b)(cx-d).',
            get_settings: function() {
                return {
                    factor_size: 6,
                    types_of_quadratics: ['two_non_integer_factors'],
                    leading_coef: 1,
                    quadratic_prompt_type: 'expression'
                };
            }
        },
        {
            title: 'Factor a&thinsp;&ne;&thinsp;1 (with common factor)',
            example_problem: '12x^{2}+22x-20',
            description: 'Factor quadratics in the form K(ax-b)(cx-d).',
            get_settings: function() {
                return {
                    factor_size: 5,
                    types_of_quadratics: ['two_non_integer_factors'],
                    leading_coef: H.randInt(2, 4) * (-1)**H.randInt(0, 1),
                    quadratic_prompt_type: 'expression'
                };
            }
        },
        {
            title: 'Factor Perfect Squares',
            example_problem: 'x^{2}+10x+25',
            description: 'Factor quadratics in the form (x-a)&sup2;.',
            get_settings: function() {
                return {
                    factor_size: 10,
                    types_of_quadratics: ['perf_square'],
                    leading_coef: 1,
                    quadratic_prompt_type: 'expression'
                };
            }
        },
        {
            title: 'Factor Perfect Squares (with common factor)',
            example_problem: '4x^{2}+32x+64',
            description: 'Factor quadratics in the form K(x-a)&sup2;.',
            get_settings: function() {
                return {
                    factor_size: 5,
                    types_of_quadratics: ['perf_square'],
                    leading_coef: H.randInt(2, 5) * (-1)**H.randInt(0, 1),
                    quadratic_prompt_type: 'expression'
                };
            }
        },
        {
            title: 'Factor Difference Of Squares',
            example_problem: 'x^{2}-36',
            description: 'Factor quadratics in the form (x-a)(x+a).',
            get_settings: function() {
                return {
                    factor_size: 10,
                    types_of_quadratics: ['diff_squares'],
                    leading_coef: 1,
                    quadratic_prompt_type: 'expression'
                };
            }
        },
        {
            title: 'Factor Difference Of Squares (with common factor)',
            example_problem: '-2x^{2}+18',
            description: 'Factor quadratics in the form K(x-a)(x+a).',
            get_settings: function() {
                return {
                    factor_size: 5,
                    types_of_quadratics: ['diff_squares'],
                    leading_coef: H.randInt(2, 5) * (-1)**H.randInt(0, 1),
                    quadratic_prompt_type: 'expression'
                };
            }
        },
        {
            title: 'Factor With No (c) term',
            example_problem: 'x^{2}+5x',
            description: 'Factor quadratics in the form x(x-a)',
            get_settings: function() {
                return {
                    factor_size: 10,
                    types_of_quadratics: ['no_c_term'],
                    leading_coef: 1,
                    quadratic_prompt_type: 'expression'
                };
            }
        },
        {
            title: 'Factor With No (c) term (with common factor)',
            example_problem: '-2x^{2}+6x',
            description: 'Factor quadratics in the form Kx(x-a)',
            get_settings: function() {
                return {
                    factor_size: 10,
                    types_of_quadratics: ['no_c_term'],
                    leading_coef: H.randInt(2, 10) * (-1)**H.randInt(0, 1),
                    quadratic_prompt_type: 'expression'
                };
            }
        },
        {
            title: 'Solve With The Quadratic Formula (real)',
            example_problem: '3x^{2}+21x-6=0',
            description: 'Quadratics where the quadratic formula is required to find the roots (real roots).',
            get_settings: function() {
                return {
                    factor_size: 10,
                    types_of_quadratics: ['not_factorable'],
                    leading_coef: H.randInt(2, 5) * (-1)**H.randInt(0, 1),
                    quadratic_prompt_type: 'equation'
                };
            }
        },
        {
            title: 'Solve With The Quadratic Formula (imaginary)',
            example_problem: '5x^{2}+5x+30=0',
            description: 'Quadratics where the quadratic formula is required to find the roots (imaginary roots).',
            get_settings: function() {
                return {
                    factor_size: 10,
                    types_of_quadratics: ['complex_roots'],
                    leading_coef: H.randInt(2, 5) * (-1)**H.randInt(0, 1),
                    quadratic_prompt_type: 'equation'
                };
            }
        },
        {
            title: 'Solve With The Quadratic Formula (general)',
            example_problem: `
                \\begin{aligned}
                & b^2 - 4ac \\geq 0~~\\mathrm{or}\\\\
                & b^2 - 4ac < 0
                \\end{aligned}
            `,
            description: 'Quadratics where the quadratic formula is required to find the roots (real or imaginary).',
            get_settings: function() {
                return {
                    factor_size: 10,
                    types_of_quadratics: ['not_factorable', 'complex_roots'],
                    leading_coef: H.randInt(2, 5) * (-1)**H.randInt(0, 1),
                    quadratic_prompt_type: 'equation'
                };
            }
        },
        {
            title: 'Solve By Factoring (integer solutions)',
            example_problem: 'x^{2}+7x+10=0',
            description: 'Quadratics that can be solved by factoring (integer solutions only).',
            get_settings: function() {
                return {
                    factor_size: 5,
                    types_of_quadratics: ['two_integer_factors', 'perf_square'],
                    leading_coef: H.randInt(2, 5) * (-1)**H.randInt(0, 1),
                    quadratic_prompt_type: 'equation',
                    qf_answer_type: 'comma_seperated_values'
                };
            }
        },
        {
            title: 'Solve By Factoring (fraction solutions)',
            example_problem: '60x^{2}-52x+8=0',
            description: 'Quadratics that can be solved by factoring (with fraction solutions).',
            get_settings: function() {
                return {
                    factor_size: 5,
                    types_of_quadratics: ['two_non_integer_factors'],
                    leading_coef: H.randInt(2, 4) * (-1)**H.randInt(0, 1),
                    quadratic_prompt_type: 'equation',
                    qf_answer_type: 'comma_seperated_values'
                };
            }
        },
        {
            title: 'Solve By Factoring (general)',
            example_problem: '15x^{2}+9x=0',
            description: 'Quadratics that can be solved by factoring (integer or fraction solutions).',
            get_settings: function() {
                return {
                    factor_size: 5,
                    types_of_quadratics: ['two_integer_factors','two_non_integer_factors','perf_square','diff_squares', 'no_c_term'],
                    leading_coef: H.randInt(2, 4) * (-1)**H.randInt(0, 1),
                    quadratic_prompt_type: 'equation',
                    qf_answer_type: 'comma_seperated_values'
                };
            }
        },
        {
            title: 'Solve By Square Roots (real)',
            example_problem: 'x^{2}-10=0',
            description: 'Quadratics that can be solved by taking square roots (real solutions).',
            get_settings: function() {
                return {
                    factor_size: 10,
                    types_of_quadratics: ['real_solvebyroots'],
                    leading_coef: 1,
                    quadratic_prompt_type: 'equation',
                    qf_answer_type: 'comma_seperated_values'
                };
            }
        },
        {
            title: 'Solve By Square Roots (real, common factor)',
            example_problem: '3x^{2}-21=0',
            description: 'Quadratics that can be solved by taking square roots (real solutions, common factors).',
            get_settings: function() {
                return {
                    factor_size: 10,
                    types_of_quadratics: ['real_solvebyroots'],
                    leading_coef: H.randInt(2, 10) * (-1)**H.randInt(0, 1),
                    quadratic_prompt_type: 'equation',
                    qf_answer_type: 'comma_seperated_values'
                };
            }
        },
        {
            title: 'Solve By Square Roots (imaginary)',
            example_problem: 'x^{2}+4=0',
            description: 'Quadratics that can be solved by taking square roots (imaginary solutions).',
            get_settings: function() {
                return {
                    factor_size: 10,
                    types_of_quadratics: ['complex_solvebyroots'],
                    leading_coef: 1,
                    quadratic_prompt_type: 'equation',
                    qf_answer_type: 'comma_seperated_values'
                };
            }
        },
        {
            title: 'Solve By Square Roots (imaginary, common factor)',
            example_problem: '6x^{2}+18=0',
            description: 'Quadratics that can be solved by taking square roots (imaginary solutions, common factors).',
            get_settings: function() {
                return {
                    factor_size: 10,
                    types_of_quadratics: ['complex_solvebyroots'],
                    leading_coef: H.randInt(2, 10) * (-1)**H.randInt(0, 1),
                    quadratic_prompt_type: 'equation',
                    qf_answer_type: 'comma_seperated_values'
                };
            }
        },
        {
            title: 'Solve By Square Roots (general)',
            example_problem: `
                \\begin{aligned}
                & x = \\pm \\sqrt{a}~~\\mathrm{or}\\\\
                & x = \\pm i\\sqrt{a}
                \\end{aligned}
            `,
            description: 'Quadratics that can be solved by taking square roots (real or imaginary solutions).',
            get_settings: function() {
                return {
                    factor_size: 10,
                    types_of_quadratics: ['real_solvebyroots', 'complex_solvebyroots'],
                    leading_coef: H.randFromList([1, H.randInt(2, 10) * (-1)**H.randInt(0, 1)]),
                    quadratic_prompt_type: 'equation',
                    qf_answer_type: 'comma_seperated_values'
                };
            }
        }
    ]
};