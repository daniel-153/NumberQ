import * as H from '../helpers/gen-helpers.js';

export function validateSettings(form_obj, error_locations) {
    // ensure the min <= max in the two min-max ranges
    if (form_obj.first_term_range_min > form_obj.first_term_range_max) {
        [form_obj.first_term_range_min, form_obj.first_term_range_max] = [form_obj.first_term_range_max, form_obj.first_term_range_min];
        error_locations.add('first_term_range_min').add('first_term_range_max');
    } 
    if (form_obj.second_term_range_min > form_obj.second_term_range_max) {
        [form_obj.second_term_range_min, form_obj.second_term_range_max] = [form_obj.second_term_range_max, form_obj.second_term_range_min];
        error_locations.add('second_term_range_min').add('second_term_range_max');
    }

    // if zero is NOT allowed, ensure that both ranges are non-zero (that is, not exactly [0,0])
    if (form_obj.allow_zero_terms === 'no') {
        if (form_obj.first_term_range_min === 0 && form_obj.first_term_range_max === 0) {
            form_obj.first_term_range_max = 1;
            error_locations.add('first_term_range_max');
        }
        if (form_obj.second_term_range_min === 0 && form_obj.second_term_range_max === 0) {
            form_obj.second_term_range_max = 1;
            error_locations.add('second_term_range_max');
        }
    }

    // if either range allows negative numbers, ensure the arithmetic notation isn't stacked
    if (
        form_obj.addsub_notation === 'stacked' &&
        ( // any term range input is negative
            form_obj.first_term_range_min < 0 ||
            form_obj.first_term_range_max < 0 ||
            form_obj.second_term_range_min < 0 ||
            form_obj.second_term_range_max < 0
        )
    ) form_obj.addsub_notation = 'flat_with_eq';
}

