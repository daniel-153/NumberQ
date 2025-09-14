import * as H from '../helpers/gen-helpers.js';

export default [
    {
        title: 'Sine Law (one unknown)',
        example_problem: 'AB=?',
        description: 'Apply the law of sines to solve for one unknown.',
        get_settings: function() {
            return {
                triangle_length_size: 50,
                law_sin_or_cos: 'sines',
                triangle_number_type: 'integers_only',
                sico_solve_for: 'one_unknown',
            };
        }
    },
    {
        title: 'Cosine Law (one unknown)',
        example_problem: '\\text{m}\\angle B=?',
        description: 'Apply the law of cosines to solve for one unknown.',
        get_settings: function() {
            return {
                triangle_length_size: 50,
                law_sin_or_cos: 'cosines',
                triangle_number_type: 'integers_only',
                sico_solve_for: 'one_unknown',
            };
        }
    },
    {
        title: 'Either Law (one unknown)',
        example_problem: 'BC=?',
        description: 'Apply either triangle law to solve for one unknown.',
        get_settings: function() {
            return {
                triangle_length_size: 50,
                law_sin_or_cos: '__random__',
                triangle_number_type: 'integers_only',
                sico_solve_for: 'one_unknown',
            };
        }
    },
    {
        title: 'Sine Law (whole triangle)',
        example_problem: `
        \\begin{array}{c}\\text{m}\\angle C=?,~BC=?,\\\\AC=?\\end{array}
        `,
        description: 'Apply the law of sines to solve for all unknowns in the triangle.',
        get_settings: function() {
            return {
                triangle_length_size: 50,
                law_sin_or_cos: 'sines',
                triangle_number_type: 'integers_only',
                sico_solve_for: 'whole_triangle',
            };
        }
    },
    {
        title: 'Cosine Law (whole triangle)',
        example_problem: `
        \\begin{array}{c}AB=?,~BC=?,\\\\AC=?\\end{array}
        `,
        description: 'Apply the law of cosines to solve for all unknowns in the triangle.',
        get_settings: function() {
            return {
                triangle_length_size: 50,
                law_sin_or_cos: 'cosines',
                triangle_number_type: 'integers_only',
                sico_solve_for: 'whole_triangle',
            };
        }
    },
    {
        title: 'Either Law (whole triangle)',
        example_problem: `
        \\begin{array}{c}AC=?,~BC=?,\\\\ \\text{m}\\angle C=?\\end{array}
        `,
        description: 'Apply either triangle law to solve for all unknowns in the triangle.',
        get_settings: function() {
            return {
                triangle_length_size: 50,
                law_sin_or_cos: '__random__',
                triangle_number_type: 'integers_only',
                sico_solve_for: 'whole_triangle',
            };
        }
    },
    {
        title: 'Integer Given Sides Only',
        example_problem: `
            \\begin{array}{c}AB=4,~BC=7,\\\\AC=?\\end{array}
        `,
        description: 'Triangles where the provided sides are integers.',
        get_settings: function() {
            return {
                triangle_length_size: 50,
                law_sin_or_cos: '__random__',
                triangle_number_type: 'integers_only'
            };
        }
    },
    {
        title: 'Allow Decimal Given Sides',
        example_problem: `
            \\begin{array}{c}AB=1.8,~BC=5.3,\\\\AC=?\\end{array}
        `,
        description: 'Triangles where the provided sides may be decimals.',
        get_settings: function() {
            return {
                triangle_length_size: 50,
                law_sin_or_cos: '__random__',
                triangle_number_type: 'allow_decimals'
            };
        }
    },
    {
        title: 'Integer Given Sides With Units',
        example_problem: `
            \\begin{array}{c}AB=5~\\mathrm{cm},~BC=7~\\mathrm{cm},\\\\AC=?\\end{array}
        `,
        description: 'Triangles where the provided sides are integers and contain units.',
        get_settings: function() {
            return {
                triangle_length_size: 50,
                law_sin_or_cos: '__random__',
                triangle_number_type: 'integers_only',
                triangle_length_unit: H.randFromList(['in', 'ft', 'yd', 'mi', 'mm', 'cm', 'm', 'km'])
            };
        }
    },
    {
        title: 'Sides With Units (general)',
        example_problem: `
            \\begin{array}{c}AB=9.7~\\mathrm{m},~BC=7~\\mathrm{m},\\\\AC=?\\end{array}
        `,
        description: 'Triangles where the provided sides contain units (integers or decimals allowed).',
        get_settings: function() {
            return {
                triangle_length_size: 50,
                law_sin_or_cos: '__random__',
                triangle_number_type: '__random__',
                triangle_length_unit: H.randFromList(['in', 'ft', 'yd', 'mi', 'mm', 'cm', 'm', 'km'])
            };
        }
    },
    {
        title: 'Triangles Oriented Up',
        example_problem: '\\bigtriangleup~\\Uparrow',
        description: 'Triangles that sit flat and point upwards.',
        get_settings: function() {
            return {
                law_sin_or_cos: '__random__',
                rotation_deg: 0,
                randomize_rotation: undefined,
                triangle_reflection: []
            };
        }
    },
    {
        title: 'Triangles Oriented Down',
        example_problem: '\\bigtriangledown~\\Downarrow',
        description: 'Triangles that sit flat and point downwards.',
        get_settings: function() {
            return {
                law_sin_or_cos: '__random__',
                rotation_deg: 0,
                randomize_rotation: undefined,
                triangle_reflection: ['vertical']
            };
        }
    },
    {
        title: 'Triangles Oriented Randomly',
        example_problem: '[?]^\\circ \\circlearrowright',
        description: 'Triangles with random rotations and reflections that change their orientation.',
        get_settings: function() {
            return {
                law_sin_or_cos: '__random__',
                randomize_rotation: 'is_checked',
                triangle_reflection: H.randFromList([['horizontal'],['vertical'],['horizontal', 'vertical']])
            };
        }
    },
]