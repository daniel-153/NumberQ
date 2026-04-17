import * as H from '../helpers/gen-helpers.js';
import * as FH from '../helpers/func-helpers.js';

export function validateSettings(form_obj, error_locations) {}

const DIH  = { // genDerIve helpers
    funcs: {
        constant: x => FH.integer(H.randIntExcept(-5, 5, 0)),
        identity: x => FH.identity(x),
        const_mul: x => FH.mul(DIH.funcs.constant(x), x),
        linear: x => FH.add(DIH.funcs.const_mul(x), DIH.funcs.constant(x)),
        int_power: x => FH.pow(x, FH.integer(H.randFromList(H.removeFromArray([0, 1], H.integerArray(-5, 5))))),
        e_x: x => FH.exp(x),
        quadratic: x => {
            let a;
            if (H.randInt(0, 1)) a = FH.integer(1);
            else a = FH.integer(H.randFromList(H.removeFromArray([0, 1], H.integerArray(-5, 5))));

            let b;
            if (!H.randInt(0, 2)) b = FH.integer(0);
            else b = FH.integer(H.randIntExcept(-5, 5, 0));

            let c = FH.integer(H.randInt(-5, 5));

            return FH.add(FH.mul(a, FH.pow(x, FH.integer(2))), FH.mul(b, x), c);
        },
        basic_trig: x => H.randInt(0, 1) ? FH.sin(x) : FH.cos(x),
        advan_trig: x => {
            let switcher = H.randInt(0, 3);
            if (switcher === 0) return FH.tan(x);
            else if (switcher === 1) return FH.sec(x);
            else if (switcher === 2) return FH.csc(x);
            else return FH.cot(x);
        },
        sqrt: x => FH.sqrt(x),
        ln: x => FH.ln(x),
        recip: x => FH.frac(FH.integer(1), x),
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

            let pow = FH.rational(n, d);
            if (H.randInt(0, 1)) pow = FH.mul(FH.integer(-1), pow);

            return FH.pow(x, pow);
        },
        polynom: x => {
            const degree = H.randInt(1, 4);
            const terms = [];
            for (let n = degree; n >= 0; n--) {
                let coef;
                if (n === degree) coef = H.randIntExcept(-5, 5, 0);
                else coef = H.randInt(-5, 5);
                terms.push(FH.mul(FH.integer(coef), FH.pow(x, FH.integer(n))));
            }
            return FH.add.apply({}, terms);
        },
        nroot: x => FH.nroot(FH.integer(H.randInt(3, 7)), x),
        a_x: x => FH.pow(FH.integer(H.randInt(2, 9)), x),
        log_a_x: x => FH.logn(FH.integer(H.randInt(2, 9)), x),
        abs: x => FH.abs(x),
        inv_trig: x => {
            const switcher = H.randInt(0, 2);
            if (switcher === 0) return FH.asin(x);
            else if (switcher === 1) return FH.acos(x);
            else return FH.atan(x);
        },
        co_inv_trig: x => {
            const switcher = H.randInt(0, 2);
            if (switcher === 0) return FH.asec(x);
            else if (switcher === 1) return FH.acsc(x);
            else return FH.acot(x);
        },
        basic_hyper_trig: x => H.randInt(0, 1) ? FH.sinh(x) : FH.cosh(x),
        advan_hyper_trig: x => {
            let switcher = H.randInt(0, 3);
            if (switcher === 0) return FH.tanh(x);
            else if (switcher === 1) return FH.sech(x);
            else if (switcher === 2) return FH.csch(x);
            else return FH.coth(x);
        },
        inv_hyper_trig: x => {
            const switcher = H.randInt(0, 2);
            if (switcher === 0) return FH.asinh(x);
            else if (switcher === 1) return FH.acosh(x);
            else return FH.atanh(x);
        },
        co_inv_hyper_trig: x => {
            const switcher = H.randInt(0, 2);
            if (switcher === 0) return FH.asech(x);
            else if (switcher === 1) return FH.acsch(x);
            else return FH.acoth(x);
        }
    },
    ops: {
        sum: (a, b) => H.randInt(0, 1) ? FH.add(a, b) : FH.sub(a, b),
        mul: (a, b) => FH.mul(a, b),
        div: (a, b) => FH.frac(a, b),
        chain: (a, b) => FH.compose(a, b)
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
        if (settings.expr_diff_notation === 'func') {
            const order = settings.diff_order === 'second' ? 2 : 1;
            return `${dep_var}${"'".repeat(order)}\\left(${ind_var}\\right)`;
        }
        else return `\\dfrac{d${settings.expr_diff_notation === 'implicit' ? dep_var : ''}}{d${ind_var}}`;
    },
    getPromptStr(settings, func_str, diff_op_str) {
        if (settings.expr_diff_notation === 'oper_brac') return `${diff_op_str}\\left[${func_str}\\right]`;
        else if (settings.expr_diff_notation === 'oper_paren') return `${diff_op_str}\\left(${func_str}\\right)`;
        else {
            let lhs;
            if (settings.expr_diff_notation === 'func') lhs = `${settings.diff_eq_vars.split('_').join('\\left(')}\\right)`;
            else if (settings.expr_diff_notation === 'implicit') lhs = settings.diff_eq_vars.split('_')[0];

            return `${lhs}=${func_str},~${diff_op_str}=\\:?`;
        }
    },
    getAnswerStr(settings, diff_func_str, diff_op_str) {
        if (
            settings.expr_diff_notation === 'func' ||
            settings.expr_diff_notation === 'implicit'
        ) return `${diff_op_str}=${diff_func_str}`;
        else return diff_func_str;
    }
};
export default function genDerIve(settings) {
    const [dep_var, ind_var] = settings.diff_eq_vars.split('_');
    const ind_var_sym = new FH.Symb(ind_var);
    const func = DIH.buildPromptExpr(settings)(ind_var_sym);
    const diff_func = func.diff(ind_var_sym);
    const func_str = func.trim().toString();
    const diff_func_str = diff_func.trim().toString();
    const diff_op_str = DIH.getDiffOpStr(settings, ind_var, dep_var);
    const prompt_str = DIH.getPromptStr(settings, func_str, diff_op_str);
    const answer_str = DIH.getAnswerStr(settings, diff_func_str, diff_op_str);

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
            diff_funcs: ['constant', 'identity', 'const_mul', 'linear', 'int_power', 'e_x', 'basic_trig'],
            expr_diff_notation: 'oper_paren',
            diff_eq_vars: 'y_x'
        };
    },
    random: function() {
        return {
            
        };
    },
    // has_topic_presets: true
};

export const size_adjustments = {
    width: 1.25,
    height: 1.4,
    present: {
        canvas: {
            max_width: 0.5,
            max_height: 0.2,
            init_scale: 0.6
        },
        preview: {
            max_width: 0.5,
            max_height: 0.2,
            init_scale: 0.6
        },
        answer: {
            max_size_scale: 4.5,
            init_scale: 0.9
        }
    }
};