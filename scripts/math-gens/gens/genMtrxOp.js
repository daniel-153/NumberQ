import * as H from '../helpers/gen-helpers.js';
import * as LAH from '../helpers/linalg-helpers.js';
import * as SH from '../helpers/settings-helpers.js';
import * as PH from '../helpers/polynom-helpers.js';

export function validateSettings(form_obj, error_locations) {
    // ensure the matrix dimensions agree with the operation (are square if they need to be)
    const matrix_dimensions = [
        SH.val_restricted_integer(form_obj.matrix_rows, error_locations, 1, 6, 'matrix_rows'),
        SH.val_restricted_integer(form_obj.matrix_cols, error_locations, 1, 6, 'matrix_rows'),
    ];

    if ( // operation requires a square matrix (but the inputted matrix wasn't square)
        (form_obj.single_matrix_operation === 'det' ||
        form_obj.single_matrix_operation === 'inverse') &&
        matrix_dimensions[0] !== matrix_dimensions[1]
    ) { // force both dimensions to equal the min of the two
        const min_dimension = Math.min(...matrix_dimensions);
        matrix_dimensions[0] = min_dimension;
        matrix_dimensions[1] = min_dimension;
    }

    let index = 0;
    ['matrix_rows', 'matrix_cols'].forEach(textbox_name => {
        if (matrix_dimensions[index] + '' !== form_obj[textbox_name] + '') {
            form_obj[textbox_name] = matrix_dimensions[index];
            error_locations.add(textbox_name);
        }
        index++;
    });

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

    form_obj.decimal_places = SH.val_restricted_integer(form_obj.decimal_places, error_locations, 0, 4, 'decimal_places');

    // Handle an edge case (not an explicit error, but fields might need to change):
    if ( // clamp the range below [-3, 3] for inverses of 5x5's or greater (the entries can exceed max_safe_integers if the range is larger than [-3, 3])
        form_obj.single_matrix_operation === 'inverse' && // operation => inverse
        Number(form_obj.matrix_cols) >= 5 && Number(form_obj.matrix_rows) >=5 && // 5x5 or greater
        (Math.abs(form_obj.mtrx_entry_range_min) > 3 || Math.abs(form_obj.mtrx_entry_range_max) > 3) // numbers can get larger than 3 (in magnitude)
    ) {
        const clamped_range = SH.val_restricted_range(form_obj.mtrx_entry_range_min, Math.abs(form_obj.mtrx_entry_range_max), -3, 3, new Set());
        form_obj.mtrx_entry_range_min = clamped_range.input_min;
        form_obj.mtrx_entry_range_max = clamped_range.input_max;
    }
    else if ( // clamp the range below [-6,6] for a 5x6 rref (which is the largest number-producing rref + entries can exceed max safe integers)
        form_obj.single_matrix_operation === 'rref' && // operation => rref
        Number(form_obj.matrix_cols) === 6 && Number(form_obj.matrix_rows) === 5 && // 5x6 matrix
        (Math.abs(form_obj.mtrx_entry_range_min) > 6 || Math.abs(form_obj.mtrx_entry_range_max) > 6) // numbers can get larger than 6 (in magnitude)
    ) {
        const clamped_range = SH.val_restricted_range(form_obj.mtrx_entry_range_min, Math.abs(form_obj.mtrx_entry_range_max), -6, 6, new Set());
        form_obj.mtrx_entry_range_min = clamped_range.input_min;
        form_obj.mtrx_entry_range_max = clamped_range.input_max;
    }
}

