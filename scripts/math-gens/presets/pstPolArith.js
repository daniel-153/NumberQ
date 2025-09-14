import * as H from '../helpers/gen-helpers.js';

export default [
    {
        title: 'Add And Subtract (linear)',
        example_problem: '(5x+2)+(x+9)',
        description: 'Add and subtract two linear polynomials.',
        get_settings: function() {    
            return {
                polynomial_A_degree: 1,
                polynomial_B_degree: 1,
                general_operation_types: ['add','subtract'],
                coef_size: 9
            };
        }
    },
    {
        title: 'Multiply (linear)',
        example_problem: '(x+3)(7x+9)',
        description: 'Multiply two linear polynomials.',
        get_settings: function() {    
            return {
                polynomial_A_degree: 1,
                polynomial_B_degree: 1,
                general_operation_types: ['multiply'],
                coef_size: 7
            };
        }
    },
    {
        title: 'Add And Subtract (linear and quadratic)',
        example_problem: '(x-3)-(x^{2}+3x+9)',
        description: 'Add and subtract with a linear and a quadratic polynomial.',
        get_settings: function() {    
            const degree_AB = [1, 1];
            degree_AB[H.randInt(0, 1)]++;
            
            return {
                polynomial_A_degree: degree_AB[0],
                polynomial_B_degree: degree_AB[1],
                general_operation_types: ['add','subtract'],
                coef_size: 9
            };
        }
    },
    {
        title: 'Multiply (linear and quadratic)',
        example_problem: '(2x+6)(x^{2}+5x+4)',
        description: 'Multiply with a linear and a quadratic polynomial.',
        get_settings: function() {    
            const degree_AB = [1, 1];
            degree_AB[H.randInt(0, 1)]++;
            
            return {
                polynomial_A_degree: degree_AB[0],
                polynomial_B_degree: degree_AB[1],
                general_operation_types: ['multiply'],
                coef_size: 7
            };
        }
    },
    {
        title: 'Add And Subtract (quadratic)',
        example_problem: '(ax^{2}+...)\\pm(bx^{2}+...)',
        description: 'Add and subtract two quadratic polynomials.',
        get_settings: function() {    
            return {
                polynomial_A_degree: 2,
                polynomial_B_degree: 2,
                general_operation_types: ['add','subtract'],
                coef_size: 9
            };
        }
    },
    {
        title: 'Multiply (quadratic)',
        example_problem: '(ax^{2}+...)(bx^{2}+...)',
        description: 'Multiply two quadratic polynomials.',
        get_settings: function() {    
            return {
                polynomial_A_degree: 2,
                polynomial_B_degree: 2,
                general_operation_types: ['multiply'],
                coef_size: 5
            };
        }
    },
    {
        title: 'Multiply (linear and cubic)',
        example_problem: '(ax^{3}+...)(bx+c)',
        description: 'Multiply a linear polynomial and a cubic polynomial.',
        get_settings: function() {    
            const degree_AB = [1, 1];
            degree_AB[H.randInt(0, 1)] = 3;
            
            return {
                polynomial_A_degree: degree_AB[0],
                polynomial_B_degree: degree_AB[1],
                general_operation_types: ['multiply'],
                coef_size: 5
            };
        }
    },
    {
        title: 'Add And Subtract (mixed degrees)',
        example_problem: '(ax^{p}+...)\\pm(bx^{q}+...)',
        description: 'Add and subtract two polynomials of random degrees.',
        get_settings: function() {
            const degree_AB = [H.randInt(1, 3), H.randInt(1, 3)];

            while (degree_AB[0] + degree_AB[1] > 4) {
                let decrease_idx = H.randInt(0, 1);
                degree_AB[decrease_idx]--;
            }
            
            return {
                polynomial_A_degree: degree_AB[0],
                polynomial_B_degree: degree_AB[1],
                general_operation_types: ['add','subtract'],
                coef_size: 9
            };
        }
    },
    {
        title: 'Multiply (mixed degrees)',
        example_problem: '(ax^{p}+...)(bx^{q}+...)',
        description: 'Multiply two polynomials of random degrees.',
        get_settings: function() {
            const degree_AB = [H.randInt(1, 3), H.randInt(1, 3)];

            while (degree_AB[0] + degree_AB[1] > 4) {
                let decrease_idx = H.randInt(0, 1);
                degree_AB[decrease_idx]--;
            }
            
            return {
                polynomial_A_degree: degree_AB[0],
                polynomial_B_degree: degree_AB[1],
                general_operation_types: ['multiply'],
                coef_size: 5
            };
        }
    },
    {
        title: 'Divide (quadratic by linear, no remainder)',
        example_problem: '\\frac{x^{2}+5x-14}{x+7}',
        description: 'Divide a quadratic by one of its linear factors.',
        get_settings: function() {                
            return {
                polynomial_A_degree: 2,
                polynomial_B_degree: 1,
                general_operation_types: ['divide'],
                factor_size: 9,
                division_result: 'divide_evenly'
            };
        }
    },
    {
        title: 'Divide (by linear, no remainder)',
        example_problem: '\\frac{P(x)}{x-a}=Q(x)',
        description: 'Divide a polynomial by a linear factor (no remainder).',
        get_settings: function() {                
            return {
                polynomial_A_degree: H.randInt(2, 4),
                polynomial_B_degree: 1,
                general_operation_types: ['divide'],
                factor_size: 5,
                division_result: 'divide_evenly'
            };
        }
    },
    {
        title: 'Divide (by linear, numerical remainder)',
        example_problem: '\\frac{P(x)}{x-a} \\rightarrow R=P(a)',
        description: 'Divide a polynomial by a linear factor (remainder represented numerically).',
        get_settings: function() {                
            return {
                polynomial_A_degree: H.randInt(2, 4),
                polynomial_B_degree: 1,
                general_operation_types: ['divide'],
                factor_size: 5,
                division_result: 'numerical_remainder'
            };
        }
    },
    {
        title: 'Divide (by linear, algebraic remainder)',
        example_problem: '\\frac{P(x)}{x-a}=Q(x)+\\frac{R}{x-a}',
        description: 'Divide a polynomial by a linear factor (remainder represented algebraically).',
        get_settings: function() {                
            return {
                polynomial_A_degree: H.randInt(2, 4),
                polynomial_B_degree: 1,
                general_operation_types: ['divide'],
                factor_size: 5,
                division_result: 'quotient_plus_remainder'
            };
        }
    },
    {
        title: 'Divide (by linear, remainders and no remainders)',
        example_problem: '\\frac{P(x)}{x-a}=Q(x)+(\\frac{R}{x-a}?)',
        description: 'Divide a polynomial by a linear factor (result may or may not have a remainder).',
        get_settings: function() {                
            return {
                polynomial_A_degree: H.randInt(2, 4),
                polynomial_B_degree: 1,
                general_operation_types: ['divide'],
                factor_size: 5,
                division_result: H.randFromList(['divide_evenly', 'quotient_plus_remainder'])
            };
        }
    },
    {
        title: 'Divide (higher order divisors, no remainder)',
        example_problem: '\\frac{P(x)}{(x^2+...)}=Q(x)',
        description: 'Divide by quadratic and cubic polynomials (no remainder).',
        get_settings: function() {                
            const num_degree = H.randInt(3, 4);
            const den_degree = H.randInt(2, num_degree - 1);
            
            return {
                polynomial_A_degree: num_degree,
                polynomial_B_degree: den_degree,
                general_operation_types: ['divide'],
                factor_size: 5,
                division_result: 'divide_evenly'
            };
        }
    }
]