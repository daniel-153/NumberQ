import * as H from '../helpers/gen-helpers.js';

export default [
    {
        title: 'Standard Form (small coefficients)',
        example_problem: `
            \\begin{aligned}
            -3x+2y&=-5 \\\\
            2x+3y&=12
            \\end{aligned}
        `,
        description: 'Equations in standard form with smaller coefficients.',
        get_settings: function() {
            return {
                sys_eqs_coef_size: 3,
                linear_equation_form: 'standard',
                sys_eqs_x_solution: H.randInt(-7, 7),
                sys_eqs_y_solution: H.randInt(-7, 7),
                randomize_solutions: undefined,
                sys_eqs_term_number: '2_x_2_y'
            };
        }
    },
    {
        title: 'Standard Form (general)',
        example_problem: `
            \\begin{aligned}
            -6x+3y&=18 \\\\
            -x+7y&=29
            \\end{aligned}
        `,
        description: 'Equations in standard form.',
        get_settings: function() {
            return {
                sys_eqs_coef_size: 7,
                linear_equation_form: 'standard',
                sys_eqs_x_solution: H.randInt(-5, 5),
                sys_eqs_y_solution: H.randInt(-5, 5),
                randomize_solutions: undefined,
                sys_eqs_term_number: '2_x_2_y'
            };
        }
    },
    {
        title: 'Equal To Zero Form (small coefficients)',
        example_problem: `
            \\begin{aligned}
            2x-3y+13&=0 \\\\
            -3x-3y+18&=0
            \\end{aligned}
        `,
        description: 'Equations with all the terms on one side and smaller coefficients.',
        get_settings: function() {
            return {
                sys_eqs_coef_size: 3,
                linear_equation_form: 'equal_to_zero',
                sys_eqs_x_solution: H.randInt(-7, 7),
                sys_eqs_y_solution: H.randInt(-7, 7),
                randomize_solutions: undefined,
                sys_eqs_term_number: '2_x_2_y'
            };
        }
    },
    {
        title: 'Equal To Zero Form (general)',
        example_problem: `
            \\begin{aligned}
            3x-6y+39&=0 \\\\
            7x-5y+55&=0
            \\end{aligned}
        `,
        description: 'Equations with all the terms on one side.',
        get_settings: function() {
            return {
                sys_eqs_coef_size: 7,
                linear_equation_form: 'equal_to_zero',
                sys_eqs_x_solution: H.randInt(-5, 5),
                sys_eqs_y_solution: H.randInt(-5, 5),
                randomize_solutions: undefined,
                sys_eqs_term_number: '2_x_2_y'
            };
        }
    },
    {
        title: 'Slope Intercept Form (small coefficients)',
        example_problem: `
            \\begin{aligned}
            y&=x+10 \\\\
            y&=\\frac{2}{3}x+9
            \\end{aligned}
        `,
        description: 'Equations in slope intercept form with smaller coefficients.',
        get_settings: function() {
            return {
                sys_eqs_coef_size: 3,
                linear_equation_form: 'slope_intercept',
                sys_eqs_x_solution: H.randInt(-7, 7),
                sys_eqs_y_solution: H.randInt(-7, 7),
                randomize_solutions: undefined,
                sys_eqs_term_number: '2_x_2_y'
            };
        }
    },
    {
        title: 'Slope Intercept Form (general)',
        example_problem: `
            \\begin{aligned}
            y&=5x+15 \\\\
            y&=-6x-29
            \\end{aligned}
        `,
        description: 'Equations in slope intercept form.',
        get_settings: function() {
            return {
                sys_eqs_coef_size: 7,
                linear_equation_form: 'slope_intercept',
                sys_eqs_x_solution: H.randInt(-5, 5),
                sys_eqs_y_solution: H.randInt(-5, 5),
                randomize_solutions: undefined,
                sys_eqs_term_number: '2_x_2_y'
            };
        }
    },
    {
        title: 'Shuffled Terms (small coefficients)',
        example_problem: `
            \\begin{array}{c} 
            3x=-12+y \\\\ 
            -4=2y+x 
            \\end{array}
        `,
        description: 'Equations with terms in a randomized order and smaller coefficients.',
        get_settings: function() {
            return {
                sys_eqs_coef_size: 3,
                linear_equation_form: 'randomized',
                sys_eqs_x_solution: H.randInt(-7, 7),
                sys_eqs_y_solution: H.randInt(-7, 7),
                randomize_solutions: undefined,
                sys_eqs_term_number: '2_x_2_y'
            };
        }
    },
    {
        title: 'Shuffled Terms (general)',
        example_problem: `
            \\begin{array}{c} 
            6x=-7y+44 \\\\ 
            4y-33=-5x 
            \\end{array}
        `,
        description: 'Equations with terms in a randomized order.',
        get_settings: function() {
            return {
                sys_eqs_coef_size: 7,
                linear_equation_form: 'randomized',
                sys_eqs_x_solution: H.randInt(-5, 5),
                sys_eqs_y_solution: H.randInt(-5, 5),
                randomize_solutions: undefined,
                sys_eqs_term_number: '2_x_2_y'
            };
        }
    },
    {
        title: 'All Forms',
        example_problem: `
            \\begin{array}{c} 
            ax+by=c \\\\
            y=mx+b \\\\
            ax+by+c=0 \\\\
            \\operatorname{L}(x,y)=\\operatorname{R}(x,y) 
            \\end{array}
        `,
        description: 'Equations in standard, slope intercept, equal to zero, or shuffled form.',
        get_settings: function() {
            return {
                sys_eqs_coef_size: 5,
                linear_equation_form: H.randFromList(['standard', 'equal_to_zero', 'slope_intercept', 'randomized']),
                sys_eqs_x_solution: H.randInt(-5, 5),
                sys_eqs_y_solution: H.randInt(-5, 5),
                randomize_solutions: undefined,
                sys_eqs_term_number: '2_x_2_y'
            };
        }
    },
    {
        title: 'x-y Equation And An x-only Equation',
        example_problem: `
            \\begin{aligned}
            4x&=-8 \\\\
            3x+y&=-4
            \\end{aligned}
        `,
        description: 'A system where one of the equations has no y term.',
        get_settings: function() {
            return {
                sys_eqs_coef_size: 5,
                linear_equation_form: H.randFromList(['standard', 'equal_to_zero', 'randomized']),
                sys_eqs_x_solution: H.randInt(-5, 5),
                sys_eqs_y_solution: H.randInt(-5, 5),
                randomize_solutions: undefined,
                sys_eqs_term_number: '2_x_1_y'
            };
        }
    },
    {
        title: 'x-y Equation And An y-only Equation',
        example_problem: `
            \\begin{aligned}
            5y&=25 \\\\
            3x+3y&=27
            \\end{aligned}
        `,
        description: 'A system where one of the equations has no x term.',
        get_settings: function() {
            return {
                sys_eqs_coef_size: 5,
                linear_equation_form: H.randFromList(['standard', 'equal_to_zero', 'randomized']),
                sys_eqs_x_solution: H.randInt(-5, 5),
                sys_eqs_y_solution: H.randInt(-5, 5),
                randomize_solutions: undefined,
                sys_eqs_term_number: '1_x_2_y'
            };
        }
    },
    {
        title: 'x-only Equation And y-only Equation',
        example_problem: `
            \\begin{aligned}
            5x&=-15 \\\\
            -2y&=10
            \\end{aligned}
        `,
        description: 'A system where both equations have only one variable (an x-term or a y-term).',
        get_settings: function() {
            return {
                sys_eqs_coef_size: 5,
                linear_equation_form: H.randFromList(['standard', 'equal_to_zero', 'randomized']),
                sys_eqs_x_solution: H.randInt(-5, 5),
                sys_eqs_y_solution: H.randInt(-5, 5),
                randomize_solutions: undefined,
                sys_eqs_term_number: '1_x_1_y'
            };
        }
    },
    {
        title: 'Lines That Intersect At (0,0)',
        example_problem: `
            \\begin{aligned}
            -6x+6y&=0 \\\\
            7x+5y&=0
            \\end{aligned}
        `,
        description: 'A system where the lines intersect at the origin.',
        get_settings: function() {
            return {
                sys_eqs_coef_size: 10,
                linear_equation_form: H.randFromList(['standard', 'slope_intercept', 'equal_to_zero', 'randomized']),
                sys_eqs_x_solution: 0,
                sys_eqs_y_solution: 0,
                randomize_solutions: undefined,
                sys_eqs_term_number: '2_x_2_y'
            };
        }
    },
    {
        title: 'Solutions Where y=x',
        example_problem: `
            \\begin{aligned}
            -2x+4y&=-10 \\\\
            x-y&=0
            \\end{aligned}
        `,
        description: 'A system where the solution for y is equal to the solution for x.',
        get_settings: function() {
            const sol = H.randInt(-5, 5);
            
            return {
                sys_eqs_coef_size: 5,
                linear_equation_form: H.randFromList(['standard', 'slope_intercept', 'equal_to_zero', 'randomized']),
                sys_eqs_x_solution: sol,
                sys_eqs_y_solution: sol,
                randomize_solutions: undefined,
                sys_eqs_term_number: '2_x_2_y'
            };
        }
    },
    {
        title: 'Solutions Where y=-x',
        example_problem: `
            \\begin{array}{c} 
            5y=-5x \\\\ 
            3y-2x=15 
            \\end{array}
        `,
        description: 'A system where the solution for y is equal to the negative of the solution for x.',
        get_settings: function() {
            const sol = H.randIntExcept(-5, 5, 0);
            
            return {
                sys_eqs_coef_size: 5,
                linear_equation_form: H.randFromList(['standard', 'slope_intercept', 'equal_to_zero', 'randomized']),
                sys_eqs_x_solution: sol,
                sys_eqs_y_solution: -sol,
                randomize_solutions: undefined,
                sys_eqs_term_number: '2_x_2_y'
            };
        }
    },
    {
        title: 'Full Size Coefficients And Solutions',
        example_problem: `
            \\begin{aligned}
            -6x+9y&=183 \\\\
            -16x+20y&=420
            \\end{aligned}
        `,
        description: 'Equations with larger numbers (calculator may be required).',
        get_settings: function() {
            return {
                sys_eqs_coef_size: 20,
                linear_equation_form: H.randFromList(['standard', 'slope_intercept', 'equal_to_zero', 'randomized']),
                sys_eqs_x_solution: H.randInt(-20, 20),
                sys_eqs_y_solution: H.randInt(-20, 20),
                randomize_solutions: undefined,
                sys_eqs_term_number: '2_x_2_y'
            };
        }
    }
]