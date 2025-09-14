import * as H from '../helpers/gen-helpers.js';

export default [
    {
        title: 'Integer Pythagorean Triples Within 25',
        example_problem: `
            \\begin{array}{c} 
            a=5,~b=12,\\\\ 
            c=13
            \\end{array}
        `,
        description: 'Sides lengths that are integers &leq; 25.',
        get_settings: function() {    
            return {
                triangle_number_type: 'integers_only',
                py_theo_unknown: H.randFromList(['hypotenuse', 'leg']),
                force_py_theo_triples: 'always', 
                triangle_length_unit: '',
                triangle_length_size: 25
            };
        }
    },
    {
        title: 'Integer Pythagorean Triples Within 100',
        example_problem: `
            \\begin{array}{c} 
            a=57,~b=76,\\\\ 
            c=95
            \\end{array}
        `,
        description: 'Sides lengths that are integers &leq; 100.',
        get_settings: function() {    
            return {
                triangle_number_type: 'integers_only',
                py_theo_unknown: H.randFromList(['hypotenuse', 'leg']),
                force_py_theo_triples: 'always', 
                triangle_length_unit: '',
                triangle_length_size: 100
            };
        }
    },
    {
        title: 'Integer Pythagorean Triples With Units',
        example_problem: `
            \\begin{array}{c} 
            a=3~\\mathrm{ft},~b=4~\\mathrm{ft},\\\\ 
            c=5~\\mathrm{ft}
            \\end{array}
        `,
        description: 'Integer side lengths that contain units.',
        get_settings: function() {    
            return {
                triangle_number_type: 'integers_only',
                py_theo_unknown: H.randFromList(['hypotenuse', 'leg']),
                force_py_theo_triples: 'always', 
                triangle_length_unit: H.randFromList(['in', 'ft', 'yd', 'mi', 'mm', 'cm', 'm', 'km']),
                triangle_length_size: 100
            };
        }
    },
    {
        title: 'Decimal Pythagorean Triples (small)',
        example_problem: `
            \\begin{array}{c} 
            a=0.7,~b=2.4,\\\\ 
            c=2.5
            \\end{array}
        `,
        description: 'Exact decimal side lengths that form a right triangle and are &leq; 10.',
        get_settings: function() {    
            return {
                triangle_number_type: 'allow_decimals',
                py_theo_unknown: H.randFromList(['hypotenuse', 'leg']),
                force_py_theo_triples: 'always', 
                triangle_length_unit: '',
                triangle_length_size: 10
            };
        }
    },
    {
        title: 'Decimal Pythagorean Triples (general)',
        example_problem: `
            \\begin{array}{c} 
            a=11.5,~b=27.6,\\\\ 
            c=29.9
            \\end{array}
        `,
        description: 'Exact decimal side lengths that form a right triangle and are &leq; 100.',
        get_settings: function() {    
            return {
                triangle_number_type: 'allow_decimals',
                py_theo_unknown: H.randFromList(['hypotenuse', 'leg']),
                force_py_theo_triples: 'always', 
                triangle_length_unit: '',
                triangle_length_size: 100
            };
        }
    },
    {
        title: 'Include Non-Triples (exact answers)',
        example_problem: `
            \\begin{array}{c} 
            a=4,~b=5,\\\\ 
            c=\\sqrt{41}
            \\end{array}
        `,
        description: 'Triangles where the unknown side may be a square root that can\'t be fully reduced.',
        get_settings: function() {    
            return {
                triangle_number_type: 'integers_only',
                py_theo_unknown: H.randFromList(['hypotenuse', 'leg']),
                force_py_theo_triples: 'sometimes', 
                triangle_length_unit: '',
                triangle_length_size: 15,
                py_theo_answer_form: 'exact_answers'
            };
        }
    },
    {
        title: 'Include Non-Triples (rounded answers)',
        example_problem: `
            \\begin{array}{c} 
            a=4,~b=5,\\\\ 
            c\\approx 6.4
            \\end{array}
        `,
        description: 'Triangles where the unknown side may be a non-teriminating decimal (so it is rounded).',
        get_settings: function() {    
            return {
                triangle_number_type: 'integers_only',
                py_theo_unknown: H.randFromList(['hypotenuse', 'leg']),
                force_py_theo_triples: 'sometimes', 
                triangle_length_unit: '',
                triangle_length_size: 15,
                py_theo_answer_form: 'decimal_answers'
            };
        }
    },
    {
        title: 'Include Decimals And Non-Triples',
        example_problem: `
            \\begin{array}{c} 
            a=1.1,~b=3.4,\\\\ 
            c\\approx 3.6
            \\end{array}
        `,
        description: 'No restrictions on the triangle\'s side lengths.',
        get_settings: function() {    
            return {
                triangle_number_type: H.randFromList(['integers_only', 'allow_decimals']),
                py_theo_unknown: H.randFromList(['hypotenuse', 'leg']),
                force_py_theo_triples: H.randFromList(['always', 'sometimes']), 
                triangle_length_unit: '',
                triangle_length_size: 100,
                py_theo_answer_form: 'decimal_answers'
            };
        }
    },
    {
        title: 'Include Decimals, Non-Triples, And Units',
        example_problem: `
            \\begin{array}{c} 
            a=8.2~\\mathrm{ft}, \\\\
            ~b=9.3~\\mathrm{ft}, \\\\ 
            c\\approx 12.4~\\mathrm{ft}
            \\end{array}
        `,
        description: 'No restrictions on the triangle\'s side lengths (units included).',
        get_settings: function() {    
            return {
                triangle_number_type: H.randFromList(['integers_only', 'allow_decimals']),
                py_theo_unknown: H.randFromList(['hypotenuse', 'leg']),
                force_py_theo_triples: H.randFromList(['always', 'sometimes']), 
                triangle_length_unit: H.randFromList(['in', 'ft', 'yd', 'mi', 'mm', 'cm', 'm', 'km']),
                triangle_length_size: 100,
                py_theo_answer_form: 'decimal_answers'
            };
        }
    },
    {
        title: 'Find The Hypotenuse (triples)',
        example_problem: `
            \\begin{array}{c} 
            a=6,~b=8,\\\\ 
            c=?
            \\end{array}
        `,
        description: 'Triangles where the hypontenuse is unknown (integer side lengths).',
        get_settings: function() {    
            return {
                triangle_number_type: 'integers_only',
                py_theo_unknown: 'hypotenuse',
                force_py_theo_triples: 'always', 
                triangle_length_unit: '',
                triangle_length_size: 25
            };
        }
    },
    {
        title: 'Find The Hypotenuse (general lengths)',
        example_problem: `
            \\begin{array}{c} 
            a=1.8,~b=2.3,\\\\ 
            c=?
            \\end{array}
        `,
        description: 'Triangles where the hypontenuse is unknown (general side lengths).',
        get_settings: function() {    
            return {
                triangle_number_type: H.randFromList(['integers_only', 'allow_decimals']),
                py_theo_unknown: 'hypotenuse',
                force_py_theo_triples: H.randFromList(['sometimes', 'always']), 
                triangle_length_unit: '',
                triangle_length_size: 25,
                py_theo_answer_form: 'decimal_answers'
            };
        }
    },
    {
        title: 'Find A Leg (triples)',
        example_problem: `
            \\begin{array}{c} 
            a=12,~b=?,\\\\ 
            c=20
            \\end{array}
        `,
        description: 'Triangles where a leg is unknown (integer side lengths).',
        get_settings: function() {    
            return {
                triangle_number_type: 'integers_only',
                py_theo_unknown: 'leg',
                force_py_theo_triples: 'always', 
                triangle_length_unit: '',
                triangle_length_size: 25
            };
        }
    },
    {
        title: 'Find A Leg (general lengths)',
        example_problem: `
            \\begin{array}{c} 
            a=9.8,~b=?,\\\\ 
            c=15.3
            \\end{array}
        `,
        description: 'Triangles where a leg is unknown (general side lengths).',
        get_settings: function() {    
            return {
                triangle_number_type: H.randFromList(['integers_only', 'allow_decimals']),
                py_theo_unknown: 'leg',
                force_py_theo_triples: H.randFromList(['sometimes', 'always']), 
                triangle_length_unit: '',
                triangle_length_size: 25,
                py_theo_answer_form: 'decimal_answers'
            };
        }
    },
    {
        title: 'Triangles Rotated By 90&deg; (CCW)',
        example_problem: '90^\\circ	\\circlearrowleft~\\text{CCW}',
        description: 'Triangles rotated by 90&deg; (CCW).',
        get_settings: function() {    
            return {
                triangle_number_type: H.randFromList(['integers_only', 'allow_decimals']),
                py_theo_unknown: H.randFromList(['hypotenuse', 'leg']),
                force_py_theo_triples: H.randFromList(['always', 'sometimes']), 
                triangle_length_unit: '',
                triangle_length_size: 100,
                py_theo_answer_form: 'decimal_answers',
                rotation_deg: 90,
                randomize_rotation: undefined
            };
        }
    },
    {
        title: 'Triangles Rotated By 90&deg; (CW)',
        example_problem: '90^\\circ	\\circlearrowright~\\text{CW}',
        description: 'Triangles rotated by 90&deg; (CW).',
        get_settings: function() {    
            return {
                triangle_number_type: H.randFromList(['integers_only', 'allow_decimals']),
                py_theo_unknown: H.randFromList(['hypotenuse', 'leg']),
                force_py_theo_triples: H.randFromList(['always', 'sometimes']), 
                triangle_length_unit: '',
                triangle_length_size: 100,
                py_theo_answer_form: 'decimal_answers',
                rotation_deg: 270,
                randomize_rotation: undefined
            };
        }
    },
    {
        title: 'Triangles Rotated By 180&deg;',
        example_problem: '180^\\circ \\circlearrowright',
        description: 'Triangles rotated by 180&deg;.',
        get_settings: function() {    
            return {
                triangle_number_type: H.randFromList(['integers_only', 'allow_decimals']),
                py_theo_unknown: H.randFromList(['hypotenuse', 'leg']),
                force_py_theo_triples: H.randFromList(['always', 'sometimes']), 
                triangle_length_unit: '',
                triangle_length_size: 100,
                py_theo_answer_form: 'decimal_answers',
                rotation_deg: 180,
                randomize_rotation: undefined
            };
        }
    },
    {
        title: 'Triangles With Random Rotation',
        example_problem: '[?]^\\circ \\circlearrowright',
        description: 'Triangles rotated by a random amount (between 0&deg; and 360&deg;).',
        get_settings: function() {    
            return {
                triangle_number_type: H.randFromList(['integers_only', 'allow_decimals']),
                py_theo_unknown: H.randFromList(['hypotenuse', 'leg']),
                force_py_theo_triples: H.randFromList(['always', 'sometimes']), 
                triangle_length_unit: '',
                triangle_length_size: 100,
                py_theo_answer_form: 'decimal_answers',
                randomize_rotation: 'is_checked'
            };
        }
    },
]