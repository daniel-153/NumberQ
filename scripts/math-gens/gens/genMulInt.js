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

export const presets = {
    default: function() {
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
    },
    random: function() {
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
    },
    topic_presets: [
        {
            title: 'Multiply Within 5',
            example_problem: '3\\times 4=\\:?',
            description: 'Multiply numbers between 0 and 5.',
            get_settings: function() {
                return {
                    first_term_range_min: 0,
                    first_term_range_max: 5,
                    second_term_range_min: 0,
                    second_term_range_max: 5,
                };
            }
        },
        {
            title: 'Multiply Within 10 (flat)',
            example_problem: '7\\times 8=\\:?',
            description: 'Multiply numbers between 0 and 10 (with flat, a &times; b, notation).',
            get_settings: function() {
                return {
                    first_term_range_min: 0,
                    first_term_range_max: 10,
                    second_term_range_min: 0,
                    second_term_range_max: 10,
                    muldiv_notation: 'flat_with_eq',
                };
            }
        },
        {
            title: 'Multiply Within 10 (stacked)',
            example_problem: '\\begin{array}{@{}r@{}} 6\\\\[-0.4em] \\underline{\\smash[b]{\\times~7}} \\end{array}',
            description: 'Multiply numbers between 0 and 10 (with stacked notation).',
            get_settings: function() {
                return {
                    first_term_range_min: 0,
                    first_term_range_max: 10,
                    second_term_range_min: 0,
                    second_term_range_max: 10,
                    muldiv_notation: 'stacked',
                    stacked_notation_rule: 'a_geq_b',
                };
            }
        },
        {
            title: 'Multiply Within 12 (flat)',
            example_problem: '10\\times 11=\\:?',
            description: 'Multiply numbers between 0 and 12 (with flat, a &times; b, notation).',
            get_settings: function() {
                return {
                    first_term_range_min: 0,
                    first_term_range_max: 12,
                    second_term_range_min: 0,
                    second_term_range_max: 12,
                    muldiv_notation: 'flat_with_eq',
                };
            }
        },
        {
            title: 'Multiply Within 12 (stacked)',
            example_problem: '\\begin{array}{@{}r@{}} 12\\\\[-0.4em] \\underline{\\smash[b]{\\times~\\phantom{1}3}} \\end{array}',
            description: 'Multiply numbers between 0 and 12 (with stacked notation).',
            get_settings: function() {
                return {
                    first_term_range_min: 0,
                    first_term_range_max: 12,
                    second_term_range_min: 0,
                    second_term_range_max: 12,
                    muldiv_notation: 'stacked',
                    stacked_notation_rule: 'a_geq_b',
                };
            }
        },
        {
            title: 'Multiply By 0',
            example_problem: '45\\times 0=\\:?',
            description: 'Multiply a number and zero.',
            get_settings: function() {
                let first_term_max, second_term_max;
                if (H.randInt(0, 1) === 0) {
                    first_term_max = 0;
                    second_term_max = Number('9' + H.randFromList(['', '9', '99']));
                }
                else {
                    first_term_max = Number('9' + H.randFromList(['', '9', '99']));
                    second_term_max = 0;
                }
                
                return {
                    first_term_range_min: 0,
                    first_term_range_max: first_term_max,
                    second_term_range_min: 0,
                    second_term_range_max: second_term_max,
                    muldiv_allow_zero: 'yes'
                };
            }
        },
        {
            title: 'Multiply By 1',
            example_problem: '1\\times 23=\\:?',
            description: 'Multiply a number and one.',
            get_settings: function() {
                let first_term_range, second_term_range;
                if (H.randInt(0, 1) === 0) {
                    first_term_range = [1, 1];
                    second_term_range = [0, Number('9' + H.randFromList(['', '9', '99']))]; 
                }
                else {
                    first_term_range = [0, Number('9' + H.randFromList(['', '9', '99']))];
                    second_term_range = [1, 1];
                }
                
                return {
                    first_term_range_min: first_term_range[0],
                    first_term_range_max: first_term_range[1],
                    second_term_range_min: second_term_range[0],
                    second_term_range_max: second_term_range[1]
                };
            }
        },
        {
            title: 'Multiply By 2',
            example_problem: '2\\times 10=\\:?',
            description: 'Multiply a number and two.',
            get_settings: function() {
                let first_term, second_term;
                if (H.randInt(0, 1) === 0) {
                    first_term = 2;
                    second_term = H.randInt(0, 12);
                }
                else {
                    first_term = H.randInt(0, 12);
                    second_term = 2;
                }
                
                return {
                    first_term_range_min: first_term,
                    first_term_range_max: first_term,
                    second_term_range_min: second_term,
                    second_term_range_max: second_term
                };
            }
        },
        {
            title: 'Multiply By 5',
            example_problem: '5\\times 6=\\:?',
            description: 'Multiply a number and five.',
            get_settings: function() {
                let first_term, second_term;
                if (H.randInt(0, 1) === 0) {
                    first_term = 5;
                    second_term = H.randInt(0, 12);
                }
                else {
                    first_term = H.randInt(0, 12);
                    second_term = 5;
                }
                
                return {
                    first_term_range_min: first_term,
                    first_term_range_max: first_term,
                    second_term_range_min: second_term,
                    second_term_range_max: second_term
                };
            }
        },
        {
            title: 'Multiply By 9',
            example_problem: '9\\times 8=\\:?',
            description: 'Multiply a number and nine.',
            get_settings: function() {
                let first_term, second_term;
                if (H.randInt(0, 1) === 0) {
                    first_term = 9;
                    second_term = H.randInt(0, 12);
                }
                else {
                    first_term = H.randInt(0, 12);
                    second_term = 9;
                }
                
                return {
                    first_term_range_min: first_term,
                    first_term_range_max: first_term,
                    second_term_range_min: second_term,
                    second_term_range_max: second_term
                };
            }
        },
        {
            title: 'Multiply By 10',
            example_problem: '10\\times 3=\\:?',
            description: 'Multiply a number and ten.',
            get_settings: function() {
                let first_term, second_term;
                if (H.randInt(0, 1) === 0) {
                    first_term = 10;
                    second_term = H.randInt(0, 12);
                }
                else {
                    first_term = H.randInt(0, 12);
                    second_term = 10;
                }
                
                return {
                    first_term_range_min: first_term,
                    first_term_range_max: first_term,
                    second_term_range_min: second_term,
                    second_term_range_max: second_term
                };
            }
        },
        {
            title: 'Multiply By 11',
            example_problem: '5\\times 11=\\:?',
            description: 'Multiply a number and eleven.',
            get_settings: function() {
                let first_term, second_term;
                if (H.randInt(0, 1) === 0) {
                    first_term = 11;
                    second_term = H.randInt(0, 12);
                }
                else {
                    first_term = H.randInt(0, 12);
                    second_term = 11;
                }
                
                return {
                    first_term_range_min: first_term,
                    first_term_range_max: first_term,
                    second_term_range_min: second_term,
                    second_term_range_max: second_term
                };
            }
        },
        {
            title: 'Multiply By 20',
            example_problem: '20\\times 4=\\:?',
            description: 'Multiply a number and twenty.',
            get_settings: function() {
                let first_term, second_term;
                if (H.randInt(0, 1) === 0) {
                    first_term = 20;
                    second_term = H.randInt(0, 12);
                }
                else {
                    first_term = H.randInt(0, 12);
                    second_term = 20;
                }
                
                return {
                    first_term_range_min: first_term,
                    first_term_range_max: first_term,
                    second_term_range_min: second_term,
                    second_term_range_max: second_term
                };
            }
        },
        {
            title: 'Multiply By Multiples Of 10',
            example_problem: '7 \\times 30',
            description: 'Multiply a number and a multiple of 10 (10, 20, 30, etc).',
            get_settings: function() {
                let first_term, second_term;
                if (H.randInt(0, 1) === 0) {
                    first_term = 10 * H.randInt(1, 9);
                    second_term = H.randInt(0, 10);
                }
                else {
                    first_term = H.randInt(0, 10);
                    second_term = 10 * H.randInt(1, 9);
                }
                
                return {
                    first_term_range_min: first_term,
                    first_term_range_max: first_term,
                    second_term_range_min: second_term,
                    second_term_range_max: second_term,
                    muldiv_notation: 'stacked',
                    stacked_notation_rule: 'a_geq_b',
                };
            }
        },
        {
            title: 'Multiply By Powers Of 10',
            example_problem: '25 \\times 1000',
            description: 'Multiply a number and a power of 10 (10, 100, 1000).',
            get_settings: function() {
                let first_term_range, second_term_range;
                if (H.randInt(0, 1) === 0) {
                    first_term_range = Array(2).fill(10**(H.randInt(1, 3)));
                    second_term_range = [0, Number('9' + H.randFromList(['', '9', '99']))]; 
                }
                else {
                    first_term_range = [0, Number('9' + H.randFromList(['', '9', '99']))];
                    second_term_range = Array(2).fill(10**(H.randInt(1, 3)));
                }
                
                return {
                    first_term_range_min: first_term_range[0],
                    first_term_range_max: first_term_range[1],
                    second_term_range_min: second_term_range[0],
                    second_term_range_max: second_term_range[1],
                    muldiv_notation: 'stacked',
                    stacked_notation_rule: 'a_geq_b',
                };
            }
        },
        {
            title: 'Multiply By Negatives (Within [-10,&nbsp;10])',
            example_problem: '(-5)\\times 8=\\:?',
            description: 'Multiply A &times B where one or both of A and B are negative.',
            get_settings: function() {
                let [first_term_is_neg, second_term_is_neg] = [H.randFromList([true, false]), H.randFromList([true, false])];
                if (H.randInt(0, 1) === 0 && !first_term_is_neg) second_term_is_neg = true;
                else if (!second_term_is_neg) first_term_is_neg = true;
                
                const first_term_range = (first_term_is_neg)? [-10, -1] : [0, 10];
                const second_term_range = (second_term_is_neg)? [-10, -1] : [0, 10];

                return {
                    first_term_range_min: first_term_range[0],
                    first_term_range_max: first_term_range[1],
                    second_term_range_min: second_term_range[0],
                    second_term_range_max: second_term_range[1],
                    muldiv_notation: 'flat_with_eq',
                };
            }
        },
        {
            title: 'Multiply By Negatives (Within [-12,&nbsp;12])',
            example_problem: '3\\times (-11)=\\:?',
            description: 'Multiply A &times B where one or both of A and B are negative.',
            get_settings: function() {
                let [first_term_is_neg, second_term_is_neg] = [H.randFromList([true, false]), H.randFromList([true, false])];
                if (H.randInt(0, 1) === 0 && !first_term_is_neg) second_term_is_neg = true;
                else if (!second_term_is_neg) first_term_is_neg = true;
                
                const first_term_range = (first_term_is_neg)? [-12, -1] : [0, 12];
                const second_term_range = (second_term_is_neg)? [-12, -1] : [0, 12];

                return {
                    first_term_range_min: first_term_range[0],
                    first_term_range_max: first_term_range[1],
                    second_term_range_min: second_term_range[0],
                    second_term_range_max: second_term_range[1],
                    muldiv_notation: 'flat_with_eq',
                };
            }
        },
        {
            title: '2 Digits Times 1 Digit',
            example_problem: '\\begin{array}{@{}r@{}} 25\\\\[-0.4em] \\underline{\\smash[b]{\\times~\\phantom{2}9}} \\end{array}',
            description: 'Multiply a two digit number by a one digit number.',
            get_settings: function() {
                return {
                    first_term_range_min: 10,
                    first_term_range_max: 99,
                    second_term_range_min: 0,
                    second_term_range_max: 9,
                    muldiv_notation: 'stacked',
                    stacked_notation_rule: 'a_geq_b',
                };
            }
        },
        {
            title: '3 Digits Times 1 Digit',
            example_problem: '\\begin{array}{@{}r@{}} 453\\\\[-0.4em] \\underline{\\smash[b]{\\times~\\phantom{45}5}} \\end{array}',
            description: 'Multiply a three digit number by a one digit number.',
            get_settings: function() {
                return {
                    first_term_range_min: 100,
                    first_term_range_max: 999,
                    second_term_range_min: 0,
                    second_term_range_max: 9,
                    muldiv_notation: 'stacked',
                    stacked_notation_rule: 'a_geq_b',
                };
            }
        },
        {
            title: '4 Digits Times 1 Digit',
            example_problem: '\\begin{array}{@{}r@{}} 8279\\\\[-0.4em] \\underline{\\smash[b]{\\times~\\phantom{827}6}} \\end{array}',
            description: 'Multiply a four digit number by a one digit number.',
            get_settings: function() {
                return {
                    first_term_range_min: 1000,
                    first_term_range_max: 9999,
                    second_term_range_min: 0,
                    second_term_range_max: 9,
                    muldiv_notation: 'stacked',
                    stacked_notation_rule: 'a_geq_b',
                };
            }
        },
        {
            title: '2 Digits Times 2 Digits',
            example_problem: '\\begin{array}{@{}r@{}} 63\\\\[-0.4em] \\underline{\\smash[b]{\\times~18}} \\end{array}',
            description: 'Multiply a two digit number by another two digit number.',
            get_settings: function() {
                return {
                    first_term_range_min: 10,
                    first_term_range_max: 99,
                    second_term_range_min: 10,
                    second_term_range_max: 99,
                    muldiv_notation: 'stacked',
                    stacked_notation_rule: 'a_geq_b',
                };
            }
        },
        {
            title: '3 Digits Times 2 Digits',
            example_problem: '\\begin{array}{@{}r@{}} 921\\\\[-0.4em] \\underline{\\smash[b]{\\times~\\phantom{9}34}} \\end{array}',
            description: 'Multiply a three digit number by a two digit number.',
            get_settings: function() {
                return {
                    first_term_range_min: 100,
                    first_term_range_max: 999,
                    second_term_range_min: 10,
                    second_term_range_max: 99,
                    muldiv_notation: 'stacked',
                    stacked_notation_rule: 'a_geq_b',
                };
            }
        },
        {
            title: '3 Digits Times 3 Digits',
            example_problem: '\\begin{array}{@{}r@{}} 243\\\\[-0.4em] \\underline{\\smash[b]{\\times~729}} \\end{array}',
            description: 'Multiply a three digit number by another three digit number.',
            get_settings: function() {
                return {
                    first_term_range_min: 100,
                    first_term_range_max: 999,
                    second_term_range_min: 100,
                    second_term_range_max: 999,
                    muldiv_notation: 'stacked',
                    stacked_notation_rule: 'a_geq_b',
                };
            }
        },
        {
            title: 'Multiply A Number By Itself (within 10)',
            example_problem: '8\\times 8=\\:?',
            description: 'Square numbers between 0 and 10.',
            get_settings: function() {
                const term = H.randInt(0, 10);

                return {
                    first_term_range_min: term,
                    first_term_range_max: term,
                    second_term_range_min: term,
                    second_term_range_max: term,
                };
            }
        },
        {
            title: 'Multiply A Number By Itself (within 15)',
            example_problem: '13\\times 13=\\:?',
            description: 'Square numbers between 0 and 15.',
            get_settings: function() {
                const term = H.randInt(0, 15);

                return {
                    first_term_range_min: term,
                    first_term_range_max: term,
                    second_term_range_min: term,
                    second_term_range_max: term,
                };
            }
        },
        {
            title: 'Multiply A Number By Itself (within 25)',
            example_problem: '21\\times 21=\\:?',
            description: 'Square numbers between 0 and 25.',
            get_settings: function() {
                const term = H.randInt(0, 25);

                return {
                    first_term_range_min: term,
                    first_term_range_max: term,
                    second_term_range_min: term,
                    second_term_range_max: term,
                };
            }
        },
    ]
};

export const size_adjustments = {
    width: 0.9,
    height: 1.3,
    q_font_size: 1.1,
    a_font_size: 1.1
};