import * as H from '../helpers/gen-helpers.js';

export function validateSettings(form_obj, error_locations) {    
    // ensure the min <= max in the two min-max ranges
    if (form_obj.dividend_range_min > form_obj.dividend_range_max) {
        [form_obj.dividend_range_min, form_obj.dividend_range_max] = [form_obj.dividend_range_max, form_obj.dividend_range_min];
        error_locations.add('dividend_range_min').add('dividend_range_max');
    } 
    if (form_obj.divisor_range_min > form_obj.divisor_range_max) {
        [form_obj.divisor_range_min, form_obj.divisor_range_max] = [form_obj.divisor_range_max, form_obj.divisor_range_min];
        error_locations.add('divisor_range_min').add('divisor_range_max');
    }

    // if negative numbers are contained by any of the ranges, force even division (remainder division is unconventional with negatives)
    if (
        form_obj.dividend_range_min < 0 ||
        form_obj.dividend_range_max < 0 ||
        form_obj.divisor_range_min < 0 ||
        form_obj.divisor_range_max < 0
    ) form_obj.divide_evenly = 'always';

    // if even division is forced, ensure the divisor can't be zero ('either' and 'divisor' must be excluded from the zero rule)
    if (form_obj.divide_evenly === 'always' && form_obj.divint_zero_rule === 'either') {
        form_obj.divint_zero_rule = 'only_dividend';
    }
    else if (form_obj.divide_evenly === 'always' && form_obj.divint_zero_rule === 'only_divisor') {
        form_obj.divint_zero_rule = 'never';
    }

    // ensure the ranges and the allow-zero rule agree
    if (form_obj.divint_zero_rule === 'never') {
        if (form_obj.dividend_range_min === 0 && form_obj.dividend_range_max === 0) {
            form_obj.dividend_range_max = 1;
            error_locations.add('dividend_range_max');
        }
        if (form_obj.divisor_range_min === 0 && form_obj.divisor_range_max === 0) {
            form_obj.divisor_range_max = 1;
            error_locations.add('divisor_range_max');
        }
    }
    else if (form_obj.divint_zero_rule === 'only_dividend') {
        if (form_obj.divisor_range_min === 0 && form_obj.divisor_range_max === 0) {
            form_obj.divisor_range_max = 1;
            error_locations.add('divisor_range_max');
        }
    }
    else if (form_obj.divint_zero_rule === 'only_divisor') {
        if (form_obj.dividend_range_min === 0 && form_obj.dividend_range_max === 0) {
            form_obj.dividend_range_max = 1;
            error_locations.add('dividend_range_max');
        }
    }

    // if divide evenly is 'never', ensure that the divisor range isn't [1,1] (1 divides everything evenly), and the dividend range isn't [0,0] (0 is divided evenly by everything except 0)
    if (form_obj.divide_evenly === 'never') {
        if (form_obj.divisor_range_min === 1 && form_obj.divisor_range_max === 1) {
            form_obj.divisor_range_max = 2;
            error_locations.add('divisor_range_max');   
        }
        if (form_obj.dividend_range_min === 0 && form_obj.dividend_range_max === 0) {
            form_obj.dividend_range_max = 1;
            error_locations.add('dividend_range_max');
        }
    }
}

