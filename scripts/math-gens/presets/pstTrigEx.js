import * as H from '../helpers/gen-helpers.js';

export default [
    {
        title: 'Sine, Positive Angles In Radians',
        example_problem: '\\sin\\left(\\frac{\\pi}{4}\\right)',
        description: 'Sine values in [0,&nbsp;2&pi;].',
        get_settings: function() {
            return {
                angular_unit: 'radians',
                argument_sign: 'positive',
                trig_function_types: ['sine']
            };
        }
    },
    {
        title: 'Cosine, Positive Angles In Radians',
        example_problem: '\\cos\\left(\\frac{7\\pi}{4}\\right)',
        description: 'Cosine values in [0,&nbsp;2&pi;].',
        get_settings: function() {
            return {
                angular_unit: 'radians',
                argument_sign: 'positive',
                trig_function_types: ['cosine']
            };
        }
    },
    {
        title: 'Sine, Negative Angles In Radians',
        example_problem: '\\sin\\left(-\\frac{3\\pi}{2}\\right)',
        description: 'Sine values in [-2&pi;,&nbsp;0].',
        get_settings: function() {
            return {
                angular_unit: 'radians',
                argument_sign: 'negative',
                trig_function_types: ['sine']
            };
        }
    },
    {
        title: 'Cosine, Negative Angles In Radians',
        example_problem: '\\cos\\left(-\\frac{\\pi}{3}\\right)',
        description: 'Cosine values in [-2&pi;,&nbsp;0].',
        get_settings: function() {
            return {
                angular_unit: 'radians',
                argument_sign: 'negative',
                trig_function_types: ['cosine']
            };
        }
    },
    {
        title: 'Sine Or Cosine (Mixed Radian Angles)',
        example_problem: `
        \\begin{array}{c}
            \\sin\\left([-2\\pi,\\,2\\pi]\\right) \\\\
            \\cos\\left([-2\\pi,\\,2\\pi]\\right)
        \\end{array}
        `,
        description: 'Sine or cosine values in [-2&pi;,&nbsp;2&pi;].',
        get_settings: function() {
            return {
                angular_unit: 'radians',
                argument_sign: '__random__',
                trig_function_types: ['sine', 'cosine']
            };
        }
    },
    {
        title: 'Sine, Positive Angles In Degrees',
        example_problem: '\\sin\\left(60^\\circ\\right)',
        description: 'Sine values in [0,&nbsp;360&deg;].',
        get_settings: function() {
            return {
                angular_unit: 'degrees',
                argument_sign: 'positive',
                trig_function_types: ['sine']
            };
        }
    },
    {
        title: 'Cosine, Positive Angles In Degrees',
        example_problem: '\\cos\\left(135^\\circ\\right)',
        description: 'Cosine values in [0,&nbsp;360&deg;].',
        get_settings: function() {
            return {
                angular_unit: 'degrees',
                argument_sign: 'positive',
                trig_function_types: ['cosine']
            };
        }
    },
    {
        title: 'Sine, Negative Angles In Degrees',
        example_problem: '\\sin\\left(-45^\\circ\\right)',
        description: 'Sine values in [-360&deg;,&nbsp;0].',
        get_settings: function() {
            return {
                angular_unit: 'degrees',
                argument_sign: 'negative',
                trig_function_types: ['sine']
            };
        }
    },
    {
        title: 'Cosine, Negative Angles In Degrees',
        example_problem: '\\cos\\left(-180^\\circ\\right)',
        description: 'Cosine values in [-360&deg;,&nbsp;0].',
        get_settings: function() {
            return {
                angular_unit: 'degrees',
                argument_sign: 'negative',
                trig_function_types: ['cosine']
            };
        }
    },
    {
        title: 'Sine Or Cosine (Mixed Degree Angles)',
        example_problem: `
        \\begin{array}{c}
            \\sin\\left([-360^\\circ,\\,360^\\circ]\\right) \\\\
            \\cos\\left([-360^\\circ,\\,360^\\circ]\\right)
        \\end{array}
        `,
        description: 'Sine or cosine values in [-360&deg;,&nbsp;360&deg;].',
        get_settings: function() {
            return {
                angular_unit: 'degrees',
                argument_sign: '__random__',
                trig_function_types: ['sine', 'cosine']
            };
        }
    },
    {
        title: 'Tangent Values (Radians)',
        example_problem: '\\tan\\left(\\frac{11\\pi}{6}\\right)',
        description: 'Tangent values in [0,&nbsp;2&pi;].',
        get_settings: function() {
            return {
                angular_unit: 'radians',
                argument_sign: 'positive',
                trig_function_types: ['tangent']
            };
        }
    },
    {
        title: 'Tangent Values (Degrees)',
        example_problem: '\\tan\\left(135^\\circ\\right)',
        description: 'Tangent values in [0,&nbsp;360&deg;].',
        get_settings: function() {
            return {
                angular_unit: 'degrees',
                argument_sign: 'positive',
                trig_function_types: ['tangent']
            };
        }
    },
    {
        title: 'Sine, Cosine, or Tangent (Radians)',
        example_problem: `
            \\begin{array}{c}
                ~~\\sin\\left([0,\\,2\\pi]\\right)~~ \\\\
                \\cos\\left([0,\\,2\\pi]\\right) \\\\
                \\tan\\left([0,\\,2\\pi]\\right)
            \\end{array}
        `,
        description: 'Sine, cosine, or tangent values in [0,&nbsp;2&pi;].',
        get_settings: function() {
            return {
                angular_unit: 'radians',
                argument_sign: 'positive',
                trig_function_types: '__random__'
            };
        }
    },
    {
        title: 'Sine, Cosine, or Tangent (Degrees)',
        example_problem: `
            \\begin{array}{c}
                \\sin\\left([0^\\circ,\\,360^\\circ]\\right) \\\\
                \\cos\\left([0^\\circ,\\,360^\\circ]\\right) \\\\
                \\tan\\left([0^\\circ,\\,360^\\circ]\\right)
            \\end{array}
        `,
        description: 'Sine, cosine, or tangent values in [0,&nbsp;360&deg;].',
        get_settings: function() {
            return {
                angular_unit: 'degrees',
                argument_sign: 'positive',
                trig_function_types: '__random__'
            };
        }
    },
]