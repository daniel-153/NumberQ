import * as H from '../helpers/gen-helpers.js';
import * as LAH from '../helpers/linalg-helpers.js';
import * as SH from '../helpers/settings-helpers.js';

export function validateSettings(form_obj, error_locations) {
    const validated_range = SH.val_restricted_range(
        form_obj.vec_entry_range_min,
        form_obj.vec_entry_range_max,
        -20,
        20,
        error_locations,
        'vec_entry_range_min',
        'vec_entry_range_max' 
    );
    form_obj.vec_entry_range_min = validated_range.input_min;
    form_obj.vec_entry_range_max = validated_range.input_max;

    form_obj.vector_dimension = SH.val_restricted_integer(form_obj.vector_dimension, error_locations, 2, 10, 'vector_dimension');

    // if the operation is cross-product, make sure the dimension is 3
    if (form_obj.vector_operation === 'cross' && form_obj.vector_dimension !== 3) {
        form_obj.vector_dimension = 3;
        error_locations.add('vector_dimension');
    }

    form_obj.decimal_places = SH.val_restricted_integer(form_obj.decimal_places, error_locations, 0, 4, 'decimal_places');
}

const VAH = { // genVecArith helpers
    operator_conversions: {
        "add": "+",
        "sub": "-",
        "dot": "\\cdot",
        "cross": "\\times"
    },
    isZeroVector: function(array) {
        for (let i = 0; i < array.length; i++) {
            if (array[i] !== 0) return false;
        }

        return true;
    },
    randScalar: function(restriction) { //hardcoded => 2,3,4, or 5
        if (restriction === 'non-negative') {
            return H.randInt(2, 5); // excluding 1 (since a scalar of 1 is unecessary)
        }
        else {
            return H.randFromList(H.removeFromArray([0, 1], H.integerArray(-5, 5)));
        }
    },
    buildValidRandFunc: function(min, max) {
        return (function() {
            return H.randInt(min, max);
        });
    },
    createVector: function(dimension) {
        const output_vector = [];

        for (let i = 0; i < dimension; i++) {
            output_vector.push(this.randVectorEntry());
        }

        return output_vector;
    }
}
export default function genVecArith(settings) {
    // create the function to get random values into the vector entries (based on the settings)
    VAH.randVectorEntry = VAH.buildValidRandFunc(settings.vec_entry_range_min, settings.vec_entry_range_max);

    // get new round function based on settings
    const round = H.buildNewRounder(settings.decimal_places, settings.keep_rounded_zeros);

    // create the random vectors in the given dimension
    const vector_1 = VAH.createVector(settings.vector_dimension);
    const vector_2 = VAH.createVector(settings.vector_dimension);
    const vector_1_string = LAH.js_to_tex.arrayToVector(vector_1, settings.vector_notation);
    const vector_2_string = LAH.js_to_tex.arrayToVector(vector_2, settings.vector_notation);

    // scalars and their strings (based on the operation)
    let scalar_1, scalar_2, scalar_1_string, scalar_2_string;
    if (settings.allow_scalars === 'yes' && settings.vector_operation === 'add' || settings.vector_operation === 'sub') { // scalars only applicable in add or sub
        scalar_1 = VAH.randScalar();
        scalar_2 = VAH.randScalar('non-negative');

        scalar_2_string = scalar_2 + ''; // a pos int, so no math handling needed

        // need to handle the '-1' case
        scalar_1_string = scalar_1 + '';
        if (scalar_1_string === '-1') scalar_1_string = '-';
    }
    else {
        scalar_1 = 1;
        scalar_2 = 1;

        scalar_1_string = '';
        scalar_2_string = '';
    }

    // perform the required operation
    let final_prompt, final_answer;
    if (settings.vector_operation !== 'angle') { // everything but 'angle'
        final_prompt = scalar_1_string + vector_1_string + VAH.operator_conversions[settings.vector_operation] + scalar_2_string + vector_2_string;
        
        if (settings.vector_operation !== 'dot') { // everything but 'dot' 
            final_answer = LAH.js_to_tex.arrayToVector(
                LAH.vector_operations[settings.vector_operation](
                    LAH.vector_operations.scale(scalar_1, vector_1), LAH.vector_operations.scale(scalar_2, vector_2)
                ), settings.vector_notation
            );
        }
        else { // 'dot' needs special handling because it is the only operation that goes from vectors => scalar
            final_answer = '' + LAH.vector_operations.dot(
                LAH.vector_operations.scale(scalar_1, vector_1), LAH.vector_operations.scale(scalar_2, vector_2)
            ); // no chance of scalars here, but writing it this way for future flexibility
        }
    }
    else { // 'angle' needs special handling because it isn't just (u {operator} v)
        const angle_symbol = (settings.angle_unit === 'degrees')? '^\\circ' : '';
        const angle_subscript = (settings.angle_unit === 'degrees')? 'deg' : 'rad';
        const result = LAH.vector_operations.angle(
            LAH.vector_operations.scale(scalar_1, vector_1), 
            LAH.vector_operations.scale(scalar_2, vector_2),
            settings.angle_unit
        );

        final_prompt = `\\theta_{\\scriptscriptstyle\\mathrm{${angle_subscript}}}\\left(` + scalar_1_string + vector_1_string + ',' + scalar_2_string + vector_2_string + '\\right)';
        if (result === 'undefined') { // need this branch to handle the case where the angle is undefined
            final_answer = `\\theta_{\\scriptscriptstyle\\mathrm{${angle_subscript}}}\\mathrm{~~is~~undefined}`;
        }
        else {
            const rounded_result = round(result);
            const equal_sign = (result === Number(rounded_result))? '=' : '\\approx';

            final_answer = `\\theta_{\\scriptscriptstyle\\mathrm{${angle_subscript}}}${equal_sign}` + round(result) + angle_symbol;
        }
    }

    return {
        question: final_prompt,
        answer: final_answer
    }
}

export const settings_fields = [
    'vector_dimension',
    'vector_operation',
    'vector_notation',
    'entry_range',
    'allow_scalars',
    'angle_unit',
    'rounding_rules'
];

export const prelocked_settings = [
    'vector_notation',
    'angle_unit',
    'decimal_places'
];

export const presets = {
    default: function() {
        return {
            vec_entry_range_min: -5,
            vec_entry_range_max: 5,
            vector_dimension: 2,
            vector_operation: 'add',
            vector_notation: 'brackets',
            allow_scalars: 'yes',
            angle_unit: 'radians',
            decimal_places: 3
        };
    },
    random: function() {
        const operation = H.randFromList(['add','sub','dot','cross','angle']);
    
        return {
            vec_entry_range_min: H.randInt(-5, 0),
            vec_entry_range_max: H.randInt(1, 5),
            vector_dimension: (operation === 'cross')? 3 : H.randInt(2, 4),
            vector_operation: operation,
            vector_notation: '__random__',
            allow_scalars: '__random__',
            angle_unit: '__random__'
        };
    }
};

export const size_adjustments = {
    width: 1.1,
    height: 2,
};