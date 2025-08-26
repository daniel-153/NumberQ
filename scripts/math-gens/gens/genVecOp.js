import * as H from '../helpers/gen-helpers.js';
import * as LAH from '../helpers/linalg-helpers.js';
import * as SH from '../helpers/settings-helpers.js';
import * as PH from '../helpers/polynom-helpers.js';

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

    form_obj.decimal_places = SH.val_restricted_integer(form_obj.decimal_places, error_locations, 0, 4, 'decimal_places');
}

const VOH = { // genVecOp helpers
    resolveRootQuotient: function(numerator_int, denom_root_expr, settings) {
        // first check if the expression simplifies to an integer (in which case, no special handling is needed)
        const raw_denom = denom_root_expr.numberInFront * Math.sqrt(denom_root_expr.numberUnderRoot);
        const raw_value = numerator_int / raw_denom;

        if (Number.isSafeInteger(raw_value)) { // result is an integer (form doesn't matter)
            return raw_value + '';
        }
        else if (Number.isSafeInteger(raw_denom) && settings.vec_op_answer_form !== 'decimals') { // result is a fraction with no roots 
            return PH.simplifiedFracString(numerator_int, raw_denom, 'in_front');
        }
        else if (settings.vec_op_answer_form === 'not-rationalized') { 
            const integer_frac = PH.simplifyFraction(numerator_int, denom_root_expr.numberInFront); // integer part of the result fraction
            const final_numer = integer_frac.numer;
            let final_denom = `\\sqrt{${denom_root_expr.numberUnderRoot}}`;
            if (integer_frac.denom !== 1) final_denom = integer_frac.denom + final_denom; 

            if (final_numer > 0) return `\\frac{${final_numer}}{${final_denom}}`; // positive result
            else return `-\\frac{${-final_numer}}{${final_denom}}`; // negative result (move the negative sign in front of the frac)
        }
        else if (settings.vec_op_answer_form === 'rationalized') {
            const integer_frac = PH.simplifyFraction(numerator_int, denom_root_expr.numberInFront * denom_root_expr.numberUnderRoot); // integer part of the result fraction
            const final_denom = integer_frac.denom;
            let final_numer;
            if (integer_frac.numer === 1) final_numer = '';
            else if (integer_frac.numer === -1) final_numer = '-';
            else final_numer = integer_frac.numer + '';
            final_numer += `\\sqrt{${denom_root_expr.numberUnderRoot}}`;

            if (integer_frac.denom === 1) return final_numer;
            else if (final_numer.charAt(0) === '-') return `-\\frac{${final_numer.slice(1)}}{${final_denom}}`; 
            else return `\\frac{${final_numer}}{${final_denom}}`;
        }
        else if (settings.vec_op_answer_form === 'decimals') { // only case where the vector might not be exact anymore
            let rounded_result = H.buildNewRounder(settings.decimal_places, settings.keep_rounded_zeros)(raw_value); // invoke the new rounder immidiately
            if (Number(rounded_result) === raw_value) return rounded_result; // rounding happened to result in no change
            else return 'r' + rounded_result; // indicate the result ins't exact anymore
        }
    },
    normArrayEntries(array, magnitude_root_obj, settings) {
        let result_is_exact = true; // result array is exactly equal to the unit vector it's supposed to represent 
        const result_array = array.map(function(integer_entry) {
            const resolved_entry = VOH.resolveRootQuotient(integer_entry, magnitude_root_obj, settings);
            if ((resolved_entry + '').charAt(0) === 'r') {
                result_is_exact = false;
                return resolved_entry.slice(1);
            }
            else return resolved_entry;
        });

        return {result_array, result_is_exact};
    }
}
export default function genVecOp(settings) {
    const vec_as_array = [];
    for (let i = 0; i < settings.vector_dimension; i++) {
        vec_as_array.push(H.randInt(settings.vec_entry_range_min, settings.vec_entry_range_max));
    }
    const vec_in_math = LAH.js_to_tex.arrayToVector(vec_as_array, settings.vector_notation);

    const round = H.buildNewRounder(settings.decimal_places, settings.keep_rounded_zeros);

    let final_prompt, final_answer;
    if (settings.single_vector_operation === 'scale') {
        const scalar = H.randFromList(H.removeFromArray([0, 1], H.integerArray(-5, 5)));
        let scalar_string;
        if (scalar === -1) scalar_string = '-';
        else scalar_string = scalar + '';

        final_prompt = scalar_string + vec_in_math;
        final_answer = LAH.js_to_tex.arrayToVector(LAH.vector_operations.scale(scalar, vec_as_array), settings.vector_notation);
    }
    else if (settings.single_vector_operation === 'mag') {
        final_prompt = '\\left\\lVert' + vec_in_math + '\\right\\rVert';
        
        const root_expression = PH.simplifySQRT(LAH.vector_operations.sum_squared_entries(vec_as_array)); // magnitude as a root expr object

        if (root_expression.numberUnderRoot === 1) { // the root was a non-zero perfect square (reduced completely to an integer (k))
            final_answer = root_expression.numberInFront;
        }
        else if (root_expression.numberUnderRoot === 0) { // magnitude of zero (zero vector)
            final_answer = 0;
        }
        else { // the root was not a perfect square (could only be reduced to a*sqrt(b) or not at all: sqrt(b))
            if (settings.vec_op_answer_form !== 'decimals') { // final answer should be an exact root expression
                final_answer = ((root_expression.numberInFront === 1)? '' : root_expression.numberInFront) + '\\sqrt{' + root_expression.numberUnderRoot + '}';
            }
            else { // round the final answer to places
                final_answer = '\\approx' + round(root_expression.numberInFront * Math.sqrt(root_expression.numberUnderRoot));
            }
        }
    }
    else if (settings.single_vector_operation === 'unit') {
        final_prompt = '\\widehat{' + vec_in_math + '}';

        // don't attempt the computation on zero vectors (they can't be converted to a unit vector)
        if (vec_as_array.every(entry => entry === 0)) {
            final_answer = final_prompt + '\\mathrm{~~is~~undefined}';
        }
        else {
            const root_expression = PH.simplifySQRT(LAH.vector_operations.sum_squared_entries(vec_as_array)); // magnitude as a root expr object
            const normed_result_obj = VOH.normArrayEntries(vec_as_array, root_expression, settings);
            const equal_sign = (normed_result_obj.result_is_exact)? '' : '\\approx';

            final_answer = equal_sign + LAH.js_to_tex.arrayToVector(normed_result_obj.result_array, settings.vector_notation);
        } 
    } 

    return {
        question: final_prompt,
        answer: final_answer
    }
}

export const settings_fields = [
    'vector_dimension',
    'single_vector_operation',
    'vector_notation',
    'entry_range',
    'vec_op_answer_form',
    'rounding_rules'
];

export const prelocked_settings = [
    'vector_notation',
    'vec_op_answer_form',
    'decimal_places'
];

export const presets = {
    default: function() {
        return {
            vec_entry_range_min: -5,
            vec_entry_range_max: 5,
            vector_dimension: 2,
            single_vector_operation: 'mag',
            vector_notation: 'brackets',
            vec_op_answer_form: 'rationalized',
            decimal_places: 3
        };
    },
    random: function() {
        return {
            vec_entry_range_min: H.randInt(-5, 0),
            vec_entry_range_max: H.randInt(1, 5),
            vector_dimension: H.randInt(2, 4),
            single_vector_operation: '__random__',
            vector_notation: '__random__',
            vec_op_answer_form: '__random__'
        };
    }
};

export const size_adjustments = {
    width: 1.1,
    height: 2.2,
};