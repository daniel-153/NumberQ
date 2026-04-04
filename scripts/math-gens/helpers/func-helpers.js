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

    norm () {

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
        else throw new Error(`rational constructor must recieve integer arguments; provided arguments: ${Array.from(arguments)}`);
    }

    get num() { return this.#num; }
    get den() { return this.#den; }
    clone() { return rational(this.#num, this.#den); }
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

export const neg = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `-\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return neg(this.args[0].diff(sym)); }
})

export const sin = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\sin\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return mul(cos(this.args[0]), this.args[0].diff(sym)); }
})

export const cos = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\cos\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return mul(neg(sin(this.args[0])), this.args[0].diff(sym)); }
})

export const tan = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\tan\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return mul(pow(sec(this.args[0]), integer(2)), this.args[0].diff(sym)); }
})

export const csc = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\csc\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return mul(neg(mul(csc(this.args[0]), cot(this.args[0]))), this.args[0].diff(sym)); }
})

export const sec = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\sec\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return mul(sec(this.args[0]), tan(this.args[0]), this.args[0].diff(sym)); }
})

export const cot = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\cot\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return mul(neg(pow(csc(this.args[0]), integer(2))), this.args[0].diff(sym)); }
})

export const asin = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\sin^{-1}\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return frac(this.args[0].diff(sym), sqrt(sub(integer(1), pow(this.args[0], integer(2))))); }
})

export const acos = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\cos^{-1}\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return neg(frac(this.args[0].diff(sym), sqrt(sub(integer(1), pow(this.args[0], integer(2)))))); }
})

export const atan = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\tan^{-1}\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return frac(this.args[0].diff(sym), add(integer(1), pow(this.args[0], integer(2)))); }
})

export const acsc = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\csc^{-1}\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return neg(frac(this.args[0].diff(sym), mul(abs(this.args[0]), sqrt(sub(pow(this.args[0], integer(2)), integer(1)))))); }
})

export const asec = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\sec^{-1}\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return frac(this.args[0].diff(sym), mul(abs(this.args[0]), sqrt(sub(pow(this.args[0], integer(2)), integer(1))))); }
})

export const acot = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\cot^{-1}\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return neg(frac(this.args[0].diff(sym), add(integer(1), pow(this.args[0], integer(2))))); }
})

export const sinh = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\sinh\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return mul(cosh(this.args[0]), this.args[0].diff(sym)); }
})

export const cosh = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\cosh\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return mul(sinh(this.args[0]), this.args[0].diff(sym)); }
})

export const tanh = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\tanh\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return mul(pow(sech(this.args[0]), integer(2)), this.args[0].diff(sym)); }
})

export const csch = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\csch\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return mul(neg(mul(csch(this.args[0]), coth(this.args[0]))), this.args[0].diff(sym)); }
})

export const sech = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\sech\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return mul(neg(mul(sech(this.args[0]), tanh(this.args[0]))), this.args[0].diff(sym)); }
})

export const coth = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\coth\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return mul(neg(pow(csch(this.args[0]), integer(2))), this.args[0].diff(sym)); }
})

export const asinh = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\sinh^{-1}\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return frac(this.args[0].diff(sym), sqrt(add(pow(this.args[0], integer(2)), integer(1)))); }
})

export const acosh = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\cosh^{-1}\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return frac(this.args[0].diff(sym), mul(sqrt(sub(this.args[0], integer(1))), sqrt(add(this.args[0], integer(1))))); }
})

export const atanh = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\tanh^{-1}\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return frac(this.args[0].diff(sym), sub(integer(1), pow(this.args[0], integer(2)))); }
})

export const acsch = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\csch^{-1}\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return neg(frac(this.args[0].diff(sym), mul(abs(this.args[0]), sqrt(add(pow(this.args[0], integer(2)), integer(1)))))); }
})

export const asech = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\sech^{-1}\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return neg(frac(this.args[0].diff(sym), mul(this.args[0], sqrt(sub(integer(1), pow(this.args[0], integer(2))))))); }
})

export const acoth = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\coth^{-1}\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return frac(this.args[0].diff(sym), sub(integer(1), pow(this.args[0], integer(2)))); }
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

export const ln = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\ln\\left(${arguments[0]}\\right)`; }
    derivative(sym) { return mul(frac(integer(1), this.args[0]), this.args[0].diff(sym)); }
})

export const BinaryFunc = class extends Func {
    constructor() {
        if (arguments.length === 2) super(arguments[0], arguments[1]);
        else throw new Error(`BinaryFunc must receive two arguments; provided arguments: ${Array.from(arguments)}`);
    }
}

export const sub = callable(class extends BinaryFunc {
    constructor() { 
        super(...arguments);
        return add(this.args[0], neg(this.args[1]));
    }
    repr() { return `\\left(${arguments[0]}\\right)-\\left(${arguments[1]}\\right)`; }
    derivative(sym) {
        if (sym.isIn(this.args[0]) && sym.isIn(this.args[1])) return sub(this.args[0].diff(sym), this.args[1].diff(sym));
        if (sym.isIn(this.args[0])) return this.args[0].diff(sym);
        return neg(this.args[1].diff(sym));
    }
})

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
})

export const log = callable(class extends BinaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\log_{${arguments[0]}}\\left(${arguments[1]}\\right)`; }
    derivative(sym) {
        if (sym.isIn(this.args[0]) && sym.isIn(this.args[1])) {
            return frac(sub(mul(frac(this.args[1].diff(sym), this.args[1]), ln(this.args[0])), mul(frac(this.args[0].diff(sym), this.args[0]), ln(this.args[1]))), pow(ln(this.args[0]), integer(2)));
        }
        if (sym.isIn(this.args[1])) return frac(frac(this.args[1].diff(sym), this.args[1]), ln(this.args[0]));
        return neg(frac(mul(frac(this.args[0].diff(sym), this.args[0]), ln(this.args[1])), pow(ln(this.args[0]), integer(2))));
    }
})

export const root = callable(class extends BinaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\sqrt[${arguments[0]}]{${arguments[1]}}`; }
    derivative(sym) {
        if (sym.isIn(this.args[0]) && sym.isIn(this.args[1])) {
            return mul(pow(this.args[1], frac(integer(1), this.args[0])), frac(sub(mul(this.args[0], frac(this.args[1].diff(sym), this.args[1])), mul(ln(this.args[1]), this.args[0].diff(sym))), pow(this.args[0], integer(2))));
        }
        if (sym.isIn(this.args[1])) return mul(frac(integer(1), this.args[0]), pow(this.args[1], sub(frac(integer(1), this.args[0]), integer(1))), this.args[1].diff(sym));
        return mul(neg(frac(mul(ln(this.args[1]), this.args[0].diff(sym)), pow(this.args[0], integer(2)))), pow(this.args[1], frac(integer(1), this.args[0])));
    }
})