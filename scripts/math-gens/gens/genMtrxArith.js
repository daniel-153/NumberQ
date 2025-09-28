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
    if ((settings.allow_matrix_scalars === 'yes') && (settings.matrix_operation === 'add' || settings.matrix_operation === 'sub')) { // scalars only applicable in add or sub
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
    has_topic_presets: true
};

export const size_adjustments = {
    width: 1.2,
    height: 2,
    present: {
        canvas: {
            max_height: 0.2
        },
        preview: {
            max_height: 0.2,
            max_width: 0.6
        },
        answer: {
            max_size_scale: 2.5
        }
    }
};