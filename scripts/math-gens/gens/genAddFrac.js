import * as H from '../helpers/gen-helpers.js';
import * as PH from '../helpers/polynom-helpers.js';
import * as SH from '../helpers/settings-helpers.js';

export function processFormObj(form_obj, error_locations) {
    // validation for the numerator size range
    const validated_numer_range = SH.val_restricted_range(form_obj.numer_range_min, form_obj.numer_range_max, 1, 100, error_locations, 'numer_range_min', 'numer_range_max');
    form_obj.numer_range_min = validated_numer_range.input_min;
    form_obj.numer_range_max = validated_numer_range.input_max;

    // validation for the denominator size range
    const validated_denom_range = SH.val_restricted_range(form_obj.denom_range_min, form_obj.denom_range_max, 1, 100, error_locations, 'denom_range_min', 'denom_range_max');
    form_obj.denom_range_min = validated_denom_range.input_min;
    form_obj.denom_range_max = validated_denom_range.input_max;

    // ensure that 'like_denoms' and the denom range agree 
    if (form_obj.like_denoms === 'never' && (form_obj.denom_range_min === form_obj.denom_range_max)) { 
        // if the denom range is a single number, we can't force unlike denoms (so expand the range to at least two numbers
        if (form_obj.denom_range_max !== 100) {
            form_obj.denom_range_max++;
        }
        else {
            form_obj.denom_range_min--;
        }
    }

    // Everything below is for the following: if improper fractions are forced by the ranges => allow them
    if (form_obj.like_denoms !== 'never') {
        if (form_obj.numer_range_min >= form_obj.denom_range_max) form_obj.allow_improper_fracs = 'yes'; // allow if forced in the terms
    }
    else {
        if (!(form_obj.denom_range_max >= form_obj.numer_range_min + 2)) form_obj.allow_improper_fracs = 'yes'; // allow if forced in the terms
    }
    
    let min_sum_value;
    if (form_obj.like_denoms !== 'never') {
        min_sum_value = 2 * (form_obj.numer_range_min / form_obj.denom_range_max); 
    }
    else {
        min_sum_value = (2 * form_obj.numer_range_min * form_obj.denom_range_max - form_obj.numer_range_min) / (form_obj.denom_range_max**2 - form_obj.denom_range_max);
    }
    if (min_sum_value >= 1) form_obj.allow_improper_fracs = 'yes'; // allow if forced in the result
}

