import * as H from '../helpers/gen-helpers.js';

export default [
    {
        title: 'Add Or Subtract (2-3 operations)',
        example_problem: '4+3-5',
        description: 'Expressions with 2-3 addition and subtraction operations.',
        get_settings: function() {
            const combined_count = H.randInt(2, 3);
            let add_count = H.randInt(1, combined_count);
            let sub_count = combined_count - add_count;
            ([add_count, sub_count] = H.randomizeList([add_count, sub_count]));
            
            return {
                add_count: add_count,
                subtract_count: sub_count,
                multiply_count: 0,
                divide_count: 0,
                exponent_count: 0,
                allow_parentheses: 'no',
                allow_nesting: 'no',
                allow_zero: 'no',
                multiply_symbol: ' \\times '
            };
        }
    },
    {
        title: 'Add Or Subtract (4-5 operations)',
        example_problem: '9-2+5+3-1',
        description: 'Expressions with 4-5 addition and subtraction operations.',
        get_settings: function() {
            const combined_count = H.randInt(4, 5);
            let add_count = H.randInt(1, combined_count);
            let sub_count = combined_count - add_count;
            ([add_count, sub_count] = H.randomizeList([add_count, sub_count]));
            
            return {
                add_count: add_count,
                subtract_count: sub_count,
                multiply_count: 0,
                divide_count: 0,
                exponent_count: 0,
                allow_parentheses: 'no',
                allow_nesting: 'no',
                allow_zero: 'no',
                multiply_symbol: ' \\times '
            };
        }
    },
    {
        title: 'Add Or Subtract (with parentheses)',
        example_problem: '10-(5+2)',
        description: 'Addition and subtraction expressions that may contain parentheses.',
        get_settings: function() {
            const combined_count = H.randInt(2, 4);
            let add_count = H.randInt(1, combined_count);
            let sub_count = combined_count - add_count;
            ([add_count, sub_count] = H.randomizeList([add_count, sub_count]));
            
            return {
                add_count: add_count,
                subtract_count: sub_count,
                multiply_count: 0,
                divide_count: 0,
                exponent_count: 0,
                allow_parentheses: 'yes',
                allow_nesting: 'no',
                allow_zero: 'no',
                multiply_symbol: ' \\times '
            };
        }
    },
    {
        title: 'Multiply Or Divide (2-3 operations)',
        example_problem: '2 \\times 4 \\div 8',
        description: 'Expressions with 2-3 multiplication and division operations.',
        get_settings: function() {
            const combined_count = H.randInt(2, 3);
            let mul_count = H.randInt(1, combined_count);
            let div_count = combined_count - mul_count;
            ([mul_count, div_count] = H.randomizeList([mul_count, div_count]));
            
            return {
                add_count: 0,
                subtract_count: 0,
                multiply_count: mul_count,
                divide_count: div_count,
                exponent_count: 0,
                allow_parentheses: 'no',
                allow_nesting: 'no',
                allow_zero: 'no',
                multiply_symbol: ' \\times '
            };
        }
    },
    {
        title: 'Multiply Or Divide (4-5 operations)',
        example_problem: '10 \\times 2 \\div 5 \\times 3 \\times 2',
        description: 'Expressions with 4-5 multiplication and division operations.',
        get_settings: function() {
            const combined_count = H.randInt(4, 5);
            let mul_count = H.randInt(1, combined_count);
            let div_count = combined_count - mul_count;
            ([mul_count, div_count] = H.randomizeList([mul_count, div_count]));
            
            return {
                add_count: 0,
                subtract_count: 0,
                multiply_count: mul_count,
                divide_count: div_count,
                exponent_count: 0,
                allow_parentheses: 'no',
                allow_nesting: 'no',
                allow_zero: 'no',
                multiply_symbol: ' \\times '
            };
        }
    },
    {
        title: 'Multiply Or Divide (with parentheses)',
        example_problem: '18 \\div (6 \\times 3)',
        description: 'Multiplication and division expressions that may contain parentheses.',
        get_settings: function() {
            const combined_count = H.randInt(2, 4);
            let mul_count = H.randInt(1, combined_count);
            let div_count = combined_count - mul_count;
            ([mul_count, div_count] = H.randomizeList([mul_count, div_count]));
            
            return {
                add_count: 0,
                subtract_count: 0,
                multiply_count: mul_count,
                divide_count: div_count,
                exponent_count: 0,
                allow_parentheses: 'yes',
                allow_nesting: 'no',
                allow_zero: 'no',
                multiply_symbol: ' \\times '
            };
        }
    },
    {
        title: 'All Except Exponents (2-3 operations)',
        example_problem: '1 + 9 \\div 3',
        description: 'Expressions with 2-3 addition, subtraction, multiplication, or division operations.',
        get_settings: function() {
            const asmd = [0,0,0,0];
            const operator_count = H.randInt(2, 3);
            for (let i = 0; i < operator_count; i++) {
                asmd[H.randInt(0, 3)]++;
            }
            
            return {
                add_count: asmd[0],
                subtract_count: asmd[1],
                multiply_count: asmd[2],
                divide_count: asmd[3],
                exponent_count: 0,
                allow_parentheses: 'yes',
                allow_nesting: 'no',
                allow_zero: 'no',
                multiply_symbol: ' \\times '
            };
        }
    },
    {
        title: 'All Except Exponents (4-5 operations)',
        example_problem: '8 \\times 7 \\div 4 + 3 - 1',
        description: 'Expressions with 4-5 addition, subtraction, multiplication, or division operations.',
        get_settings: function() {
            const asmd = [0,0,0,0];
            const operator_count = H.randInt(4, 5);
            for (let i = 0; i < operator_count; i++) {
                asmd[H.randInt(0, 3)]++;
            }
            
            return {
                add_count: asmd[0],
                subtract_count: asmd[1],
                multiply_count: asmd[2],
                divide_count: asmd[3],
                exponent_count: 0,
                allow_parentheses: 'yes',
                allow_nesting: 'no',
                allow_zero: 'no',
                multiply_symbol: ' \\times '
            };
        }
    },
    {
        title: 'Exponents In Addition And Subtraction',
        example_problem: '3^{2}-7+1^{3}',
        description: 'Addition and subtraction expressions where terms have exponents',
        get_settings: function() {
            const combined_count = H.randInt(2, 3);
            let add_count = H.randInt(1, combined_count);
            let sub_count = combined_count - add_count;
            ([add_count, sub_count] = H.randomizeList([add_count, sub_count]));
            const num_terms = combined_count + 1;
            
            return {
                add_count: add_count,
                subtract_count: sub_count,
                multiply_count: 0,
                divide_count: 0,
                exponent_count: H.randInt(1, num_terms - 1),
                allow_parentheses: 'no',
                allow_nesting: 'no',
                allow_zero: 'no',
                multiply_symbol: ' \\times '
            };
        }
    },
    {
        title: 'Exponents In Multiplication And Division',
        example_problem: '2^{3}\\times 5 \\div 3^{2}',
        description: 'Multiplication and division expressions where terms have exponents',
        get_settings: function() {
            const combined_count = H.randInt(2, 3);
            let mul_count = H.randInt(1, combined_count);
            let div_count = combined_count - mul_count;
            ([mul_count, div_count] = H.randomizeList([mul_count, div_count]));
            const num_terms = combined_count + 1;
            
            return {
                add_count: 0,
                subtract_count: 0,
                multiply_count: mul_count,
                divide_count: div_count,
                exponent_count: H.randInt(1, num_terms - 1),
                allow_parentheses: 'no',
                allow_nesting: 'no',
                allow_zero: 'no',
                multiply_symbol: ' \\times '
            };
        }
    },
    {
        title: 'All Operations (no parentheses)',
        example_problem: '5\\times4-2^3+6\\div6',
        description: 'Expressions with all EDMAS operations and no parentheses.',
        get_settings: function() {                
            return {
                add_count: 1,
                subtract_count: 1,
                multiply_count: 1,
                divide_count: 1,
                exponent_count: 1,
                allow_parentheses: 'no',
                allow_nesting: 'no',
                allow_zero: 'no',
                multiply_symbol: ' \\times '
            };
        }
    },
    {
        title: 'All Operations (parentheses allowed)',
        example_problem: '2^3\\div1\\times(6+8)-80',
        description: 'Expressions with all EDMAS operations (parentheses allowed)',
        get_settings: function() {                
            return {
                add_count: 1,
                subtract_count: 1,
                multiply_count: 1,
                divide_count: 1,
                exponent_count: 1,
                allow_parentheses: 'yes',
                allow_nesting: 'no',
                allow_zero: 'no',
                multiply_symbol: ' \\times '
            };
        }
    },
    {
        title: 'All Operations (nested parentheses allowed)',
        example_problem: '81\\div((2^3+1)\\times(5-2))',
        description: 'Expressions with all EDMAS operations (nested parentheses allowed)',
        get_settings: function() {                
            return {
                add_count: 1,
                subtract_count: 1,
                multiply_count: 1,
                divide_count: 1,
                exponent_count: 1,
                allow_parentheses: 'yes',
                allow_nesting: 'yes',
                allow_zero: 'no',
                multiply_symbol: ' \\times '
            };
        }
    },
    {
        title: 'Zero In Operations',
        example_problem: '6-3^2\\div(2\\times0+9)',
        description: 'Expressions that may involve operations with 0.',
        get_settings: function() {                
            return {
                add_count: 1,
                subtract_count: 1,
                multiply_count: 1,
                divide_count: 1,
                exponent_count: 1,
                allow_parentheses: 'yes',
                allow_nesting: 'no',
                allow_zero: 'yes',
                multiply_symbol: ' \\times '
            };
        }
    },
    {
        title: 'Negative Numbers In Operations',
        example_problem: '(-8)+((-2)^2-3)',
        description: 'Expressions that may involve operations with negative numbers.',
        get_settings: function() {                
            const asmde = [1,1,1,1,1];
            const non_reduced_ops = [0,1,2,3,4];
            for (let i = 0; i < 2; i++) {
                const chosen_op_index = non_reduced_ops.splice(H.randInt(0, non_reduced_ops.length - 1), 1)[0]
                asmde[chosen_op_index]--;
            }
            
            return {
                add_count: asmde[0],
                subtract_count: asmde[1],
                multiply_count: asmde[2],
                divide_count: asmde[3],
                exponent_count: asmde[4],
                allow_parentheses: 'yes',
                allow_nesting: 'no',
                allow_zero: 'no',
                allow_negatives: 'yes',
                multiply_symbol: ' \\times '
            };
        }
    },
    {
        title: 'Challenge Problems (no negatives)',
        example_problem: '(2^3\\div(5-3))\\times4^2\\div16+4',
        description: 'Unrestricted expressions with 6-7 operations (no negative numbers allowed).',
        get_settings: function() {                
            const asmde = [1,1,1,1,1];
            for (let i = 0; i < 2; i++) {
                asmde[H.randInt(0, 4)]++;
            }
            
            return {
                add_count: asmde[0],
                subtract_count: asmde[1],
                multiply_count: asmde[2],
                divide_count: asmde[3],
                exponent_count: asmde[4],
                allow_parentheses: 'yes',
                allow_nesting: 'yes',
                allow_zero: 'yes',
                allow_negatives: 'no',
                multiply_symbol: ' \\times '
            };
        }
    },
    {
        title: 'Challenge Problems (general)',
        example_problem: '0\\div2\\times(2^2\\times(-2))+4^2-3',
        description: 'Unrestricted expressions with 6-7 operations.',
        get_settings: function() {                
            const asmde = [1,1,1,1,1];
            for (let i = 0; i < 2; i++) {
                asmde[H.randInt(0, 4)]++;
            }
            
            return {
                add_count: asmde[0],
                subtract_count: asmde[1],
                multiply_count: asmde[2],
                divide_count: asmde[3],
                exponent_count: asmde[4],
                allow_parentheses: 'yes',
                allow_nesting: 'yes',
                allow_zero: 'yes',
                allow_negatives: 'yes',
                multiply_symbol: ' \\times '
            };
        }
    },
]