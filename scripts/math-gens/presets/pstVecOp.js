import * as H from '../helpers/gen-helpers.js';

export default [
    {
        title: 'Scale 2D',
        example_problem: '2\\left\\langle3,4\\right\\rangle',
        description: 'Scalar multiplication with 2D vectors.',
        get_settings: function() {    
            return {
                vec_entry_range_min: -7,
                vec_entry_range_max: 7,
                vector_dimension: 2,
                single_vector_operation: 'scale'
            };
        }
    },
    {
        title: 'Scale 3D',
        example_problem: '4\\left\\langle3,5,0\\right\\rangle',
        description: 'Scalar multiplication with 3D vectors.',
        get_settings: function() {    
            return {
                vec_entry_range_min: -5,
                vec_entry_range_max: 5,
                vector_dimension: 3,
                single_vector_operation: 'scale'
            };
        }
    },
    {
        title: 'Scale 2D-4D',
        example_problem: 'c\\vec{v},~~\\mathbb{R}^{2-4}',
        description: 'Scalar multiplication with 2D, 3D, or 4D vectors.',
        get_settings: function() {    
            return {
                vec_entry_range_min: -5,
                vec_entry_range_max: 5,
                vector_dimension: H.randInt(2, 4),
                single_vector_operation: 'scale'
            };
        }
    },
    {
        title: 'Scale A Zero Vector',
        example_problem: '3\\left\\langle0,0\\right\\rangle = \\left\\langle0,0\\right\\rangle',
        description: 'Recognize that a zero vector remains a zero vector when scaled.',
        get_settings: function() {    
            return {
                vec_entry_range_min: 0,
                vec_entry_range_max: 0,
                vector_dimension: H.randInt(2, 4),
                single_vector_operation: 'scale'
            };
        }
    },
    {
        title: 'Magnitude 2D',
        example_problem: '\\left\\lVert\\left\\langle-3,5\\right\\rangle\\right\\rVert',
        description: 'Find the magnitude of 2D vectors.',
        get_settings: function() {    
            return {
                vec_entry_range_min: -7,
                vec_entry_range_max: 7,
                vector_dimension: 2,
                single_vector_operation: 'mag'
            };
        }
    },
    {
        title: 'Magnitude 3D',
        example_problem: '\\left\\lVert\\left\\langle1,2,1\\right\\rangle\\right\\rVert',
        description: 'Find the magnitude of 3D vectors.',
        get_settings: function() {    
            return {
                vec_entry_range_min: -5,
                vec_entry_range_max: 5,
                vector_dimension: 3,
                single_vector_operation: 'mag'
            };
        }
    },
    {
        title: 'Magnitude 2D-4D',
        example_problem: '\\left\\lVert \\vec{v}\\right\\rVert,~~\\mathbb{R}^{2-4}',
        description: 'Find the magnitude of 2D, 3D, or 4D vectors.',
        get_settings: function() {    
            return {
                vec_entry_range_min: -5,
                vec_entry_range_max: 5,
                vector_dimension: H.randInt(2, 4),
                single_vector_operation: 'mag'
            };
        }
    },
    {
        title: 'Magnitude Of A Zero Vector',
        example_problem: '\\left\\lVert\\left\\langle0,0\\right\\rangle\\right\\rVert=0',
        description: 'Recognize that the magnitude of a zero vector is zero.',
        get_settings: function() {    
            return {
                vec_entry_range_min: 0,
                vec_entry_range_max: 0,
                vector_dimension: H.randInt(2, 4),
                single_vector_operation: 'mag'
            };
        }
    },
    {
        title: 'Magnitude (simple entries)',
        example_problem: '\\left\\lVert\\left\\langle0,-1,1\\right\\rangle\\right\\rVert',
        description: 'Find the magnitude where all entries are either -1, 0, or 1.',
        get_settings: function() {    
            return {
                vec_entry_range_min: -1,
                vec_entry_range_max: 1,
                vector_dimension: H.randInt(2, 4),
                single_vector_operation: 'mag'
            };
        }
    },
    {
        title: 'Unit Vector 2D',
        example_problem: '~~\\widehat{\\left\\langle4,2\\right\\rangle}~~',
        description: 'Find the unit vector in the direction of a 2D vector.',
        get_settings: function() {    
            return {
                vec_entry_range_min: -7,
                vec_entry_range_max: 7,
                vector_dimension: 2,
                single_vector_operation: 'unit'
            };
        }
    },
    {
        title: 'Unit Vector 3D',
        example_problem: '\\widehat{\\left\\langle3,2,2\\right\\rangle}',
        description: 'Find the unit vector in the direction of a 3D vector.',
        get_settings: function() {    
            return {
                vec_entry_range_min: -5,
                vec_entry_range_max: 5,
                vector_dimension: 3,
                single_vector_operation: 'unit'
            };
        }
    },
    {
        title: 'Unit Vector 2D-4D',
        example_problem: '\\frac{\\vec{v}}{\\left\\lVert \\vec{v} \\right\\rVert},~~\\mathbb{R}^{2-4}',
        description: 'Find the unit vector in the direction of a 2D, 3D, or 4D vector.',
        get_settings: function() {    
            return {
                vec_entry_range_min: -5,
                vec_entry_range_max: 5,
                vector_dimension: H.randInt(2, 4),
                single_vector_operation: 'unit'
            };
        }
    },
    {
        title: 'Unit Vector Of A Zero Vector (undefined)',
        example_problem: '\\widehat{\\left\\langle0,0\\right\\rangle} \\rightarrow \\mathrm{undefined}',
        description: 'Recognize that the unit vector in the direction of a zero vector is undefined.',
        get_settings: function() {    
            return {
                vec_entry_range_min: 0,
                vec_entry_range_max: 0,
                vector_dimension: H.randInt(2, 4),
                single_vector_operation: 'unit'
            };
        }
    },
]