export default function genAddFrac(settings) {    
    let num1, num2, den1, den2;

    if (settings.allow_improper_fracs === 'yes') { // no additional restrictions
        num1 = H.randInt(settings.numer_range_min, settings.numer_range_max);
        num2 = H.randInt(settings.numer_range_min, settings.numer_range_max);

        let switcher = H.randInt(0, 1);
        if (switcher === 0) { // ensure den1 and den2 are treated equally in random assignment
            den1 = H.randInt(settings.denom_range_min, settings.denom_range_max);

            if (settings.like_denoms === 'always') {
                den2 = den1;
            }
            else if (settings.like_denoms === 'never') {
                den2 = H.randIntExcept(settings.denom_range_min, settings.denom_range_max, den1);
            }
            else if (settings.like_denoms === 'sometimes') {
                den2 = H.randInt(settings.denom_range_min, settings.denom_range_max);
            }  
        }
        else {
            den2 = H.randInt(settings.denom_range_min, settings.denom_range_max);
            
            if (settings.like_denoms === 'always') {
                den1 = den2;
            }
            else if (settings.like_denoms === 'never') {
                den1 = H.randIntExcept(settings.denom_range_min, settings.denom_range_max, den2);
            }
            else if (settings.like_denoms === 'sometimes') {
                den1 = H.randInt(settings.denom_range_min, settings.denom_range_max);
            }
        }
    }
    else if (settings.allow_improper_fracs === 'no') { // nums < dens && (num1*den2 + num2 * den1) < (den1 * den2) 
        const resultIsProper = function() {return ((num1*den2 + num2 * den1) < (den1 * den2));}
        
        let conditionsMet;
        if (settings.like_denoms === 'sometimes') {
            conditionsMet = function() {
                return resultIsProper(); 
            }
        }
        else if (settings.like_denoms === 'never') {
            conditionsMet = function() {
                return (resultIsProper() && den1 !== den2);
            }
        }
        else if (settings.like_denoms === 'always') {
            conditionsMet = function() {
                return (resultIsProper() && den1 === den2);
            }
        }

        let order_to_pick, pick_status;
        let pickNumAndDen = function(curr_index) {
            if (order_to_pick[curr_index].coef === 'num1') {
                num1 = H.randInt(settings.numer_range_min, settings.numer_range_max);
                pick_status.num1 = true;

                // if den1's min is not greater than num1 => make sure it is (to waste fewer attempts by at least ensuring num1 < den1)
                const den1_index = order_to_pick.findIndex(element => element.coef === 'den1');
                if (order_to_pick[den1_index].range[0] <= num1) {
                    order_to_pick[den1_index].range[0] = num1 + 1;
                }
                den1 = H.randInt(order_to_pick[den1_index].range[0], order_to_pick[den1_index].range[1]);
                if (settings.like_denoms === 'never' && pick_status.den2) { // force unlike denoms && den2 has been picked
                    den1 = H.randIntExcept(order_to_pick[den1_index].range[0], order_to_pick[den1_index].range[1], den2);
                }
                pick_status.den1 = true;

                return den1_index;
            }
            else if (order_to_pick[curr_index].coef === 'num2') {
                num2 = H.randInt(settings.numer_range_min, settings.numer_range_max);
                pick_status.num2 = true;

                const den2_index = order_to_pick.findIndex(element => element.coef === 'den2');
                if (order_to_pick[den2_index].range[0] <= num2) {
                    order_to_pick[den2_index].range[0] = num2 + 1;
                }
                den2 = H.randInt(order_to_pick[den2_index].range[0], order_to_pick[den2_index].range[1]);
                if (settings.like_denoms === 'never' && pick_status.den1) { // force unlike denoms && den1 has been picked
                    den2 = H.randIntExcept(order_to_pick[den2_index].range[0], order_to_pick[den2_index].range[1], den1);
                }
                pick_status.den2 = true;

                return den2_index;
            }
            else if (order_to_pick[curr_index].coef === 'den1') {
                den1 = H.randInt(settings.denom_range_min, settings.denom_range_max);
                if (settings.like_denoms === 'never' && pick_status.den2) {
                    den1 = H.randIntExcept(settings.denom_range_min, settings.denom_range_max, den2);
                }
                pick_status.den1 = true;

                // if num1's max is not less then den1 => make sure it is (to waste fewer attempts by at least ensuring num1 < den1)
                const num1_index = order_to_pick.findIndex(element => element.coef === 'num1'); 
                if (order_to_pick[num1_index].range[1] > den1) {
                    order_to_pick[num1_index].range[1] = den1 - 1;
                }
                num1 = H.randInt(order_to_pick[num1_index].range[0], order_to_pick[num1_index].range[1]);
                pick_status.num1 = true;

                return num1_index;
            }
            else { // den2
                den2 = H.randInt(settings.denom_range_min, settings.denom_range_max);
                if (settings.like_denoms === 'never' && pick_status.den1) {
                    den2 = H.randIntExcept(settings.denom_range_min, settings.denom_range_max, den1);
                }
                pick_status.den2 = true;

                const num2_index = order_to_pick.findIndex(element => element.coef === 'num2'); 
                if (order_to_pick[num2_index].range[1] > den2) {
                    order_to_pick[num2_index].range[1] = den2 - 1;
                }
                num2 = H.randInt(order_to_pick[num2_index].range[0], order_to_pick[num2_index].range[1]);
                pick_status.num2 = true;

                return num2_index;
            }
        }

        let num_attempts = 0;
        let sol_found = false;
        while (num_attempts++ < 500 && !sol_found) {
            order_to_pick = H.randomizeList([
                {coef: 'num1', range: [settings.numer_range_min, settings.numer_range_max]},
                {coef: 'num2', range: [settings.numer_range_min, settings.numer_range_max]},
                {coef: 'den1', range: [settings.denom_range_min, settings.denom_range_max]},
                {coef: 'den2', range: [settings.denom_range_min, settings.denom_range_max]}
            ]); 
            pick_status = {num1: false, num2: false, den1: false, den2: false};

            const changed_index = pickNumAndDen(0);
            if (changed_index === 1) pickNumAndDen(2);
            else pickNumAndDen(1);
            if (settings.like_denoms === 'always') {
                (H.randInt(0, 1) === 0) ? (den2 = den1) : (den1 = den2);
            }

            if (conditionsMet()) sol_found = true;
        }
        if (!sol_found) { // if a sol is not found in time, use the minimum value (which we know results in a proper fraction)
            num1 = settings.numer_range_min;
            num2 = settings.numer_range_min;
            den1 = settings.denom_range_max;
            den2 = settings.denom_range_max;
            
            if (settings.like_denoms === 'never') {
                (H.randInt(0, 1) === 0) ? (den1--) : (den2--);
            }
        }
    }

    // Note: we can switch to subtraction without having to recheck conditions because 
    // if N1*D2 + N2*D1 < D1*D2 then |N1*D2 - N2*D1| < D1*D2 where N1,N2,D1,D2 > 0 (the subtraction case is enclosed within the addition case)
    const prompt_type = (settings.addsub_operation_type === 'both') ? H.randFromList(['add','subtract']) : settings.addsub_operation_type;
    let operation_symbol;
    let final_numer, final_denom;
    final_denom = den1 * den2;
    if (prompt_type === 'add') {
        operation_symbol = '+';

        final_numer = num1 * den2 + num2 * den1;
    }
    else if (prompt_type === 'subtract') {
        operation_symbol = '-';
        
        if ((num1 * den2 - num2 * den1) >= 0) { // final num is non-negative (no change)
            final_numer = num1 * den2 - num2 * den1;
        }
        else { // final num is negative (need to swap the two fractions so its >= 0) 
            final_numer = (-1) * (num1 * den2 - num2 * den1);
            
            let temp = num1;
            num1 = num2;
            num2 = temp;
            temp = den1;
            den1 = den2;
            den2 = temp;   
        }
    }

    const final_prompt = '\\frac{' + num1 + '}{' + den1 + '}' + operation_symbol + '\\frac{' + num2 + '}{' + den2 + '}';
    let final_answer;
    if (settings.add_frac_answer_form === 'fractions' || final_numer < final_denom) {
        final_answer = PH.simplifiedFracString(final_numer, final_denom);
    }
    else if (settings.add_frac_answer_form === 'mixed_numbers') { // by the condition above, we already know mixed numbers are applicable
        const whole_part = Math.floor(final_numer / final_denom) + '';
        const frac_numer = final_numer - (whole_part * final_denom);
        const frac_part = PH.simplifiedFracString(frac_numer, final_denom);

        final_answer = whole_part + ((frac_part === '0')? '' : frac_part);
    }

    return {
        question: final_prompt,
        answer: final_answer
    };
}

