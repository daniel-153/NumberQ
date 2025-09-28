import * as H from '../helpers/gen-helpers.js';
import * as geometry from '../helpers/geom-helpers.js';   
import { CH } from '../../helpers/canvas-helpers.js';

export const gen_type = 'canvas-Q|latex-A';

export function validateSettings(form_obj, error_locations) {
    // ensure the label is congruent with the prompt (solving for a single unknown or the whole triangle)
    if (form_obj.sico_solve_for === 'whole_triangle' && form_obj.sico_labels === 'only_unknown') {
        form_obj.sico_labels = 'all_vert';
    }

    // handle random rotation
    if (form_obj.randomize_rotation === 'is_checked') form_obj.rotation_deg = H.randInt(0, 360);

    // ensure that decimal places is at least 2 (required for genLawSico due to multistep, error producing calculations)
    if (form_obj.decimal_places < 2) {
        form_obj.decimal_places = 2;
        error_locations.add('decimal_places');
    }
}

const LSH = { // genLawSico helpers
    side_length_size: null,
    number_type: null,
    known_angle_min: 10, 
    getValidRandSide: function(raw = false) {
        if (this.number_type === 'integers_only') {
            return H.randInt(1, this.side_length_size); // 1 - 100
        }
        else if (this.number_type === 'allow_decimals' && raw) {
            return H.randInt(1, 10 * this.side_length_size); // 1 - 1000
        }
        else if (this.number_type === 'allow_decimals') {
            return H.randInt(1, 10 * this.side_length_size) / 10; // 0.1 - 100
        }
    },
    randomizeTriangleVertexLetters: function(triangle_ps) {
        const rand_reordering = {'A': null, 'B': null, 'C': null, 'a': null, 'b': null, 'c': null};
        const vertices = ['A', 'B', 'C'];
        let rand = H.randInt(1,3);
        if (rand === 1) {
            rand_reordering['A'] = vertices.splice(H.randInt(0, 2), 1)[0];

            if (H.randInt(0, 1) === 0) {
                rand_reordering['B'] = vertices.splice(H.randInt(0, 1), 1)[0];
                rand_reordering['C'] = vertices[0];
            }
            else {
                rand_reordering['C'] = vertices.splice(H.randInt(0, 1), 1)[0];
                rand_reordering['B'] = vertices[0];
            }
        }
        else if (rand === 2) {
            rand_reordering['B'] = vertices.splice(H.randInt(0, 2), 1)[0];

            if (H.randInt(0, 1) === 0) {
                rand_reordering['A'] = vertices.splice(H.randInt(0, 1), 1)[0];
                rand_reordering['C'] = vertices[0];
            }
            else {
                rand_reordering['C'] = vertices.splice(H.randInt(0, 1), 1)[0];
                rand_reordering['A'] = vertices[0];
            }
        }
        else if (rand === 3) {
            rand_reordering['C'] = vertices.splice(H.randInt(0, 2), 1)[0];

            if (H.randInt(0, 1) === 0) {
                rand_reordering['A'] = vertices.splice(H.randInt(0, 1), 1)[0];
                rand_reordering['B'] = vertices[0];
            }
            else {
                rand_reordering['B'] = vertices.splice(H.randInt(0, 1), 1)[0];
                rand_reordering['A'] = vertices[0];
            }
        }
        rand_reordering['a'] = rand_reordering['A'].toLowerCase();
        rand_reordering['b'] = rand_reordering['B'].toLowerCase();
        rand_reordering['c'] = rand_reordering['C'].toLowerCase();

        const randomized_triangle_ps = {};
        randomized_triangle_ps[rand_reordering.A] = JSON.parse(JSON.stringify(triangle_ps.A));
        randomized_triangle_ps[rand_reordering.B] = JSON.parse(JSON.stringify(triangle_ps.B));
        randomized_triangle_ps[rand_reordering.C] = JSON.parse(JSON.stringify(triangle_ps.C));

        triangle_ps.A = randomized_triangle_ps.A;
        triangle_ps.B = randomized_triangle_ps.B;
        triangle_ps.C = randomized_triangle_ps.C;

        return rand_reordering;
    },
    getConvertedTriangleMeasureNames: function(measure_names_arr, rand_ordering_key) { // how do names like [A,c,B] change after randomizing vertices
        const converted_names = [];
        measure_names_arr.forEach(measure_name => {
            converted_names.push(rand_ordering_key[measure_name]);
        });

        return converted_names;
    },
    randSSS: function() { // cosines | S1->a, S2->b, S3->c
        const side_length_size = (this.number_type === 'allow_decimals')? 10*this.side_length_size : this.side_length_size;
        let a = this.getValidRandSide(true);
        let c = this.getValidRandSide(true);
        let b = H.randInt(Math.max(c - a, a - c) + 1, Math.min(a + c - 1, side_length_size)); // use triangle inequality to ensure b is valid 

        if (this.number_type === 'allow_decimals') {
            a = a / 10;
            b = b / 10;
            c = c / 10;
        }

        return {
            triangle: geometry.build_triangle.SSS(a, b, c),
            first_level_unknowns: ['A','B','C'],
            all_unknowns: ['A','B','C'],
            knowns: {
                'a': a,
                'b': b,
                'c': c
            }
        };
    },
    randSAS: function() { // cosines | S1->c, A1->B, S2->a
        const c = this.getValidRandSide();
        const B = H.randInt(this.known_angle_min, 155);
        const a = this.getValidRandSide();

        return { 
            triangle: geometry.build_triangle.SAS(c, B, a, 'deg'),
            first_level_unknowns: ['b'],
            all_unknowns: ['A','C','b'],
            knowns: {
                'c': c,
                'B': B,
                'a': a
            }
        };
    },
    randASA: function() { // sines | A1->A, S1->c, A2->B
        const rand_angles = geometry.getRandomTriangleAngles(this.known_angle_min);
        
        const A = rand_angles[0];
        const c = this.getValidRandSide();
        const B = rand_angles[1];

        return { 
            triangle: geometry.build_triangle.ASA(A, c, B, 'deg'),
            first_level_unknowns: ['a','b'],
            all_unknowns: ['a','b', 'C'],
            knowns: {
                'A': A,
                'c': c,
                'B': B
            }
        };
    },
    randAAS: function() { // sines | A1->C, A2->A, S1->c
        const rand_angles = geometry.getRandomTriangleAngles(this.known_angle_min);
        
        const C = rand_angles[0];
        const A = rand_angles[1];
        const c = this.getValidRandSide();

        return { 
            triangle: geometry.build_triangle.AAS(C, A, c, 'deg'),
            first_level_unknowns: ['a'],
            all_unknowns: ['a','b','B'],
            knowns: {
                'C': C,
                'A': A,
                'c': c
            }
        };
    },
    getRandTriangleInfo: function(law) {
        if (law === 'random') law = H.randFromList(['sines','cosines']);
        
        let initial_triangle_info;
        if (law === 'sines') {
            if (H.randInt(0, 1) === 0) {
                initial_triangle_info = this.randAAS();
            }
            else {
                initial_triangle_info = this.randASA();
            }
        }
        else if (law === 'cosines') {
            if (H.randInt(0, 1) === 0) {
                initial_triangle_info = this.randSSS();
            }
            else {
                initial_triangle_info = this.randSAS();
            }
        }

        // randomly swap the triangle sides around + keep track of how the unknown letters change
        const reordering_key = this.randomizeTriangleVertexLetters(initial_triangle_info.triangle);
        initial_triangle_info.first_level_unknowns = initial_triangle_info.first_level_unknowns.map(unknown_letter => reordering_key[unknown_letter]);
        initial_triangle_info.all_unknowns = initial_triangle_info.all_unknowns.map(unknown_letter => reordering_key[unknown_letter]);
        const new_knowns_obj = {};
        for (const [known_letter, value] of Object.entries(initial_triangle_info.knowns)) {
            const converted_letter = reordering_key[known_letter];

            new_knowns_obj[converted_letter] = value;
        }
        initial_triangle_info.knowns = new_knowns_obj;

        return initial_triangle_info;
    },
    upperOrLower: function(string) {
        if (string === string.toLowerCase()) return 'lower';
        else if (string === string.toUpperCase()) return 'upper';
    },
    getPromptMeasureLabel: function(measure_letter, triangle_info, settings, triangle_unknown) {
        // just return the numerical value (with units) if known
        if (triangle_info.knowns[measure_letter] !== undefined) {
            if (this.upperOrLower(measure_letter) === 'lower') return triangle_info.knowns[measure_letter] + ((settings.triangle_length_unit === '')? '' : `\\,\\mathrm{${settings.triangle_length_unit}}`);
            else if (this.upperOrLower(measure_letter) === 'upper') return triangle_info.knowns[measure_letter] + '^\\circ';
        }
        
        if (triangle_unknown === 'all') { // entire triangle unknown
            // only special case is 'all_vert_and_unknown', where uknown sides should have their letter instead of being blank
            if (settings.sico_labels === 'all_vert_and_unknown' && this.upperOrLower(measure_letter) === 'lower') return measure_letter;
            else return null;
        }
        else { // only one unknown
            if (measure_letter === triangle_unknown) { // *THE* unknown
                if (settings.sico_labels === 'all_vert_and_unknown' && this.upperOrLower(measure_letter) === 'lower') return measure_letter;
                else if (settings.sico_labels === 'only_unknown' && this.upperOrLower(measure_letter) === 'lower') return 'x';
                else if (settings.sico_labels === 'only_unknown' && this.upperOrLower(measure_letter) === 'upper') return '\\theta';
                else return null;
            }
            else return null; // *AN* unknown, but NOT *THE* unknown
        }
    },
    getUnknownDisplaySymbol: function(unknown_letter, settings) {
        const unknown_type = (this.upperOrLower(unknown_letter) === 'lower')? 'side' : 'angle';

        if (unknown_type === 'angle' && (settings.sico_labels === 'all_vert' || settings.sico_labels == 'all_vert_and_unknown')) {
            return `\\text{m}\\angle ${unknown_letter}`;
        }
        else if (settings.sico_labels === 'all_vert') {
            const opposite_vertex = unknown_letter.toUpperCase();
            return ['A','B','C'].filter(letter => letter !== opposite_vertex).join('');
        }
        else if (settings.sico_labels == 'all_vert_and_unknown') {
            return unknown_letter;
        }
        else if (settings.sico_labels === 'only_unknown') {
            if (unknown_type === 'side') {
                return 'x';
            }
            else if (unknown_type === 'angle') {
                return '\\theta';
            }
        }
    }
};
export default async function genLawSico(settings) {
    LSH.side_length_size = settings.triangle_length_size;
    LSH.number_type = settings.triangle_number_type;

    const triangle_info = LSH.getRandTriangleInfo(settings.law_sin_or_cos);
    let triangle_unknown, unknown_type;
    if (settings.sico_solve_for === 'one_unknown') {
        triangle_unknown = H.randFromList(triangle_info.first_level_unknowns);
        unknown_type = (LSH.upperOrLower(triangle_unknown) === 'lower')? 'side' : 'angle';
    }
    else if (settings.sico_solve_for === 'whole_triangle') {
        triangle_unknown = 'all';
        unknown_type = 'all';
    }

    // determine the measure labels on the prompt triangle
    const prompt_angle_labels = {'A': null, 'B': null, 'C': null};
    const prompt_side_labels = {'a': null, 'b': null, 'c': null};

    ['a','b','c','A','B','C'].forEach(measure_letter => {
        const label = LSH.getPromptMeasureLabel(measure_letter, triangle_info, settings, triangle_unknown);

        if (LSH.upperOrLower(measure_letter) === 'upper') prompt_angle_labels[measure_letter] = label;
        else if (LSH.upperOrLower(measure_letter) === 'lower') prompt_side_labels[measure_letter] = label;
    });

    // determine the written prompt
    let written_prompt;
    if (settings.sico_solve_for === 'one_unknown') written_prompt = '\\text{Find}~' + LSH.getUnknownDisplaySymbol(triangle_unknown, settings);
    else if (settings.sico_solve_for === 'whole_triangle') written_prompt = '\\text{Solve}';
    written_prompt += '\\mkern1.5mu{:}\\mkern1.5mu';
    
    // determine the values for the unknowns
    let solved_unknowns;
    const calced_triangle_measures = {
        sides: geometry.getAllTriangleSides(triangle_info.triangle),
        angles: geometry.getAllTriangleAngles(triangle_info.triangle, 'deg')
    }

    if (settings.sico_solve_for === 'one_unknown') solved_unknowns = [triangle_unknown];
    else if (settings.sico_solve_for === 'whole_triangle') solved_unknowns = [...triangle_info.all_unknowns];

    // sort the unknown letters in the following general order (angles before sides + alphabetical when applicable)
    const ordered_unknowns = [];
    ['A','B','C','a','b','c'].forEach(ordered_letter => {
        if (solved_unknowns.includes(ordered_letter)) {
            ordered_unknowns.push(ordered_letter)
        }
    });
    solved_unknowns = ordered_unknowns;

    const round = H.buildNewRounder(settings.decimal_places, settings.keep_rounded_zeros);
    solved_unknowns = solved_unknowns.map(function(solved_unknown_letter) {
        const measure_type = (LSH.upperOrLower(solved_unknown_letter) === 'lower')? 'side' : 'angle';
        const rounded = round(calced_triangle_measures[`${measure_type}s`][solved_unknown_letter]);

        let value;
        if (Math.abs(calced_triangle_measures[`${measure_type}s`][solved_unknown_letter] - Number(rounded)) < 1e-12) {
            value = '=' + Number(rounded);
        }
        else value = '\\approx' + rounded;

        // add on units
        if (measure_type === 'angle') value += '^\\circ';
        else if (measure_type === 'side' && settings.triangle_length_unit !== '') value += `\\,\\mathrm{${settings.triangle_length_unit}}`;

        const label = LSH.getUnknownDisplaySymbol(solved_unknown_letter, settings);

        return label + value;
    });

    // extract the reflections from the settings
    let horizontal_reflection, vertical_reflection;
    if (settings.triangle_reflection?.includes('horizontal')) horizontal_reflection = true;
    if (settings.triangle_reflection?.includes('vertical')) vertical_reflection = true;

    // create the prompt triangle and the answer tex string
    let new_canvas = CH.createCanvas(1000, 1000, true);
    const prompt_canvas = new_canvas.element;
    let label_vertices = false;
    if (settings.sico_labels === 'all_vert' || settings.sico_labels === 'all_vert_and_unknown') label_vertices = true;
    await CH.drawGeneralTriangle({
        triangle: triangle_info.triangle,
        side_labels: prompt_side_labels,
        angle_labels: prompt_angle_labels,
        written_prompt: written_prompt
    },label_vertices, settings.rotation_deg, horizontal_reflection, vertical_reflection);

    const answer_tex_string = '\\begin{array}{c}' + solved_unknowns.join(',\\\\') + '\\end{array}';

    return {
        question: prompt_canvas,
        answer: answer_tex_string
    };
}

