const callable = (Cls) => new Proxy(Cls, {
    apply(target, _, args) {
        return Reflect.construct(target, args);
    },
    get(target, prop, receiver) {
        return prop === 'ctr' ? target : Reflect.get(target, prop, receiver);
    },
    construct(target, args, new_target) {
        return Reflect.construct(target, args, new_target?.ctr ?? new_target);
    }
})

export class Expr {
    #vars = new Set();
    #els = [];
    constructor() {
        for (let i = 0; i < arguments.length; i++) {
            if (arguments[i] instanceof Expr) {
                this.#els.push(arguments[i]);
                arguments[i].vars.forEach(vari => this.#vars.add(vari));
            }
            else throw new Error(`Expr constructor must only receive Expr args; failed with arg at index ${i}.`);
        }
        this.#vars = Object.freeze(new.target === variable.ctr ? [this] : Array.from(this.#vars));
        Object.freeze(this.#els);
    }

    get vars() { return this.#vars; }
    get els() { return this.#els; }

    toString() { 
        if (typeof(this.repr) === 'function') return this.repr.apply(this, this.#els.map(el => el.toString()));
        else throw new Error(`No .repr method present on attempted Expr instance; failed to build string.`);
    }
    diff(vari) {
        if (vari instanceof variable) return this.#vars.includes(vari) ? this.derivative(vari) : integer(0);
        else throw new Error(`Expr.diff must receive a single variable argument; provided argument has type: '${vari?.constructor?.name}'`);
    }
    trim() {
        if (typeof(this.constructor?.trimmed) === 'function') return this.constructor.trimmed.apply(this, this.#els.map(el => el.trim()));
        else return Reflect.construct(this.constructor, this.#els.map(el => el.trim()));
    }
    equals(expr) {
        if (this instanceof variable) return this === expr;
        if (this instanceof integer) return expr?.constructor === this.constructor && expr?.value === this.value;
        if (this instanceof Oper) return (
            this.constructor === expr?.constructor && 
            expr.els.length === this.#els.length && 
            this.#els.every((el, idx) => el.equals(expr.els[idx]))
        );
        throw new Error(`.equals comparison is only available for (variable, integer, Oper) Expr instances, not '${this.constructor.name}'.`);
    }
    static getMaxNesting(expr, nesting = 0) {
        if (!(expr instanceof Expr)) throw new Error('Expr.getMaxNesting(expr) argument must be instanceof Expr.');
        else if (expr instanceof frac) return Math.max(Expr.getMaxNesting(expr.els[0], nesting + 1), Expr.getMaxNesting(expr.els[1], nesting + 1));
        else if (expr instanceof pow) return Math.max(Expr.getMaxNesting(expr.els[0], nesting), Expr.getMaxNesting(expr.els[1], nesting + 1));
        else if (expr instanceof log || expr instanceof root) return Math.max(Expr.getMaxNesting(expr.els[0], nesting + 1), Expr.getMaxNesting(expr.els[1], nesting));
        else if (expr instanceof InvNamedUnaryOper) return Math.max(nesting + 1, Expr.getMaxNesting(expr.els[0], nesting));
        else if (!expr.els.length) return nesting;
        else return Math.max.apply(null, expr.els.map(el => Expr.getMaxNesting(el, nesting)));
    }
}

export class Symb extends Expr {
    #symbol;
    constructor() {
        if (
            arguments.length === 1 &&
            typeof(arguments[0]) === 'string' &&
            !(/\s/.test(arguments[0]))
        ) {
            super();
            this.#symbol = arguments[0];
        }
        else throw new Error(`Sym constructor must receive a single string argument with no whitespace; provided arguments: ${Array.from(arguments)}`);
    }
    repr() { return this.#symbol; }
    get symbol() { return this.#symbol; }
    static trimmed() { return this; }
}

export const variable = callable(class variable extends Symb {
    constructor(str) { super(str); }
    derivative(vari) { return this === vari ? integer(1) : integer(0); }
    isIn(expr) {
        if (expr instanceof variable) return this === expr;
        else if (expr instanceof Expr) return this.vars.includes(this);
        else throw new Error(`No variable.isIn test available for '${arg?.constructor?.name}'.`);
    }
})
export const const_e = callable(class const_e extends variable { constructor() { super('e'); } })();
export const const_pi = callable(class const_pi extends variable { constructor() { super('\\pi'); } })();

export const integer = callable(class integer extends Symb {
    #value;
    constructor(int) {
        if (Number.isSafeInteger(int)) {
            super(String(int));
            this.#value = int;
        }
        else throw new Error(`integer constructor must receive a safe integer argument; provided argument: '${int}', type '${int.constructor?.name}'.`);
    }
    derivative() { return new integer(0); }
    get value() { return this.#value; }
})

export class Oper extends Expr {
    constructor() {
        if (arguments.length > 0) super(...arguments);
        else throw new Error('Oper constructor must receive at least one argument, but none were provided.');
    }
}

export const add  = callable(class add extends Oper {
    constructor() { super(...arguments); }
    repr() { return Array.from(arguments).reduce((acc, curr, idx) => acc + (curr.charAt(0) !== '-' && idx > 0 ? ('+' + curr) : curr), ''); }
    derivative(vari) { return Reflect.construct(add, this.els.map(el => el.diff(vari))); }
    static trimmed() {
        let args = [];
        Array.from(arguments).forEach(arg => {
            if (!arg.equals(integer(0))) {
                if (arg instanceof add) args.push.apply(args, arg.els);
                else args.push(arg);
            }
        });
        if (args.length === 0) return integer(0);

        const factors = function(term) {
            const const_frac = [integer(1), integer(1)];
            const func_frac = [[], []];
            if (term instanceof frac) {
                const num_factors = factors(term.els[0]);
                const den_factors = factors(term.els[1]);

                const_frac[0] = num_factors.const_frac[0];
                const_frac[1] = den_factors.const_frac[0];
                func_frac[0] = num_factors.func_frac[0];
                func_frac[1] = den_factors.func_frac[0];
            }
            else if (term instanceof mul) {
                term.els.forEach(el => {
                    if (el instanceof integer) const_frac[0] = integer(const_frac[0].value*el.value);
                    else func_frac[0].push(el);
                });
            }
            else if (term instanceof integer) const_frac[0] = term;
            else func_frac[0] = [term];

            return {const_frac, func_frac};
        }
        for (let i = 0; i < args.length; i++) {
            const arg_factors = factors(args[i]);
            let arg_constant = frac(...arg_factors.const_frac);
            const combined_idxs = [];
            for (let j = i + 1; j < args.length; j++) {
                const test_factors = factors(args[j]);
                let all_funcs_match = true;
                for (let k = 0; (k < 2 && all_funcs_match); k++) {
                    const arg_funcs = arg_factors.func_frac[k];
                    const test_funcs = test_factors.func_frac[k];
                    all_funcs_match = arg_funcs.length === test_funcs.length;
                    for (let l = 0; (l < arg_funcs.length && all_funcs_match); l++) {
                        const match_idx = test_funcs.findIndex(test_func => test_func.equals(arg_funcs[l]));
                        all_funcs_match = match_idx !== -1;
                        if (all_funcs_match) test_funcs.splice(match_idx, 1);
                    }
                    all_funcs_match = all_funcs_match && test_funcs.length === 0;
                }
                if (all_funcs_match) {
                    arg_constant = frac(
                        integer(arg_constant.els[0].value*test_factors.const_frac[1].value + arg_constant.els[1].value*test_factors.const_frac[0].value),
                        integer(arg_constant.els[1].value*test_factors.const_frac[1].value)
                    );
                    combined_idxs.push(j);
                }
            }
            const eval_arg_const = arg_constant.els[0].value / arg_constant.els[1].value;
            if (Number.isSafeInteger(eval_arg_const)) {
                if (arg_factors.func_frac[1].length === 0) args[i] = mul.trimmed(integer(eval_arg_const), ...arg_factors.func_frac[0]);
                else args[i] = frac.trimmed(mul.trimmed(integer(eval_arg_const), ...arg_factors.func_frac[0]), mul.trimmed(...arg_factors.func_frac[1]));
            }
            else args[i] = frac.trimmed(mul.trimmed(arg_constant.els[0], ...arg_factors.func_frac[0]), mul.trimmed(arg_constant.els[1], ...arg_factors.func_frac[1]));
            if (combined_idxs.length) args = args.filter((_, idx) => !combined_idxs.includes(idx)); 
        }

        if (args.length === 0) return integer(0);
        else if (args.length === 1) return args[0];
        else return new add(...args); 
    }
})

export const mul = callable(class mul extends Oper {
    constructor() { super(...arguments); }
    repr() { 
        const order_groups = [
            [integer],
            [frac],
            [variable],
            [pow, abs],
            [sqrt, root, add, mul],
            [
                log, ln, sin, cos, tan, csc, sec, cot, asin, acos, atan, acsc, asec, acot, 
                sinh, cosh, tanh, csch, sech, coth, asinh, acosh, atanh, acsch, asech, acoth
            ],
            [Expr]
        ].map(group => ({group, args: []}));
        let len_args = 0;
        Array.from({length: arguments.length}, (_, i) => this.els[i].equals(integer(1)) ? null : [arguments[i], this.els[i]]).forEach(arg_el => {
            if (arg_el) {
                const group_idx = order_groups.findIndex(group_entry => group_entry.group.some(ctr => arg_el[1] instanceof ctr));
                order_groups[group_idx].args.push(arg_el);
                len_args++;
            }
        });

        let acc_str = '';
        order_groups.forEach((group_entry, group_idx) => {
            group_entry.args.forEach(arg_el => {
                const [str, expr] = arg_el;
                if (group_idx === 0) {
                    if (acc_str.length !== 0) acc_str += `\\left(${str}\\right)`;
                    else if (expr.equals(integer(-1)) && len_args > 1) acc_str += '-';
                    else acc_str += str;
                }
                else if (group_idx === 1) {
                    if (group_entry.args.length > 1 || acc_str.length !== 0) acc_str += `\\left(${str}\\right)`;
                    else acc_str += str;
                }
                else if (len_args > 1 && (expr instanceof add || expr instanceof mul || group_idx === 6)) acc_str += `\\left(${str}\\right)`;
                else acc_str += str;
            });
        })
        return acc_str ? acc_str : '1';
    }
    derivative(vari) {
        return Reflect.construct(add,
            this.els.map((_, addend_idx, args) => Reflect.construct(mul,
                args.map((arg, factor_idx) => addend_idx === factor_idx? arg.diff(vari) : arg)
            ))
        );
    }
    static trimmed() {
        if (arguments.length === 1) return arguments[0];
        const args = [];
        let is_frac = false;
        for (let i = 0; i < arguments.length; i++) {
            const arg = arguments[i];
            if (arg instanceof integer && arg.value === 0) return integer(0);
            if (arg instanceof mul) args.push.apply(args, arg.els);
            else if (arg instanceof frac) {
                is_frac = true;
                if (arg.els[0] instanceof integer && arg.els[0].value === 0) return integer(0);
                if (arg.els[0] instanceof mul) args.push.apply(args, arg.els[0].els);
                else args.push(arg.els[0]);
                if (arg.els[1] instanceof mul) arg.els[1].els.forEach(el => args.push(pow.trimmed(el, integer(-1))));
                else args.push(pow.trimmed(arg.els[1], integer(-1)));
            }
            else args.push(arg);
        }

        const base_pow_pairs = [];
        args.forEach(arg => {
            let resolved_arg, resolved_pow;
            if (arg instanceof pow) ([resolved_arg, resolved_pow] = arg.els);
            else {
                resolved_arg = arg;
                resolved_pow = integer(1);
            }

            const base_idx = base_pow_pairs.findIndex(base_pow => resolved_arg.equals(base_pow[0]));
            if (base_idx > -1) base_pow_pairs[base_idx][1] = add.trimmed(base_pow_pairs[base_idx][1], resolved_pow);
            else base_pow_pairs.push([resolved_arg, resolved_pow]);
        });

        const const_frac = [1, 1];
        const func_frac = [[], []];
        base_pow_pairs.forEach(base_pow => {
            const [resolved_base, resolved_pow] = base_pow;
            if (resolved_base instanceof integer && resolved_pow instanceof integer) {
                if (resolved_pow.value < 0) const_frac[1] *= (resolved_base.value ** Math.abs(resolved_pow.value));
                else const_frac[0] *= (resolved_base.value ** resolved_pow.value);
            }
            else if (is_frac && resolved_pow instanceof integer && resolved_pow.value < 0) {
                func_frac[1].push(pow.trimmed(resolved_base, integer(Math.abs(resolved_pow.value))));
            }
            else if (
                is_frac &&
                resolved_pow instanceof frac &&
                resolved_pow.els[0] instanceof integer &&
                resolved_pow.els[1] instanceof integer &&
                resolved_pow.els[0].value < 0
            ) {
                func_frac[1].push(
                    pow.trimmed(resolved_base, frac(integer(-resolved_pow.els[0].value), resolved_pow.els[1]))
                );
            }
            else {
                func_frac[0].push(pow.trimmed(resolved_base, resolved_pow));
            }
        });

        if (const_frac[0] === 0) const_frac[1] = 1;
        else {
            const gcd = (function(a, b) {
                a = Math.abs(a);
                b = Math.abs(b);
                while (b !== 0) {
                    const t = b;
                    b = a % b;
                    a = t;
                }
                return a;
            })(const_frac[0], const_frac[1]);

            if (gcd > 1) {
                const_frac[0] /= gcd;
                const_frac[1] /= gcd;
            }
        }
        if (const_frac[1] < 0) {
            const_frac[0] = -const_frac[0];
            const_frac[1] = -const_frac[1];
        }
         
        const resolved_frac = Array.from({length: 2}, (_, i) => {
            if (func_frac[i].length > 0 && const_frac[i] !== 1) return new mul(integer(const_frac[i]), ...func_frac[i]);
            else if (func_frac[i].length > 0) return new mul(...func_frac[i]);
            else return integer(const_frac[i]);
        });
        if (resolved_frac[1].equals(integer(1))) return resolved_frac[0];
        else return frac(resolved_frac[0], resolved_frac[1]);
    }
})  

export class BinaryOper extends Oper {
    constructor() {
        if (arguments.length === 2) super(arguments[0], arguments[1]);
        else throw new Error(`BinaryOper must receive two arguments; provided arguments: ${Array.from(arguments)}`);
    }
}

export const frac = callable(class frac extends BinaryOper {
    constructor() { super(...arguments); }
    repr() { 
        if (arguments[0].charAt(0) === '-' && !(this.els[0] instanceof add)) return `-\\frac{${arguments[0].slice(1)}}{${arguments[1]}}`;
        else return `\\frac{${arguments[0]}}{${arguments[1]}}`;
    }
    derivative(vari) { return new frac(sub(mul(this.els[0].diff(vari), this.els[1]), mul(this.els[0], this.els[1].diff(vari))), pow(this.els[1], integer(2))); }
    static trimmed() { 
        if (arguments[0] instanceof frac && arguments[1] instanceof frac) {
            return mul.trimmed(integer(1), new frac(mul.trimmed(arguments[0].els[0], arguments[1].els[1]), mul.trimmed(arguments[0].els[1], arguments[1].els[0])));
        }   
        else if (arguments[0] instanceof frac) {
            return mul.trimmed(integer(1), new frac(arguments[0].els[0], mul.trimmed(arguments[0].els[1], arguments[1])));
        }
        else if (arguments[1] instanceof frac) {
            return mul.trimmed(integer(1), new frac(mul.trimmed(arguments[0], arguments[1].els[1]), arguments[1].els[0]));
        }
        else return mul.trimmed(integer(1), new frac(arguments[0], arguments[1]));
    }
})

export const pow = callable(class pow extends BinaryOper {
    constructor() { super(...arguments); }
    repr() { 
        if (
            this.els[0] instanceof NamedUnaryOper && 
            !(this.els[0] instanceof InvNamedUnaryOper) &&
            this.els[1] instanceof integer &&
            this.els[1].value > 0
        ) {
            const open_idx = arguments[0].indexOf('\\left(');
            return `${arguments[0].slice(0, open_idx)}^{${arguments[1]}}${arguments[0].slice(open_idx)}`;
        }
        else if (this.els[0] instanceof variable && this.els[0].symbol.length === 1) return `${arguments[0]}^{${arguments[1]}}`;
        else return `\\left(${arguments[0]}\\right)^{${arguments[1]}}`;
    }
    derivative(vari) { return mul(new pow(this.els[0], this.els[1]), mul(this.els[1], ln(this.els[0])).diff(vari)); }
    static trimmed() {
        if (arguments[0] instanceof pow) return pow.trimmed(arguments[0].els[0], mul.trimmed(arguments[0].els[1], arguments[1]));
        else if (arguments[0] instanceof integer && arguments[1] instanceof integer) {
            if (arguments[1].value >= 0) return integer(arguments[0].value ** arguments[1].value);
            else return new pow(arguments[0], arguments[1])
        }
        else if (arguments[0] instanceof integer) {
            if (arguments[0].value === 1) return integer(1);
            else if (arguments[0].value === 0) return integer(0);
            else return new pow(arguments[0], arguments[1])
        }
        else if (arguments[1] instanceof integer && arguments[1].value === 0) return integer(1);
        else if (arguments[1] instanceof integer && arguments[1].value === 1) return arguments[0];
        else return new pow(arguments[0], arguments[1]);
    }
})

export const log = callable(class log extends BinaryOper {
    constructor() { super(...arguments); }
    repr() { return `\\log_{${arguments[0]}}\\left(${arguments[1]}\\right)`; }
    derivative(vari) { return frac(ln(this.els[1]), ln(this.els[0])).diff(vari); }
})

export const root = callable(class root extends BinaryOper {
    constructor() { super(...arguments); }
    repr() { return `\\sqrt[${arguments[0]}]{${arguments[1]}}`; }
    derivative(vari) { return pow(this.els[1], frac(integer(1), this.els[0])).diff(vari); }
});

export class UnaryOper extends Oper {
    constructor() {
        if (arguments.length === 1) super(arguments[0]);
        else throw new Error(`UnaryOper must receive one argument; provided arguments: ${Array.from(arguments)}`);
    }
}

export const sqrt = callable(class sqrt extends UnaryOper {
    constructor() { super(...arguments); }
    repr() { return `\\sqrt{${arguments[0]}}`; }
    derivative(vari) { return mul(frac(integer(1), mul(integer(2), new sqrt(this.els[0]))), this.els[0].diff(vari)); }
})

export const abs = callable(class abs extends UnaryOper {
    constructor() { super(...arguments); }
    repr() { return `\\left|${arguments[0]}\\right|`; }
    derivative(vari) { return mul(frac(this.els[0], new abs(this.els[0])), this.els[0].diff(vari)); }
})

export class NamedUnaryOper extends UnaryOper {
    constructor() { super(...arguments); }
    repr() {
        if (NamedUnaryOper.latex_operators.includes(this.constructor.name)) {
            return `\\${this.constructor.name}\\left(${arguments[0]}\\right)`;
        }
        else return `\\operatorname{${this.constructor.name}}\\left(${arguments[0]}\\right)`;
    }
    static latex_operators = ['sin','cos','tan','csc','sec','cot','sinh','cosh','tanh','coth','ln'];
}

export const ln = callable(class ln extends NamedUnaryOper {
    constructor() { super(...arguments); }
    derivative(vari) { return mul(frac(integer(1), this.els[0]), this.els[0].diff(vari)); }
    static trimmed() {
        if (arguments[0].equals(const_e)) return integer(1);
        else return this;
    }
})

export const sin = callable(class sin extends NamedUnaryOper {
    constructor() { super(...arguments); }
    derivative(vari) { return mul(cos(this.els[0]), this.els[0].diff(vari)); }
})

export const cos = callable(class cos extends NamedUnaryOper {
    constructor() { super(...arguments); }
    derivative(vari) { return mul(neg(sin(this.els[0])), this.els[0].diff(vari)); }
})

export const tan = callable(class tan extends NamedUnaryOper {
    constructor() { super(...arguments); }
    derivative(vari) { return mul(pow(sec(this.els[0]), integer(2)), this.els[0].diff(vari)); }
})

export const csc = callable(class csc extends NamedUnaryOper {
    constructor() { super(...arguments); }
    derivative(vari) { return mul(neg(mul(new csc(this.els[0]), cot(this.els[0]))), this.els[0].diff(vari)); }
})

export const sec = callable(class sec extends NamedUnaryOper {
    constructor() { super(...arguments); }
    derivative(vari) { return mul(new sec(this.els[0]), tan(this.els[0]), this.els[0].diff(vari)); }
})

export const cot = callable(class cot extends NamedUnaryOper {
    constructor() { super(...arguments); }
    derivative(vari) { return mul(neg(pow(csc(this.els[0]), integer(2))), this.els[0].diff(vari)); }
})

export const sinh = callable(class sinh extends NamedUnaryOper {
    constructor() { super(...arguments); }
    derivative(vari) { return mul(cosh(this.els[0]), this.els[0].diff(vari)); }
})

export const cosh = callable(class cosh extends NamedUnaryOper {
    constructor() { super(...arguments); }
    derivative(vari) { return mul(sinh(this.els[0]), this.els[0].diff(vari)); }
})

export const tanh = callable(class tanh extends NamedUnaryOper {
    constructor() { super(...arguments); }
    derivative(vari) { return mul(pow(sech(this.els[0]), integer(2)), this.els[0].diff(vari)); }
})

export const csch = callable(class csch extends NamedUnaryOper {
    constructor() { super(...arguments); }
    derivative(vari) { return mul(neg(mul(new csch(this.els[0]), coth(this.els[0]))), this.els[0].diff(vari)); }
})

export const sech = callable(class sech extends NamedUnaryOper {
    constructor() { super(...arguments); }
    derivative(vari) { return mul(neg(mul(new sech(this.els[0]), tanh(this.els[0]))), this.els[0].diff(vari)); }
})

export const coth = callable(class coth extends NamedUnaryOper {
    constructor() { super(...arguments); }
    derivative(vari) { return mul(neg(pow(csch(this.els[0]), integer(2))), this.els[0].diff(vari)); }
})

export class InvNamedUnaryOper extends NamedUnaryOper {
    constructor() { super(...arguments); }
    repr() {
        if (NamedUnaryOper.latex_operators.includes(this.constructor.name)) {
            return `\\${this.constructor.name}^{-1}\\left(${arguments[0]}\\right)`;
        }
        else return `\\operatorname{${this.constructor.name}}^{-1}\\left(${arguments[0]}\\right)`;
    }
}

export const asin = callable(class sin extends InvNamedUnaryOper {
    constructor() { super(...arguments); }
    derivative(vari) { return frac(this.els[0].diff(vari), sqrt(sub(integer(1), pow(this.els[0], integer(2))))); }
})

export const acos = callable(class cos extends InvNamedUnaryOper {
    constructor() { super(...arguments); }
    derivative(vari) { return neg(frac(this.els[0].diff(vari), sqrt(sub(integer(1), pow(this.els[0], integer(2)))))); }
})

export const atan = callable(class tan extends InvNamedUnaryOper {
    constructor() { super(...arguments); }
    derivative(vari) { return frac(this.els[0].diff(vari), add(integer(1), pow(this.els[0], integer(2)))); }
})

export const acsc = callable(class csc extends InvNamedUnaryOper {
    constructor() { super(...arguments); }
    derivative(vari) { return neg(frac(this.els[0].diff(vari), mul(abs(this.els[0]), sqrt(sub(pow(this.els[0], integer(2)), integer(1)))))); }
})

export const asec = callable(class sec extends InvNamedUnaryOper {
    constructor() { super(...arguments); }
    derivative(vari) { return frac(this.els[0].diff(vari), mul(abs(this.els[0]), sqrt(sub(pow(this.els[0], integer(2)), integer(1))))); }
})

export const acot = callable(class cot extends InvNamedUnaryOper {
    constructor() { super(...arguments); }
    derivative(vari) { return neg(frac(this.els[0].diff(vari), add(integer(1), pow(this.els[0], integer(2))))); }
})

export const asinh = callable(class sinh extends InvNamedUnaryOper {
    constructor() { super(...arguments); }
    derivative(vari) { return frac(this.els[0].diff(vari), sqrt(add(pow(this.els[0], integer(2)), integer(1)))); }
})

export const acosh = callable(class cosh extends InvNamedUnaryOper {
    constructor() { super(...arguments); }
    derivative(vari) { return frac(this.els[0].diff(vari), sqrt(sub(pow(this.els[0], integer(2)), integer(1)))); }
})

export const atanh = callable(class tanh extends InvNamedUnaryOper {
    constructor() { super(...arguments); }
    derivative(vari) { return frac(this.els[0].diff(vari), sub(integer(1), pow(this.els[0], integer(2)))); }
})

export const acsch = callable(class csch extends InvNamedUnaryOper {
    constructor() { super(...arguments); }
    derivative(vari) { return neg(frac(this.els[0].diff(vari), mul(abs(this.els[0]), sqrt(add(pow(this.els[0], integer(2)), integer(1)))))); }
})

export const asech = callable(class sech extends InvNamedUnaryOper {
    constructor() { super(...arguments); }
    derivative(vari) { return neg(frac(this.els[0].diff(vari), mul(this.els[0], sqrt(sub(integer(1), pow(this.els[0], integer(2))))))); }
})

export const acoth = callable(class coth extends InvNamedUnaryOper {
    constructor() { super(...arguments); }
    derivative(vari) { return frac(this.els[0].diff(vari), sub(integer(1), pow(this.els[0], integer(2)))); }
})

export class SyntaxOper extends Oper {
    constructor(arity, ...args) {
        if (Number.isSafeInteger(arity) && arity > 0) {
            if (args.length === arity) super(...args);
            else throw new Error(`SyntaxOper arity mismatch; [${arity}] args expected but [${args.length}] args provided.`);
        }
        else throw new Error(`SyntaxOper must receive a positive integer arity; provided arity: [${arity}].`);
    }
}

export const neg = callable(class extends SyntaxOper {
    constructor() {
        super(1, ...arguments);
        return mul(integer(-1), arguments[0]);
    }
})

export const sub = callable(class extends SyntaxOper {
    constructor() {
        super(2, ...arguments);
        return add(this.els[0], neg(this.els[1]));
    }
})

export const compose = callable(class extends SyntaxOper {
    constructor() {
        super(2, ...arguments);
        if (this.els[0].vars.length === 0) return this.els[1];
        else if (this.els[0].vars.length === 1) return (function sub(vari, new_val, expr) {
            if (expr === vari) return new_val;
            else if (expr.els.length === 0) return expr;
            else return Reflect.construct(expr.constructor, expr.els.map(el => sub(vari, new_val, el)));
        })(this.els[0].vars[0], this.els[1], this.els[0]);
        else throw new Error(`First element of compose must contain 1 or 0 variables; [${this.els[0].vars.length}] variables present in first element.`);
    }
})

export const exp = callable(class extends SyntaxOper {
    constructor() {
        super(1, ...arguments);
        return pow(const_e, arguments[0]);
    }
});