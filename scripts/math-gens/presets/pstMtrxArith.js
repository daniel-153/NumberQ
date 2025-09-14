import * as H from '../helpers/gen-helpers.js';

export default [
    {
        title: 'Add And Subtract 2&times;2 (no scalars)',
        example_problem: '\\begin{bmatrix} 2&3\\\\3&4 \\end{bmatrix} + \\begin{bmatrix} 2&5\\\\5&2 \\end{bmatrix}',
        description: 'Add and subtract 2 by 2 matrices without scalars.',
        get_settings: function() {    
            return {
                matrix_A_rows: 2,
                matrix_A_cols: 2,
                matrix_B_rows: 2,
                matrix_B_cols: 2,
                matrix_operation: H.randFromList(['add', 'sub']),
                mtrx_entry_range_min: -9,
                mtrx_entry_range_max: 9,
                allow_matrix_scalars: 'no'
            };
        }
    },
    {
        title: 'Add And Subtract 2&times;2 (with scalars)',
        example_problem: '3 \\begin{bmatrix} 5&5\\\\4&2 \\end{bmatrix} +4 \\begin{bmatrix} 2&4\\\\3&3 \\end{bmatrix}',
        description: 'Add and subtract 2 by 2 matrices with scalars.',
        get_settings: function() {    
            return {
                matrix_A_rows: 2,
                matrix_A_cols: 2,
                matrix_B_rows: 2,
                matrix_B_cols: 2,
                matrix_operation: H.randFromList(['add', 'sub']),
                mtrx_entry_range_min: -5,
                mtrx_entry_range_max: 5,
                allow_matrix_scalars: 'yes'
            };
        }
    },
    {
        title: 'Add And Subtract 3&times;3 (no scalars)',
        example_problem: '\\begin{bmatrix} 3&1&6\\\\2&4&4\\\\3&2&4 \\end{bmatrix} - \\begin{bmatrix} 2&1&4\\\\4&3&5\\\\2&5&2 \\end{bmatrix}',
        description: 'Add and subtract 3 by 3 matrices without scalars.',
        get_settings: function() {    
            return {
                matrix_A_rows: 3,
                matrix_A_cols: 3,
                matrix_B_rows: 3,
                matrix_B_cols: 3,
                matrix_operation: H.randFromList(['add', 'sub']),
                mtrx_entry_range_min: -9,
                mtrx_entry_range_max: 9,
                allow_matrix_scalars: 'no'
            };
        }
    },
    {
        title: 'Add And Subtract 3&times;3 (with scalars)',
        example_problem: '5 \\begin{bmatrix} 2&3&2\\\\2&4&5\\\\4&5&1 \\end{bmatrix} +4 \\begin{bmatrix} 5&5&2\\\\3&2&4\\\\3&1&3 \\end{bmatrix}',
        description: 'Add and subtract 3 by 3 matrices with scalars.',
        get_settings: function() {    
            return {
                matrix_A_rows: 3,
                matrix_A_cols: 3,
                matrix_B_rows: 3,
                matrix_B_cols: 3,
                matrix_operation: H.randFromList(['add', 'sub']),
                mtrx_entry_range_min: -5,
                mtrx_entry_range_max: 5,
                allow_matrix_scalars: 'yes'
            };
        }
    },
    {
        title: 'Add And Subtract (non-square matrices)',
        example_problem: '5 \\begin{bmatrix} 3&1\\\\3&3\\\\3&3 \\end{bmatrix} +3 \\begin{bmatrix} 5&1\\\\4&1\\\\5&1 \\end{bmatrix}',
        description: 'Add and subtract with random non-square matrices.',
        get_settings: function() {    
            let rows, cols;
            if (H.randInt(0, 1)) {
                rows = H.randInt(2, 3) - Number((Math.random() > 0.5));
                cols = H.randIntExcept(2, 3, rows);
            }
            else {
                cols = H.randInt(2, 3) - Number((Math.random() > 0.5));
                rows = H.randIntExcept(2, 3, cols);
            }
            
            return {
                matrix_A_rows: rows,
                matrix_A_cols: cols,
                matrix_B_rows: rows,
                matrix_B_cols: cols,
                matrix_operation: H.randFromList(['add', 'sub']),
                mtrx_entry_range_min: -5,
                mtrx_entry_range_max: 5
            };
        }
    },
    {
        title: 'Add And Subtract (general)',
        example_problem: `
            \\begin{array}{c}
            A_{r,c}\\pm B_{r,c}\\\\
            ~~r=?,\\;c=?~~
            \\end{array}
        `,
        description: 'Add and subtract two matrices with random dimensions.',
        get_settings: function() {    
            let rows = H.randInt(1, 3);
            let cols = H.randInt(1, 3);

            if (rows === 1 && cols === 1) (H.randInt(0, 1))? (rows  = H.randInt(2, 3)) : (cols = H.randInt(2, 3));
            
            return {
                matrix_A_rows: rows,
                matrix_A_cols: cols,
                matrix_B_rows: rows,
                matrix_B_cols: cols,
                matrix_operation: H.randFromList(['add', 'sub']),
                mtrx_entry_range_min: -5,
                mtrx_entry_range_max: 5
            };
        }
    },
    {
        title: 'Multiply (2&times;2 by 2D vector)',
        example_problem: '~~\\begin{bmatrix} 2&4\\\\3&2 \\end{bmatrix} \\begin{bmatrix} 5\\\\3 \\end{bmatrix}~~',
        description: 'Find the product of a 2 by 2 matrix and a 2D column vector.',
        get_settings: function() {    
            return {
                matrix_A_rows: 2,
                matrix_A_cols: 2,
                matrix_B_rows: 2,
                matrix_B_cols: 1,
                matrix_operation: 'mul',
                mtrx_entry_range_min: -5,
                mtrx_entry_range_max: 5
            };
        }
    },
    {
        title: 'Multiply 2&times;2',
        example_problem: '\\begin{bmatrix} 1&2\\\\3&0 \\end{bmatrix} \\begin{bmatrix} 3&2\\\\2&3 \\end{bmatrix}',
        description: 'Find the product of two 2 by 2 matrices.',
        get_settings: function() {    
            return {
                matrix_A_rows: 2,
                matrix_A_cols: 2,
                matrix_B_rows: 2,
                matrix_B_cols: 2,
                matrix_operation: 'mul',
                mtrx_entry_range_min: -5,
                mtrx_entry_range_max: 5
            };
        }
    },
    {
        title: 'Multiply (3&times;3 by 3D vector)',
        example_problem: '~~\\begin{bmatrix} 2&1&2\\\\4&4&5\\\\3&5&3 \\end{bmatrix} \\begin{bmatrix} 3\\\\5\\\\5 \\end{bmatrix}~~',
        description: 'Find the product of a 3 by 3 matrix and a 3D column vector.',
        get_settings: function() {    
            return {
                matrix_A_rows: 3,
                matrix_A_cols: 3,
                matrix_B_rows: 3,
                matrix_B_cols: 1,
                matrix_operation: 'mul',
                mtrx_entry_range_min: -5,
                mtrx_entry_range_max: 5
            };
        }
    },
    {
        title: 'Multiply 3&times;3',
        example_problem: '\\begin{bmatrix} 5&3&5\\\\1&4&1\\\\1&4&5 \\end{bmatrix} \\begin{bmatrix} 4&3&4\\\\4&5&2\\\\4&3&1 \\end{bmatrix}',
        description: 'Find the product of two 3 by 3 matrices.',
        get_settings: function() {    
            return {
                matrix_A_rows: 3,
                matrix_A_cols: 3,
                matrix_B_rows: 3,
                matrix_B_cols: 3,
                matrix_operation: 'mul',
                mtrx_entry_range_min: -5,
                mtrx_entry_range_max: 5
            };
        }
    },
    {
        title: 'Multiply (row and column vector)',
        example_problem: '~~~~\\begin{bmatrix} 4&5&5 \\end{bmatrix} \\begin{bmatrix} 0\\\\2\\\\1 \\end{bmatrix}~~~~',
        description: 'Multiply a random row vector by a random column vector (or vice versa).',
        get_settings: function() {    
            let rows_A, cols_A, rows_B, cols_B;
            if (H.randInt(0, 1)) {
                cols_A = rows_B = 1;
                rows_A = H.randInt(2, 3);
                cols_B = H.randInt(2, 3);
            }
            else {
                cols_A = rows_B = H.randInt(2, 3);
                rows_A = cols_B = 1;
            }
            
            return {
                matrix_A_rows: rows_A,
                matrix_A_cols: cols_A,
                matrix_B_rows: rows_B,
                matrix_B_cols: cols_B,
                matrix_operation: 'mul',
                mtrx_entry_range_min: -5,
                mtrx_entry_range_max: 5
            };
        }
    },
    {
        title: 'Multiply (general)',
        example_problem: `
            \\begin{array}{c}
            A_{r,c}B_{r,c} \\\\
            ~~r=?,\\;c=?~~
            \\end{array}
        `,
        description: 'Find the product of two matrices with random dimensions.',
        get_settings: function() {    
            let rows_A, cols_A, rows_B, cols_B; 
            cols_A = rows_B = H.randInt(1, 3);
            if (cols_A === 1) {
                rows_A = H.randInt(2, 3);
                cols_B = H.randInt(2, 3);
            }
            else {
                rows_A = H.randInt(1, 3);
                cols_B = H.randInt(1, 3);
            }
            
            return {
                matrix_A_rows: rows_A,
                matrix_A_cols: cols_A,
                matrix_B_rows: rows_B,
                matrix_B_cols: cols_B,
                matrix_operation: 'mul',
                mtrx_entry_range_min: -5,
                mtrx_entry_range_max: 5
            };
        }
    },
]