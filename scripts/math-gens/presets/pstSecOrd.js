import * as H from '../helpers/gen-helpers.js';

export default [
	{
		title: 'Distinct Homo.',
		example_problem: 'y\'\'+5y\'+4y',
		description: 'Homogeneous with real distinct roots.',
		get_settings: function() {
			return {
				sec_ord_roots: 'real_dis',
				sec_ord_reso: 'allow',
				force_func_form: 'zero',
				sec_ord_b_term: 'rand'
			};
		}
	},
	{
		title: 'Repeated Homo.',
		example_problem: 'y\'\'-2y\'+y',
		description: 'Homogeneous with a repeated real root.',
		get_settings: function() {
			return {
				sec_ord_roots: 'real_rep',
				sec_ord_reso: 'allow',
				force_func_form: 'zero',
				sec_ord_b_term: 'rand'
			};
		}
	},
	{
		title: 'Complex Homo.',
		example_problem: 'y\'\'+9y',
		description: 'Homogeneous with complex roots.',
		get_settings: function() {
			return {
				sec_ord_roots: 'complex',
				sec_ord_reso: 'allow',
				force_func_form: 'zero',
				sec_ord_b_term: 'rand'
			};
		}
	},
	{
		title: 'Homo. (random roots)',
		example_problem: 'y\'\'+by\'+cy',
		description: 'Homogeneous with random root type.',
		get_settings: function() {
			return {
				sec_ord_roots: '__random__',
				force_func_form: 'zero',
				sec_ord_reso: 'allow',
				sec_ord_b_term: 'rand'
			};
		}
	},
	{
		title: 'Distinct (random forcing)',
		example_problem: `
		\\begin{array}{c}
			y''+by'+cy=\\:? \\\\
			r_{1},r_{2} \\in \\mathbb{R}
		\\end{array}
		`,
		description: 'Real distinct roots with random forcing.',
		get_settings: function() {
			return {
				sec_ord_roots: 'real_dis',
				force_func_form: H.randFromList(['constant', 'et_alone', 'sin_alone', 'cos_alone', 'tn_alone']),
				sec_ord_reso: 'allow',
				sec_ord_b_term: 'rand'
			};
		}
	},
	{
		title: 'Repeated (random forcing)',
		example_problem: `
		\\begin{array}{c}
			y''+by'+cy=\\:? \\\\
			r_{1} \\in \\mathbb{R}
		\\end{array}
		`,
		description: 'Repeated real root with random forcing.',
		get_settings: function() {
			return {
				sec_ord_roots: 'real_rep',
				force_func_form: H.randFromList(['constant', 'et_alone', 'sin_alone', 'cos_alone', 'tn_alone']),
				sec_ord_reso: 'allow',
				sec_ord_b_term: 'rand'
			};
		}
	},
	{
		title: 'Complex (random forcing)',
		example_problem: `
		\\begin{array}{c}
			y''+by'+cy=\\:? \\\\
			r_{1},r_{2} \\in \\mathbb{C}
		\\end{array}
		`,
		description: 'Complex roots with random forcing.',
		get_settings: function() {
			return {
				sec_ord_roots: 'complex',
				force_func_form: H.randFromList(['constant', 'et_alone', 'sin_alone', 'cos_alone', 'tn_alone']),
				sec_ord_reso: 'allow',
				sec_ord_b_term: 'rand'
			};
		}
	},
	{
		title: 'Random Roots & Forcing',
		example_problem: 'y\'\'+by\'+cy=?',
		description: 'Random roots and random forcing.',
		get_settings: function() {
			return {
				sec_ord_roots: '__random__',
				force_func_form: H.randFromList(['constant', 'et_alone', 'sin_alone', 'cos_alone', 'tn_alone']),
				sec_ord_reso: 'allow',
				sec_ord_b_term: 'rand'
			};
		}
	},
	{
		title: 'Real Resonant',
		example_problem: `
		~~~~\\begin{array}{c}
			\\mathrm{roots} \\in \\mathbb{R} \\\\
			\\mathrm{[resonant]}
		\\end{array}~~~~
		`,
		description: 'Resonant cases with real roots.',
		get_settings: function() {		
			return {
				sec_ord_roots: H.randFromList(['real_dis', 'real_rep']),
				force_func_form: H.randFromList(['constant', 'et_alone', 'tn_alone']),
				sec_ord_reso: 'prefer',
				sec_ord_b_term: 'rand'
			};
		}
	},
	{
		title: 'Complex Resonant',
		example_problem: `
		~~\\begin{array}{c}
			\\mathrm{roots} \\in \\mathbb{C} \\\\
			\\mathrm{[resonant]}
		\\end{array}~~
		`,
		description: 'Resonant cases with complex roots.',
		get_settings: function() {
			return {
				sec_ord_roots: 'complex',
				force_func_form: H.randFromList(['sin_alone', 'cos_alone', 'e_and_sin', 'e_and_cos']),
				sec_ord_reso: 'prefer',
				sec_ord_b_term: 'rand'
			};
		}
	},
	{
		title: 'Mixed Resonance',
		example_problem: `
		~~~~\\begin{array}{c}
			\\mathrm{roots} \\in \\:? \\\\
			\\mathrm{[resonant]}
		\\end{array}~~~~
		`,
		description: 'Resonant cases with mixed root types.',
		get_settings: function() {
			const root_type = H.randFromList(['real_dis', 'real_rep', 'complex']);
			let forcing_type;
			if (root_type === 'complex') {
				forcing_type = H.randFromList(['sin_alone', 'cos_alone', 'e_and_sin', 'e_and_cos']);
			}
			else forcing_type = H.randFromList(['constant', 'et_alone', 'tn_alone', 'tn_and_e']);
			
			return {
				sec_ord_roots: root_type,
				force_func_form: forcing_type,
				sec_ord_reso: 'prefer',
				sec_ord_b_term: 'rand'
			};
		}
	},
	{
		title: 'Constant Forcing',
		example_problem: 'f(t)=C',
		description: 'Constant forcing function.',
		get_settings: function() {
			return {
				sec_ord_roots: '__random__',
				force_func_form: 'constant',
				sec_ord_reso: 'allow',
				sec_ord_b_term: 'rand'
			};
		}
	},
	{
		title: 'Exponential Forcing',
		example_problem: 'f(t)=e^{\\lambda t}',
		description: 'Pure exponential forcing.',
		get_settings: function() {
			return {
				sec_ord_roots: '__random__',
				force_func_form: 'et_alone',
				sec_ord_reso: 'allow',
				sec_ord_b_term: 'rand'
			};
		}
	},
	{
		title: 'Trigonometric Forcing',
		example_problem: 'f(t)=\\sin(\\omega t)',
		description: 'Pure trig forcing (sin or cos).',
		get_settings: function() {
			return {
				sec_ord_roots: '__random__',
				force_func_form: H.randFromList(['sin_alone', 'cos_alone']),
				sec_ord_reso: 'allow',
				sec_ord_b_term: 'rand'
			};
		}
	},
	{
		title: 'Polynomial Forcing',
		example_problem: 'f(t)=t^{n}',
		description: 'Pure polynomial forcing.',
		get_settings: function() {
			return {
				sec_ord_roots: '__random__',
				force_func_form: 'tn_alone',
				sec_ord_reso: 'allow',
				sec_ord_b_term: 'rand'
			};
		}
	},
	{
		title: 'Basic Forcing',
		example_problem: 'f(t)=\\mathrm{[basic]}',
		description: 'Basic forcing functions and resonance avoided.',
		get_settings: function() {
			return {
				sec_ord_roots: '__random__',
				force_func_form: H.randFromList(['constant', 'et_alone', 'sin_alone', 'cos_alone']),
				sec_ord_reso: 'avoid',
				sec_ord_b_term: 'rand'
			};
		}
	},
	{
		title: 'Challenging Forcing',
		example_problem: 'f(t)=\\mathrm{[challenge]}',
		description: 'Challenging forcing functions and possible resonance.',
		get_settings: function() {
			return {
				sec_ord_roots: '__random__',
				force_func_form: H.randFromList(['tn_alone', 'e_and_sin', 'e_and_cos', 'tn_and_e']),
				sec_ord_reso: H.randFromList(['allow', 'prefer']),
				sec_ord_b_term: 'rand'
			};
		}
	},
	{
		title: 'Real Homo. (no y\')',
		example_problem: 'y\'\'-r^{2}y',
		description: 'Homogeneous equations with real roots and no first derivative term.',
		get_settings: function() {
			return {
				sec_ord_roots: 'real_dis',
				force_func_form: 'zero',
				sec_ord_reso: 'allow',
				sec_ord_b_term: 'zero'
			};
		}
	},
	{
		title: 'Complex Homo. (no y\')',
		example_problem: 'y\'\'+r^{2}y',
		description: 'Homogeneous equations with complex roots and no first derivative term.',
		get_settings: function() {
			return {
				sec_ord_roots: 'complex',
				force_func_form: 'zero',
				sec_ord_reso: 'allow',
				sec_ord_b_term: 'zero'
			};
		}
	}
];