import * as H from '../helpers/gen-helpers.js';

export default [
    {
        title: 'Beginner Forms (small integer solutions)',
        example_problem: 'x+5=7',
        description: 'Beginner level equations with single digit integer solutions.',
        get_settings: function() {
            return {
                solution_size_range: 'single_digit', 
                lin_eq_equation_form: 'all_begin',
                solution_form: 'integers'
            };
        }
    },
    {
        title: 'Beginner Forms (general integer solutions)',
        example_problem: '\\frac{x}{10}=3',
        description: 'Beginner level equations with single or multi digit integer solutions.',
        get_settings: function() {
            return {
                solution_size_range: 'multi_digit', 
                lin_eq_equation_form: 'all_begin',
                solution_form: 'integers'
            };
        }
    },
    {
        title: 'Beginner Forms (integer or fraction solutions)',
        example_problem: '-\\frac{2}{7}x=\\frac{1}{4}',
        description: 'Beginner level equations where solutions are both integers and fractions.',
        get_settings: function() {
            return {
                solution_size_range: 'single_digit', 
                lin_eq_equation_form: 'all_begin',
                solution_form: 'both'
            };
        }
    },
    {
        title: 'Intermediate Forms (small integer solutions)',
        example_problem: '-6+3(5x+45)=9',
        description: 'Intermediate level equations with single digit integer solutions.',
        get_settings: function() {
            return {
                solution_size_range: 'single_digit', 
                lin_eq_equation_form: 'all_inter',
                solution_form: 'integers'
            };
        }
    },
    {
        title: 'Intermediate Forms (general integer solutions)',
        example_problem: '7(-x-72)-3x=-4',
        description: 'Intermediate level equations with single or multi digit integer solutions.',
        get_settings: function() {
            return {
                solution_size_range: 'multi_digit', 
                lin_eq_equation_form: 'all_inter',
                solution_form: 'integers'
            };
        }
    },
    {
        title: 'Intermediate Forms (integer or fraction solutions)',
        example_problem: '7x-6-5x=-7x-1',
        description: 'Intermediate level equations where solutions are both integers and fractions.',
        get_settings: function() {
            return {
                solution_size_range: 'single_digit', 
                lin_eq_equation_form: 'all_inter',
                solution_form: 'both'
            };
        }
    },
    {
        title: 'Mixed Forms (x variable letter only)',
        example_problem: '-5x-4x=63',
        description: 'Mixed equation forms with x as the variable letter.',
        get_settings: function() {
            return {
                solution_size_range: 'single_digit', 
                lin_eq_equation_form: H.randFromList(['all_begin', 'all_inter']),
                solution_form: 'integers',
                variable_letter: 'x',
            };
        }
    },
    {
        title: 'Mixed Forms (any variable letter)',
        example_problem: '-5v=6v-22',
        description: 'Mixed equation forms with any lowercase letter representing the variable.',
        get_settings: function() {
            return {
                solution_size_range: 'single_digit', 
                lin_eq_equation_form: H.randFromList(['all_begin', 'all_inter']),
                solution_form: 'integers',
                variable_letter: "abcdfghjkmnpqrstuvwxyz"[Math.floor(Math.random() * 22)], // rand alphabet letter excluding e,i,o,l,
            };
        }
    },
    {
        title: 'One Step',
        example_problem: 'x+5=6',
        description: 'Equations that require one step to isolate the variable.',
        get_settings: function() {
            return {
                solution_size_range: 'single_digit', 
                lin_eq_equation_form: H.randFromList(['begin_1', 'begin_2', 'begin_3', 'begin_4', 'begin_8']),
                solution_form: 'integers'
            };
        }
    },
    {
        title: 'Two Step',
        example_problem: '3x+8=11',
        description: 'Equations that require two steps to isolate the variable.',
        get_settings: function() {
            return {
                solution_size_range: 'single_digit', 
                lin_eq_equation_form: H.randFromList(['begin_5', 'begin_6', 'begin_7', 'begin_10', 'begin_11', 'begin_12', 'begin_13', 'inter_3']),
                solution_form: 'integers'
            };
        }
    },
    {
        title: 'Three Step',
        example_problem: '3x+3=x-1',
        description: 'Equations that require three steps to isolate the variable.',
        get_settings: function() {
            return {
                solution_size_range: 'single_digit', 
                lin_eq_equation_form: H.randFromList(['inter_1', 'inter_2', 'inter_4', 'inter_12']),
                solution_form: 'integers'
            };
        }
    },
    {
        title: 'Include Fractions',
        example_problem: '\\frac{x+3}{2}=4',
        description: 'Equation forms that include fractions.',
        get_settings: function() {
            return {
                solution_size_range: 'single_digit', 
                lin_eq_equation_form: H.randFromList(['begin_4', 'begin_8', 'begin_9', 'begin_10', 'begin_11', 'begin_12', 'inter_11', 'inter_12', 'inter_13', 'inter_14', 'inter_15']),
                solution_form: 'integers'
            };
        }
    },
    {
        title: 'Include Parentheses',
        example_problem: '3(x+7)=9',
        description: 'Equation forms that include parentheses.',
        get_settings: function() {
            return {
                solution_size_range: 'single_digit', 
                lin_eq_equation_form: H.randFromList(['inter_3', 'inter_4', 'inter_5', 'inter_6', 'inter_7', 'inter_8', 'inter_9', 'inter_10', 'inter_14']),
                solution_form: 'integers'
            };
        }
    },
    {
        title: 'Variable On One Side',
        example_problem: '4x+6=10',
        description: 'Equation forms where only one side contains the variable.',
        get_settings: function() {
            return {
                solution_size_range: 'single_digit', 
                lin_eq_equation_form: H.randFromList([
                    'begin_1', 'begin_2', 'begin_3', 'begin_4', 'begin_5', 'begin_6', 'begin_8', 'begin_9', 'begin_10', 'begin_11', 'begin_12',
                    'inter_3', 'inter_4', 'inter_5', 'inter_6', 'inter_7', 'inter_8', 'inter_12', 'inter_14'
                ]),
                solution_form: 'integers'
            };
        }
    },
    {
        title: 'Variable On Both Sides',
        example_problem: '3+2x=x',
        description: 'Equation forms where both sides contain the variable.',
        get_settings: function() {
            return {
                solution_size_range: 'single_digit', 
                lin_eq_equation_form: H.randFromList(['begin_7', 'inter_1', 'inter_2', 'inter_9', 'inter_10', 'inter_11', 'inter_13', 'inter_15', 'inter_16']),
                solution_form: 'integers'
            };
        }
    },
    {
        title: 'Advanced Forms (challenging)',
        example_problem: '\\frac{9x+8}{8}=\\frac{2x+24}{4}',
        description: 'Challenging equation forms.',
        get_settings: function() {
            return {
                solution_size_range: 'single_digit', 
                lin_eq_equation_form: H.randFromList(['advan_1', 'advan_2', 'advan_4', 'advan_5', 'advan_8', 'advan_10', 'advan_11']),
                solution_form: 'integers'
            };
        }
    },
    {
        title: 'Advanced Forms (very challenging)',
        example_problem: '\\frac{3}{2}x+\\frac{1}{6}=\\frac{2}{7}x+\\frac{1}{6}',
        description: 'Very challenging equation forms.',
        get_settings: function() {
            return {
                solution_size_range: 'single_digit', 
                lin_eq_equation_form: H.randFromList(['advan_3', 'advan_6', 'advan_7', 'advan_9', 'advan_12', 'advan_13']),
                solution_form: 'integers'
            };
        }
    }
]