export default function genMulInt(settings) {
    // resolve the zero rule for the dividend and the divisor
    let [allow_z_in_dividend, allow_z_in_divisor] = [true, true];
    if (settings.divint_zero_rule === 'never' || settings.divint_zero_rule === 'only_dividend') {
        allow_z_in_divisor = false;
    }
    if (settings.divint_zero_rule === 'never' || settings.divint_zero_rule === 'only_divisor') {
        allow_z_in_dividend = false;
    }
    
    // resolve the values for the dividend and the divisor
    let dividend, divisor;
    if (settings.divide_evenly === 'sometimes') {
        if (allow_z_in_dividend) dividend = H.randInt(settings.dividend_range_min, settings.dividend_range_max);
        else dividend = H.randIntExcept(settings.dividend_range_min, settings.dividend_range_max, 0);
        
        if (allow_z_in_divisor) divisor = H.randInt(settings.divisor_range_min, settings.divisor_range_max);
        else divisor = H.randIntExcept(settings.divisor_range_min, settings.divisor_range_max, 0);
    }
    else if (settings.divide_evenly === 'always') {
        // select the divisor first
        divisor = H.randIntExcept(settings.divisor_range_min, settings.divisor_range_max, 0); // divisor can never be zero if even division is forced
        const unsigned_divisor = Math.abs(divisor);

        // extract numbers in the dividend range that divide the divisor evenly (if any)
        let lower_endpoint_multiple = Math.floor(settings.dividend_range_min / unsigned_divisor) * unsigned_divisor; 
        lower_endpoint_multiple = (lower_endpoint_multiple === settings.dividend_range_min)? lower_endpoint_multiple : lower_endpoint_multiple + unsigned_divisor;
        let upper_endpoint_multiple = Math.ceil(settings.dividend_range_max / unsigned_divisor) * unsigned_divisor;
        upper_endpoint_multiple = (upper_endpoint_multiple === settings.dividend_range_max)? upper_endpoint_multiple : upper_endpoint_multiple - unsigned_divisor;
        
        let min_multiple = 0;
        let max_multiple = (upper_endpoint_multiple - lower_endpoint_multiple) / unsigned_divisor;

        // if a valid range of potential dividends was found in the dividend range, randomly select from it
        if (
            lower_endpoint_multiple <= upper_endpoint_multiple &&
            (settings.dividend_range_min <= lower_endpoint_multiple && lower_endpoint_multiple <= settings.dividend_range_max) &&
            (settings.dividend_range_min <= upper_endpoint_multiple && upper_endpoint_multiple <= settings.dividend_range_max) &&
            !( // ensure the allow zero rule is still followed
                !allow_z_in_dividend && // zero is not allowed
                lower_endpoint_multiple === 0 &&
                max_multiple === 0 // but there is no possibility of any value other than 0
            )
        ) {
            if ( // zero is included in the 'range' but not allowed
                (lower_endpoint_multiple <= 0 && 0 <= lower_endpoint_multiple + unsigned_divisor * max_multiple) &&
                !allow_z_in_dividend
            ) {
                // solve for the multiple that results in a zero dividend and exclude it
                const zero_multiple_factor = -lower_endpoint_multiple / unsigned_divisor;
                dividend = lower_endpoint_multiple + unsigned_divisor * H.randIntExcept(min_multiple, max_multiple, zero_multiple_factor);
            }
            else { // zero is allowed or is not possible
                dividend = lower_endpoint_multiple + unsigned_divisor * H.randInt(min_multiple, max_multiple);
            }
        }
        else { // otherwise, the dividend range needs to be corrected (expanded) so that 'divide evenly' can be applied
            // find the 'closest' multiple of divisor to the provided range (as a starting point)
            const lower_multiple = Math.floor(settings.dividend_range_min / unsigned_divisor) * unsigned_divisor;
            const upper_multiple = Math.ceil(settings.dividend_range_max / unsigned_divisor) * unsigned_divisor;

            const lower_distance = settings.dividend_range_min - lower_multiple;
            const upper_distance = upper_multiple - settings.dividend_range_max;

            const closest_multiple = (upper_distance < lower_distance)? upper_multiple : lower_multiple;

            const expansion_number = 3; // expand by (expansion_number) of multiples of divisor in each direction (- and +)
            let multiple_set = [];
            multiple_set.unshift(closest_multiple - expansion_number * unsigned_divisor);
            multiple_set.push(closest_multiple + expansion_number * unsigned_divisor);

            // try to maintain the sign of the user's dividend range (if it had a uniform sign)
            let multiple_set_min = multiple_set[0];
            let multiple_set_max = multiple_set[multiple_set.length - 1];
            if (settings.dividend_range_min >= 0 && settings.dividend_range_max >= 0) { // range was non-negative
                // shift the multiple set so that it is non-negative (if needed)
                if (multiple_set_min < 0) {
                    const required_shift = Math.abs(multiple_set_min);
                    multiple_set = multiple_set.map(entry => entry + required_shift);
                }
            }
            else if (settings.dividend_range_min <= 0 && settings.dividend_range_max <= 0) { // range was non-positive
                // shift the multiple set so that it is non-positive (if needed)
                if (multiple_set_max > 0) {
                    const required_shift = multiple_set_max;
                    multiple_set = multiple_set.map(entry => entry - required_shift);
                }
            }

            // ensure the adjusted range didn't spill over the bounds (-9999 and 9999)
            multiple_set_min = multiple_set[0];
            multiple_set_max = multiple_set[multiple_set.length - 1];
            if (multiple_set_min < -9999) {
                const required_shift = -9999 - multiple_set_min;
                multiple_set = multiple_set.map(entry => entry + required_shift);
            }
            else if (multiple_set_max > 9999) {
                const required_shift = multiple_set_max - 9999
                multiple_set = multiple_set.map(entry => entry - required_shift);
            }
            multiple_set_min = multiple_set[0];
            multiple_set_max = multiple_set[multiple_set.length - 1];


            // the final adjusted multiple set still 'bounds' at least (2 * expansion_number) dividends that are even multiples of the divisor (these are extracted + selected from below)
            lower_endpoint_multiple = Math.floor(multiple_set_min / unsigned_divisor) * unsigned_divisor; 
            lower_endpoint_multiple = (lower_endpoint_multiple === multiple_set_min)? lower_endpoint_multiple : lower_endpoint_multiple + unsigned_divisor;
            upper_endpoint_multiple = Math.ceil(multiple_set_max / unsigned_divisor) * unsigned_divisor;
            upper_endpoint_multiple = (upper_endpoint_multiple === multiple_set_max)? upper_endpoint_multiple : upper_endpoint_multiple - unsigned_divisor;

            min_multiple = 0;
            max_multiple = (upper_endpoint_multiple - lower_endpoint_multiple) / unsigned_divisor;
            
            dividend = lower_endpoint_multiple + unsigned_divisor * H.randInt(min_multiple, max_multiple);

            // update the dividend range values in settings
            settings.dividend_range_min = multiple_set_min;
            settings.dividend_range_max = multiple_set_max;
        }
    }
    else if (settings.divide_evenly === 'never') { // by previous validation, ranges must be non-negative here + divisor range non-1 (not [1,1]) + dividend range non-0 (not [0,0])
        // pick a random divisor other than 1 from the divisor range
        divisor = H.randIntExcept(settings.divisor_range_min, settings.divisor_range_max, 1);
        if (!allow_z_in_divisor && divisor === 0) { // zero not possible but was selected 
            // the divisor_range_min must be equal to 0, and the divisor_range_max can be anything >= 1
            if (settings.divisor_range_max === 1) settings.divisor_range_max = 2; // increase divisor max to 2 if it was 1

            divisor = H.randInt(2, settings.divisor_range_max);
        }

        if (divisor === 0) { // no extra handling needed (reguardless of what the dividend is, the division will not be even - it will be undefined)
            dividend = H.randInt(settings.dividend_range_min, settings.dividend_range_max);
        }
        else {
            // pick a random non-zero dividend to start
            dividend = H.randIntExcept(settings.dividend_range_min, settings.dividend_range_max, 0);

            if (dividend % divisor === 0) { // if the division happened to be even, adjustments are necessary
                // need to expand by -1 or +1, but it may not be possible to expand in one of these two directions
                const valid_directions = [];
                if (dividend - 1 >= settings.dividend_range_min) { // can expand downward
                    valid_directions.push('-');
                }
                if (dividend + 1 <= settings.dividend_range_max) { // can expand upward
                    valid_directions.push('+')
                }

                if (valid_directions.length >= 1) { // possible to expand upward, downward, or both while staying within the user's range
                    const chosen_direction = H.randFromList(valid_directions);

                    if (chosen_direction === '+') dividend += 1;
                    else if (chosen_direction === '-') dividend -= 1;
                }
                else { // user's range is a single number which happened to be divisible by the selected divisor
                    valid_directions.length = 0; // clear

                    // user's range needs to be expanded (+1 or -1) but still be kept within [-9999,9999]
                    if (dividend - 1 >= -9999) { // can expand downward
                        valid_directions.push('-');
                    }
                    if (dividend + 1 <= 9999) { // can expand upward
                        valid_directions.push('+')
                    }

                    const chosen_direction = H.randFromList(valid_directions);

                    // adjust the dividend + settings value
                    if (chosen_direction === '+') {
                        dividend += 1;
                        settings.dividend_range_max += 1;
                    }
                    else if (chosen_direction === '-') {
                        dividend -= 1;
                        settings.dividend_range_min -= 1;
                    }
                }
            }
        }
    }

    // resolve the prompt form based on settings
    let prompt_str;
    let tex_prompt_str; // needed because '\enclose{longdiv}' is not LaTeX (it is only a MathJax utility)
    if (settings.divint_notation === 'long_div') { // no negative handling
        prompt_str = `${divisor}\\enclose{longdiv}{${dividend}}`;
        tex_prompt_str = `${divisor}\\overline{\\smash{)}${dividend}}`;
    }
    else { // flat forms (negative handling needed)
        const divisor_str = (divisor < 0)? `(${divisor})` : String(divisor);
        let dividend_str;
        if (settings.wrap_negatives === 'always') {
            dividend_str = (dividend < 0)? `(${dividend})` : String(dividend);
        }
        else if (settings.wrap_negatives === 'only_middle') {
            dividend_str = String(dividend);
        }

        prompt_str = `${dividend_str}\\div ${divisor_str}`;
        if (settings.divint_notation === 'flat_with_eq') prompt_str += '=';
        else if (settings.divint_notation === 'flat_with_eq_and_q') prompt_str += '=\\:?';

        tex_prompt_str = prompt_str;
    }

    // resolve the answer
    let answer_str;
    if (dividend % divisor === 0) { // division is even
        answer_str = String(dividend / divisor);
    }
    else if (divisor === 0) { // division is undefined (k/0 or 0/0)
        answer_str = '\\mathrm{undefined}';
    }
    else if (dividend > 0 && divisor > 0) { // division has a remainder (>0 condition should not be necessary, but is placed as a guard)
        const quotient = Math.floor(dividend / divisor);
        const remainder = dividend - quotient * divisor;

        answer_str = `${quotient}\\;\\,\\,\\mathrm{R}\\,${remainder}`;
    }

    return {
        question: prompt_str,
        TeXquestion: tex_prompt_str,
        answer: answer_str
    };
}   

export const settings_fields = [
    'dividend_range',
    'divisor_range',
    'divide_evenly',
    'divint_notation',
    'divint_zero_rule',
    'wrap_negatives'
];

export function get_presets() {
    return {
        dividend_range_min: 1,
        dividend_range_max: 100,
        divisor_range_min: 1,
        divisor_range_max: 10,
        divide_evenly: 'always',
        divint_notation: 'flat_with_eq',
        divint_zero_rule: 'only_dividend',
        wrap_negatives: 'always'
    };
}

export function get_rand_settings() {
    return {
        dividend_range_min: H.randInt(1, 200),
        dividend_range_max: H.randInt(1, 200),
        divisor_range_min: H.randInt(1, 25),
        divisor_range_max: H.randInt(1, 25),
        divide_evenly: '__random__',
        divint_notation: 'flat_with_eq',
        divint_zero_rule: '__random__',
        wrap_negatives: 'always'
    }; 
}

export const size_adjustments = {
    q_font_size: 1.1,
    a_font_size: 1.1
};