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
    if (form_obj.muldiv_allow_zero === 'no') {
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
        form_obj.muldiv_notation === 'stacked' &&
        ( // any term range input is negative
            form_obj.first_term_range_min < 0 ||
            form_obj.first_term_range_max < 0 ||
            form_obj.second_term_range_min < 0 ||
            form_obj.second_term_range_max < 0
        )
    ) form_obj.muldiv_notation = 'flat_with_eq';
}

export default function genMulInt(settings) {
    // resolve the two term values
    let term_1, term_2;
    if (settings.muldiv_allow_zero === 'yes') {
        term_1 = H.randInt(settings.first_term_range_min, settings.first_term_range_max);
        term_2 = H.randInt(settings.second_term_range_min, settings.second_term_range_max);
    }
    else if (settings.muldiv_allow_zero === 'no') {
        term_1 = H.randIntExcept(settings.first_term_range_min, settings.first_term_range_max, 0);
        term_2 = H.randIntExcept(settings.second_term_range_min, settings.second_term_range_max, 0);
    }

    // resolve the notation for the prompt
    let question_tex_str;
    if (settings.muldiv_notation === 'stacked') { // stacked notation -> negatives not possible
        // handle the swap of terms if digits(a) < digits(b) and required by settings
        if (
            (String(term_1).length < String(term_2).length) &&
            settings.stacked_notation_rule === 'a_geq_b'
        ) {
            [term_1, term_2] = [term_2, term_1];
        }

        const term_1_str = String(term_1);
        let term_2_str = String(term_2);

        // if the lower term has fewer digits than the upper, phantom digits need to be added to it so the stacked notation stays aligned
        if (term_2_str.length < term_1_str.length) {
            // pad the second term with phantom digits of the first term (matching up in columns)
            let second_term_pad_digits = '';
            for (let i = 0; i < (term_1_str.length - term_2_str.length); i++) {
                second_term_pad_digits += term_1_str.charAt(i);
            }

            term_2_str = `\\phantom{${second_term_pad_digits}}` + term_2_str;
        }

        question_tex_str = `
            \\begin{array}{@{}r@{}}
                ${term_1_str}\\\\[-0.4em]
                \\underline{\\smash[b]{\\times~${term_2_str}}}
            \\end{array}
        `;
    }
    else { // all flat notations -> negatives must be handled
        const term_2_str = (term_2 < 0)? `(${term_2})` : String(term_2);
        let term_1_str;
        if (settings.wrap_negatives === 'always') {
            term_1_str = (term_1 < 0)? `(${term_1})` : String(term_1);
        }
        else if (settings.wrap_negatives === 'only_middle') {
            term_1_str = String(term_1);
        }

        question_tex_str = `${term_1_str} \\times ${term_2_str}`;
        if (settings.muldiv_notation === 'flat_with_eq') question_tex_str += '=';
        else if (settings.muldiv_notation === 'flat_with_eq_and_q') question_tex_str += '=\\:?';
    }

    const answer_tex_str = String(term_1 * term_2);

    return {
        question: question_tex_str,
        answer: answer_tex_str
    };
}   

export const settings_fields = [
    'first_term_range',
    'second_term_range',
    'muldiv_notation',
    'stacked_notation_rule',
    'muldiv_allow_zero',
    'wrap_negatives'
];

export function get_presets() {
    return {
        first_term_range_min: 1,
        first_term_range_max: 9,
        second_term_range_min: 1,
        second_term_range_max: 9,
        muldiv_notation: 'flat_with_eq',
        stacked_notation_rule: 'a_geq_b',
        muldiv_allow_zero: 'yes',
        wrap_negatives: 'always'
    };
}

export function get_rand_settings() {
    return {
        first_term_range_min: H.randInt(1, 12),
        first_term_range_max: H.randInt(1, 12),
        second_term_range_min: H.randInt(1, 12),
        second_term_range_max: H.randInt(1, 12),
        muldiv_notation: 'flat_with_eq',
        stacked_notation_rule: 'a_geq_b',
        muldiv_allow_zero: '__random__',
        wrap_negatives: 'always'
    }; 
}

export const size_adjustments = {
    width: 0.9,
    height: 1.3,
    q_font_size: 1.1,
    a_font_size: 1.1
};