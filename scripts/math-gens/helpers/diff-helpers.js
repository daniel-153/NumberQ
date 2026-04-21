const callable = (Cls) => new Proxy(Cls, {
    apply(target, _, args) {
        return Reflect.construct(target, args);
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
        this.#vars = Object.freeze(this instanceof variable ? [this] : Array.from(this.#vars));
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
        else throw new Error('No .trim method present on Expr instance; failed to trim.');
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

export const integer = callable(class integer extends Symb {
    constructor(int) {
        if (Number.isSafeInteger(int)) super(String(int));
        else throw new Error(`integer constructor must receive a safe integer argument; provided argument: '${int}', type '${int.constructor?.name}'.`);
    }
    derivative() { return new integer(0); }
})

export class Oper extends Expr {
    constructor() {
        if (arguments.length > 0) super(...arguments);
        else throw new Error('Oper constructor must receive at least one argument, but none were provided.');
    }
}

export const add  = callable(class add extends Oper {
    constructor() { super(...arguments); }
    repr() { return `(${Array.from(arguments).join(')+(')})`; }
    derivative(vari) { return Reflect.construct(add, this.els.map(el => el.diff(vari))); }
})

export const mul = callable(class mul extends Oper {
    constructor() { super(...arguments); }
    repr() { return `(${Array.from(arguments).join(')(')})`; }
    derivative(vari) {
        return Reflect.construct(add,
            this.els.map((_, addend_idx, args) => Reflect.construct(mul,
                args.map((arg, factor_idx) => addend_idx === factor_idx? arg.diff(vari) : arg)
            ))
        );
    }
    static trimmed() {
        const args = [];
        let is_frac = false;
        Array.from(arguments).forEach(arg => {
            if (arg instanceof mul) args.push.apply(args, arg.els);
            else if (arg instanceof frac) {
                is_frac = true;
                if (arg.els[0] instanceof mul) args.push.apply(args, arg.els[0]);
                else args.push(arg.els[0]);
                if (arg.els[1] instanceof mul) arg.els[1].els.forEach(el => args.push(pow(el, integer(-1))));
                else args.push(pow(arg.els[1], integer(-1)));
            }
            else args.push(arg);
        });

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
        const func_frac = [integer(1), integer(1)];
        base_pow_pairs.forEach(base_pow => {
            const [resolved_base, resolved_pow] = base_pow;
            if (resolved_base instanceof integer && resolved_pow instanceof integer) {
                if (resolved_pow.value < 0) const_frac[1] *= (resolved_base.value ** Math.abs(resolved_pow.value));
                else const_frac[0] *= (resolved_base.value ** resolved_pow.value);
            }
            else if (is_frac && resolved_pow instanceof integer && resolved_pow.value < 0) {
                func_frac[1] = mul.trimmed(func_frac[1], pow.trimmed(resolved_base, integer(Math.abs(resolved_pow.value))));
            }
            else {
                func_frac[0] = mul.trimmed(func_frac[0], pow.trimmed(resolved_base, resolved_pow.value));
            }
        });

        const resolved_num = func_frac[0].equals(integer(1)) ? integer(const_frac[0]) : mul.trimmed(integer(const_frac[0]), func_frac[0]);
        const resolved_den = func_frac[1].equals(integer(1)) ? integer(const_frac[1]) : mul.trimmed(integer(const_frac[1]), func_frac[1]);
        if (resolved_den.equals(integer(1))) return resolved_num;
        else return frac.trimmed(resolved_num, resolved_den);
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
    repr() { return `\\frac{${arguments[0]}}{${arguments[1]}}`; }
    derivative(vari) { return new frac(sub(mul(this.els[0].diff(vari), this.els[1]), mul(this.els[0], this.els[1].diff(vari))), pow(this.els[1], integer(2))); }
})

export const pow = callable(class pow extends BinaryOper {
    constructor() { super(...arguments); }
    repr() { return `\\left(${arguments[0]}\\right)^{${arguments[1]}}`; }
    derivative(vari) { return mul(new pow(this.els[0], this.els[1]), mul(this.els[1], ln(this.els[0])).diff(vari)); }
    static trimmed() {
        if (arguments[0] instanceof pow) return pow.trimmed(arguments[0].els[0], mul.trimmed(arguments[0].els[1], arguments[1]));
        else if (arguments[1]) 3;
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
    derivative(vari) { return pow(this.els[0], frac(integer(1), this.els[1])).diff(vari); }
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

export const exp = callable(class exp extends UnaryOper {
    constructor() { super(...arguments); }
    repr() { return `e^{${arguments[0]}}`; }
    derivative(vari) { return mul(new exp(this.els[0]), this.els[0].diff(vari)); }
})

export class NamedUnaryOper extends UnaryOper {
    constructor() { super(...arguments); }
    repr() {
        if (NamedUnaryOper.latex_operators.includes(this.constructor.name)) {
            return `\\${this.constructor.name}\\left(${arguments[0]}\\right)`;
        }
        else return `\\operatorname{${this.constructor.name}}\\left(${arguments[0]}\\right)`;
    }
    static latex_operators = ['sin','cos','tan','csc','sec','cot','sinh','cosh','tanh','coth','exp','ln'];
}

export const ln = callable(class ln extends NamedUnaryOper {
    constructor() { super(...arguments); }
    derivative(vari) { return mul(frac(integer(1), this.els[0]), this.els[0].diff(vari)); }
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
    derivative(vari) { return frac(this.els[0].diff(vari), mul(sqrt(sub(this.els[0], integer(1))), sqrt(add(this.els[0], integer(1))))); }
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