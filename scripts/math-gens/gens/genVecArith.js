import * as H from '../helpers/gen-helpers.js';
import * as SH from '../helpers/settings-helpers.js';

export function processFormObj(form_obj, error_locations) {
    const validated_range = SH.val_restricted_range(
        form_obj.vec_entry_range_min,
        form_obj.vec_entry_range_max,
        -999,
        999,
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
}

const VAH = { // genVecArith helpers
    operator_conversions: {
        "add": "+",
        "sub": "-",
        "dot": "\\cdot",
        "cross": "\\times"
    },
    round: function(number, places = 0, remove_trailing_zeros = true) {
        const is_negative = String(number).charAt(0) === '-';
        if (is_negative && typeof(number) === 'number') number = -number;
        else if (is_negative && typeof(number) === 'string') number = number.slice(1);
        
        let number_as_string = number.toString();
        if (!number_as_string.includes('.')) return number; // no decimal places at all
        else if (places === 0) return Math.round(number); // no need for extra logic

        let [before_decimal, after_decimal] = number_as_string.split('.');

        // get an array representing the number
        const decimal_place_array = Array.from(after_decimal).map(numerical_char => Number(numerical_char)).slice(0, places);
        const integer_place_array = Array.from(before_decimal).map(numerical_char => Number(numerical_char));
        const number_as_array = [...integer_place_array, '.', ...decimal_place_array];

        // rounding step (if needed)
        let first_cut_place = Number(after_decimal.charAt(places)); // the first number outside the provided limit (like 4 in 1.234 rounded to 2 places)
        let carry_a_one = (first_cut_place >= 5); // number we are carrying back to the previous place 

        for (let i = number_as_array.length - 1; i >= 0; i--) {
            if (!carry_a_one) break;
            if (number_as_array[i] === '.') continue;
            number_as_array[i]++;
            carry_a_one = false;

            if (number_as_array[i] === 10) {
                carry_a_one = true;
                number_as_array[i] = 0;
            }
        }
        if (carry_a_one) { // the very first integer place got bumped up to a 10 -> 0 (need to add a 1 up front)
            number_as_array.unshift(1);
        }

        const rounded_result = ((is_negative)? '-' : '') + number_as_array.join('');

        if (remove_trailing_zeros) return Number(rounded_result); // Number() removes trailing zeros
        else return rounded_result;
    },
    isZeroVector: function(array) {
        for (let i = 0; i < array.length; i++) {
            if (array[i] !== 0) return false;
        }

        return true;
    },
    vector_operations: {
        add: function(array_1, array_2) {
            const result = [];

            for (let i = 0; i < array_1.length; i++) {
                result[i] = array_1[i] + array_2[i];
            }

            return result;
        },
        sub: function(array_1, array_2) {
            const result = [];

            for (let i = 0; i < array_1.length; i++) {
                result[i] = array_1[i] - array_2[i];
            }

            return result;
        },
        dot: function(array_1, array_2) {
            let result = 0;

            for (let i = 0; i < array_1.length; i++) {
                result += array_1[i] * array_2[i];
            }

            return result;
        },
        cross: function(array_1, array_2) {
            if (array_1.length !== 3 || array_2.length !== 3) {
                console.error('Cross product is only applicable to two vectors in R3. One or both vectors pased was not of length 3.');
                return;
            }

            return [
                array_1[1]*array_2[2] - array_1[2]*array_2[1],
                array_1[2]*array_2[0] - array_1[0]*array_2[2],
                array_1[0]*array_2[1] - array_1[1]*array_2[0]
            ];
        },
        scale: function(scalar, array) {
            const result = [];
            
            for (let i = 0; i < array.length; i++) {
                result[i] = array[i] * scalar;
            }

            return result;
        },
        magnitude: function(array) {
            let sum_squares = 0;

            for (let i = 0; i < array.length; i++) {
                sum_squares += array[i]**2;
            }

            return Math.sqrt(sum_squares);
        },
        sum_squared_entries: function(array) {  // [a, b, c, ...] => a^2 + b^2 + c^2 + ...
            let sum_of_squares = 0;

            for (let i = 0; i < array.length; i++) {
                sum_of_squares += array[i]**2;
            }

            return sum_of_squares;
        },
        angle: function(array_1, array_2, angular_unit = 'radians') {
            // if any zero vector is involved, the angle between is undefined (no need for additional processing)
            if (VAH.isZeroVector(array_1) || VAH.isZeroVector(array_2)) return 'undefined';
            
            const dot_prod_result = this.dot(array_1, array_2);
            const array_1_mag_squared = this.sum_squared_entries(array_1); // array_1's magnitude squared
            const array_2_mag_squared = this.sum_squared_entries(array_2);
            
            let result;
            if (array_1_mag_squared === dot_prod_result && array_2_mag_squared === dot_prod_result) { // acos arg is exactly 1
                result = 0;
            }
            else if (array_1_mag_squared === -dot_prod_result && array_2_mag_squared === -dot_prod_result) { // acos arg is exactly -1
                result = Math.PI;
            }
            else { // arg to acos is in (-1, 1) (not an edge case that is likely to cause a floating point error - by being outside acos's domain)
                result = Math.acos(this.dot(array_1, array_2) / (this.magnitude(array_1) * this.magnitude(array_2))); // radians by default
            }

            if (angular_unit === 'radians') return result;
            else if (angular_unit === 'degrees') return (result * 180) / Math.PI;
        }
    },
    ATV: { // arrayToVector functions
        brackets: function(array) {
            return '\\begin{bmatrix}' + array.join('\\\\') + '\\end{bmatrix}';
        },
        angle_brackets: function(array) {
            return '\\left\\langle' + array.join(',') + '\\right\\rangle';
        },
        parens: function(array) {
            return '\\left(\\begin{array}{c}' + array.join('\\\\') + '\\end{array}\\right)';
        }
    },
    arrayToVector: function(array, notation) {
        return this.ATV[notation](array);
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
export default async function genVecArith(settings) {
    // create the function to get random values into the vector entries (based on the settings)
    VAH.randVectorEntry = VAH.buildValidRandFunc(settings.vec_entry_range_min, settings.vec_entry_range_max);

    // create the random vectors in the given dimension
    const vector_1 = VAH.createVector(settings.vector_dimension);
    const vector_2 = VAH.createVector(settings.vector_dimension);
    const vector_1_string = VAH.arrayToVector(vector_1, settings.vector_notation);
    const vector_2_string = VAH.arrayToVector(vector_2, settings.vector_notation);

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
            final_answer = VAH.arrayToVector(
                VAH.vector_operations[settings.vector_operation](
                    VAH.vector_operations.scale(scalar_1, vector_1), VAH.vector_operations.scale(scalar_2, vector_2)
                ), settings.vector_notation
            );
        }
        else { // 'dot' needs special handling because it is the only operation that goes from vectors => scalar
            final_answer = '' + VAH.vector_operations.dot(
                VAH.vector_operations.scale(scalar_1, vector_1), VAH.vector_operations.scale(scalar_2, vector_2)
            ); // no chance of scalars here, but writing it this way for future flexibility
        }
    }
    else { // 'angle' needs special handling because it isn't just (u {operator} v)
        const angle_symbol = (settings.angle_unit === 'degrees')? '^\\circ' : '';
        const angle_subscript = (settings.angle_unit === 'degrees')? 'deg' : 'rad';
        const result = VAH.vector_operations.angle(
            VAH.vector_operations.scale(scalar_1, vector_1), 
            VAH.vector_operations.scale(scalar_2, vector_2),
            settings.angle_unit
        );

        final_prompt = `\\theta_{\\scriptscriptstyle\\mathrm{${angle_subscript}}}\\left(` + scalar_1_string + vector_1_string + ',' + scalar_2_string + vector_2_string + '\\right)';
        if (result === 'undefined') { // need this branch to handle the case where the angle is undefined
            final_answer = `\\theta_{\\scriptscriptstyle\\mathrm{${angle_subscript}}}\\mathrm{~~is~~undefined}`;
        }
        else {
            const rounded_result = VAH.round(result, 3);
            const equal_sign = (result === Number(rounded_result))? '=' : '\\approx';

            final_answer = `\\theta_{\\scriptscriptstyle\\mathrm{${angle_subscript}}}${equal_sign}` + VAH.round(result, 3) + angle_symbol;
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
    'angle_unit'
];

export const prelocked_settings = [
    'vector_notation',
    'angle_unit'
];

export function get_presets() {
    return {
        vec_entry_range_min: -5,
        vec_entry_range_max: 5,
        vector_dimension: 2,
        vector_operation: 'add',
        vector_notation: 'brackets',
        allow_scalars: 'yes',
        angle_unit: 'radians'
    };
}

export function get_rand_settings() {
    return {

    };
}