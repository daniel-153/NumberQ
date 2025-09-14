import * as H from '../helpers/gen-helpers.js';

export default [
    {
        title: 'Factor a&thinsp;=&thinsp;1',
        example_problem: 'x^{2}+3x+2',
        description: 'Factor quadratics in the form (x-a)(x-b).',
        get_settings: function() {
            return {
                factor_size: 10,
                types_of_quadratics: ['two_integer_factors'],
                leading_coef: 1,
                quadratic_prompt_type: 'expression'
            };
        }
    },
    {
        title: 'Factor a&thinsp;=&thinsp;1 (with common factor)',
        example_problem: '2x^{2}+12x+16',
        description: 'Factor quadratics in the form K(x-a)(x-b).',
        get_settings: function() {
            return {
                factor_size: 5,
                types_of_quadratics: ['two_integer_factors'],
                leading_coef: H.randInt(2, 5) * (-1)**H.randInt(0, 1),
                quadratic_prompt_type: 'expression'
            };
        }
    },
    {
        title: 'Factor a&thinsp;&ne;&thinsp;1',
        example_problem: '4x^{2}+3x-10',
        description: 'Factor quadratics in the form (ax-b)(cx-d).',
        get_settings: function() {
            return {
                factor_size: 6,
                types_of_quadratics: ['two_non_integer_factors'],
                leading_coef: 1,
                quadratic_prompt_type: 'expression'
            };
        }
    },
    {
        title: 'Factor a&thinsp;&ne;&thinsp;1 (with common factor)',
        example_problem: '12x^{2}+22x-20',
        description: 'Factor quadratics in the form K(ax-b)(cx-d).',
        get_settings: function() {
            return {
                factor_size: 5,
                types_of_quadratics: ['two_non_integer_factors'],
                leading_coef: H.randInt(2, 4) * (-1)**H.randInt(0, 1),
                quadratic_prompt_type: 'expression'
            };
        }
    },
    {
        title: 'Factor Perfect Squares',
        example_problem: 'x^{2}+10x+25',
        description: 'Factor quadratics in the form (x-a)&sup2;.',
        get_settings: function() {
            return {
                factor_size: 10,
                types_of_quadratics: ['perf_square'],
                leading_coef: 1,
                quadratic_prompt_type: 'expression'
            };
        }
    },
    {
        title: 'Factor Perfect Squares (with common factor)',
        example_problem: '4x^{2}+32x+64',
        description: 'Factor quadratics in the form K(x-a)&sup2;.',
        get_settings: function() {
            return {
                factor_size: 5,
                types_of_quadratics: ['perf_square'],
                leading_coef: H.randInt(2, 5) * (-1)**H.randInt(0, 1),
                quadratic_prompt_type: 'expression'
            };
        }
    },
    {
        title: 'Factor Difference Of Squares',
        example_problem: 'x^{2}-36',
        description: 'Factor quadratics in the form (x-a)(x+a).',
        get_settings: function() {
            return {
                factor_size: 10,
                types_of_quadratics: ['diff_squares'],
                leading_coef: 1,
                quadratic_prompt_type: 'expression'
            };
        }
    },
    {
        title: 'Factor Difference Of Squares (with common factor)',
        example_problem: '-2x^{2}+18',
        description: 'Factor quadratics in the form K(x-a)(x+a).',
        get_settings: function() {
            return {
                factor_size: 5,
                types_of_quadratics: ['diff_squares'],
                leading_coef: H.randInt(2, 5) * (-1)**H.randInt(0, 1),
                quadratic_prompt_type: 'expression'
            };
        }
    },
    {
        title: 'Factor With No (c) term',
        example_problem: 'x^{2}+5x',
        description: 'Factor quadratics in the form x(x-a)',
        get_settings: function() {
            return {
                factor_size: 10,
                types_of_quadratics: ['no_c_term'],
                leading_coef: 1,
                quadratic_prompt_type: 'expression'
            };
        }
    },
    {
        title: 'Factor With No (c) term (with common factor)',
        example_problem: '-2x^{2}+6x',
        description: 'Factor quadratics in the form Kx(x-a)',
        get_settings: function() {
            return {
                factor_size: 10,
                types_of_quadratics: ['no_c_term'],
                leading_coef: H.randInt(2, 10) * (-1)**H.randInt(0, 1),
                quadratic_prompt_type: 'expression'
            };
        }
    },
    {
        title: 'Solve With The Quadratic Formula (real)',
        example_problem: '3x^{2}+21x-6=0',
        description: 'Quadratics where the quadratic formula is required to find the roots (real roots).',
        get_settings: function() {
            return {
                factor_size: 10,
                types_of_quadratics: ['not_factorable'],
                leading_coef: H.randInt(2, 5) * (-1)**H.randInt(0, 1),
                quadratic_prompt_type: 'equation'
            };
        }
    },
    {
        title: 'Solve With The Quadratic Formula (imaginary)',
        example_problem: '5x^{2}+5x+30=0',
        description: 'Quadratics where the quadratic formula is required to find the roots (imaginary roots).',
        get_settings: function() {
            return {
                factor_size: 10,
                types_of_quadratics: ['complex_roots'],
                leading_coef: H.randInt(2, 5) * (-1)**H.randInt(0, 1),
                quadratic_prompt_type: 'equation'
            };
        }
    },
    {
        title: 'Solve With The Quadratic Formula (general)',
        example_problem: `
            \\begin{aligned}
            & b^2 - 4ac \\geq 0~~\\mathrm{or}\\\\
            & b^2 - 4ac < 0
            \\end{aligned}
        `,
        description: 'Quadratics where the quadratic formula is required to find the roots (real or imaginary).',
        get_settings: function() {
            return {
                factor_size: 10,
                types_of_quadratics: ['not_factorable', 'complex_roots'],
                leading_coef: H.randInt(2, 5) * (-1)**H.randInt(0, 1),
                quadratic_prompt_type: 'equation'
            };
        }
    },
    {
        title: 'Solve By Factoring (integer solutions)',
        example_problem: 'x^{2}+7x+10=0',
        description: 'Quadratics that can be solved by factoring (integer solutions only).',
        get_settings: function() {
            return {
                factor_size: 5,
                types_of_quadratics: ['two_integer_factors', 'perf_square'],
                leading_coef: H.randInt(2, 5) * (-1)**H.randInt(0, 1),
                quadratic_prompt_type: 'equation',
                qf_answer_type: 'comma_seperated_values'
            };
        }
    },
    {
        title: 'Solve By Factoring (fraction solutions)',
        example_problem: '60x^{2}-52x+8=0',
        description: 'Quadratics that can be solved by factoring (with fraction solutions).',
        get_settings: function() {
            return {
                factor_size: 5,
                types_of_quadratics: ['two_non_integer_factors'],
                leading_coef: H.randInt(2, 4) * (-1)**H.randInt(0, 1),
                quadratic_prompt_type: 'equation',
                qf_answer_type: 'comma_seperated_values'
            };
        }
    },
    {
        title: 'Solve By Factoring (general)',
        example_problem: '15x^{2}+9x=0',
        description: 'Quadratics that can be solved by factoring (integer or fraction solutions).',
        get_settings: function() {
            return {
                factor_size: 5,
                types_of_quadratics: ['two_integer_factors','two_non_integer_factors','perf_square','diff_squares', 'no_c_term'],
                leading_coef: H.randInt(2, 4) * (-1)**H.randInt(0, 1),
                quadratic_prompt_type: 'equation',
                qf_answer_type: 'comma_seperated_values'
            };
        }
    },
    {
        title: 'Solve By Square Roots (real)',
        example_problem: 'x^{2}-10=0',
        description: 'Quadratics that can be solved by taking square roots (real solutions).',
        get_settings: function() {
            return {
                factor_size: 10,
                types_of_quadratics: ['real_solvebyroots'],
                leading_coef: 1,
                quadratic_prompt_type: 'equation',
                qf_answer_type: 'comma_seperated_values'
            };
        }
    },
    {
        title: 'Solve By Square Roots (real, common factor)',
        example_problem: '3x^{2}-21=0',
        description: 'Quadratics that can be solved by taking square roots (real solutions, common factors).',
        get_settings: function() {
            return {
                factor_size: 10,
                types_of_quadratics: ['real_solvebyroots'],
                leading_coef: H.randInt(2, 10) * (-1)**H.randInt(0, 1),
                quadratic_prompt_type: 'equation',
                qf_answer_type: 'comma_seperated_values'
            };
        }
    },
    {
        title: 'Solve By Square Roots (imaginary)',
        example_problem: 'x^{2}+4=0',
        description: 'Quadratics that can be solved by taking square roots (imaginary solutions).',
        get_settings: function() {
            return {
                factor_size: 10,
                types_of_quadratics: ['complex_solvebyroots'],
                leading_coef: 1,
                quadratic_prompt_type: 'equation',
                qf_answer_type: 'comma_seperated_values'
            };
        }
    },
    {
        title: 'Solve By Square Roots (imaginary, common factor)',
        example_problem: '6x^{2}+18=0',
        description: 'Quadratics that can be solved by taking square roots (imaginary solutions, common factors).',
        get_settings: function() {
            return {
                factor_size: 10,
                types_of_quadratics: ['complex_solvebyroots'],
                leading_coef: H.randInt(2, 10) * (-1)**H.randInt(0, 1),
                quadratic_prompt_type: 'equation',
                qf_answer_type: 'comma_seperated_values'
            };
        }
    },
    {
        title: 'Solve By Square Roots (general)',
        example_problem: `
            \\begin{aligned}
            & x = \\pm \\sqrt{a}~~\\mathrm{or}\\\\
            & x = \\pm i\\sqrt{a}
            \\end{aligned}
        `,
        description: 'Quadratics that can be solved by taking square roots (real or imaginary solutions).',
        get_settings: function() {
            return {
                factor_size: 10,
                types_of_quadratics: ['real_solvebyroots', 'complex_solvebyroots'],
                leading_coef: H.randFromList([1, H.randInt(2, 10) * (-1)**H.randInt(0, 1)]),
                quadratic_prompt_type: 'equation',
                qf_answer_type: 'comma_seperated_values'
            };
        }
    }
]