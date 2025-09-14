import * as H from '../helpers/gen-helpers.js';

export default [
    {
        title: 'Small Side Length Numbers',
        example_problem: `
            \\begin{array}{c} 
            a=2,~b=2\\sqrt{3},\\\\ 
            c=4
            \\end{array}
        `,
        description: 'Small-sized numbers in the triangle side length expressions.',
        get_settings: function() {    
            return {
                sp_tri_side_length: '__random__',
                right_triangle_type: '__random__',
                sp_tri_number_size: 3
            };
        }
    },
    {
        title: 'Medium Side Length Numbers',
        example_problem: `
            \\begin{array}{c} 
            a=7,~b=7,\\\\ 
            c=7\\sqrt{2}
            \\end{array}
        `,
        description: 'Medium-sized numbers in the triangle side length expressions.',
        get_settings: function() {    
            return {
                sp_tri_side_length: '__random__',
                right_triangle_type: '__random__',
                sp_tri_number_size: 15
            };
        }
    },
    {
        title: 'Large Side Length Numbers',
        example_problem: `
            \\begin{array}{c} 
            a=26,~b=26\\sqrt{3},\\\\ 
            c=52
            \\end{array}
        `,
        description: 'Large-sized numbers in the triangle side length expressions.',
        get_settings: function() {    
            return {
                sp_tri_side_length: '__random__',
                right_triangle_type: '__random__',
                sp_tri_number_size: 30
            };
        }
    },
    {
        title: 'Integer Given Length (45-45-90)',
        example_problem: `
            \\begin{array}{c} 
            a=5,~b=?,\\\\ 
            c=?
            \\end{array}
        `,
        description: '45-45-90 triangles where the provided side length is an integer.',
        get_settings: function() {    
            return {
                sp_tri_side_length: 'integer',
                right_triangle_type: '45-45-90',
                sp_tri_number_size: 16
            };
        }
    },
    {
        title: 'Integer Given Length (30-60-90)',
        example_problem: `
            \\begin{array}{c} 
            a=9,~b=?,\\\\ 
            c=?
            \\end{array}
        `,
        description: '30-60-90 triangles where the provided side length is an integer.',
        get_settings: function() {    
            return {
                sp_tri_side_length: 'integer',
                right_triangle_type: '30-60-90',
                sp_tri_number_size: 16
            };
        }
    },
    {
        title: 'Integer Given Length',
        example_problem: `
            \\begin{array}{c} 
            a=2,~b=?,\\\\ 
            c=?
            \\end{array}
        `,
        description: 'Triangles where the provided side length is an integer (either triangle type).',
        get_settings: function() {    
            return {
                sp_tri_side_length: 'integer',
                right_triangle_type: '__random__',
                sp_tri_number_size: 16
            };
        }
    },
    {
        title: 'Matched Given Length (45-45-90)',
        example_problem: `
            \\begin{array}{c} 
            a=?,~b=?,\\\\ 
            c=3\\sqrt{2}
            \\end{array}
        `,
        description: 'The provided side length cancels with some factors introduced in solving the triangle (45-45-90).',
        get_settings: function() {    
            return {
                sp_tri_side_length: 'matched_to_triangle',
                right_triangle_type: '45-45-90',
                sp_tri_number_size: 16
            };
        }
    },
    {
        title: 'Matched Given Length (30-60-90)',
        example_problem: `
            \\begin{array}{c} 
            a=?,~b=?,\\\\ 
            c=2\\sqrt{3}
            \\end{array}
        `,
        description: 'The provided side length cancels with some factors introduced in solving the triangle (30-60-90).',
        get_settings: function() {    
            return {
                sp_tri_side_length: 'matched_to_triangle',
                right_triangle_type: '30-60-90',
                sp_tri_number_size: 16
            };
        }
    },
    {
        title: 'Matched Given Length',
        example_problem: `
            \\begin{array}{c} 
            a=?,~b=?,\\\\ 
            c=4
            \\end{array}
        `,
        description: 'The provided side length cancels with some factors introduced in solving the triangle (either triangle type).',
        get_settings: function() {    
            return {
                sp_tri_side_length: 'matched_to_triangle',
                right_triangle_type: '__random__',
                sp_tri_number_size: 16
            };
        }
    },
    {
        title: 'General Given Lengths (45-45-90)',
        example_problem: `
            \\begin{array}{c} 
            a=?,~b=3\\sqrt{5},\\\\ 
            c=?
            \\end{array}
        `,
        description: '45-45-90 triangles with random expressions as their given length.',
        get_settings: function() {    
            return {
                sp_tri_side_length: 'rand_expression',
                right_triangle_type: '45-45-90',
                sp_tri_number_size: 16
            };
        }
    },
    {
        title: 'General Given Lengths (30-60-90)',
        example_problem: `
            \\begin{array}{c} 
            a=?,~b=?,\\\\ 
            c=\\frac{\\sqrt{2}}{5}
            \\end{array}
        `,
        description: '30-60-90 triangles with random expressions as their given length.',
        get_settings: function() {    
            return {
                sp_tri_side_length: 'rand_expression',
                right_triangle_type: '30-60-90',
                sp_tri_number_size: 16
            };
        }
    },
    {
        title: 'General Given Lengths',
        example_problem: `
            \\begin{array}{c} 
            a=?,~b=?,\\\\ 
            c=\\frac{1}{7}
            \\end{array}
        `,
        description: 'Triangles with random expressions as their given length (either triangle type).',
        get_settings: function() {    
            return {
                sp_tri_side_length: 'rand_expression',
                right_triangle_type: '__random__',
                sp_tri_number_size: 16
            };
        }
    },
    {
        title: 'Only One Given Angle',
        example_problem: `
            \\begin{array}{c} 
            A=90^\\circ,~B=45^\\circ,\\\\ 
            C=?
            \\end{array}
        `,
        description: 'Triangles where only one angle (besides the right angle) is given.',
        get_settings: function() {    
            return {
                right_triangle_type: '__random__',
                sp_tri_given_angles: 'just_one'
            };
        }
    },
    {
        title: 'Randomly Reflected Triangles',
        example_problem: '\\lhd \\rightarrow \\rhd',
        description: 'Triangles that are reflected over their horizontal or vertical axis.',
        get_settings: function() {    
            return {
                right_triangle_type: '__random__',
                triangle_reflection: H.randFromList([['horizontal'],['vertical'],['horizontal', 'vertical']]),
                rotation_deg: 0,
                randomize_rotation: undefined
            };
        }
    },
    {
        title: 'Randomly Rotated Triangles',
        example_problem: '[?]^\\circ \\circlearrowright',
        description: 'Triangles that are rotated by a random amount (between 0&deg; and 360&deg;).',
        get_settings: function() {    
            return {
                right_triangle_type: '__random__',
                randomize_rotation: 'is_checked',
                triangle_reflection: []
            };
        }
    },
    {
        title: 'Randomly Labeled Triangles',
        example_problem: '(x,y),(a,b),(p,q),...',
        description: 'Triangles with randomized letters representing their unknown sides.',
        get_settings: function() {    
            return {
                right_triangle_type: '__random__',
                sp_tri_unknowns: '__random__'
            };
        }
    },
]