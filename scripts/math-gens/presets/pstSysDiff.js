import * as H from '../helpers/gen-helpers.js';

export default [
    {
        title: 'Real Distinct',
        example_problem: '\\lambda_{1}, \\lambda_{2} \\in \\mathbb{R}',
        description: 'Real distinct eigenvalues and initial conditions.',
        get_settings: function() {
            return {
                sys_diff_eigenvals: 'real_dis',
                sys_diff_initcond: 'yes'
            };
        }
    },
    {
        title: 'Real Repeated',
        example_problem: `
            \\begin{array}{c}
                \\lambda \\in \\mathbb{R} \\\\
                (\\lambda - r)^{2}=0
            \\end{array}
        `,
        description: 'Real repeated eigenvalues and initial conditions.',
        get_settings: function() {
            return {
                sys_diff_eigenvals: 'real_rep',
                sys_diff_initcond: 'yes'
            };
        }
    },
    {
        title: 'Complex',
        example_problem: '\\lambda = \\alpha \\pm \\beta i',
        description: 'Complex eigenvalues and initial conditions.',
        get_settings: function() {
            return {
                sys_diff_eigenvals: 'complex',
                sys_diff_initcond: 'yes'
            };
        }
    },
    {
        title: 'Real Distinct (no IC)',
        example_problem: 'C_{1}e^{\\lambda_{1}t} + C_{2}e^{\\lambda_{2}t}',
        description: 'Real distinct eigenvalues without initial conditions.',
        get_settings: function() {
            return {
                sys_diff_eigenvals: 'real_dis',
                sys_diff_initcond: 'no'
            };
        }
    },
    {
        title: 'Real Repeated (no IC)',
        example_problem: 'e^{\\lambda t}(C_{1} + C_{2}t)',
        description: 'Real repeated eigenvalues without initial conditions.',
        get_settings: function() {
            return {
                sys_diff_eigenvals: 'real_rep',
                sys_diff_initcond: 'no'
            };
        }
    },
    {
        title: 'Complex (no IC)',
        example_problem: `~~~
            \\begin{array}{c}
                \\lambda = \\alpha \\pm \\beta i \\\\
                (C_{1}, C_{2})
            \\end{array}
        ~~~`,
        description: 'Complex eigenvalues without initial conditions.',
        get_settings: function() {
            return {
                sys_diff_eigenvals: 'complex',
                sys_diff_initcond: 'no'
            };
        }
    },
    {
        title: 'Mixed Eigenvalue Cases',
        example_problem: `~~
            \\begin{array}{c}
                \\lambda_{1},\\lambda_{2} \\;\\; \\text{or} \\\\
                (\\lambda - r)^{2} = 0 \\;\\; \\text{or} \\\\
                \\lambda=\\alpha \\pm \\beta i
            \\end{array}
        ~~`,
        description: 'Randomly selected eigenvalue type.',
        get_settings: function() {
            return {
                sys_diff_eigenvals: '__random__'
            };
        }
    },
    {
        title: 'Mixed Real Eigenvalue Cases',
        example_problem: `~~~~
            \\begin{array}{c}
                \\lambda_{1},\\lambda_{2} \\;\\; \\text{or} \\\\
                (\\lambda - r)^{2} = 0
            \\end{array}
        ~~~~`,
        description: 'Randomly selected real eigenvalue type.',
        get_settings: function() {
            return {
                sys_diff_eigenvals: H.randFromList(['real_dis', 'real_rep'])
            };
        }
    },
    {
        title: 'Degenerate Cases Allowed',
        example_problem: "~~~~~\\begin{cases} x'=ax \\\\ y'=by \\end{cases}~~~~~",
        description: 'Systems that may be degenerate (decoupled or reducible without system techniques).',
        get_settings: function() {
            return {
                sys_diff_eigenvals: H.randFromList(['real_dis', 'real_rep']),
                sys_diff_degenerate: 'yes'
            };
        }
    },
    {
        title: 'Mixed Notations and Variables',
        example_problem: `x'\\;\\;\\frac{dy}{dt}\\;\\;\\dot{x}_{2}(t)`,
        description: 'Randomly selected derivative notation, function notation, and variables.',
        get_settings: function() {
            return {
                diff_notation: '__random__',
                sys_diff_vars: '__random__',
                func_notation: '__random__'
            };
        }
    }
];