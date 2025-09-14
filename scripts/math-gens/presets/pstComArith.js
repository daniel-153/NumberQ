import * as H from '../helpers/gen-helpers.js';

export default [
    {
        title: 'Add (positive coefficients)',
        example_problem: '(4+7i)+(8+8i)',
        description: 'Add where all the coefficients are positive integers.',
        get_settings: function() {    
            return {
                term_range_min: 1,
                term_range_max: 10,
                general_operation_types: ['add']
            };
        }
    },
    {
        title: 'Add (general)',
        example_problem: '(-3+5i)+(1-8i)',
        description: 'Add with both positive and negative coefficients.',
        get_settings: function() {    
            return {
                term_range_min: -10,
                term_range_max: 10,
                general_operation_types: ['add']
            };
        }
    },
    {
        title: 'Subtract (positive coefficients)',
        example_problem: '(8+7i)-(3+i)',
        description: 'Subtract where all the coefficients are positive integers.',
        get_settings: function() {    
            return {
                term_range_min: 1,
                term_range_max: 10,
                general_operation_types: ['subtract']
            };
        }
    },
    {
        title: 'Subtract (general)',
        example_problem: '(-2+6i)-(-4+5i)',
        description: 'Subtract with both positive and negative coefficients.',
        get_settings: function() {    
            return {
                term_range_min: -10,
                term_range_max: 10,
                general_operation_types: ['subtract']
            };
        }
    },
    {
        title: 'Multiply (positive coefficients)',
        example_problem: '(2+5i)(1+4i)',
        description: 'Multiply where all the coefficients are positive integers.',
        get_settings: function() {    
            return {
                term_range_min: 1,
                term_range_max: 5,
                general_operation_types: ['multiply']
            };
        }
    },
    {
        title: 'Multiply (general)',
        example_problem: '(3-2i)(-2-5i)',
        description: 'Multiply with both positive and negative coefficients.',
        get_settings: function() {    
            return {
                term_range_min: -5,
                term_range_max: 5,
                general_operation_types: ['multiply']
            };
        }
    },
    {
        title: 'Divide (a+bi order, integer quotient numbers)',
        example_problem: '\\frac{6+2i}{1+i}\\Rightarrow 4-2i',
        description: 'Divide where the terms are written in a+bi order and the quotient only contains integer coefficients.',
        get_settings: function() {    
            return {
                term_range_min: -4,
                term_range_max: 4,
                general_operation_types: ['divide'],
                randomize_order: 'no',
                force_ints_in_div: 'yes'
            };
        }
    },
    {
        title: 'Divide (random order, integer quotient numbers)',
        example_problem: '\\frac{9+2i}{1+4i}\\Rightarrow 1-2i',
        description: 'Divide where the terms are written in a random order and the quotient only contains integer coefficients.',
        get_settings: function() {    
            return {
                term_range_min: -4,
                term_range_max: 4,
                general_operation_types: ['divide'],
                randomize_order: 'yes',
                force_ints_in_div: 'yes'
            };
        }
    },
    {
        title: 'Divide (a+bi order, fractions allowed)',
        example_problem: '\\frac{2+6i}{5-2i}\\Rightarrow -\\frac{2}{29}+\\frac{34}{29}i',
        description: 'Divide where the terms are written in a+bi order and the quotient may contain fractions.',
        get_settings: function() {    
            return {
                term_range_min: -5,
                term_range_max: 5,
                general_operation_types: ['divide'],
                randomize_order: 'no',
                force_ints_in_div: 'no'
            };
        }
    },
    {
        title: 'Divide (random order, fractions allowed)',
        example_problem: '\\frac{1-3i}{-3i+2}\\Rightarrow \\frac{11}{13}-\\frac{3}{13}i',
        description: 'Divide where the terms are written in a random order and the quotient may contain fractions.',
        get_settings: function() {    
            return {
                term_range_min: -5,
                term_range_max: 5,
                general_operation_types: ['divide'],
                randomize_order: 'yes',
                force_ints_in_div: 'no'
            };
        }
    },
    {
        title: 'Add And Subtract (general)',
        example_problem: '(a+bi)[+-](c+di)',
        description: 'Add and subtract with no restriction on coefficients or order.',
        get_settings: function() {    
            return {
                term_range_min: -10,
                term_range_max: 10,
                general_operation_types: ['add', 'subtract'],
                randomize_order: 'yes'
            };
        }
    },
    {
        title: 'Multiply And Divide (general)',
        example_problem: '(a+bi)[\\times \\div](c+di)',
        description: 'Multiply and divide with no restriction on coefficients or order.',
        get_settings: function() {    
            return {
                term_range_min: -5,
                term_range_max: 5,
                general_operation_types: ['multiply', 'divide'],
                randomize_order: 'yes',
                force_ints_in_div: 'no'
            };
        }
    },
    {
        title: 'Any Operation (general)',
        example_problem: '(a+bi) \\begin{bmatrix} {+} & {-} \\\\ {\\times} & {\\div} \\end{bmatrix} (c+di)',
        description: 'All operations with no restriction on coefficients or order.',
        get_settings: function() {    
            return {
                term_range_min: -5,
                term_range_max: 5,
                general_operation_types: '__random__',
                randomize_order: 'yes',
                force_ints_in_div: 'no'
            };
        }
    },
]