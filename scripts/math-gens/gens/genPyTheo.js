import * as H from '../helpers/gen-helpers.js';
import * as PH from '../helpers/polynom-helpers.js';
import { CH } from '../../helpers/canvas-helpers.js';

export const gen_type = 'canvas';

export function validateSettings(form_obj, error_locations) {
    // ensure the side length size isn't too small (for the desired type of side lengths)
    if (
        form_obj.force_py_theo_triples === 'always' && 
        form_obj.triangle_number_type === 'integers_only' &&
        form_obj.triangle_length_size < 5
    ) { 
        error_locations.add('triangle_length_size')
        form_obj.triangle_length_size = 5;
    }
    else if (
        form_obj.force_py_theo_triples === 'sometimes' && 
        form_obj.triangle_number_type === 'integers_only' &&
        form_obj.triangle_length_size < 2
    ) {
        error_locations.add('triangle_length_size')
        form_obj.triangle_length_size = 2;
    }

    // if rounding rules requires that all decimals be rounded to whole numbers, don't allow decimal side lengths
    if (form_obj.decimal_places === 0) {
        form_obj.triangle_number_type === 'integers_only'
    }
    
    // not an explicit error, but if the number type allows decimals, it doesn't make sense for the final answer to be a root expression like √1.5
    if (form_obj.triangle_number_type === 'allow_decimals') {
        form_obj.py_theo_answer_form === 'decimal_answers';
    }
}

