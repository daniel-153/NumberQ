import * as H from '../helpers/gen-helpers.js';

export default [
    {
        title: 'Pure Variable Random Forms',
        example_problem: 'w=\\frac{r}{g} + q',
        description: 'Random equation forms with no numerical coefficients (besides 1 and -1).',
        get_settings: function() {
            return {
                var_iso_var_letters: 'rand_lower_except',
                var_iso_eq_type: 'pure_var_random_forms',
                var_iso_num_vars: 'random',
                var_iso_solving_var: 'any'
            };
        }
    },
    {
        title: 'Random Forms With Coefficients',
        example_problem: 'n=\\frac{4v}{v+2}',
        description: 'Random equation forms with numerical coefficients allowed.',
        get_settings: function() {
            return {
                var_iso_var_letters: 'rand_lower_except',
                var_iso_eq_type: 'numerical_random_forms',
                var_iso_num_vars: 'random',
                var_iso_solving_var: 'any'
            };
        }
    },
    {
        title: 'Mixed Random Forms',
        example_problem: '-6t+3n=4a+7x',
        description: 'Equation forms with and without numerical coefficients.',
        get_settings: function() {
            return {
                var_iso_var_letters: 'rand_lower_except',
                var_iso_eq_type: H.randFromList(['pure_var_random_forms', 'numerical_random_forms']),
                var_iso_num_vars: 'random',
                var_iso_solving_var: 'any'
            };
        }
    },
    {
        title: 'Algebra Formulas',
        example_problem: 'y - y_{1}=m(x - x_{1})',
        description: 'Isolate variables in common algebra formulas.',
        get_settings: function() {
            return {
                var_iso_eq_type: 'algebra_forms',
                var_iso_num_vars: 'random',
                var_iso_solving_var: 'any',
                var_iso_match_form: 'yes',
                var_iso_allow_exponents: 'yes',
                var_iso_allow_sign_rest: 'yes'
            };
        }
    },
    {
        title: 'Geometry Formulas',
        example_problem: 'A=\\frac{bh}{2}',
        description: 'Isolate variables in common geometry formulas.',
        get_settings: function() {
            return {
                var_iso_eq_type: 'geometry_forms',
                var_iso_num_vars: 'random',
                var_iso_solving_var: 'any',
                var_iso_match_form: 'yes',
                var_iso_allow_exponents: 'yes',
                var_iso_allow_sign_rest: 'yes'
            };
        }
    },
    {
        title: 'Physics Formulas',
        example_problem: 'F_{\\small{G}}=\\frac{GmM}{r^{2}}',
        description: 'Isolate variables in common physics formulas.',
        get_settings: function() {
            return {
                var_iso_eq_type: 'physics_forms',
                var_iso_num_vars: 'random',
                var_iso_solving_var: 'any',
                var_iso_match_form: 'yes',
                var_iso_allow_exponents: 'yes',
                var_iso_allow_sign_rest: 'yes'
            };
        }
    },
    {
        title: 'Chemistry Formulas',
        example_problem: 'P_{1}V_{1}=P_{2}V_{2}',
        description: 'Isolate variables in common chemistry formulas.',
        get_settings: function() {
            return {
                var_iso_eq_type: 'chemistry_forms',
                var_iso_num_vars: 'random',
                var_iso_solving_var: 'any',
                var_iso_match_form: 'yes',
                var_iso_allow_exponents: 'yes',
                var_iso_allow_sign_rest: 'yes'
            };
        }
    },
    {
        title: 'All Subject Formulas (no exponents)',
        example_problem: 'l=\\frac{V}{wh}',
        description: 'Algebra, geometry, physics, and chemistry formulas without exponents.',
        get_settings: function() {
            return {
                var_iso_eq_type: H.randFromList(['algebra_forms', 'geometry_forms', 'physics_forms', 'chemistry_forms']),
                var_iso_num_vars: 'random',
                var_iso_solving_var: 'any',
                var_iso_match_form: 'yes',
                var_iso_allow_exponents: 'no',
                var_iso_allow_sign_rest: 'no'
            };
        }
    },
    {
        title: 'All Subject Formulas (general)',
        example_problem: 'A=2\\pi r^{2} + 2\\pi rh',
        description: 'Algebra, geometry, physics, and chemistry formulas.',
        get_settings: function() {
            return {
                var_iso_eq_type: H.randFromList(['algebra_forms', 'geometry_forms', 'physics_forms', 'chemistry_forms']),
                var_iso_num_vars: 'random',
                var_iso_solving_var: 'any',
                var_iso_match_form: 'yes',
                var_iso_allow_exponents: 'yes',
                var_iso_allow_sign_rest: 'yes'
            };
        }
    },
    {
        title: 'Any Form (random letters)',
        example_problem: 'j=\\frac{3t}{\\pi a^{2}}',
        description: 'All random forms and topic forms with random letters (no restrictions).',
        get_settings: function() {
            return {
                var_iso_var_letters: 'rand_lower_except',
                var_iso_eq_type: 'random',
                var_iso_num_vars: 'random',
                var_iso_solving_var: 'any',
                var_iso_match_form: 'no',
                var_iso_allow_exponents: 'yes',
                var_iso_allow_sign_rest: 'yes'
            };
        }
    },
]