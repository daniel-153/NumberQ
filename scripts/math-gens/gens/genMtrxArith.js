import * as H from '../helpers/gen-helpers.js';
import * as LAH from '../helpers/linalg-helpers.js';
import * as SH from '../helpers/settings-helpers.js';

export function validateSettings(form_obj, error_locations) {
    const validated_range = SH.val_restricted_range(
        form_obj.mtrx_entry_range_min,
        form_obj.mtrx_entry_range_max,
        -20,
        20,
        error_locations,
        'mtrx_entry_range_min',
        'mtrx_entry_range_max' 
    );
    form_obj.mtrx_entry_range_min = validated_range.input_min;
    form_obj.mtrx_entry_range_max = validated_range.input_max;

    const matrix_dimensions = []; // keep easier track of A and B's dimensions
    ['matrix_A_rows', 'matrix_A_cols', 'matrix_B_rows', 'matrix_B_cols'].forEach(textbox_name => { // first ensure they are all valid integers
        matrix_dimensions.push(SH.val_restricted_integer(form_obj[textbox_name], error_locations, 1, 10, textbox_name));
    });

    // ensure no 1x1's
    if (matrix_dimensions[0] === 1 && matrix_dimensions[1] === 1) matrix_dimensions[0] = 2;
    if (matrix_dimensions[2] === 1 && matrix_dimensions[3] === 1) matrix_dimensions[2] = 2; 

    // handle the special dimension requirements for [add and sub] and [mul]
    if (form_obj.matrix_operation === 'add' || form_obj.matrix_operation === 'sub') { // dimensions must be the same
        if (matrix_dimensions[0] !== matrix_dimensions[2] || matrix_dimensions[1] !== matrix_dimensions[3]) { // dimensions are different
            // force the dimensions of matrix B to equal those of matrix A
            matrix_dimensions[2] = matrix_dimensions[0];
            matrix_dimensions[3] = matrix_dimensions[1];
        }
    }
    else if (form_obj.matrix_operation === 'mul') { // C1 must = R2 (in A{R1,C1} * B{R2,C2})
        // force C1 to = R2
        if (matrix_dimensions[1] !== matrix_dimensions[2]) matrix_dimensions[2] = matrix_dimensions[1];

        // make sure that^ didn't just create a 1x1
        if (matrix_dimensions[2] === 1 && matrix_dimensions[3] === 1) matrix_dimensions[3] = 2;
    }
    
    // now use the validated values and log the error locations in the dimensions (any where the value is different in matrix_dimensions)
    let index = 0;
    ['matrix_A_rows', 'matrix_A_cols', 'matrix_B_rows', 'matrix_B_cols'].forEach(textbox_name => {
        if (form_obj[textbox_name] + '' !== matrix_dimensions[index] + '') {
            form_obj[textbox_name] = matrix_dimensions[index];
            error_locations.add(textbox_name); 
        }
        index++;
    });
}