export const settings_fields = [
    'triangle_length_size',
    'law_sin_or_cos',
    'sico_labels',
    'triangle_number_type',
    'sico_solve_for',
    'rounding_rules',
    'triangle_length_unit',
    'triangle_rotation',
    'triangle_reflection'
];

export const presets = {
    default: function() {
        return {
            triangle_length_size: 50,
            law_sin_or_cos: 'random',
            sico_labels: 'all_vert',
            triangle_number_type: 'integers_only',
            sico_solve_for: 'one_unknown',
            decimal_places: 2,
            triangle_length_unit: '',
            rotation_deg: 0,
            randomize_rotation: 'is_checked',
            triangle_reflection: []
        };
    },
    random: function() {
        return {
            triangle_length_size: H.randInt(20, 100),
            law_sin_or_cos: '__random__',
            sico_labels: '__random__',
            triangle_number_type: '__random__',
            sico_solve_for: '__random__',
            triangle_length_unit: H.randFromList(['in', 'ft', 'yd', 'mi', 'mm', 'cm', 'm', 'km']),
            rotation_deg: H.randInt(0, 360),
            randomize_rotation: 'is_checked',
            triangle_reflection: H.randFromList([['horizontal'],['vertical'],['horizontal', 'vertical']])
        };
    },
    has_topic_presets: true
};

export const size_adjustments = {
    width: 0.85,
    force_square: true,
    present: {
        canvas: {
            max_height: 0.4
        },
        preview: {
            max_height: 0.4
        },
        answer: {
            max_size_scale: 1.5,
            init_scale: 1.25
        }
    }
};