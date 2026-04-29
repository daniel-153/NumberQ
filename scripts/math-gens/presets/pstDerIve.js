import * as H from '../helpers/gen-helpers.js';

export default [
	{
		title: 'Basic Functions',
		example_problem: '~~~~~\\begin{array}{c}x^{2}~~\\ln(x)\\\\ \\sin(x)~~e^{x}\\end{array}~~~~~',
		description: 'Constant, polynomial, trig, and other basic functions.',
		get_settings: function() {
			return {
				func_op: 'none',
				diff_funcs: [
					'constant', 'identity', 'const_mul', 'linear', 'int_power', 'e_x',
                    'basic_trig', 'ln', 'quadratic'
				]
			};
		}
	},
	{
		title: 'Intermediate Functions',
		example_problem: '\\begin{array}{c}\\tan(x)~~2^{x}\\\\ x^{\\frac{1}{3}}~~\\sin^{-1}(x)\\end{array}',
		description: 'Reciprocal trig, fractional powers, absolute value, and other intermediate functions.',
		get_settings: function() {
			return {
				func_op: 'none',
				diff_funcs: [
					'advan_trig', 'sqrt', 'recip', 'frac_power',
                    'a_x', 'abs', 'inv_trig'
				]
			};
		}
	},
	{
		title: 'Advanced Functions',
		example_problem: '\\begin{array}{c}\\sqrt[3]{x}~~\\cot^{-1}(x)\\\\ \\log_{6}(x)~~\\cosh(x)\\end{array}',
		description: 'Hyperbolic trig, n-th roots, general base logs, and other advanced functions.',
		get_settings: function() {
			return {
				func_op: 'none',
				diff_funcs: [
					'nroot', 'log_a_x', 'co_inv_trig', 'hyper_trig', 'inv_hyper_trig'
				]
			};
		}
	},
	{
		title: 'Power Rule',
		example_problem: '~~~~x^{n}~~x^{\\frac{p}{q}}~~~~',
		description: 'Power rule with an integer or fractional exponent.',
		get_settings: function() {
			const funcs = [H.randFromList(['int_power', 'frac_power'])];
            let op = 'none';
            if (H.randInt(0, 1)) {
                funcs.push('constant');
                op = 'mul';
            }
            return {
				func_op: op,
				diff_funcs: funcs
			};
		}
	},
	{
		title: 'Sum Rule',
		example_problem: 'f(x)\\pm g(x)',
		description: 'Sums or differences of common functions.',
		get_settings: function() {
			return {
				func_op: 'sum',
				diff_funcs: [
					'constant', 'identity', 'const_mul', 'linear',
					'int_power', 'quadratic', 'e_x',
					'basic_trig', 'sqrt', 'ln', 'recip',
					'frac_power','abs'
				]
			};
		}
	},
	{
		title: 'Product Rule',
		example_problem: "f(x)g(x)",
		description: 'Products of common functions.',
		get_settings: function() {
			return {
				func_op: 'mul',
				diff_funcs: [
					'linear','int_power', 'quadratic', 'e_x',
					'basic_trig', 'sqrt', 'ln',
					'frac_power','abs', 'inv_trig', 'advan_trig' 
				]
			};
		}
	},
	{
		title: 'Quotient Rule',
		example_problem: '~~~~~~~\\dfrac{f(x)}{g(x)}~~~~~~~',
		description: 'Quotients of common functions.',
		get_settings: function() {
			return {
				func_op: 'div',
				diff_funcs: [
					'identity', 'const_mul', 'linear',
					'int_power', 'quadratic', 'e_x',
					'basic_trig', 'sqrt', 'ln',
					'frac_power','abs'
				]
			};
		}
	},
	{
		title: 'Chain Rule',
		example_problem: 'f(g(x))',
		description: 'Compositions of common functions.',
		get_settings: function() {
			return {
				func_op: 'chain',
				diff_funcs: [
					'int_power', 'e_x', 'basic_trig', 'advan_trig',
                    'sqrt', 'ln', 'recip', 'abs', 'inv_trig'
				]
			};
		}
	},
	{
		title: 'Polynomial',
		example_problem: '~~~\\begin{array}{c}x^2-2x+5\\\\ x^2(x-3)\\end{array}~~~',
		description: 'Polynomial and constant functions, including sums and products.',
		get_settings: function() {
			return {
				func_op: H.randFromList(['sum', 'mul', 'none']),
				diff_funcs: [
					'constant', 'identity', 'const_mul', 'linear', 'quadratic'
				]
			};
		}
	},
	{
		title: 'Exp and Log',
		example_problem: '~~~\\begin{array}{c}e^x~~\\ln(x)\\\\ \\log_{4}(x)~~9^{x}\\end{array}~~~',
		description: 'Exponentials and logarithms, natural or any base.',
		get_settings: function() {
			return {
				func_op: H.randFromList(['any', 'none']),
				diff_funcs: ['e_x', 'a_x', 'ln', 'log_a_x']
			};
		}
	},
	{
		title: 'Trig',
		example_problem: '\\begin{array}{c}\\sin(x)~~\\csc^{-1}(x)\\\\ \\tan^{-1}(x)~~\\sec(x)\\end{array}',
		description: 'All trig function types, including inverses.',
		get_settings: function() {
			return {
				func_op: H.randFromList(['any', 'none']),
				diff_funcs: ['basic_trig', 'advan_trig', 'inv_trig', 'co_inv_trig']
			};
		}
	},
	{
		title: 'Challenge',
		example_problem: '\\dfrac{\\sec^{-1}(x)}{|x|}~~\\log_{2}(x^{\\frac{7}{6}})',
		description: 'Less common functions with product, quotient, or chain rules.',
		get_settings: function() {
			return {
				func_op: H.randFromList(['mul', 'div', 'chain']),
				diff_funcs: [
					'advan_trig', 'inv_trig', 'co_inv_trig',
					'frac_power', 'nroot', 'log_a_x', 'a_x',
					'abs', 'hyper_trig', 'inv_hyper_trig'
				]
			};
		}
	}
];