import { jsx } from 'react/jsx-runtime';
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
}

const VAH = { // genVecArith helpers
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
    add: function(array_1, array_2) {
        const result = [];

        for (let i = 0; i < array_1.length; i++) {
            result[i] = array_1[i] + array_2[i];
        }

        return result;
    },
    subtract: function(array_1, array_2) {
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
        result = [];
        
        for (let i = 0; i < array.length; i++) {
            result[i] *= array[i] * scalar;
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
    angle: function(array_1, array_2, angular_unit = 'radians') {
        const result = Math.acos(this.dot(array_1, array_2) / (this.magnitude(array_1) * this.magnitude(array_2))); // radians by default

        if (angular_unit === 'radians') return result;
        else if (angular_unit === 'degrees') return (result * 180) / Math.PI;
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
    }
}
export default async function genVecArith(settings) {
    
    
    return {
        question: final_prompt,
        answer: final_value
    }
}

export const settings_fields = [

];

export const prelocked_settings = [

];

export function get_presets() {
    return {

    };
}

export function get_rand_settings() {
    return {

    };
}