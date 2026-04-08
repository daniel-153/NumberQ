const callable = (Cls) => new Proxy(Cls, {
    apply(target, _, args) {
        return new target(...args);
    }
})

export const Symb = class {
    #description;
    
    constructor(description) {
        if (
            arguments.length === 1 &&
            typeof(description) === 'string'
        ) this.#description = description;
        else if (arguments.length === 0) this.#description = '\\mathrm{[Symb]}';
        else throw new Error(`Symb constructor only receives an optional 'string' description; provided arguments: ${Array.from(arguments)}`);
    }

    get description() { return this.#description; }
    toString() { return this.#description; }
    diff(sym) { return sym === this? integer(1) : integer(0); }
    clone() { return new Symb(this.#description); }
    isIn(arg) {
        if (arg instanceof Symb) return arg === this;
        if (arg instanceof Func) return arg.symbols.includes(this);
        throw new Error(`No Symb.isIn test available for '${arg?.constructor}'.`);
    }
}

export const Func = class {
    #symbols; #args; #arity;
    
    constructor() {
        this.#symbols = new Set();
        this.#args = [];
        for (let i = 0; i < arguments.length; i++) {
            const curr_arg = arguments[i];
            if (curr_arg instanceof Symb) this.#symbols.add(curr_arg);
            else if (curr_arg instanceof Func) {
                curr_arg.symbols.forEach(sym => this.#symbols.add(sym));
            }
            else throw new Error('Func constructor must only receive Symb or Func arguments.');

            this.#args.push(curr_arg);
        }

        this.#symbols = Object.freeze(Array.from(this.#symbols));
        Object.freeze(this.#args);
        this.#arity = this.#symbols.length;
    }

    get symbols() { return this.#symbols; }
    get args() { return this.#args; }
    get arity() { return this.#arity; }
    get is_const() { return (this.#arity === 0); }

    toString() {
        const arg_strs = this.#args.map(arg => {
            if (arg instanceof Func || arg instanceof Symb) return arg.toString();
            else throw new Error(`Invalid Func argument in toString(), constructor of '${arg?.constructor}'.`);
        });

        if (typeof(this.repr) === 'function') return this.repr(...arg_strs);
        else return `\\mathrm{[Func]}\\left(${arg_strs.join(',')}\\right)`
    }

    clone() {
        return Reflect.construct(this.constructor, this.#args.map(arg => arg instanceof Func ? arg.clone() : arg));
    }

    diff(sym, order = 1) {
        if (
            sym instanceof Symb &&
            Number.isSafeInteger(order) &&
            order >= 0
        ) {
            if (typeof(this.derivative) === 'function') {
                if (order === 0) return this.clone();
                else if (!this.#symbols.includes(sym)) return integer(0);
                else {
                    let diff_acc = this.derivative(sym);
                    for (let i = 1; i < order; i++) diff_acc = diff_acc.diff(sym);
                    return diff_acc;
                }
            }
            else throw new Error(`No derivative(sym) method present on Func instance with constructor '${this.constructor}'.`);
        }
        else throw new Error(`Func.diff(sym, order) receives a Symb and a non-negative integer order; provided arguments ${{sym, order}}.`);
    }

    static #trim_ctx = Symbol();
    trim(trim_ctx = undefined) {
        const args = this.#args.map(arg => arg instanceof Func ? arg.trim(Func.#trim_ctx) : arg);
        if (typeof(this.trimmed) === 'function') {
            const trimmed = this.trimmed.apply(this, args);
            if (trimmed instanceof Func) {
                if (trimmed instanceof identity && (trim_ctx === Func.#trim_ctx || trimmed.#args[0] instanceof Func)) return trimmed.#args[0]
                else return trimmed;
            } 
            else throw new Error('Non Func return for Func.trimmed encountered.');
        }
        else if (this instanceof identity && (trim_ctx === Func.#trim_ctx || args[0] instanceof Func)) return args[0];
        else if (this instanceof constant) return this.clone();
        else if (this instanceof PartialBinaryFunc) return new this.constructor(this.constant.trim(Func.#trim_ctx), ...args);
        else return Reflect.construct(this.constructor, args);
    }
}

export const VariadicFunc = class extends Func {
    constructor() {
        if (arguments.length > 0) super(...arguments);
        else throw new Error('VariadicFunc must receive at least one argument, but none were provided.');
    }
}

export const add  = callable(class extends VariadicFunc {
    constructor() { 
        const args = [];
        for (let i  = 0; i < arguments.length; i++) {
            if (arguments[i] instanceof add) args.push(...arguments[i].args);
            else if (arguments[i] instanceof sub) args.push(arguments[i].args[0], neg(arguments[i].args[1]));
            else args.push(arguments[i]);
        }
        super(...args);
    }
    repr() { return `\\left(${Array.from(arguments).join('\\right)+\\left(')}\\right)`; }
    derivative(sym) { return Reflect.construct(add, this.args.map(arg => arg.diff(sym))); }
    trimmed() { 
        const args = Array.from(arguments).filter(arg => !(arg instanceof integer && arg.value === 0));
        if (args.length === 0) return add(integer(0));
        if (args.length === 1) return identity(args[0]);
        return Reflect.construct(add, args); 
    }
})

export const mul = callable(class extends VariadicFunc {
    constructor() { 
        const args = [];
        for (let i  = 0; i < arguments.length; i++) {
            if (arguments[i] instanceof mul) args.push(...arguments[i].args);
            else args.push(arguments[i]);
        }
        super(...args);    
    }
    repr() { return `\\left(${Array.from(arguments).join('\\right)\\left(')}\\right)`; }
    derivative(sym) { 
        return Reflect.construct(add, 
            this.args.map((_, addend_idx, args) => Reflect.construct(mul, 
                args.map((arg, factor_idx) => addend_idx === factor_idx? arg.diff(sym) : arg)
            ))
        );
    }
    trimmed() {
        const args = [];
        for (let i = 0; i < arguments.length; i++) {
            if (arguments[i] instanceof integer) {
                if (arguments[i].value === 0) return integer(0);
                else if (arguments[i].value !== 1) args.push(arguments[i]);
            }
            else args.push(arguments[i]);
        }

        if (args.length === 0) return mul(integer(1));
        else if (args.length === 1) return identity(args[0]);
        else return Reflect.construct(mul, args);
    }
})

export const NullaryFunc = class extends Func {
    constructor() {
        if (arguments.length === 0) super();
        else throw new Error(`NullaryFunc must receive no arguments; provided arguments: ${Array.from(arguments)}`);
    }
}

export const constant = callable(class extends NullaryFunc {
    #symbol;
    
    constructor(symbol) {
        if (
            arguments.length === 1 && 
            typeof(symbol) === 'string'
        ) {
            super();
            this.#symbol = symbol;
        }
        else if (arguments.length !== 1) {
            throw new Error(`constant constructor must receive one argument; provided arguments: ${Array.from(arguments)}`);
        }
        else throw new Error(`Invalid constant argument, constructor of '${arguments[0]?.constructor}': constant must receive a string.`);
    }

    repr() { return this.#symbol; }
    derivative() { return integer(0); }
    clone() { return constant(this.#symbol); }
})

export const integer = callable(class extends constant {
    #value;
    
    constructor(int) {
        if (arguments.length === 1) {
            if (Number.isSafeInteger(int)) {
                super(String(int));
                this.#value = int;
            }
            else throw new Error(`Provided argument to integer constructor is not a safe integer: '${int}' [[${int?.constructor}]]`);
        }
        else throw new Error(`integer constructor must receive one argument; provided arguments: ${Array.from(arguments)}`);
    }

    get value() { return this.#value; }
    clone() { return integer(this.#value); }
})

export const rational = callable(class extends constant {
    #num; #den;
        
    constructor(num, den) {
        if (
            arguments.length === 2 &&
            Number.isSafeInteger(num) &&
            Number.isSafeInteger(den) &&
            den !== 0
        ) {
            super(`\\frac{${num}}{${den}}`);
            this.#num = num;
            this.#den = den;
        }
        else if (arguments.length !== 2) throw new Error(`rational constructor must recieve two arguments; provided arguments: ${Array.from(arguments)}`);
        else if (Number.isInteger(arguments[0]) && Number.isInteger(arguments[1])) {
            throw new Error(`One or both arguments to rational constructor exceed safe integer size.`);
        }
        else throw new Error(`rational constructor must recieve integer arguments with non-zero denominator; provided arguments: ${Array.from(arguments)}`);
    }

    get num() { return this.#num; }
    get den() { return this.#den; }
    clone() { return rational(this.#num, this.#den); }
    trimmed() {
        if (this.#num === 0) return integer(0);
        else if (this.#den === 1) return integer(this.#num);
        else if (this.#den < 0) return rational(-this.#num, -this.#den);
        else return rational(this.#num, this.#den);
    }
})

export const UnaryFunc = class extends Func {
    constructor() {
        if (arguments.length === 1) super(arguments[0]);
        else throw new Error(`UnaryFunc must receive one argument; provided arguments: ${Array.from(arguments)}`);
    }
}

export const identity = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `${arguments[0]}`; }
    derivative(sym) { return this.args[0].diff(sym); }
})

export const sqrt = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\sqrt{${arguments[0]}}`; }
    derivative(sym) { return mul(frac(integer(1), mul(integer(2), sqrt(this.args[0]))), this.args[0].diff(sym)); }
})

export const abs = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\left|${arguments[0]}\\right|`; }
    derivative(sym) { return mul(frac(this.args[0], abs(this.args[0])), this.args[0].diff(sym)); }
})

export const exp = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `e^{${arguments[0]}}`; }
    derivative(sym) { return mul(exp(this.args[0]), this.args[0].diff(sym)); }
})

export const PartialBinaryFunc = class extends UnaryFunc {
    #constant;
    
    constructor(constant_modifier, arg) {
        if (
            arguments.length === 2 &&
            constant_modifier instanceof Func &&
            constant_modifier.is_const
        ) {
            super(arg);
            this.#constant = constant_modifier;
        }
        else throw new Error(`PartialBinaryFunc constructor must receive a constant_modifier and an arg; provided arguments: ${Array.from(arguments)}.`);
    }

    get constant() { return this.#constant; }
    clone() {
        return new this.constructor(
            this.#constant.clone(), this.args[0] instanceof Func ? this.args[0].clone() : this.args[0]
        );
    }
}

export const nroot = callable(class extends PartialBinaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\sqrt[${this.constant.toString()}]{${arguments[0]}}`; }
    derivative(sym) { return mul(frac(integer(1), this.constant), pow(this.args[0], sub(frac(integer(1), this.constant), integer(1))), this.args[0].diff(sym)); }
})

export const logn = callable(class extends PartialBinaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\log_{${this.constant.toString()}}\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return frac(this.args[0].diff(sym), mul(ln(this.constant), this.args[0])); }
})

export const NamedUnaryFunc = class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { 
        if (NamedUnaryFunc.latex_operators.includes(this.constructor.name)) {
            return `\\${this.constructor.name}\\left(${arguments[0]}\\right)`;
        }
        else return `\\operatorname{${this.constructor.name}}\\left(${arguments[0]}\\right)`;
    }
    static latex_operators = ['sin','cos','tan','csc','sec','cot','sinh','cosh','tanh','csch','sech','coth','exp','ln'];
}

export const ln = callable(class ln extends NamedUnaryFunc {
    constructor() { super(...arguments); }
    derivative(sym) { return mul(frac(integer(1), this.args[0]), this.args[0].diff(sym)); }
})

export const sin = callable(class sin extends NamedUnaryFunc {
    constructor() { super(...arguments); }
    derivative(sym) { return mul(cos(this.args[0]), this.args[0].diff(sym)); }
})

export const cos = callable(class cos extends NamedUnaryFunc {
    constructor() { super(...arguments); }
    derivative(sym) { return mul(neg(sin(this.args[0])), this.args[0].diff(sym)); }
})

export const tan = callable(class tan extends NamedUnaryFunc {
    constructor() { super(...arguments); }
    derivative(sym) { return mul(pow(sec(this.args[0]), integer(2)), this.args[0].diff(sym)); }
})

export const csc = callable(class csc extends NamedUnaryFunc {
    constructor() { super(...arguments); }
    derivative(sym) { return mul(neg(mul(csc(this.args[0]), cot(this.args[0]))), this.args[0].diff(sym)); }
})

export const sec = callable(class sec extends NamedUnaryFunc {
    constructor() { super(...arguments); }
    derivative(sym) { return mul(sec(this.args[0]), tan(this.args[0]), this.args[0].diff(sym)); }
})

export const cot = callable(class cot extends NamedUnaryFunc {
    constructor() { super(...arguments); }
    derivative(sym) { return mul(neg(pow(csc(this.args[0]), integer(2))), this.args[0].diff(sym)); }
})

export const sinh = callable(class sinh extends NamedUnaryFunc {
    constructor() { super(...arguments); }
    derivative(sym) { return mul(cosh(this.args[0]), this.args[0].diff(sym)); }
})

export const cosh = callable(class cosh extends NamedUnaryFunc {
    constructor() { super(...arguments); }
    derivative(sym) { return mul(sinh(this.args[0]), this.args[0].diff(sym)); }
})

export const tanh = callable(class tanh extends NamedUnaryFunc {
    constructor() { super(...arguments); }
    derivative(sym) { return mul(pow(sech(this.args[0]), integer(2)), this.args[0].diff(sym)); }
})

export const csch = callable(class csch extends NamedUnaryFunc {
    constructor() { super(...arguments); }
    derivative(sym) { return mul(neg(mul(csch(this.args[0]), coth(this.args[0]))), this.args[0].diff(sym)); }
})

export const sech = callable(class sech extends NamedUnaryFunc {
    constructor() { super(...arguments); }
    derivative(sym) { return mul(neg(mul(sech(this.args[0]), tanh(this.args[0]))), this.args[0].diff(sym)); }
})

export const coth = callable(class coth extends NamedUnaryFunc {
    constructor() { super(...arguments); }
    derivative(sym) { return mul(neg(pow(csch(this.args[0]), integer(2))), this.args[0].diff(sym)); }
})

export const InvNamedUnaryFunc = class extends NamedUnaryFunc {
    constructor() { super(...arguments); }
    repr() {
        if (NamedUnaryFunc.latex_operators.includes(this.constructor.name)) {
            return `\\${this.constructor.name}^{-1}\\left(${arguments[0]}\\right)`;
        }
        else return `\\operatorname{${this.constructor.name}}^{-1}\\left(${arguments[0]}\\right)`;
    }
}

export const asin = callable(class sin extends InvNamedUnaryFunc {
    constructor() { super(...arguments); }
    derivative(sym) { return frac(this.args[0].diff(sym), sqrt(sub(integer(1), pow(this.args[0], integer(2))))); }
})

export const acos = callable(class cos extends InvNamedUnaryFunc {
    constructor() { super(...arguments); }
    derivative(sym) { return neg(frac(this.args[0].diff(sym), sqrt(sub(integer(1), pow(this.args[0], integer(2)))))); }
})

export const atan = callable(class tan extends InvNamedUnaryFunc {
    constructor() { super(...arguments); }
    derivative(sym) { return frac(this.args[0].diff(sym), add(integer(1), pow(this.args[0], integer(2)))); }
})

export const acsc = callable(class csc extends InvNamedUnaryFunc {
    constructor() { super(...arguments); }
    derivative(sym) { return neg(frac(this.args[0].diff(sym), mul(abs(this.args[0]), sqrt(sub(pow(this.args[0], integer(2)), integer(1)))))); }
})

export const asec = callable(class sec extends InvNamedUnaryFunc {
    constructor() { super(...arguments); }
    derivative(sym) { return frac(this.args[0].diff(sym), mul(abs(this.args[0]), sqrt(sub(pow(this.args[0], integer(2)), integer(1))))); }
})

export const acot = callable(class cot extends InvNamedUnaryFunc {
    constructor() { super(...arguments); }
    derivative(sym) { return neg(frac(this.args[0].diff(sym), add(integer(1), pow(this.args[0], integer(2))))); }
})

export const asinh = callable(class sinh extends InvNamedUnaryFunc {
    constructor() { super(...arguments); }
    derivative(sym) { return frac(this.args[0].diff(sym), sqrt(add(pow(this.args[0], integer(2)), integer(1)))); }
})

export const acosh = callable(class cosh extends InvNamedUnaryFunc {
    constructor() { super(...arguments); }
    derivative(sym) { return frac(this.args[0].diff(sym), mul(sqrt(sub(this.args[0], integer(1))), sqrt(add(this.args[0], integer(1))))); }
})

export const atanh = callable(class tanh extends InvNamedUnaryFunc {
    constructor() { super(...arguments); }
    derivative(sym) { return frac(this.args[0].diff(sym), sub(integer(1), pow(this.args[0], integer(2)))); }
})

export const acsch = callable(class csch extends InvNamedUnaryFunc {
    constructor() { super(...arguments); }
    derivative(sym) { return neg(frac(this.args[0].diff(sym), mul(abs(this.args[0]), sqrt(add(pow(this.args[0], integer(2)), integer(1)))))); }
})

export const asech = callable(class sech extends InvNamedUnaryFunc {
    constructor() { super(...arguments); }
    derivative(sym) { return neg(frac(this.args[0].diff(sym), mul(this.args[0], sqrt(sub(integer(1), pow(this.args[0], integer(2))))))); }
})

export const acoth = callable(class coth extends InvNamedUnaryFunc {
    constructor() { super(...arguments); }
    derivative(sym) { return frac(this.args[0].diff(sym), sub(integer(1), pow(this.args[0], integer(2)))); }
})

export const BinaryFunc = class extends Func {
    constructor() {
        if (arguments.length === 2) super(arguments[0], arguments[1]);
        else throw new Error(`BinaryFunc must receive two arguments; provided arguments: ${Array.from(arguments)}`);
    }
}

export const frac = callable(class extends BinaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\frac{${arguments[0]}}{${arguments[1]}}`; }
    derivative(sym) {
        if (sym.isIn(this.args[0]) && sym.isIn(this.args[1])) {
            return frac(sub(mul(this.args[0].diff(sym), this.args[1]), mul(this.args[0], this.args[1].diff(sym))), pow(this.args[1], integer(2)));
        }
        if (sym.isIn(this.args[0])) return frac(this.args[0].diff(sym), this.args[1]);
        return neg(frac(mul(this.args[0], this.args[1].diff(sym)), pow(this.args[1], integer(2))));
    }
    trimmed() {
        if (
            arguments[0] instanceof integer && arguments[0].value === 0 &&
            !(arguments[1] instanceof integer && arguments[1].value === 0)
        ) return integer(0);
        else if (arguments[1] instanceof integer && arguments[1].value === 1) return identity(arguments[0]);
        else return frac(arguments[0], arguments[1]);
    }
})

export const pow = callable(class extends BinaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\left(${arguments[0]}\\right)^{${arguments[1]}}`; }
    derivative(sym) {
        if (sym.isIn(this.args[0]) && sym.isIn(this.args[1])) {
            return add(mul(this.args[0].diff(sym), this.args[1], pow(this.args[0], sub(this.args[1], integer(1)))), mul(this.args[1].diff(sym), pow(this.args[0], this.args[1]), ln(this.args[0])));
        }
        if (sym.isIn(this.args[0])) return mul(this.args[0].diff(sym), this.args[1], pow(this.args[0], sub(this.args[1], integer(1))));
        return mul(this.args[1].diff(sym), pow(this.args[0], this.args[1]), ln(this.args[0]));
    }
    trimmed() {
        if (arguments[1] instanceof integer && arguments[1].value === 1) return identity(arguments[0]);
        else if (
            arguments[1] instanceof integer && arguments[1].value === 0 && 
            !(arguments[0] instanceof integer && arguments[0].value === 0)
        ) return integer(1);
        else if (arguments[0] instanceof integer && arguments[0].value === 1) return integer(1);
        else return pow(arguments[0], arguments[1]);
    }
})

export const WrapperFunc = class extends Func {
    constructor(arity, ...args) { 
        if (Number.isSafeInteger(arity) && arity >= 0) {
            if (args.length === arity) super(...args);
            else throw new Error(`WrapperFunc arity mismatch; [${arity}] args expected but [${args.length}] args provided.`);
        }
        else throw new Error(`WrapperFunc must receive a non-negative integer arity; provided arity: [${arity}].`);
    }
}

export const neg = callable(class extends WrapperFunc {
    constructor() { 
        super(1, ...arguments);
        return mul(integer(-1), arguments[0]);
    }
})

export const sub = callable(class extends WrapperFunc {
    constructor() { 
        super(2, ...arguments);
        return add(this.args[0], neg(this.args[1]));
    }
})