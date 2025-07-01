import * as H from '../helpers/gen-helpers.js';
import * as PH from '../helpers/polynom-helpers.js';
import { CH } from '../../helpers/canvas-helpers.js';

export const gen_type = 'canvas-Q|latex-A';

export function validateSettings(form_obj, error_locations) {
    // if the number size is too small <2 or <3, matched_to_triangle can't be applied 
    if (
        form_obj.sp_tri_side_length === 'matched_to_triangle' &&
        (
            (form_obj.right_triangle_type === '45-45-90' && form_obj.sp_tri_number_size < 2) ||
            (form_obj.right_triangle_type === '30-60-90' && form_obj.sp_tri_number_size < 3)
        )
    ) form_obj.sp_tri_side_length = 'rand_expression';

    // if the number size is one, just the number '1' is possible as a side length
    if (form_obj.sp_tri_number_size === 1) form_obj.sp_tri_side_length = 'integer';

    // handle random rotation
    if (form_obj.randomize_rotation === 'is_checked') form_obj.rotation_deg = H.randInt(0, 360);
}

const STH = { // genSpTri helpers
    rootExpressionToString: function(root_expr_arr) {
        const root_values = PH.simplifySQRT(root_expr_arr[1]);

        const fractional_part = PH.simplifyFraction(root_expr_arr[0]*root_values.numberInFront, root_expr_arr[2]);

        if (root_values.numberUnderRoot !== 1 && fractional_part.denom !== 1) { // final value has both irreducible root and frac 
            let value_before_root;
            if (Math.abs(fractional_part.numer === 1)) value_before_root = '';
            else value_before_root = Math.abs(fractional_part.numer) + '';

            let expression_sign = '';
            if (fractional_part.numer < 0) expression_sign = '-';

            return `${expression_sign}\\frac{${value_before_root}\\sqrt{${root_values.numberUnderRoot}}}{${fractional_part.denom}}`;
        }
        else if (root_values.numberUnderRoot !== 1) { // just a root but no frac
            let value_before_root;
            if (fractional_part.numer === 1) value_before_root = '';
            else if (fractional_part.numer === -1) value_before_root = '-';
            else value_before_root = fractional_part.numer + '';

            return `${value_before_root}\\sqrt{${root_values.numberUnderRoot}}`;
        }
        else  { // just a frac but no root || just an integer (no root or frac)
            return PH.simplifiedFracString(fractional_part.numer, fractional_part.denom);
        }
    },
    conversion_rules: {
        _45_45_90: {
            b_c: function(side_value) {
                return [side_value[0], side_value[1]*2, side_value[2]]; // multiply by root 2
            },
            c_a: function(side_value) {
                return [side_value[0], side_value[1]*2, side_value[2]*2]; // multiply by root 2 on 2
            },
            a_b: function(side_value) {
                return [side_value[0], side_value[1], side_value[2]]; // no change (a congruent to b)
            }
        },
        _30_60_90: {
            b_c: function(side_value) {
                return [side_value[0]*2, side_value[1]*3, side_value[2]*3]; // multiply by 2 root 3 on 3
            },
            c_a: function(side_value) {
                return [side_value[0], side_value[1], side_value[2]*2]; // multiply by 1 on 2
            },
            a_b: function(side_value) {
                return [side_value[0], side_value[1]*3, side_value[2]]; // multiply by root 3
            }
        }
    },
    getNextSideLetter: function(current_side_letter) { // clockwise around the triangle
        if (current_side_letter === 'b') return 'c';
        else if (current_side_letter === 'c') return 'a';
        else if (current_side_letter === 'a') return 'b';
    },
    getPreviousSideLetter: function(current_side_letter) {
        if (current_side_letter === 'b') return 'a';
        else if (current_side_letter === 'a') return 'c';
        else if (current_side_letter === 'c') return 'b';
    },
    getNextSideValue: function(current_side_value, current_side_letter, triangle_type) { // clockwise around the triangle
        return this.conversion_rules[
            `_${triangle_type.replace(/-/g,'_')}`
        ][`${current_side_letter}_${this.getNextSideLetter(current_side_letter)}`](current_side_value);
    },
    getCompleteTriangle: function(known_side_value, known_side_letter, triangle_type) {
        const side_length_values = {a: null, b: null, c: null};
        const side_length_strings = {a: null, b: null, c: null};

        [known_side_letter, 
            this.getNextSideLetter(known_side_letter), this.getNextSideLetter(this.getNextSideLetter(known_side_letter))
        ].forEach(side_letter => {
            if (side_letter === known_side_letter) {
                side_length_values[side_letter] = known_side_value;
            }
            else {
                side_length_values[side_letter] = this.getNextSideValue(
                    side_length_values[this.getPreviousSideLetter(side_letter)],
                    this.getPreviousSideLetter(side_letter),
                    triangle_type
                );
            }   

            side_length_strings[side_letter] = this.rootExpressionToString(side_length_values[side_letter]);
        });

        return side_length_strings;
    },
    getRandomExpressionValue: function(side_length_size) {
        // cap the number under the root at 7 (in its raw form)
        const root_number_limit = (side_length_size > 7)? 7 : side_length_size; // guarunteed to be >= 2 by settings validation
        const leading_number_limit = (H.randInt(1, 3) === 3)? 1 : side_length_size; // randomly floor to 1 sometimes
        const denom_number_limit = (H.randInt(1, 3) === 3)? 1 : side_length_size; // randomly floor to 1 sometimes

        if (H.randInt(0, 1) === 0) { // include a root value
            return [H.randInt(1, leading_number_limit), H.randFromList(H.nonPerfectSquares(root_number_limit)), H.randInt(1, denom_number_limit)];
        }
        else { // don't include a root value
            return [H.randInt(1, leading_number_limit), 1, H.randInt(1, denom_number_limit)];
        }
    }
};
export default async function genSpTri(settings) {
    const rand = function() {
        return H.randInt(1, settings.sp_tri_number_size);
    }
    const halfSizeRand = function() {
        return H.randInt(1, Math.ceil(settings.sp_tri_number_size / 2));
    }

    // first step is to determine the values of the three sides based on the given side (as latex strings)
    const given_side_letter = H.randFromList(['a','b','c']);
    let side_lengths;
    let angle_measures;
    let given_length_value;
    if (settings.right_triangle_type === '45-45-90') {
        angle_measures = {A: 45, B: 45, C: 90};
        
        if (settings.sp_tri_side_length === 'integer') {
            given_length_value = [rand(), 1, 1];
        }
        else if (settings.sp_tri_side_length === 'rand_expression') {
            given_length_value = STH.getRandomExpressionValue(settings.sp_tri_number_size);
        }
        else if (settings.sp_tri_side_length === 'matched_to_triangle') {
            if (given_side_letter === 'a' || given_side_letter === 'b') {
                given_length_value = [rand(), 2, 2];
            }
            else if (given_side_letter === 'c') {
                given_length_value = [rand(), 2, 1];
            }
        }

        side_lengths = STH.getCompleteTriangle(given_length_value, given_side_letter, '45-45-90');
    }
    else if (settings.right_triangle_type === '30-60-90') {
        angle_measures = {A: 30, B: 60, C: 90};
        
        if (settings.sp_tri_side_length === 'integer') {
            given_length_value = [rand(), 1, 1];
        }
        else if (settings.sp_tri_side_length === 'rand_expression') {
            given_length_value = STH.getRandomExpressionValue(settings.sp_tri_number_size);
        }
        else if (settings.sp_tri_side_length === 'matched_to_triangle') {
            if (given_side_letter === 'a') {
                if (H.randInt(0, 1) === 0) {
                    given_length_value = [rand(), 1, 2];
                }
                else {
                    given_length_value = [rand(), 3, 3];
                }
            }  
            else if (given_side_letter === 'b') {
                if (H.randInt(0, 1) === 0) {
                    given_length_value = [rand(), 3, 1];
                }
                else {
                    given_length_value = [rand(), 3, 2];
                }
            }
            else if (given_side_letter === 'c') {
                if (H.randInt(0, 1) === 0) {
                    given_length_value = [2*halfSizeRand(), 1, 1];
                }
                else {
                    given_length_value = [2*halfSizeRand(), 3, 3];
                }
            }
        }

        side_lengths = STH.getCompleteTriangle(given_length_value, given_side_letter, '30-60-90');
    }

    // next step is to determine the labels for the prompt and answer triangles
    const prompt_side_labels = {a: null, b: null, c: null};
    let answer_tex_string;
    const first_unknown_letter = settings.sp_tri_unknowns.split('_')[0];
    const second_unknown_letter = settings.sp_tri_unknowns.split('_')[1];
    prompt_side_labels[given_side_letter] = side_lengths[given_side_letter];
    if (given_side_letter === 'a') {
        prompt_side_labels.b = first_unknown_letter;
        prompt_side_labels.c = second_unknown_letter;

        answer_tex_string = `${first_unknown_letter}=${side_lengths.b},\\:${second_unknown_letter}=${side_lengths.c}`;
    }
    else if (given_side_letter === 'b') {
        prompt_side_labels.a = first_unknown_letter;
        prompt_side_labels.c = second_unknown_letter;

        answer_tex_string = `${first_unknown_letter}=${side_lengths.a},\\:${second_unknown_letter}=${side_lengths.c}`;
    }
    else if (given_side_letter === 'c') {
        prompt_side_labels.a = first_unknown_letter;
        prompt_side_labels.b = second_unknown_letter;

        answer_tex_string = `${first_unknown_letter}=${side_lengths.a},\\:${second_unknown_letter}=${side_lengths.b}`;
    }

    // extract the reflections from the settings
    let horizontal_reflection, vertical_reflection;
    if (settings.triangle_reflection?.includes('horizontal')) horizontal_reflection = true;
    if (settings.triangle_reflection?.includes('vertical')) vertical_reflection = true;

    // resolve which angle(s) should be given (and which should be inferred)
    let given_angles;
    if (settings.sp_tri_given_angles === 'both') {
        given_angles = ['A','B'];
    }
    else if (settings.sp_tri_given_angles === 'just_one') {
        if (H.randInt(0, 1) === 0) {
            given_angles = ['A'];
        }
        else {
            given_angles = ['B'];
        }
    }

    // create the prompt canvas and draw the prompt triangle on it
    let new_canvas = CH.createCanvas(1000, 1000, true);
    const prompt_canvas = new_canvas.element;
    await CH.drawSpecialRightTriangle(prompt_side_labels, angle_measures, given_angles, settings.rotation_deg, 6.5, horizontal_reflection, vertical_reflection);
    
    return {
        question: prompt_canvas,
        answer: answer_tex_string
    };
}

export const settings_fields = [
    'sp_tri_side_length',
    'right_triangle_type',
    'sp_tri_unknowns',
    'sp_tri_number_size',
    'triangle_rotation',
    'triangle_reflection',
    'sp_tri_given_angles'
];

export function get_presets() {
    return {
        sp_tri_side_length: 'matched_to_triangle',
        right_triangle_type: '30-60-90',
        sp_tri_unknowns: 'x_y',
        sp_tri_number_size: 15,
        rotation_deg: 0,
        triangle_reflection: [],
        sp_tri_given_angles: 'both'
    };
}

export function get_rand_settings() {
    return {
        sp_tri_side_length: '__random__',
        right_triangle_type: '__random__',
        sp_tri_unknowns: '__random__',
        sp_tri_number_size: H.randInt(1, 15),
        rotation_deg: H.randInt(0, 360),
        triangle_reflection: H.randFromList([['horizontal'],['vertical'],['horizontal', 'vertical']]),
        sp_tri_given_angles: '__random__',
        randomize_rotation: 'is_checked'
    }; 
}

export const size_adjustments = {
    width: 0.8,
    force_square: true
};