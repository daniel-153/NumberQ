import * as H from '../helpers/gen-helpers.js';
import * as DH from '../helpers/diff-helpers.js';

export function validateSettings(form_obj, error_locations) {}

const DIH  = { // genDerIve helpers
    funcs: {
        constant: x => DH.integer(H.randIntExcept(-5, 5, 0)),
        identity: x => x,
        const_mul: x => DH.mul(DIH.funcs.constant(x), x),
        linear: x => DH.add(DIH.funcs.const_mul(x), DIH.funcs.constant(x)),
        int_power: x => DH.pow(x, DH.integer(H.randFromList(H.removeFromArray([0, 1], H.integerArray(-5, 5))))),
        e_x: x => DH.exp(x),
        quadratic: x => {
            let a;
            if (H.randInt(0, 1)) a = DH.integer(1);
            else a = DH.integer(H.randFromList(H.removeFromArray([0, 1], H.integerArray(-5, 5))));

            let b;
            if (!H.randInt(0, 2)) b = DH.integer(0);
            else b = DH.integer(H.randIntExcept(-5, 5, 0));

            let c = DH.integer(H.randInt(-5, 5));

            return DH.add(DH.mul(a, DH.pow(x, DH.integer(2))), DH.mul(b, x), c);
        },
        basic_trig: x => H.randInt(0, 1) ? DH.sin(x) : DH.cos(x),
        advan_trig: x => {
            let switcher = H.randInt(0, 3);
            if (switcher === 0) return DH.tan(x);
            else if (switcher === 1) return DH.sec(x);
            else if (switcher === 2) return DH.csc(x);
            else return DH.cot(x);
        },
        sqrt: x => DH.sqrt(x),
        ln: x => DH.ln(x),
        recip: x => DH.frac(DH.integer(1), x),
        frac_power: x => {
            let n;
            let d;
            do {
                n = H.randInt(1, 7);
                d = H.randInt(2, 7);
                const gcd = (function (a, b) {
                    while (b) {
                        let t = b;
                        b = a % b;
                        a = t;
                    }
                    return a;
                })(n, d);

                n /= gcd;
                d /= gcd;
            } while (d === 1);

            let pow = DH.frac(DH.integer(n), DH.integer(d));
            if (H.randInt(0, 1)) pow = DH.mul(DH.integer(-1), pow);

            return DH.pow(x, pow);
        },
        nroot: x => DH.root(DH.integer(H.randInt(3, 7)), x),
        a_x: x => DH.pow(DH.integer(H.randInt(2, 9)), x),
        log_a_x: x => DH.log(DH.integer(H.randInt(2, 9)), x),
        abs: x => DH.abs(x),
        inv_trig: x => {
            const switcher = H.randInt(0, 2);
            if (switcher === 0) return DH.asin(x);
            else if (switcher === 1) return DH.acos(x);
            else return DH.atan(x);
        },
        co_inv_trig: x => {
            const switcher = H.randInt(0, 2);
            if (switcher === 0) return DH.asec(x);
            else if (switcher === 1) return DH.acsc(x);
            else return DH.acot(x);
        },
        basic_hyper_trig: x => H.randInt(0, 1) ? DH.sinh(x) : DH.cosh(x),
        advan_hyper_trig: x => {
            let switcher = H.randInt(0, 3);
            if (switcher === 0) return DH.tanh(x);
            else if (switcher === 1) return DH.sech(x);
            else if (switcher === 2) return DH.csch(x);
            else return DH.coth(x);
        },
        inv_hyper_trig: x => {
            const switcher = H.randInt(0, 2);
            if (switcher === 0) return DH.asinh(x);
            else if (switcher === 1) return DH.acosh(x);
            else return DH.atanh(x);
        },
        co_inv_hyper_trig: x => {
            const switcher = H.randInt(0, 2);
            if (switcher === 0) return DH.asech(x);
            else if (switcher === 1) return DH.acsch(x);
            else return DH.acoth(x);
        }
    },
    ops: {
        sum: (a, b) => H.randInt(0, 1) ? DH.add(a, b) : DH.sub(a, b),
        mul: (a, b) => DH.mul(a, b),
        div: (a, b) => DH.frac(a, b),
        chain: (a, b) => DH.compose(a, b)
    },
    getRandFunc(settings) {
        const chosen_func = H.randFromList(settings.diff_funcs);
        return chosen_func === 'any' ? H.randFromList(Object.keys(DIH.funcs)) : chosen_func;
    },
    getRandOp(settings) {
        if (settings.func_op === 'any') return H.randFromList(Object.keys(DIH.ops));
        else if (settings.func_op === 'none') return null;
        else return settings.func_op;
    },
    buildPromptExpr(settings) {
        const chosen_op = DIH.getRandOp(settings);
        if (chosen_op) return (x) => DIH.ops[chosen_op](DIH.funcs[DIH.getRandFunc(settings)](x), DIH.funcs[DIH.getRandFunc(settings)](x));
        else return (x) => DIH.funcs[DIH.getRandFunc(settings)](x)
    },
    getDiffOpStr(settings, ind_var, dep_var) {
        if (settings.expr_diff_notation === 'func') return `${dep_var}'\\left(${ind_var}\\right)`;
        else return settings.expr_diff_notation === 'implicit' ? `\\frac{d${dep_var}}{d${ind_var}}` : `\\dfrac{d}{d${ind_var}}`;
    },
    getPromptStr(settings, func_str, diff_op_str) {
        if (settings.expr_diff_notation === 'oper_brac') return `${diff_op_str}\\left[${func_str}\\right]`;
        else if (settings.expr_diff_notation === 'oper_paren') return `${diff_op_str}\\left(${func_str}\\right)`;
        else {
            let lhs;
            if (settings.expr_diff_notation === 'func') lhs = `${settings.diff_eq_vars.split('_').join('\\left(')}\\right)`;
            else if (settings.expr_diff_notation === 'implicit') lhs = settings.diff_eq_vars.split('_')[0];

            return `${lhs}=${func_str},~~${diff_op_str}=\\:?`;
        }
    },
    getAnswerStr(settings, diff_func_str, diff_op_str) {
        if (
            settings.expr_diff_notation === 'func' ||
            settings.expr_diff_notation === 'implicit'
        ) return `${diff_op_str}=${diff_func_str}`;
        else return diff_func_str;
    },
    wrapForNesting(target_str, expr) {
        return DH.Expr.getMaxNesting(expr) >= 3 ? `\\displaystyle{${target_str}}` : target_str;
    }
};
export default function genDerIve(settings) {
    const [dep_var, ind_var] = settings.diff_eq_vars.split('_');
    const ind_var_sym = DH.variable(ind_var);
    const func = DIH.buildPromptExpr(settings)(ind_var_sym).trim();
    const diff_func = func.diff(ind_var_sym).trim();
    const func_str = func.toString();
    const diff_func_str = diff_func.toString();
    const diff_op_str = DIH.getDiffOpStr(settings, ind_var, dep_var);
    const prompt_str = DIH.wrapForNesting(DIH.getPromptStr(settings, func_str, diff_op_str), func);
    const answer_str = DIH.wrapForNesting(DIH.getAnswerStr(settings, diff_func_str, diff_op_str), diff_func);

    return {
        question: prompt_str,
        answer: answer_str
    };
}

