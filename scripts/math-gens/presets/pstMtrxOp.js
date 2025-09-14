import * as H from '../helpers/gen-helpers.js';

export default [
    {
        title: '2&times;2 Determinant',
        example_problem: '\\operatorname{det}\\left( \\begin{bmatrix} 3&5\\\\4&1 \\end{bmatrix} \\right)',
        description: 'Find the determinant of a 2 by 2 matrix.',
        get_settings: function() {    
            return {
                matrix_rows: 2,
                matrix_cols: 2,
                mtrx_entry_range_min: -5,
                mtrx_entry_range_max: 5,
                single_matrix_operation: 'det'
            };
        }
    },
    {
        title: '3&times;3 Determinant',
        example_problem: '\\operatorname{det}\\left( \\begin{bmatrix} 4&1&1\\\\3&4&1\\\\2&1&0 \\end{bmatrix} \\right)',
        description: 'Find the determinant of a 3 by 3 matrix.',
        get_settings: function() {    
            return {
                matrix_rows: 3,
                matrix_cols: 3,
                mtrx_entry_range_min: -4,
                mtrx_entry_range_max: 4,
                single_matrix_operation: 'det'
            };
        }
    },
    {
        title: 'Determinant Of A Square Zero Matrix',
        example_problem: '\\operatorname{det}\\left( \\begin{bmatrix} 0&0\\\\0&0 \\end{bmatrix} \\right)=0',
        description: 'Recognize that the determinant of a square zero matrix is zero.',
        get_settings: function() {    
            const dimension = H.randInt(2, 4);
            
            return {
                matrix_rows: dimension,
                matrix_cols: dimension,
                mtrx_entry_range_min: 0,
                mtrx_entry_range_max: 0,
                single_matrix_operation: 'det'
            };
        }
    },
    {
        title: '2&times;2 Inverse',
        example_problem: '~~\\begin{bmatrix} 2&2\\\\5&1 \\end{bmatrix} ^{-1}~',
        description: 'Find the inverse of a 2 by 2 matrix.',
        get_settings: function() {    
            return {
                matrix_rows: 2,
                matrix_cols: 2,
                mtrx_entry_range_min: -5,
                mtrx_entry_range_max: 5,
                single_matrix_operation: 'inverse'
            };
        }
    },
    {
        title: '3&times;3 Inverse',
        example_problem: '~\\begin{bmatrix} 1&2&2\\\\2&3&2\\\\1&4&4 \\end{bmatrix} ^{-1}',
        description: 'Find the inverse of a 3 by 3 matrix.',
        get_settings: function() {    
            return {
                matrix_rows: 3,
                matrix_cols: 3,
                mtrx_entry_range_min: -4,
                mtrx_entry_range_max: 4,
                single_matrix_operation: 'inverse'
            };
        }
    },
    {
        title: 'Inverse Of A Square Zero Matrix (no inverse)',
        example_problem: '\\begin{bmatrix} 0&0\\\\0&0 \\end{bmatrix} ^{-1} \\rightarrow \\mathrm{no~inverse}',
        description: 'Recognize that a square zero matrix does not have an inverse.',
        get_settings: function() {    
            const dimension = H.randInt(2, 4);
            
            return {
                matrix_rows: dimension,
                matrix_cols: dimension,
                mtrx_entry_range_min: 0,
                mtrx_entry_range_max: 0,
                single_matrix_operation: 'inverse'
            };
        }
    },
    {
        title: 'Transpose Of Square Matrices',
        example_problem: '~~\\begin{bmatrix} 4&2\\\\5&6 \\end{bmatrix} ^{T}~',
        description: 'Find the transpose of square matrices.',
        get_settings: function() {    
            const dimension = H.randInt(2, 4);
            
            return {
                matrix_rows: dimension,
                matrix_cols: dimension,
                mtrx_entry_range_min: 0,
                mtrx_entry_range_max: 9,
                single_matrix_operation: 'transpose'
            };
        }
    },
    {
        title: 'Transpose Of Non-Square Matrices',
        example_problem: '\\begin{bmatrix} 9&0&3\\\\9&7&2 \\end{bmatrix} ^{T}',
        description: 'Find the transpose of non-square matrices.',
        get_settings: function() {    
            let rows, cols;
            if (H.randInt(0, 1)) {
                rows = H.randInt(2, 4) - Number((Math.random() > 0.5));
                cols = H.randIntExcept(2, 4, rows);
            }
            else {
                cols = H.randInt(2, 4) - Number((Math.random() > 0.5));
                rows = H.randIntExcept(2, 4, cols);
            }

            return {
                matrix_rows: rows,
                matrix_cols: cols,
                mtrx_entry_range_min: 0,
                mtrx_entry_range_max: 9,
                single_matrix_operation: 'transpose'
            };
        }
    },
    {
        title: '2&times;3 RREF',
        example_problem: '\\operatorname{rref}\\left( \\begin{bmatrix} 2&2&1\\\\0&3&5 \\end{bmatrix} \\right)',
        description: 'Find the RREF of a 2 by 3 matrix.',
        get_settings: function() {    
            return {
                matrix_rows: 2,
                matrix_cols: 3,
                mtrx_entry_range_min: -5,
                mtrx_entry_range_max: 5,
                single_matrix_operation: 'rref'
            };
        }
    },
    {
        title: '3&times;4 RREF',
        example_problem: '\\operatorname{rref}\\left( \\begin{bmatrix} 3&2&4&1\\\\3&2&0&3\\\\1&4&2&0 \\end{bmatrix} \\right)',
        description: 'Find the RREF of a 3 by 4 matrix.',
        get_settings: function() {    
            return {
                matrix_rows: 3,
                matrix_cols: 4,
                mtrx_entry_range_min: -4,
                mtrx_entry_range_max: 4,
                single_matrix_operation: 'rref'
            };
        }
    },
    {
        title: 'RREF (general)',
        example_problem: '\\operatorname{rref}\\left( M_{\\scriptscriptstyle{?,?}} \\right)',
        description: 'Find the RREF of matrices with random dimensions.',
        get_settings: function() {                    
            return {
                matrix_rows: H.randInt(2, 4),
                matrix_cols: H.randInt(2, 4),
                mtrx_entry_range_min: -5,
                mtrx_entry_range_max: 5,
                single_matrix_operation: 'rref'
            };
        }
    },
    {
        title: 'RREF Of Square Matrices',
        example_problem: '\\operatorname{rref}\\left( \\begin{bmatrix} 4&3\\\\5&4 \\end{bmatrix} \\right)',
        description: 'Find the RREF of a square matrix.',
        get_settings: function() {    
            const dimension = H.randInt(2, 4);
            
            return {
                matrix_rows: dimension,
                matrix_cols: dimension,
                mtrx_entry_range_min: -5,
                mtrx_entry_range_max: 5,
                single_matrix_operation: 'rref'
            };
        }
    },
    {
        title: 'RREF Of Zero Matrices',
        example_problem: '\\operatorname{rref}\\left( \\begin{bmatrix} 0&0\\\\0&0 \\end{bmatrix} \\right) \\Rightarrow \\begin{bmatrix} 0&0\\\\0&0 \\end{bmatrix}',
        description: 'Recognize that the RREF of a zero matrix is the matrix itself.',
        get_settings: function() {    
            return {
                matrix_rows: H.randInt(2, 4),
                matrix_cols: H.randInt(2, 4),
                mtrx_entry_range_min: 0,
                mtrx_entry_range_max: 0,
                single_matrix_operation: 'rref'
            };
        }
    }
]