const MOH = { // genMtrxOp helpers
    pairArrayToFrac: function(pair_array) { // [a,b] -> \\frac{a,b} (simplified) or k if a = kb (reduces to integer)
        return PH.simplifiedFracString(pair_array[0], pair_array[1], 'in_front');
    },
    pairArrayToDecimal: function(pair_array, rounder) { // [a,b] -> A.abdce (rounded) or k if a = kb (reduces to integer)
        const raw_result = pair_array[0] / pair_array[1];

        if (Number.isSafeInteger(raw_result)) return raw_result;
        else return rounder(raw_result);
    },
    fractionalizedToMath: function(matrix, settings) {
        let converter; // function doing the conversion to math
        if (settings.mtrx_op_answer_form === 'exact') {
            converter = function(pair_array) {
                return MOH.pairArrayToFrac(pair_array);
            }
        }
        else if (settings.mtrx_op_answer_form === 'decimals') {
            converter = function(pair_array) {
                return MOH.pairArrayToDecimal(pair_array, H.buildNewRounder(settings.decimal_places, settings.keep_rounded_zeros));
            }
        }

        return LAH.createMatrix(matrix.length, matrix[0].length,
            function(row, col) {
                return converter(matrix[row][col]);
            }
        )
    }
}
export default function genMtrxOp(settings) {
    // Build the rand supplier based on settings
    const randValueSupplier = function() {
        return H.randInt(settings.mtrx_entry_range_min, settings.mtrx_entry_range_max);
    }

    // prompt matrix with random entries and its string
    const prompt_matrix = LAH.createMatrix(settings.matrix_rows, settings.matrix_cols, randValueSupplier);
    const prompt_matrix_string = LAH.js_to_tex.arrayOfArraysToMatrix(prompt_matrix, settings.matrix_notation);

    let final_answer;
    if (settings.single_matrix_operation === 'det') {
        let det = LAH.matrix_operations.det(prompt_matrix);

        // prevent a '-0' answer (switch it to just '0')
        if (det === 0 && 1 / det === -Infinity) det = 0;

        final_answer = det;
    }
    else if (settings.single_matrix_operation === 'transpose') {
        const transpose_matrix = LAH.matrix_operations.transpose(prompt_matrix);

        final_answer = LAH.js_to_tex.arrayOfArraysToMatrix(transpose_matrix, settings.matrix_notation);
    }
    else if (
        settings.single_matrix_operation === 'rref' ||
        settings.single_matrix_operation === 'inverse'
    ) {
        // apply .rref or .inverse
        const result_matrix = LAH.matrix_operations[settings.single_matrix_operation](prompt_matrix); // returns a fractionalized matrix 

        if (result_matrix === 'undefined') {
            final_answer = '\\mathrm{no~~inverse}'
        }
        else {
            final_answer = LAH.js_to_tex.arrayOfArraysToMatrix(MOH.fractionalizedToMath(result_matrix, settings), settings.matrix_notation);
        }
    }

    let final_prompt;
    if (
        settings.single_matrix_operation === 'rref' ||
        settings.single_matrix_operation === 'det'
    ) {
        final_prompt = `\\operatorname{${settings.single_matrix_operation}}\\left(${prompt_matrix_string}\\right)`;
    }
    else if (settings.single_matrix_operation === 'inverse') {
        final_prompt = prompt_matrix_string + '^{-1}';
    }
    else if (settings.single_matrix_operation === 'transpose') {
        final_prompt = prompt_matrix_string + '^{T}';
    }

    return {
        question: final_prompt,
        answer: final_answer
    };
}

export const settings_fields = [
    'matrix_dimensions',
    'single_matrix_operation',
    'matrix_entry_range',
    'matrix_notation',
    'mtrx_op_answer_form',
    'rounding_rules'
];

export const prelocked_settings = [
    'mtrx_op_answer_form',
    'matrix_notation',
    'decimal_places'
];

export const presets = {
    default: function() {
        return {
            matrix_rows: 3,
            matrix_cols: 4,
            mtrx_entry_range_min: -5,
            mtrx_entry_range_max: 5,
            single_matrix_operation: 'rref',
            matrix_notation: 'brackets',
            mtrx_op_answer_form: 'exact',
            decimal_places: 1
        };
    },
    random: function() {
        const operation = H.randFromList(['rref','det','inverse','transpose']);
        let rows = H.randInt(2, 4);
        let cols;
        if (operation === 'rref') {
            cols = H.randIntExcept(rows + 1, 5, rows); // in rref, ensure cols > rows but still <= 5
        }
        else cols = H.randInt(2, 4);
        
        return {
            matrix_rows: rows,
            matrix_cols: cols,
            mtrx_entry_range_min: H.randInt(-5, 0),
            mtrx_entry_range_max: H.randInt(1, 5),
            single_matrix_operation: operation,
            matrix_notation: '__random__',
            mtrx_op_answer_form: '__random__'
        };
    },
    topic_presets: [
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
            example_problem: '\\operatorname{det}\\left( \\begin{bmatrix} 5&2&3\\\\3&2&2\\\\5&5&3 \\end{bmatrix} \\right)',
            description: 'Find the determinant of a 3 by 3 matrix.',
            get_settings: function() {    
                return {
                    matrix_rows: 3,
                    matrix_cols: 3,
                    mtrx_entry_range_min: -5,
                    mtrx_entry_range_max: 5,
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
            example_problem: '~\\begin{bmatrix} 1&2&2\\\\2&3&2\\\\5&4&4 \\end{bmatrix} ^{-1}',
            description: 'Find the inverse of a 3 by 3 matrix.',
            get_settings: function() {    
                return {
                    matrix_rows: 3,
                    matrix_cols: 3,
                    mtrx_entry_range_min: -5,
                    mtrx_entry_range_max: 5,
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
            example_problem: '\\operatorname{rref}\\left( \\begin{bmatrix} 2&3&2&2\\\\1&5&3&3\\\\1&1&5&2 \\end{bmatrix} \\right)',
            description: 'Find the RREF of a 3 by 4 matrix.',
            get_settings: function() {    
                return {
                    matrix_rows: 3,
                    matrix_cols: 4,
                    mtrx_entry_range_min: -5,
                    mtrx_entry_range_max: 5,
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
};

export const size_adjustments = {
    width: 1.12,
    height: 2,
};