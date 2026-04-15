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
    getRandOpOrder(settings) {
        const op_list = [];
        ['sum_count', 'mul_count', 'div_count', 'chain_count'].forEach(op_count_field => {
            const op_count = settings[op_count_field];
            const op_name = op_count_field.split('_')[0];
            for (let i  = 0; i < op_count; i++) op_list.push(op_name);
        });
        return H.randomizeList(op_list);
    },
    getRandFuncOrder(settings, num_ops) {
        const possible_funcs = settings.diff_funcs;
        const chosen_funcs = [];
        for (let i = 0; i < num_ops + 1; i++) {
            chosen_funcs.push(H.randFromList(possible_funcs));
        }
        return chosen_funcs;
    },
    buildRandTree(op_order, func_order) {
        const nodes = [[func_order[0]]];
        for (let i = 0; i < op_order.length; i++) {
            const op = op_order[i];
            const func_node = [func_order[i + 1]];
            const chosen_node = H.randFromList(nodes);
            const cut_node = chosen_node.length === 1 ? [chosen_node[0]] : [chosen_node[0], chosen_node[1], chosen_node[2]];

            chosen_node.length = 0;
            if (H.randInt(0, 1)) chosen_node.push(cut_node, op, func_node);
            else chosen_node.push(func_node, op, cut_node);
            nodes.push(cut_node, func_node);
        }
        return nodes[0];
    },
    treeToFunc(tree, sym = new FH.Symb('x')) {
        if (tree.length === 1) return DIH.funcs[tree[0]](sym);
        else return DIH.ops[tree[1]](DIH.treeToFunc(tree[0], sym), DIH.treeToFunc(tree[2], sym));
    },
    getDiffOpStr(settings, ind_var, dep_var) {
        if (settings.expr_diff_notation === 'func') {
            const order = settings.diff_order === 'second' ? 2 : 1;
            return `${dep_var}${"'".repeat(order)}(${ind_var})`;
        }
        else {
            let num = 'd';
            let den = `d${ind_var}`;
            if (settings.diff_order === 'second') {
                num += '^{2}';
                den += '^{2}';
            }
            if (settings.expr_diff_notation === 'implicit') num += dep_var;

            return `\\dfrac{${num}}{${den}}`;
        }
    },
    getPromptStr(settings, func_str, diff_op_str) {
        if (settings.expr_diff_notation === 'oper_brac') return `${diff_op_str}[${func_str}]`;
        else if (settings.expr_diff_notation === 'oper_paren') return `${diff_op_str}(${func_str})`;
        else {
            let lhs;
            if (settings.expr_diff_notation === 'func') lhs = `${settings.diff_eq_vars.split('_').join('(')})`;
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
    const op_order = DIH.getRandOpOrder(settings);
    const func_order = DIH.getRandFuncOrder(settings, op_order.length);
    const arr_tree = DIH.buildRandTree(op_order, func_order);
    const [dep_var, ind_var] = settings.diff_eq_vars.split('_');
    const ind_var_sym = new FH.Symb(ind_var);
    const func = DIH.treeToFunc(arr_tree, ind_var_sym)
    const diff_func = func.diff(ind_var_sym, settings.diff_order === 'second' ? 2 : 1);
    const func_str = func.toString();
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
    'func_op_counts',
    'diff_funcs',
    'expr_diff_notation',
    'diff_eq_vars',
    'diff_order'
];

export const presets = {
    default: function() {
        return {
            sum_count: 0,
            mul_count: 0,
            div_count: 0,
            chain_count: 0,
            diff_funcs: ['constant', 'identity', 'const_mul', 'linear', 'int_power', 'e_x', 'basic_trig'],
            expr_diff_notation: 'oper_paren',
            diff_eq_vars: 'y_x',
            diff_order: 'first'
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