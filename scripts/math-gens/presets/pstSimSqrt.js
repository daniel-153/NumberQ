import * as H from '../helpers/gen-helpers.js';

export default [
    {
        title: 'Extract Perfect Squares (no leading factor)',
        example_problem: '~~~\\sqrt{20}~~~',
        description: 'Simplify by extracting perfect squares.',
        get_settings: function() {    
            return {
                sim_sqrt_form: 'basic_1'
            };
        }
    },
    {
        title: 'Extract Perfect Squares (general)',
        example_problem: '~~~3\\sqrt{8}~~~',
        description: 'Simplify by extracting perfect squares (leading factors allowed).',
        get_settings: function() {    
            return {
                sim_sqrt_form: H.randFromList(['basic_1', 'basic_2'])
            };
        }
    },
    {
        title: 'Multiply (2 terms, no leading factors)',
        example_problem: '\\sqrt{6} \\cdot \\sqrt{3}',
        description: 'Multiply two square roots.',
        get_settings: function() {    
            return {
                sim_sqrt_form: 'basic_3'
            };
        }
    },
    {
        title: 'Multiply (general)',
        example_problem: '2\\sqrt{7}\\cdot 5\\sqrt{3}',
        description: 'Multiply 2-3 square roots (leading factors allowed).',
        get_settings: function() {    
            return {
                sim_sqrt_form: H.randFromList(['basic_3', 'begin_5', 'begin_8'])
            };
        }
    },
    {
        title: 'Add Or Subtract (2 terms, no leading factors)',
        example_problem: '\\sqrt{2} + \\sqrt{32}',
        description: 'Add or subtract with two square roots.',
        get_settings: function() {    
            return {
                sim_sqrt_form: 'basic_4',
                sim_sqrt_allow_negatives: 'yes'
            };
        }
    },
    {
        title: 'Add Or Subtract (2 terms, with leading factors)',
        example_problem: '2\\sqrt{54} + 4\\sqrt{6}',
        description: 'Add or subtract with two square roots and leading factors included.',
        get_settings: function() {    
            return {
                sim_sqrt_form: 'begin_9',
                sim_sqrt_allow_negatives: 'yes'
            };
        }
    },
    {
        title: 'Add Or Subtract (3 terms, no leading factors)',
        example_problem: '\\sqrt{24} + \\sqrt{96} - \\sqrt{54}',
        description: 'Add or subtract with three square roots.',
        get_settings: function() {    
            return {
                sim_sqrt_form: 'begin_3',
                sim_sqrt_allow_negatives: 'yes'
            };
        }
    },
    {
        title: 'Add Or Subtract (3 terms, with leading factors)',
        example_problem: '2\\sqrt{7} + 2\\sqrt{28} - 5\\sqrt{28}',
        description: 'Add or subtract with three square roots and leading factors included.',
        get_settings: function() {    
            return {
                sim_sqrt_form: 'inter_11',
                sim_sqrt_allow_negatives: 'yes'
            };
        }
    },
    {
        title: 'Add Or Subtract (general)',
        example_problem: '4\\sqrt{54} - 5\\sqrt{24}',
        description: 'Add or subtract 2-4 roots, with or without leading factors.',
        get_settings: function() {    
            return {
                sim_sqrt_form: H.randFromList(['basic_4', 'begin_3', 'begin_9', 'inter_11', 'inter_6']),
                sim_sqrt_allow_negatives: 'yes'
            };
        }
    },
    {
        title: 'Rationalize (root in denominator, beginner)',
        example_problem: '~~~~~~~\\frac{5}{\\sqrt{3}}~~~~~~~',
        description: 'Expressions with a single square root in their denominator (beginner).',
        get_settings: function() {    
            return {
                sim_sqrt_form: H.randFromList(['begin_1', 'begin_2', 'begin_7']),
                sim_sqrt_allow_negatives: 'yes'
            };
        }
    },
    {
        title: 'Rationalize (root in denominator, advanced)',
        example_problem: '~~~~~~~\\frac{\\sqrt{6}\\cdot\\sqrt{5}}{\\sqrt{2}}~~~~~~~',
        description: 'Expressions with a single square root in their denominator (advanced).',
        get_settings: function() {    
            return {
                sim_sqrt_form: H.randFromList(['begin_4', 'inter_2', 'inter_7', 'inter_8', 'inter_9']),
                sim_sqrt_allow_negatives: 'yes'
            };
        }
    },
    {
        title: 'Rationalize Using Conjugates',
        example_problem: '~~~~~~\\frac{1}{5 - \\sqrt{7}}~~~~~~',
        description: 'Expressions that rationalize by using conjugates.',
        get_settings: function() {    
            return {
                sim_sqrt_form: H.randFromList(['inter_3', 'inter_4', 'inter_10']),
                sim_sqrt_allow_negatives: 'yes'
            };
        }
    },
    {
        title: 'Rationalize (general)',
        example_problem: '~~\\frac{1}{\\sqrt{28} - \\sqrt{7}}~~',
        description: 'Expressions that require one or more steps and techniques to rationalize.',
        get_settings: function() {    
            return {
                sim_sqrt_form: H.randFromList(['inter_12', 'inter_14', 'inter_15']),
                sim_sqrt_allow_negatives: 'yes'
            };
        }
    },
    {
        title: 'Add Or Subtract Two (a+&radic;b) Expressions',
        example_problem: '(1 + \\sqrt{3}) + (5 + \\sqrt{3})',
        description: 'Add or subtract two expressions with an integer and a square root.',
        get_settings: function() {    
            return {
                sim_sqrt_form: 'begin_6',
                sim_sqrt_allow_negatives: 'yes'
            };
        }
    },
    {
        title: 'Square An (a+&radic;b) Expression',
        example_problem: '(6 - \\sqrt{3})^{2}',
        description: 'Find the square of a sum of an integer and a square root.',
        get_settings: function() {    
            return {
                sim_sqrt_form: 'inter_1',
                sim_sqrt_allow_negatives: 'yes'
            };
        }
    },
    {
        title: 'Multiply Two (a+&radic;b) Expressions',
        example_problem: '( \\sqrt{3}+3 )( \\sqrt{3}+5 )',
        description: 'Multiply two expressions with an integer and a square root.',
        get_settings: function() {    
            return {
                sim_sqrt_form: 'inter_5',
                sim_sqrt_allow_negatives: 'yes'
            };
        }
    },
    {
        title: 'Distribute Into An (a+&radic;b) Expression',
        example_problem: '\\sqrt{6}( \\sqrt{6}-3 )',
        description: 'Apply the distributive property on an expression with an integer and a square root.',
        get_settings: function() {    
            return {
                sim_sqrt_form: H.randFromList(['begin_10', 'begin_11']),
                sim_sqrt_allow_negatives: 'yes'
            };
        }
    },
    {
        title: 'Challenge Problems',
        example_problem: '\\frac{2}{-3\\sqrt{3} - 4\\sqrt{48}}',
        description: 'Forms that require multiple steps or methods to simplify.',
        get_settings: function() {    
            return {
                sim_sqrt_form: H.randFromList(['inter_4', 'inter_6', 'inter_11', 'inter_13', 'inter_14', 'inter_15']),
                sim_sqrt_allow_negatives: 'yes'
            };
        }
    },
]