const PTH = {
    sub_1000_triples: (function() {
        const value_bound = 1000;
        const triples = new Map();

        for (let a = 1; a <= value_bound; a++) {
            for (let b = a; b <= value_bound; b++) { 
                const c = Math.sqrt(a**2 + b**2);

                if (Number.isInteger(c) && c <= value_bound) {
                    const triple = [a, b, c];
                    
                    let current_size_array = [];
                    if (typeof(triples.get(c)) !== 'object') {
                        triples.set(c, current_size_array);
                    }
                    else {
                        current_size_array = triples.get(c);
                    }

                    current_size_array.push(triple);
                }
            }
        }

        return triples;
    })(),
    getPossibleTriples: function(max_size) {
        let possible_triples = [];
        for (let key = 1; key <= max_size; key++) {
            const value = this.sub_1000_triples.get(key);

            if (value !== undefined) {
                possible_triples = possible_triples.concat(value);
            }
        }

        return possible_triples;
    }
};
export default async function genPyTheo(settings) {
    let triple;
    if (
        settings.force_py_theo_triples === 'always'
    ) {
        if (settings.triangle_number_type === 'integers_only') {
            triple = H.randFromList(PTH.getPossibleTriples(settings.triangle_length_size));
        }
        else if (settings.triangle_number_type === 'allow_decimals') {            
            triple = H.randFromList(
                PTH.getPossibleTriples(
                    settings.triangle_length_size * 10
                ).filter(triple_array => triple_array.some(side_length => side_length % 10 !== 0)) // ensure at least one side will be a decimal
            ).map(value => value / 10);
        }

        // mark the unknown (not given) side
        if (settings.py_theo_unknown === 'hypotenuse') {
            triple[2] = 'r';
        }
        else if (settings.py_theo_unknown === 'leg') {
            if (H.randInt(0, 1) === 1) {
                triple[0] = 'r';
            }
            else {
                triple[1] = 'r';
            }
        }
    }
    else if (
        settings.force_py_theo_triples === 'sometimes' // handles both the integer and decimal cases (since they're very similar)
    ) {
        let a, b, c;
        let max_length;
        if (settings.triangle_number_type === 'integers_only') {
            max_length = settings.triangle_length_size;
        }
        else if (settings.triangle_number_type === 'allow_decimals') {
            max_length = settings.triangle_length_size * 10;
        }

        if (settings.py_theo_unknown === 'hypotenuse') {
            a = H.randInt(1, max_length - 1);
            b = H.randInt(1, max_length - 1);

            // Ensure c is also within the max allowed size (a 1-1-sqrt(2) triangle satisfies this, and is always possible, so this loop will terminate)
            while (Math.sqrt(a**2 + b**2) > max_length) {
                // if this loop was entered, that must mean at least one of (a) or (b) is currently greater than 1
                const possible_actions = [];

                // randomly downsize a and b until c is within range (which is guarunteed to happen eventually)
                if (a > 1) possible_actions.push( (() => a--) );
                if (b > 1) possible_actions.push( (() => b--) );

                H.randFromList(possible_actions)(); // do a random possible action
            }

            triple = [a, b, 'r'];
        }
        else if (settings.py_theo_unknown === 'leg') {
            // Ensure c > a, but still treat them equally
            if (H.randInt(0, 1) === 0) {
                a = H.randInt(1, max_length - 1);
                c = H.randInt(a, max_length);
            }
            else {
                c = H.randInt(2, max_length);
                a = H.randInt(1, c);
            }

            // randomly swap a and b
            if (H.randInt(0, 1) === 0) {
                triple = [a, 'r', c];
            }
            else {
                triple = ['r', a, c];
            }
        }

        if (settings.triangle_number_type === 'allow_decimals') { // need to divide the 10 back out
            triple.map((value, index, array) => {
                if (value !== 'r') array[index] = value / 10;
            });
        }
    }

    // next step is to find the side lengths based on the triple (to draw the triangle on the canvas and label it according to settings)
    const numerical_side_lengths = {a: null, b: null, c: null};
    let unknown_side;
    if (triple[0] === 'r') {
        numerical_side_lengths.b = triple[1];
        numerical_side_lengths.c = triple[2];
        numerical_side_lengths.a = Math.sqrt(numerical_side_lengths.c**2 - numerical_side_lengths.b**2);

        unknown_side = 'a';
    }
    else if (triple[1] === 'r') {
        numerical_side_lengths.a = triple[0];
        numerical_side_lengths.c = triple[2];
        numerical_side_lengths.b = Math.sqrt(numerical_side_lengths.c**2 - numerical_side_lengths.a**2);

        unknown_side = 'b';
    }
    else if (triple[2] === 'r') {
        numerical_side_lengths.a = triple[0];
        numerical_side_lengths.b = triple[1];
        numerical_side_lengths.c = Math.sqrt(numerical_side_lengths.a**2 + numerical_side_lengths.b**2);

        unknown_side = 'c';
    }

    // next step is to build the displayed labels on the triangle (both in the prompt and answer)
    const display_side_lengths = {a: null, b: null, c: null};
    const round = H.buildNewRounder(settings.decimal_places, settings.keep_rounded_zeros);
    for (const [side_name, _] of Object.entries(display_side_lengths)) {
        if (side_name === unknown_side) { // the unknown side might not be a rational (exactly representable) number
            let pre_root_value;
            if (side_name === 'c') pre_root_value = numerical_side_lengths.a**2 + numerical_side_lengths.b**2;
            else if (side_name === 'a') pre_root_value = numerical_side_lengths.c**2 - numerical_side_lengths.b**2;
            else if (side_name === 'b') pre_root_value = numerical_side_lengths.c**2 - numerical_side_lengths.a**2;

            if (settings.py_theo_answer_form === 'decimal_answers') {
                display_side_lengths[side_name] = round(Math.sqrt(pre_root_value));
            }
            else if (settings.py_theo_answer_form === 'exact_answers') {
                display_side_lengths[side_name] = PH.simplifiedSqrtString(pre_root_value);
            }
        }
        else { // known side lengths are always exact integers or decimals
            display_side_lengths[side_name] = numerical_side_lengths[side_name]; 
        }
    }

    // extract what the marker for the unknown should be based on the settings
    let marker_for_unknown;
    if (settings.py_theo_unknown_marker === 'question_mark') marker_for_unknown = '?';
    else if (settings.py_theo_unknown_marker === 'letter_x') marker_for_unknown = 'x';
    else if (settings.py_theo_unknown_marker === 'appropriate_side') {
        if (unknown_side === 'c') marker_for_unknown = 'c';
        else marker_for_unknown = 'b';
    }
    else if (settings.py_theo_unknown_marker === 'nothing') marker_for_unknown = '';

    const prompt_labels = {a: null, b: null, c: null};
    for (const [key, _] of Object.entries(prompt_labels)) {
        let side_label;
        if (key === unknown_side) {
            if (settings.label_triangle_sides === 'yes') {
                if ( // to avoid labels like 'c=c' and 'c= ', all these need to be represented with a question mark 'c=?'
                    settings.py_theo_unknown_marker === 'question_mark' ||
                    settings.py_theo_unknown_marker === 'appropriate_side' ||
                    settings.py_theo_unknown_marker === 'nothing' 
                ) {
                    side_label = key + '=' + '?';
                }
                else if (settings.py_theo_unknown_marker === 'letter_x') {
                    side_label = key + '=' + 'x';
                }
            }
            else if (settings.label_triangle_sides === 'no') side_label = marker_for_unknown;
        }
        else {
            if (settings.label_triangle_sides === 'yes') side_label = key + '=' + display_side_lengths[key] + ' ' + settings.triangle_length_unit;
            else if (settings.label_triangle_sides === 'no') side_label = display_side_lengths[key] + ' ' + settings.triangle_length_unit;
        }

        prompt_labels[key] = side_label;
    }

    const answer_labels = {a: null, b: null, c: null};
    for (const [key, _] of Object.entries(answer_labels)) {
        if (settings.label_triangle_sides === 'yes') answer_labels[key] = key + '=' + display_side_lengths[key] + ' ' + settings.triangle_length_unit;
        else if (settings.label_triangle_sides === 'no') answer_labels[key] = display_side_lengths[key] + ' ' + settings.triangle_length_unit;
    }

    // before drawing the triangles, ensure the (drawn) size difference between the legs never gets too extreme (some triangles like 1-100-r(10001) won't be to scale anymore)
    const max_size_diff = 4.25;
    if (
        numerical_side_lengths.a / numerical_side_lengths.b > max_size_diff ||
        numerical_side_lengths.a / numerical_side_lengths.b < 1 / max_size_diff
    ) {
        if (numerical_side_lengths.a > numerical_side_lengths.b) {
            numerical_side_lengths.a = max_size_diff;
            numerical_side_lengths.b = 1;
        } else {
            numerical_side_lengths.a = 1;
            numerical_side_lengths.b = max_size_diff;
        }

        numerical_side_lengths.c = Math.sqrt(numerical_side_lengths.a**2 + numerical_side_lengths.b**2);
    }

    // create the prompt canvas and draw the prompt triangle on it
    let new_canvas = CH.createCanvas(1000, 1000, true);
    const prompt_canvas = new_canvas.element;
    await CH.drawRightTriangle(numerical_side_lengths, prompt_labels, unknown_side, settings.rotation_deg);

    // create the answer canvas and draw the answer triangle on it
    new_canvas = CH.createCanvas(1000, 1000, true);
    const answer_canvas = new_canvas.element;
    await CH.drawRightTriangle(numerical_side_lengths, answer_labels, unknown_side, settings.rotation_deg);
    
    return {
        question: prompt_canvas,
        answer: answer_canvas,
        TeXquestion: 'image',
        TeXanswer: 'image'
    }
}

export const settings_fields = [
    'triangle_number_type',
    'py_theo_unknown',
    'force_py_theo_triples',
    'triangle_length_unit',
    'triangle_rotation',
    'triangle_length_size',
    'py_theo_unknown_marker',
    'rounding_rules',
    'py_theo_answer_form',
    'label_triangle_sides' 
];

export function get_presets() {
    return {
        triangle_number_type: 'integers_only',
        py_theo_unknown: 'hypotenuse',
        force_py_theo_triples: 'sometimes', 
        triangle_length_unit: '',
        rotation_deg: 0,
        triangle_length_size: 75,
        py_theo_unknown_marker: 'letter_x',
        decimal_places: 1,
        py_theo_answer_form: 'decimal_answers',
        label_triangle_sides: 'no'
    };
}

export function get_rand_settings() {
    return {
        
    }; 
}

export const size_adjustments = {
    width: 0.8,
    force_square: true
};