export default function genAddSub(settings) {    
    // resolve just one operation from settings (addition or subtraction)
    const selected_operation = (settings.addsub_operation === 'either')? H.randFromList(['add', 'subtract']) : settings.addsub_operation;
    const operation_symbol = (selected_operation === 'add')? '+' : '-';

    let first_term, second_term;
    if ( // force non neg sub is chosen and applicable (adjustments may be needed)
        selected_operation === 'subtract' &&
        settings.force_non_neg_sub === 'yes' &&
        settings.first_term_range_min >= 0 &&
        settings.first_term_range_max >= 0 &&
        settings.second_term_range_min >= 0 &&
        settings.second_term_range_max >= 0
    ) { // first term must be >= second term
        let first_term_values = H.integerArray(settings.first_term_range_min, settings.first_term_range_max);
        let second_term_values = H.integerArray(settings.second_term_range_min, settings.second_term_range_max);

        if (settings.allow_zero_terms === 'no') {
            first_term_values = H.removeFromArray(0, first_term_values);
            second_term_values = H.removeFromArray(0, second_term_values);
        }

        // check if the first range is less than the second range
        if (first_term_values[first_term_values.length - 1] < second_term_values[0]) {
            // swap the ranges for the first term and second term
            [first_term_values, second_term_values] = [second_term_values, first_term_values];

            let [temp1, temp2] = [settings.first_term_range_min, settings.first_term_range_max];
            [settings.first_term_range_min, settings.first_term_range_max] = [settings.second_term_range_min, settings.second_term_range_max];
            [settings.second_term_range_min, settings.second_term_range_max] = [temp1, temp2];
        }

        if (H.randInt(0, 1) === 0) { // pick first term first
            first_term = H.randFromList(first_term_values.filter(value => value >= settings.second_term_range_min));
            second_term = H.randFromList(second_term_values.filter(value => value <= first_term));
        }
        else { // pick second term first
            second_term = H.randFromList(second_term_values);
            first_term = H.randFromList(first_term_values.filter(value => value >= second_term));
        }
    }
    else if (settings.allow_zero_terms === 'no') { // zero must be excluded
        first_term = H.randIntExcept(settings.first_term_range_min, settings.first_term_range_max, 0);
        second_term = H.randIntExcept(settings.second_term_range_min, settings.second_term_range_max, 0);
    }
    else { // no restrictions on term values
        first_term = H.randInt(settings.first_term_range_min, settings.first_term_range_max);
        second_term = H.randInt(settings.second_term_range_min, settings.second_term_range_max);
    }

    // resolve the question and answer
    let answer_tex_str = String( (selected_operation === 'add')? (first_term + second_term) : (first_term - second_term) );
    let question_tex_str;
    if (settings.addsub_notation === 'stacked') { // negative values not possible (no handling needed)
        let first_term_str = String(first_term);
        let second_term_str = String(second_term);

        // if the first term is shorter than the second term, the terms need to be swapped (having a higher term with fewer digits than the lower one is unconventional)
        if (first_term_str.length < second_term_str.length) { 
            [first_term, second_term] = [second_term, first_term];
            [first_term_str, second_term_str] = [second_term_str, first_term_str];
            answer_tex_str = String( (selected_operation === 'add')? (first_term + second_term) : (first_term - second_term) ); // recompute the result
        }
        
        // if the second term is shorter than the first term, \phantom digits need to be added so everything stays aligned
        if (first_term_str.length > second_term_str.length) { 
            // pad the second term with phantom digits of the first term (matching up in columns)
            let second_term_pad_digits = '';
            for (let i = 0; i < (first_term_str.length - second_term_str.length); i++) {
                second_term_pad_digits += first_term_str.charAt(i);
            }

            second_term_str = `\\phantom{${second_term_pad_digits}}` + second_term_str;
        }

        question_tex_str = `
            \\begin{array}{@{}r@{}}
                ${first_term_str}\\\\[-0.4em]
                \\underline{\\smash[b]{${operation_symbol}~${second_term_str}}}
            \\end{array}
        `;
    }
    else { // flat with equals or just flat (handling for negatives values is necessary)
        const second_term_str = (second_term < 0)? `(${second_term})` : String(second_term);
        let first_term_str;
        if (settings.wrap_negatives === 'always') {
            first_term_str = (first_term < 0)? `(${first_term})` : String(first_term);
        }
        else if (settings.wrap_negatives === 'only_middle') {
            first_term_str = String(first_term);
        }

        question_tex_str = `${first_term_str}${operation_symbol}${second_term_str}`;
        if (settings.addsub_notation === 'flat_with_eq') question_tex_str += '=';
        else if (settings.addsub_notation === 'flat_with_eq_and_q') question_tex_str += '=\\:?';
    }

    return {
        question: question_tex_str,
        answer: answer_tex_str
    };
}

export const settings_fields = [
    'first_term_range',
    'second_term_range',
    'addsub_operation',
    'addsub_notation',
    'force_non_neg_sub',
    'allow_zero_terms',
    'wrap_negatives'
];

export function get_presets() {
    return {
        first_term_range_min: 1,
        first_term_range_max: 9,
        second_term_range_min: 1,
        second_term_range_max: 9,
        addsub_operation: 'add',
        addsub_notation: 'flat_with_eq',
        force_non_neg_sub: 'yes',
        allow_zero_terms: 'yes',
        wrap_negatives: 'only_middle'
    };
}

export function get_rand_settings() {
    return {
        first_term_range_min: H.randInt(-25, -1),
        first_term_range_max: H.randInt(1, 25),
        second_term_range_min: H.randInt(-25, -1),
        second_term_range_max: H.randInt(1, 25),
        addsub_operation: '__random__',
        addsub_notation: 'flat_with_eq',
        force_non_neg_sub: '__random__',
        allow_zero_terms: '__random__',
        wrap_negatives: 'only_middle'
    }; 
}

export const size_adjustments = {
    width: 0.9,
    height: 1.3,
    q_font_size: 1.1,
    a_font_size: 1.1
};