export const settings_fields = [
    'func_op',
    'diff_funcs',
    'expr_diff_notation',
    'diff_eq_vars'
];

export const presets = {
    default: function() {
        return {
            func_op: 'none',
            diff_funcs: ['any'],
            expr_diff_notation: 'oper_paren',
            diff_eq_vars: 'y_x'
        };
    },
    random: function() {
        return {
            func_op: '__random__',
            diff_funcs: [
                'any', 'constant', 'identity', 'const_mul', 'linear', 'int_power', 'e_x', 'quadratic', 'basic_trig', 
                'advan_trig', 'sqrt', 'ln', 'recip', 'frac_power', 'nroot', 'a_x', 'log_a_x', 'abs', 'inv_trig', 
                'co_inv_trig', 'basic_hyper_trig', 'advan_hyper_trig', 'inv_hyper_trig', 'co_inv_hyper_trig'
            ].filter(_ => H.randInt(0, 1)),
            expr_diff_notation: '__random__',
            diff_eq_vars: '__random__'
        };
    },
    has_topic_presets: true
};

export const size_adjustments = {
    width: 1.25,
    height: 1.4,
    present: {
        canvas: {
            max_width: 0.5,
            max_height: 0.2,
            init_scale: 0.85
        },
        preview: {
            max_width: 0.5,
            max_height: 0.2,
            init_scale: 0.85
        },
        answer: {
            max_size_scale: 4.5,
            init_scale: 1.5
        }
    }
};