export const settings_fields = [
    'numer_range',
    'denom_range',
    'allow_improper_fracs',
    'addsub_operation_type',
    'add_frac_answer_form',
    'like_denoms'
];

export const prelocked_settings = [
    'add_frac_answer_form'
];

export function get_presets() {
    return {
        numer_range_min: 1,
        numer_range_max: 5,
        denom_range_min: 2,
        denom_range_max: 10,
        allow_improper_fracs: 'no',
        like_denoms: 'sometimes',
        add_frac_answer_form: 'fractions',
        addsub_operation_type: 'add'
    };
}

export function get_rand_settings() {
    let num_min_rand = H.randInt(1, 10);
    let num_max_rand = H.randInt(1, 10);
    if (num_min_rand > num_max_rand) {
        let temp;
        temp = num_min_rand;
        num_min_rand = num_max_rand;
        num_max_rand = temp;
    }

    let den_min_rand = H.randInt(1, 10);
    let den_max_rand = H.randInt(1, 10);
    if (den_min_rand > den_max_rand) {
        let temp;
        temp = den_min_rand;
        den_min_rand = den_max_rand;
        den_max_rand = temp;
    }
    
    return {
        numer_range_min: num_min_rand,
        numer_range_max: num_max_rand,
        denom_range_min: den_min_rand,
        denom_range_max: den_max_rand,
        allow_improper_fracs: '__random__',
        like_denoms: '__random__',
        add_frac_answer_form: '__random__',
        addsub_operation_type: '__random__'
    }; 
}