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
            second_term = H.randFromList(second_term_values.filter(value => value <= settings.first_term_range_max));
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

export const presets = {
    default: function() {
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
    },
    random: function() {
        return {
            first_term_range_min: H.randInt(1, 25),
            first_term_range_max: H.randInt(1, 25),
            second_term_range_min: H.randInt(1, 25),
            second_term_range_max: H.randInt(1, 25),
            addsub_operation: '__random__',
            force_non_neg_sub: '__random__',
            allow_zero_terms: '__random__'
        };
    },
    topic_presets: [
        {
            display_title: 'Addition Within 10',
            example_problem: '3+5=\\:?',
            description: 'Add numbers between 0 and 10.',
            get_settings: function() {
                return {
                    first_term_range_min: 0,
                    first_term_range_max: 10,
                    second_term_range_min: 0,
                    second_term_range_max: 10,
                    addsub_operation: 'add'
                };
            }
        },
        {
            display_title: 'Addition Within 20',
            example_problem: '13+17=\\:?',
            description: 'Add numbers between 0 and 20.',
            get_settings: function() {
                return {
                    first_term_range_min: 0,
                    first_term_range_max: 20,
                    second_term_range_min: 0,
                    second_term_range_max: 20,
                    addsub_operation: 'add'
                };
            }
        },
        {
            display_title: 'Subtraction Within 10',
            example_problem: '9-5=\\:?',
            description: 'Subtract numbers between 0 and 10.',
            get_settings: function() {
                return {
                    first_term_range_min: 0,
                    first_term_range_max: 10,
                    second_term_range_min: 0,
                    second_term_range_max: 10,
                    addsub_operation: 'subtract',
                    force_non_neg_sub: 'yes'
                };
            }
        },
        {
            display_title: 'Subtraction Within 20',
            example_problem: '19-3=\\:?',
            description: 'Subtract numbers between 0 and 20.',
            get_settings: function() {
                return {
                    first_term_range_min: 0,
                    first_term_range_max: 20,
                    second_term_range_min: 0,
                    second_term_range_max: 20,
                    addsub_operation: 'subtract',
                    force_non_neg_sub: 'yes'
                };
            }
        },
        {
            display_title: 'Mixed Operations Within 10',
            example_problem: '\\overset{[0,10]}{A} \\pm \\overset{[0,10]}{B}',
            description: 'Add and subtract numbers within 10.',
            get_settings: function() {
                return {
                    first_term_range_min: 0,
                    first_term_range_max: 10,
                    second_term_range_min: 0,
                    second_term_range_max: 10,
                    addsub_operation: 'either',
                    force_non_neg_sub: 'yes'
                };
            }
        },
        {
            display_title: 'Mixed Operations Within 20',
            example_problem: '\\overset{[0,20]}{A} \\pm \\overset{[0,20]}{B}',
            description: 'Add and subtract numbers within 20.',
            get_settings: function() {
                return {
                    first_term_range_min: 0,
                    first_term_range_max: 20,
                    second_term_range_min: 0,
                    second_term_range_max: 20,
                    addsub_operation: 'either',
                    force_non_neg_sub: 'yes'
                };
            }
        },
        {
            display_title: 'Addition With Negatives',
            example_problem: '(-3)+(-2)=\\:?',
            description: 'Add (A + B) where one or both of A and B are negative numbers.',
            get_settings: function() {
                let [first_term_is_neg, second_term_is_neg] = [H.randFromList([true, false]), H.randFromList([true, false])];
                if (H.randInt(0, 1) === 0 && !first_term_is_neg) second_term_is_neg = true;
                else if (!second_term_is_neg) first_term_is_neg = true;
                
                const first_term_range = (first_term_is_neg)? [-9, -1] : [0, 10];
                const second_term_range = (second_term_is_neg)? [-9, -1] : [0, 10];

                return {
                    first_term_range_min: first_term_range[0],
                    first_term_range_max: first_term_range[1],
                    second_term_range_min: second_term_range[0],
                    second_term_range_max: second_term_range[1],
                    addsub_operation: 'add'
                };
            }
        },
        {
            display_title: 'Subtraction With Negatives',
            example_problem: '(-8)-(-7)=\\:?',
            description: 'Subtract (A - B) where one or both of A and B are negative numbers.',
            get_settings: function() {
                let [first_term_is_neg, second_term_is_neg] = [H.randFromList([true, false]), H.randFromList([true, false])];
                if (H.randInt(0, 1) === 0 && !first_term_is_neg) second_term_is_neg = true;
                else if (!second_term_is_neg) first_term_is_neg = true;
                
                const first_term_range = (first_term_is_neg)? [-9, -1] : [0, 10];
                const second_term_range = (second_term_is_neg)? [-9, -1] : [0, 10];

                return {
                    first_term_range_min: first_term_range[0],
                    first_term_range_max: first_term_range[1],
                    second_term_range_min: second_term_range[0],
                    second_term_range_max: second_term_range[1],
                    addsub_operation: 'subtract'
                };
            }
        },
        {
            display_title: 'Addition With Zero',
            example_problem: '34+0=\\:?',
            description: 'Add a number and zero.',
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
                    addsub_operation: 'add',
                    allow_zero_terms: 'yes'
                };
            }
        },
        {
            display_title: 'Subtraction With Zero',
            example_problem: '10-0=\\:?',
            description: 'Subtract zero from a number.',
            get_settings: function() {    
                return {
                    first_term_range_min: 0,
                    first_term_range_max: Number('9' + H.randFromList(['', '9', '99'])),
                    second_term_range_min: 0,
                    second_term_range_max: 0,
                    addsub_operation: 'subtract',
                    allow_zero_terms: 'yes'
                };
            }
        },
        {
            display_title: 'Mixed Operations With Negatives',
            example_problem: 'A\\pm B,~~A \\text{ or } B \\lt 0',
            description: 'Add or subtract two numbers where at least one number is negative.',
            get_settings: function() {
                let [first_term_is_neg, second_term_is_neg] = [H.randFromList([true, false]), H.randFromList([true, false])];
                if (H.randInt(0, 1) === 0 && !first_term_is_neg) second_term_is_neg = true;
                else if (!second_term_is_neg) first_term_is_neg = true;
                
                const first_term_range = (first_term_is_neg)? [-9, -1] : [0, 10];
                const second_term_range = (second_term_is_neg)? [-9, -1] : [0, 10];

                return {
                    first_term_range_min: first_term_range[0],
                    first_term_range_max: first_term_range[1],
                    second_term_range_min: second_term_range[0],
                    second_term_range_max: second_term_range[1],
                    addsub_operation: 'either'
                };
            }
        },
        {
            display_title: 'Subtraction With Negative Results',
            example_problem: 'A-B\\lt 0',
            description: 'Subtract two numbers A and B where the result (A&thinsp;-&thinsp;B) is negative.',
            get_settings: function() {
                const term_1 = H.randInt(0, 19);
                const term_2 = H.randInt(term_1 + 1, 20);

                return {
                    first_term_range_min: term_1,
                    first_term_range_max: term_1,
                    second_term_range_min: term_2,
                    second_term_range_max: term_2,
                    addsub_operation: 'subtract',
                    force_non_neg_sub: 'no'
                };
            }
        },
        {
            display_title: 'Add 1 Digit to 2 Digits',
            example_problem: '\\begin{array}{@{}r@{}} 32\\\\[-0.4em] \\underline{\\smash[b]{+~\\phantom{3}8}} \\end{array}',
            description: 'Add a number with one digit to a number with two digits.',
            get_settings: function() {
                return {
                    first_term_range_min: 10,
                    first_term_range_max: 99,
                    second_term_range_min: 0,
                    second_term_range_max: 9,
                    addsub_operation: 'add',
                    addsub_notation: 'stacked'
                };
            }
        },
        {
            display_title: 'Add 2 Digits to 2 Digits',
            example_problem: '\\begin{array}{@{}r@{}} 84\\\\[-0.4em] \\underline{\\smash[b]{+~25}} \\end{array}',
            description: 'Add two numbers that each have two digits.',
            get_settings: function() {
                return {
                    first_term_range_min: 10,
                    first_term_range_max: 99,
                    second_term_range_min: 10,
                    second_term_range_max: 99,
                    addsub_operation: 'add',
                    addsub_notation: 'stacked'
                };
            }
        },
        {
            display_title: 'Addition Within 2 Digits',
            example_problem: '\\overset{[0,99]}{A} + \\overset{[0,99]}{B}',
            description: 'Add numbers that have either one or two digits.',
            get_settings: function() {
                return {
                    first_term_range_min: 0,
                    first_term_range_max: Number('9' + H.randFromList(['', '9'])),
                    second_term_range_min: 0,
                    second_term_range_max: Number('9' + H.randFromList(['', '9'])),
                    addsub_operation: 'add',
                    addsub_notation: 'stacked'
                };
            }
        },
        {
            display_title: 'Addition Within 3 Digits',
            example_problem: '\\overset{[0,999]}{A} + \\overset{[0,999]}{B}',
            description: 'Add numbers that have between one and three digits.',
            get_settings: function() {
                return {
                    first_term_range_min: 0,
                    first_term_range_max: Number('9' + H.randFromList(['', '9', '99'])),
                    second_term_range_min: 0,
                    second_term_range_max: Number('9' + H.randFromList(['', '9', '99'])),
                    addsub_operation: 'add',
                    addsub_notation: 'stacked'
                };
            }
        },
        {
            display_title: 'Subtract 1 Digit from 2 Digits',
            example_problem: '\\begin{array}{@{}r@{}} 46\\\\[-0.4em] \\underline{\\smash[b]{-~\\phantom{3}7}} \\end{array}',
            description: 'Subtract a number with one digit from a number with two digits.',
            get_settings: function() {
                return {
                    first_term_range_min: 10,
                    first_term_range_max: 99,
                    second_term_range_min: 0,
                    second_term_range_max: 9,
                    addsub_operation: 'subtract',
                    addsub_notation: 'stacked',
                    force_non_neg_sub: 'yes'
                };
            }
        },
        {
            display_title: 'Subtract 2 Digits from 2 Digits',
            example_problem: '\\begin{array}{@{}r@{}} 91\\\\[-0.4em] \\underline{\\smash[b]{-~17}} \\end{array}',
            description: 'Subtract a two digit number from another two digit number.',
            get_settings: function() {
                return {
                    first_term_range_min: 10,
                    first_term_range_max: 99,
                    second_term_range_min: 10,
                    second_term_range_max: 99,
                    addsub_operation: 'subtract',
                    addsub_notation: 'stacked',
                    force_non_neg_sub: 'yes'
                };
            }
        },
        {
            display_title: 'Subtraction Within 2 Digits',
            example_problem: '\\overset{[0,99]}{A} - \\overset{[0,99]}{B}',
            description: 'Subtract numbers that have either one or two digits.',
            get_settings: function() {
                return {
                    first_term_range_min: 0,
                    first_term_range_max: Number('9' + H.randFromList(['', '9'])),
                    second_term_range_min: 0,
                    second_term_range_max: Number('9' + H.randFromList(['', '9'])),
                    addsub_operation: 'subtract',
                    addsub_notation: 'stacked',
                    force_non_neg_sub: 'yes'
                };
            }
        },
        {
            display_title: 'Subtraction Within 3 Digits',
            example_problem: '\\overset{[0,999]}{A} - \\overset{[0,999]}{B}',
            description: 'Subtract numbers that have between one and three digits.',
            get_settings: function() {
                return {
                    first_term_range_min: 0,
                    first_term_range_max: Number('9' + H.randFromList(['', '9', '99'])),
                    second_term_range_min: 0,
                    second_term_range_max: Number('9' + H.randFromList(['', '9', '99'])),
                    addsub_operation: 'subtract',
                    addsub_notation: 'stacked',
                    force_non_neg_sub: 'yes'
                };
            }
        },
        {
            display_title: 'Mixed Operations Within 3 Digits',
            example_problem: '\\overset{[0,999]}{A} \\pm \\overset{[0,999]}{B}',
            description: 'Add or subtract numbers that have between one and three digits.',
            get_settings: function() {
                return {
                    first_term_range_min: 0,
                    first_term_range_max: Number('9' + H.randFromList(['', '9', '99'])),
                    second_term_range_min: 0,
                    second_term_range_max: Number('9' + H.randFromList(['', '9', '99'])),
                    addsub_operation: 'either',
                    addsub_notation: 'stacked',
                    force_non_neg_sub: 'yes'
                };
            }
        },
        {
            display_title: 'Adding by Tens',
            example_problem: 'A+(10k)=\\:?',
            description: 'Add a number and a multiple of ten.',
            get_settings: function() {
                const ten_multiple = 10 * H.randInt(1, 9);
                
                return {
                    first_term_range_min: 0,
                    first_term_range_max: Number('9' + H.randFromList(['', '9', '99'])),
                    second_term_range_min: ten_multiple,
                    second_term_range_max: ten_multiple,
                    addsub_operation: 'add',
                    addsub_notation: 'stacked'
                };
            }
        },
        {
            display_title: 'Adding by Hundreds',
            example_problem: 'A+(100k)=\\:?',
            description: 'Add a number and a multiple of 100.',
            get_settings: function() {
                const hundred_multiple = 100 * H.randInt(1, 9);

                return {
                    first_term_range_min: 0,
                    first_term_range_max: Number('9' + H.randFromList(['', '9', '99'])),
                    second_term_range_min: hundred_multiple,
                    second_term_range_max: hundred_multiple,
                    addsub_operation: 'add',
                    addsub_notation: 'stacked'
                };
            }
        },
        {
            display_title: 'Adding With Tens and Hundreds',
            example_problem: '10+500=\\:?',
            description: 'Add two numbers that are multiples of 10 or 100.',
            get_settings: function() {
                const term_1 = H.randInt(1, 9) * 10**(H.randInt(1, 2));
                const term_2 = H.randInt(1, 9) * 10**(H.randInt(1, 2));

                return {
                    first_term_range_min: term_1,
                    first_term_range_max: term_1,
                    second_term_range_min: term_2,
                    second_term_range_max: term_2,
                    addsub_operation: 'add',
                    addsub_notation: 'stacked'
                };
            }
        },
        {
            display_title: 'Large Addition (1-4 digits)',
            example_problem: '\\begin{array}{@{}r@{}} 5260\\\\[-0.4em] \\underline{\\smash[b]{+~\\phantom{5}478}} \\end{array}',
            description: 'Add numbers with between one and four digits.',
            get_settings: function() {
                return {
                    first_term_range_min: 0,
                    first_term_range_max: Number('9' + H.randFromList(['', '9', '99', '999'])),
                    second_term_range_min: 0,
                    second_term_range_max: Number('9' + H.randFromList(['', '9', '99', '999'])),
                    addsub_operation: 'add',
                    addsub_notation: 'stacked'
                };
            }
        },
        {
            display_title: 'Large Subtraction (1-4 digits)',
            example_problem: '\\begin{array}{@{}r@{}} 5087\\\\[-0.4em] \\underline{\\smash[b]{-~\\phantom{50}71}} \\end{array}',
            description: 'Subtract numbers with between one and four digits.',
            get_settings: function() {
                return {
                    first_term_range_min: 0,
                    first_term_range_max: Number('9' + H.randFromList(['', '9', '99', '999'])),
                    second_term_range_min: 0,
                    second_term_range_max: Number('9' + H.randFromList(['', '9', '99', '999'])),
                    addsub_operation: 'subtract',
                    force_non_neg_sub: 'yes',
                    addsub_notation: 'stacked'
                };
            }
        }
    ]
};

export const size_adjustments = {
    width: 0.9,
    height: 1.3,
    q_font_size: 1.1,
    a_font_size: 1.1
};