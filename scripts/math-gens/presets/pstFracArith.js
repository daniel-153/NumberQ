import * as H from '../helpers/gen-helpers.js';

export default [
    {
        title: 'Add With Common Denominators',
        example_problem: '\\frac{2}{5}+\\frac{1}{5}=',
        description: 'Add fractions with the same denominator.',
        get_settings: function() {
            return {
                numer_range_min: 1,
                numer_range_max: 5,
                denom_range_min: 2,
                denom_range_max: 12,
                allow_improper_fracs: 'no',
                like_denoms: 'always',
                frac_operations: ['add'],
                add_equals_sign: 'yes'
            };
        }
    },
    {
        title: 'Add With Different Denominators',
        example_problem: '\\frac{4}{7}+\\frac{1}{3}=',
        description: 'Add fractions with different denominators.',
        get_settings: function() {
            return {
                numer_range_min: 1,
                numer_range_max: 5,
                denom_range_min: 2,
                denom_range_max: 10,
                allow_improper_fracs: 'no',
                like_denoms: 'never',
                frac_operations: ['add'],
                add_equals_sign: 'yes'
            };
        }
    },
    {
        title: 'Add With A Numerator Of 1',
        example_problem: '\\frac{1}{9}+\\frac{1}{6}=',
        description: 'Add fractions where both numerators are 1.',
        get_settings: function() {
            return {
                numer_range_min: 1,
                numer_range_max: 1,
                denom_range_min: 2,
                denom_range_max: 10,
                allow_improper_fracs: 'no',
                like_denoms: 'sometimes',
                frac_operations: ['add'],
                add_equals_sign: 'yes'
            };
        }
    },
    {
        title: 'Add (allow improper results)',
        example_problem: '\\frac{5}{9}+\\frac{7}{8}=',
        description: 'Add fractions where the terms or result could be greater than or equal to 1.',
        get_settings: function() {
            return {
                numer_range_min: 1,
                numer_range_max: 5,
                denom_range_min: 2,
                denom_range_max: 10,
                allow_improper_fracs: 'yes',
                like_denoms: 'sometimes',
                frac_operations: ['add'],
                add_equals_sign: 'yes'
            };
        }
    },
    {
        title: 'Subtract With Common Denominators',
        example_problem: '\\frac{3}{4}-\\frac{2}{4}=',
        description: 'Subtract fractions with the same denominator.',
        get_settings: function() {
            return {
                numer_range_min: 1,
                numer_range_max: 5,
                denom_range_min: 2,
                denom_range_max: 12,
                allow_improper_fracs: 'no',
                like_denoms: 'always',
                frac_operations: ['subtract'],
                add_equals_sign: 'yes'
            };
        }
    },
    {
        title: 'Subtract With Different Denominators',
        example_problem: '\\frac{4}{9}-\\frac{1}{5}=',
        description: 'Subtract fractions with different denominators.',
        get_settings: function() {
            return {
                numer_range_min: 1,
                numer_range_max: 5,
                denom_range_min: 2,
                denom_range_max: 10,
                allow_improper_fracs: 'no',
                like_denoms: 'never',
                frac_operations: ['subtract'],
                add_equals_sign: 'yes'
            };
        }
    },
    {
        title: 'Subtract With A Numerator Of 1',
        example_problem: '\\frac{1}{3}-\\frac{1}{10}=',
        description: 'Subtract fractions where both numerators are 1.',
        get_settings: function() {
            return {
                numer_range_min: 1,
                numer_range_max: 1,
                denom_range_min: 2,
                denom_range_max: 10,
                allow_improper_fracs: 'no',
                like_denoms: 'sometimes',
                frac_operations: ['subtract'],
                add_equals_sign: 'yes'
            };
        }
    },
    {
        title: 'Add Or Subtract With Common Denominators',
        example_problem: '\\frac{a}{b} \\pm \\frac{c}{b}=',
        description: 'Add or subtract fractions with the same denominator.',
        get_settings: function() {
            return {
                numer_range_min: 1,
                numer_range_max: 5,
                denom_range_min: 2,
                denom_range_max: 12,
                allow_improper_fracs: 'no',
                like_denoms: 'always',
                frac_operations: ['add','subtract'],
                add_equals_sign: 'yes'
            };
        }
    },
    {
        title: 'Add Or Subtract With Different Denominators',
        example_problem: '\\frac{a}{b} \\pm \\frac{c}{d}=',
        description: 'Add or subtract fractions with different denominators.',
        get_settings: function() {
            return {
                numer_range_min: 1,
                numer_range_max: 5,
                denom_range_min: 2,
                denom_range_max: 10,
                allow_improper_fracs: 'no',
                like_denoms: 'never',
                frac_operations: ['add','subtract'],
                add_equals_sign: 'yes'
            };
        }
    },
    {
        title: 'Add Or Subtract (general)',
        example_problem: '\\frac{5}{4} - \\frac{1}{9}=',
        description: 'Add or subtract proper or improper fractions with like or unlike denominators.',
        get_settings: function() {
            return {
                numer_range_min: 1,
                numer_range_max: 5,
                denom_range_min: 2,
                denom_range_max: 10,
                allow_improper_fracs: 'yes',
                like_denoms: 'sometimes',
                frac_operations: ['add','subtract'],
                add_equals_sign: 'yes'
            };
        }
    },
    {
        title: 'Multiply',
        example_problem: '\\frac{2}{3} \\times \\frac{1}{7}=',
        description: 'Multiply fractions.',
        get_settings: function() {
            return {
                numer_range_min: 1,
                numer_range_max: 5,
                denom_range_min: 2,
                denom_range_max: 10,
                allow_improper_fracs: 'no',
                like_denoms: 'sometimes',
                frac_operations: ['multiply'],
                add_equals_sign: 'yes'
            };
        }
    },
    {
        title: 'Multiply With A Numerator Of 1',
        example_problem: '\\frac{1}{8} \\times \\frac{1}{6}=',
        description: 'Multiply fractions where both numerators are 1.',
        get_settings: function() {
            return {
                numer_range_min: 1,
                numer_range_max: 1,
                denom_range_min: 2,
                denom_range_max: 12,
                allow_improper_fracs: 'no',
                like_denoms: 'sometimes',
                frac_operations: ['multiply'],
                add_equals_sign: 'yes'
            };
        }
    },
    {
        title: 'Divide',
        example_problem: '\\frac{4}{6} \\div \\frac{1}{2}=',
        description: 'Divide fractions.',
        get_settings: function() {
            return {
                numer_range_min: 1,
                numer_range_max: 5,
                denom_range_min: 2,
                denom_range_max: 10,
                allow_improper_fracs: 'yes',
                like_denoms: 'sometimes',
                frac_operations: ['divide'],
                add_equals_sign: 'yes'
            };
        }
    },
    {
        title: 'Any Operation',
        example_problem: '+-\\times\\div',
        description: 'Add, subtract, multiply, and divide fractions.',
        get_settings: function() {
            return {
                numer_range_min: 1,
                numer_range_max: 5,
                denom_range_min: 2,
                denom_range_max: 10,
                allow_improper_fracs: 'yes',
                like_denoms: 'sometimes',
                frac_operations: ['add','subtract','multiply','divide'],
                add_equals_sign: 'yes'
            };
        }
    },
    {
        title: 'Subtract A Fraction From Itself',
        example_problem: '\\frac{17}{25} - \\frac{17}{25}=',
        description: 'Recognize that a fraction subtracted from itself is 0.',
        get_settings: function() {
            const numer = H.randInt(1, 100);
            const denom = H.randInt(1, 100);
            
            return {
                numer_range_min: numer,
                numer_range_max: numer,
                denom_range_min: denom,
                denom_range_max: denom,
                allow_improper_fracs: 'yes',
                like_denoms: 'sometimes',
                frac_operations: ['subtract'],
                add_equals_sign: 'yes'
            };
        }
    },
    {
        title: 'Divide A Fraction By Itself',
        example_problem: '\\frac{89}{73} \\div \\frac{89}{73}=',
        description: 'Recognize that a fraction divided by itself is 1.',
        get_settings: function() {
            const numer = H.randInt(1, 100);
            const denom = H.randInt(1, 100);
            
            return {
                numer_range_min: numer,
                numer_range_max: numer,
                denom_range_min: denom,
                denom_range_max: denom,
                allow_improper_fracs: 'yes',
                like_denoms: 'sometimes',
                frac_operations: ['divide'],
                add_equals_sign: 'yes'
            };
        }
    },
    {
        title: 'Add And Subtract Halves',
        example_problem: '\\frac{12}{2} + \\frac{5}{2}=',
        description: 'Add and subtract fractions where both denominators are 2 (mixed number answers when applicable).',
        get_settings: function() {
            return {
                numer_range_min: 1,
                numer_range_max: 20,
                denom_range_min: 2,
                denom_range_max: 2,
                allow_improper_fracs: 'yes',
                like_denoms: 'always',
                frac_operations: ['add','subtract'],
                add_equals_sign: 'yes',
                add_frac_answer_form: 'mixed_numbers'
            };
        }
    },
    {
        title: 'Add And Subtract Tenths',
        example_problem: '\\frac{25}{10} + \\frac{30}{10}=',
        description: 'Add and subtract fractions where both denominators are 10 (mixed number answers when applicable).',
        get_settings: function() {
            return {
                numer_range_min: 1,
                numer_range_max: 100,
                denom_range_min: 10,
                denom_range_max: 10,
                allow_improper_fracs: 'yes',
                like_denoms: 'always',
                frac_operations: ['add','subtract'],
                add_equals_sign: 'yes',
                add_frac_answer_form: 'mixed_numbers'
            };
        }
    },
]