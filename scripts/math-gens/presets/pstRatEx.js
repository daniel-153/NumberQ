import * as H from '../helpers/gen-helpers.js';

export default [
    {
        title: 'Addition And Subtraction (beginner)',
        example_problem: '\\frac{1}{5x}+\\frac{1}{4x}',
        description: 'Add and subtract with beginner forms.',
        get_settings: function() {    
            return {
                ratex_add_sub_form: `as_${H.randFromList([1,2,3,4,5,13])}`,
                general_operation_types: ['add','subtract']
            };
        }
    },
    {
        title: 'Multiplication (beginner)',
        example_problem: '\\frac{5}{2x}\\cdot\\frac{1}{3x}',
        description: 'Multiply with beginner forms.',
        get_settings: function() {    
            return {
                ratex_mul_div_form: `md_${H.randInt(1, 7)}`,
                general_operation_types: ['multiply']
            };
        }
    },
    {
        title: 'Division (beginner)',
        example_problem: '\\frac{x-3}{x+3}\\div\\frac{x-4}{4}',
        description: 'Divide with beginner forms.',
        get_settings: function() {    
            return {
                ratex_mul_div_form: `md_${H.randInt(1, 7)}`,
                general_operation_types: ['divide']
            };
        }
    },
    {
        title: 'Any Operation (beginner)',
        example_problem: `
        \\begin{array}{c}
            P(x)\\,[+-\\:\\cdot\\:\\div]\\,Q(x) \\\\
            [\\mathrm{beginner}]
        \\end{array}
        `,
        description: 'Random operations with beginner forms.',
        get_settings: function() {    
            return {
                ratex_add_sub_form: `as_${H.randFromList([1,2,3,4,5,13])}`,
                ratex_mul_div_form: `md_${H.randInt(1, 7)}`,
                general_operation_types: '__random__'
            };
        }
    },
    {
        title: 'Addition And Subtraction (advanced)',
        example_problem: '\\frac{2x+6}{2x-7}+\\frac{6x+4}{3x-6}',
        description: 'Add and subtract with advanced forms.',
        get_settings: function() {    
            return {
                ratex_add_sub_form: `as_${H.randFromList(H.removeFromArray([1,2,3,4,5,13], H.integerArray(1, 15)))}`,
                general_operation_types: ['add','subtract']
            };
        }
    },
    {
        title: 'Multiplication (advanced)',
        example_problem: '\\frac{6x^{2}-5x}{7x^{2}-3x}\\cdot\\frac{x+4}{x+3}',
        description: 'Multiply with advanced forms.',
        get_settings: function() {    
            return {
                ratex_mul_div_form: `md_${H.randInt(8, 16)}`,
                general_operation_types: ['multiply']
            };
        }
    },
    {
        title: 'Division (advanced)',
        example_problem: '\\frac{x}{2x^{2}+5x}\\div\\frac{x-2}{x+2}',
        description: 'Divide with advanced forms.',
        get_settings: function() {    
            return {
                ratex_mul_div_form: `md_${H.randInt(8, 16)}`,
                general_operation_types: ['divide']
            };
        }
    },
    {
        title: 'Any Operation (advanced)',
        example_problem: `
        \\begin{array}{c}
            P(x)\\,[+-\\:\\cdot\\:\\div]\\,Q(x) \\\\
            [\\mathrm{advanced}]
        \\end{array}
        `,
        description: 'Random operations with advanced forms.',
        get_settings: function() {    
            return {
                ratex_add_sub_form: `as_${H.randFromList(H.removeFromArray([1,2,3,4,5,13], H.integerArray(1, 15)))}`,
                ratex_mul_div_form: `md_${H.randInt(8, 16)}`,
                general_operation_types: '__random__'
            };
        }
    },
    {
        title: 'Addition And Subtraction (quadratic denominators)',
        example_problem: '\\frac{-7}{4x^{2}-x}-\\frac{7}{2x}',
        description: 'Add and subtract where at least one denominator has a degree of 2.',
        get_settings: function() {    
            return {
                ratex_add_sub_form: `as_${H.randFromList([8, 9, 10, 11, 12, 13, 15])}`,
                general_operation_types: ['add','subtract']
            };
        }
    },
    {
        title: 'Addition And Subtraction (different denominator forms)',
        example_problem: '\\frac{6}{6x+1}+\\frac{7}{3x}',
        description: 'Add and subtract where forms of each denominator don\'t match.',
        get_settings: function() {    
            return {
                ratex_add_sub_form: `as_${H.randFromList([4, 7, 8, 9, 10, 11, 12, 13, 15])}`,
                general_operation_types: ['add','subtract']
            };
        }
    },
    {
        title: 'Multiplication With Cancellation',
        example_problem: '\\frac{7x}{3x^{2}-4x}\\cdot\\frac{x-6}{x+3}',
        description: 'Multiply where some common factors will cancel.',
        get_settings: function() {    
            return {
                ratex_mul_div_form: `md_${H.randFromList([6, 8, 10, 11, 12, 13, 14, 15, 16])}`,
                general_operation_types: ['multiply']
            };
        }
    },
    {
        title: 'Division With Cancellation',
        example_problem: '\\frac{6x^{2}+6x}{x^{2}+7x}\\div\\frac{x+1}{x-7}',
        description: 'Divide where some common factors will cancel.',
        get_settings: function() {    
            return {
                ratex_mul_div_form: `md_${H.randInt(7, 16)}`,
                general_operation_types: ['divide']
            };
        }
    },
    {
        title: 'Addition And Subtraction (state excluded values)',
        example_problem: 'P(x)\\pm Q(x);\\;x \\neq -2,2',
        description: 'Find the sum or difference of the expressions and state the excluded values.',
        get_settings: function() {    
            return {
                ratex_add_sub_form: 'all_add_sub',
                general_operation_types: ['add','subtract'],
                give_excluded_values: 'yes'
            };
        }
    },
    {
        title: 'Multiplication (state excluded values)',
        example_problem: 'P(x)\\cdot Q(x);\\;x \\neq -4,3',
        description: 'Multiply the expressions and state the excluded values.',
        get_settings: function() {    
            return {
                ratex_mul_div_form: 'all_mul_div',
                general_operation_types: ['multiply'],
                give_excluded_values: 'yes'
            };
        }
    },
    {
        title: 'Division (state excluded values)',
        example_problem: 'P(x)\\div Q(x);\\;x \\neq -7,-5',
        description: 'Divide the expressions and state the excluded values.',
        get_settings: function() {    
            return {
                ratex_mul_div_form: 'all_mul_div',
                general_operation_types: ['divide'],
                give_excluded_values: 'yes'
            };
        }
    },
    {
        title: 'Challenge Problems',
        example_problem: '\\frac{x^{2}-9x+18}{x-7}\\cdot\\frac{x^{2}+3x-4}{x^{2}-2x-24}',
        description: 'Forms that require several steps to perform the operation and simplify.',
        get_settings: function() {    
            return {
                ratex_add_sub_form: `as_${H.randFromList([5, 6, 11, 12])}`,
                ratex_mul_div_form: `md_${H.randInt(10, 14)}`,
                general_operation_types: '__random__'
            };
        }
    }
]