const MAH = { // genMtrxArith helpers
    operation_conversions: {
        "add": "+",
        "sub": "-"
    },
    randScalar: function(restriction) { //hardcoded => (+/-) 2,3,4, or 5
        if (restriction === 'non-negative') {
            return H.randInt(2, 5); // excluding 1 (since a scalar of 1 is unecessary)
        }
        else {
            return H.randFromList(H.removeFromArray([0, 1], H.integerArray(-5, 5)));
        }
    }
}
export default function genMtrxArith(settings) {
    const randValueSupplier = function() {
        return H.randInt(settings.mtrx_entry_range_min, settings.mtrx_entry_range_max);
    }
    
    const matrix_A = LAH.createMatrix(settings.matrix_A_rows, settings.matrix_A_cols, randValueSupplier);
    const matrix_B = LAH.createMatrix(settings.matrix_B_rows, settings.matrix_B_cols, randValueSupplier);

    let scalar_A, scalar_B, scalar_A_string, scalar_B_string;
    if (settings.allow_matrix_scalars === 'yes' && settings.matrix_operation === 'add' || settings.matrix_operation === 'sub') { // scalars only applicable in add or sub
        scalar_A = MAH.randScalar();
        scalar_B = MAH.randScalar('non-negative');

        scalar_B_string = scalar_B + ''; // a pos int, so no math handling needed

        // need to handle the '-1' case
        scalar_A_string = scalar_A + '';
        if (scalar_A_string === '-1') scalar_A_string = '-';
    }
    else {
        scalar_A = 1;
        scalar_B = 1;

        scalar_A_string = '';
        scalar_B_string = '';
    }

    // perform the specified operation
    const result_matrix = LAH.matrix_operations[settings.matrix_operation](
        LAH.matrix_operations.scale(scalar_A, matrix_A), 
        LAH.matrix_operations.scale(scalar_B, matrix_B)
    );
    
    // conversion to math
    let operation_symbol;
    if (settings.matrix_operation === 'mul') operation_symbol = (settings.matrix_multiply_symbol === 'no_symbol')? '' : settings.matrix_multiply_symbol;
    else operation_symbol = MAH.operation_conversions[settings.matrix_operation];
    const final_prompt = scalar_A_string + LAH.js_to_tex.arrayOfArraysToMatrix(matrix_A, settings.matrix_notation) + operation_symbol + scalar_B_string + LAH.js_to_tex.arrayOfArraysToMatrix(matrix_B, settings.matrix_notation);
    const final_answer = LAH.js_to_tex.arrayOfArraysToMatrix(result_matrix, settings.matrix_notation);

    return {
        question: final_prompt,
        answer: final_answer
    };
}

export const settings_fields = [
    'matrix_A_dimensions',
    'matrix_B_dimensions',
    'matrix_operation',
    'matrix_entry_range',
    'allow_matrix_scalars',
    'matrix_multiply_symbol',
    'matrix_notation'
];

export const prelocked_settings = [
    'matrix_multiply_symbol',
    'matrix_notation'
];

export const presets = {
    default: function() {
        return {
            matrix_A_rows: 2,
            matrix_A_cols: 2,
            matrix_B_rows: 2,
            matrix_B_cols: 2,
            matrix_operation: 'add',
            mtrx_entry_range_min: -5,
            mtrx_entry_range_max: 5,
            allow_matrix_scalars: 'yes',
            matrix_multiply_symbol: 'no_symbol',
            matrix_notation: 'brackets'
        };
    },
    random: function() {
        const operation = H.randFromList(['add','sub','mul']);
        const dimensions = [];
        if (operation === 'add' || operation === 'sub') {
            if (H.randInt(0, 1) === 0) { // randomly pick A's dimensions, ensure they can't both = 1, and treat them equally
                dimensions[0] = H.randInt(1, 3);
                dimensions[1] = (dimensions[0] === 1)? H.randInt(2, 3) : H.randInt(1, 3);
            }
            else {
                dimensions[1] = H.randInt(1, 3);
                dimensions[0] = (dimensions[1] === 1)? H.randInt(2, 3) : H.randInt(1, 3);
            }

            // copy A's dimensions to B's dimensions
            dimensions[2] = dimensions[0];
            dimensions[3] = dimensions[1];
        }
        else if (operation === 'mul') {
            dimensions[1] = H.randInt(1, 3); // pick C1
            dimensions[2] = dimensions[1]; // copy into to R2

            // prevent 1x1's if needed
            if (dimensions[1] === 1) {
                dimensions[0] = H.randInt(2, 3);
                dimensions[3] = H.randInt(2, 3);
            }
            else {
                dimensions[0] = H.randInt(1, 3);
                dimensions[3] = H.randInt(1, 3);
            }
        }
        
        return {
            matrix_A_rows: dimensions[0],
            matrix_A_cols: dimensions[1],
            matrix_B_rows: dimensions[2],
            matrix_B_cols: dimensions[3],
            matrix_operation: operation,
            mtrx_entry_range_min: H.randInt(-5, 0),
            mtrx_entry_range_max: H.randInt(1, 5),
            allow_matrix_scalars: '__random__',
            matrix_multiply_symbol: '__random__',
            matrix_notation: '__random__'
        };
    },
    topic_presets: [
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
};

export const size_adjustments = {
    width: 1.2,
    height: 2,
};