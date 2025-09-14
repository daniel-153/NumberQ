import * as H from '../helpers/gen-helpers.js';

export default [
    {
        title: 'Add And Subtract 2D (no scalars)',
        example_problem: '\\left\\langle9,6\\right\\rangle+\\left\\langle5,2\\right\\rangle',
        description: 'Add and subtract 2D vectors without scalars.',
        get_settings: function() {    
            return {
                vec_entry_range_min: -9,
                vec_entry_range_max: 9,
                vector_dimension: 2,
                vector_operation: H.randFromList(['add', 'sub']),
                allow_scalars: 'no',
            };
        }
    },
    {
        title: 'Add And Subtract 2D (with scalars)',
        example_problem: '5\\left\\langle4,3\\right\\rangle-3\\left\\langle4,4\\right\\rangle',
        description: 'Add and subtract 2D vectors with scalars.',
        get_settings: function() {    
            return {
                vec_entry_range_min: -5,
                vec_entry_range_max: 5,
                vector_dimension: 2,
                vector_operation: H.randFromList(['add', 'sub']),
                allow_scalars: 'yes',
            };
        }
    },
    {
        title: 'Add And Subtract 3D (no scalars)',
        example_problem: '\\left\\langle2,5,2\\right\\rangle+\\left\\langle1,3,1\\right\\rangle',
        description: 'Add and subtract 3D vectors without scalars.',
        get_settings: function() {    
            return {
                vec_entry_range_min: -9,
                vec_entry_range_max: 9,
                vector_dimension: 3,
                vector_operation: H.randFromList(['add', 'sub']),
                allow_scalars: 'no',
            };
        }
    },
    {
        title: 'Add And Subtract 3D (with scalars)',
        example_problem: '3\\left\\langle3,1,2\\right\\rangle-5\\left\\langle1,5,1\\right\\rangle',
        description: 'Add and subtract 3D vectors with scalars.',
        get_settings: function() {    
            return {
                vec_entry_range_min: -5,
                vec_entry_range_max: 5,
                vector_dimension: 3,
                vector_operation: H.randFromList(['add', 'sub']),
                allow_scalars: 'yes',
            };
        }
    },
    {
        title: 'Dot Product 2D',
        example_problem: '\\left\\langle-2,2\\right\\rangle\\cdot\\left\\langle3,-2\\right\\rangle',
        description: 'Take the dot product of two 2D vectors.',
        get_settings: function() {    
            return {
                vec_entry_range_min: -5,
                vec_entry_range_max: 5,
                vector_dimension: 2,
                vector_operation: 'dot'
            };
        }
    },
    {
        title: 'Dot Product 3D',
        example_problem: '\\left\\langle3,4,4\\right\\rangle\\cdot\\left\\langle4,3,2\\right\\rangle',
        description: 'Take the dot product of two 3D vectors.',
        get_settings: function() {    
            return {
                vec_entry_range_min: -5,
                vec_entry_range_max: 5,
                vector_dimension: 3,
                vector_operation: 'dot'
            };
        }
    },
    {
        title: 'Dot Product 2D-4D',
        example_problem: '\\vec{u} \\cdot \\vec{v},~~\\mathbb{R}^{2-4}',
        description: 'Take the dot product of two 2D, 3D, or 4D vectors.',
        get_settings: function() {    
            const dimension = H.randInt(2, 4);
            
            return {
                vec_entry_range_min: (dimension === 4)? -4 : -5,
                vec_entry_range_max: (dimension === 4)? 4 : 5,
                vector_dimension: dimension,
                vector_operation: 'dot'
            };
        }
    },
    {
        title: 'Cross Product',
        example_problem: '\\left\\langle2,5,1\\right\\rangle\\times\\left\\langle2,4,0\\right\\rangle',
        description: 'Take the cross product of two 3D vectors.',
        get_settings: function() {    
            return {
                vec_entry_range_min: -5,
                vec_entry_range_max: 5,
                vector_dimension: 3,
                vector_operation: 'cross'
            };
        }
    },
    {
        title: 'Cross Product Of Zero Vectors',
        example_problem: '\\left\\langle0,0,0\\right\\rangle\\times\\left\\langle0,0,0\\right\\rangle',
        description: 'Recognize that the cross product of two zero vectors is the zero vector.',
        get_settings: function() {    
            return {
                vec_entry_range_min: 0,
                vec_entry_range_max: 0,
                vector_dimension: 3,
                vector_operation: 'cross'
            };
        }
    },
    {
        title: 'Angle Between 2D',
        example_problem: '\\theta\\left(\\left\\langle5,4\\right\\rangle,\\left\\langle0,1\\right\\rangle\\right)',
        description: 'Find the angle between two 2D vectors.',
        get_settings: function() {    
            return {
                vec_entry_range_min: -5,
                vec_entry_range_max: 5,
                vector_dimension: 2,
                vector_operation: 'angle'
            };
        }
    },
    {
        title: 'Angle Between 3D',
        example_problem: '\\theta\\left(\\left\\langle1,4,2\\right\\rangle,\\left\\langle3,1,4\\right\\rangle\\right)',
        description: 'Find the angle between two 3D vectors.',
        get_settings: function() {    
            return {
                vec_entry_range_min: -5,
                vec_entry_range_max: 5,
                vector_dimension: 3,
                vector_operation: 'angle'
            };
        }
    },
    {
        title: 'Angle Between (simple entries, 2D)',
        example_problem: '\\theta\\left(\\left\\langle0,-1\\right\\rangle,\\left\\langle1,1\\right\\rangle\\right)',
        description: 'Find the angle between two 2D vectors where all entries are either -1, 0, or 1.',
        get_settings: function() {    
            return {
                vec_entry_range_min: -1,
                vec_entry_range_max: 1,
                vector_dimension: 2,
                vector_operation: 'angle'
            };
        }
    },
    {
        title: 'Angle Between Zero Vectors (undefined)',
        example_problem: `
            \\begin{array}{c} 
            \\theta\\left(\\left\\langle0,0\\right\\rangle,\\left\\langle0,0\\right\\rangle\\right) \\\\ 
            \\downarrow \\\\
            \\mathrm{undefined} 
            \\end{array}
        `,
        description: 'Recognize that the angle between two zero vectors is undefined.',
        get_settings: function() {    
            return {
                vec_entry_range_min: 0,
                vec_entry_range_max: 0,
                vector_dimension: H.randInt(2, 3),
                vector_operation: 'angle'
            };
        }
    },
]