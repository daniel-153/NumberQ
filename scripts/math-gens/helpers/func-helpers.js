const callable = (Cls) => new Proxy(Cls, {
    apply(target, _, args) {
        return new target(...args);
    }
})

export const Symb = class {
    #description;
    
    constructor(description) {
        if (
            arguments.length <= 1 &&
            typeof(description) === 'string'
        ) {
            if (arguments.length === 1) this.#description = description;
            else this.#description = '[unlabeled_Symb]';
        }
        else throw new Error(`Symb constructor only receives an optional 'string' description; provided arguments: ${Array.from(arguments)}`);
    }

    get description() { return this.#description; }
    toString() { return this.#description; }
    diff(sym) { return sym === this? integer(1) : integer(0); }
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
        const arg_strs = this.args.map(arg => {
            if (arg instanceof Func || arg instanceof Symb) return arg.toString();
            else throw new Error(`Invalid Func argument in toString(), constructor of '${arg.constructor}'.`);
        });

        if (typeof(this.repr) === 'function') return this.repr(...arg_strs);
        else return `[unlabeled_Func](${arg_strs.join(',')})`
    }
}

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
        else throw new Error(`Invalid constant argument, constructor of '${arg.constructor}': constant must receive a string.`);
    }

    repr() { return this.#symbol; }
    diff() { return integer(0); }
})

export const integer = callable(class extends constant {
    #value;
    
    constructor(int) {
        if (arguments.length === 1) {
            if (Number.isSafeInteger(int)) {
                super(String(int));
                this.#value = int;
            }
            else throw new Error(`Provided argument to integer constructor is not a safe integer: '${int}' [[${int.constructor}]]`);
        }
        else throw new Error(`integer constructor must receive one argument; provided arguments: ${Array.from(arguments)}`);
    }

    get value() { return this.#value; }
})

export const fraction = callable(class extends constant {
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
        else if (arguments.length !== 2) throw new Error(`fraction constructor must recieve two arguments; provided arguments: ${Array.from(arguments)}`);
        else if (Number.isInteger(arguments[0]) && Number.isInteger(arguments[1])) {
            throw new Error(`One or both arguments to fraction constructor exceed safe integer size.`);
        }
        else throw new Error(`fraction constructor must recieve integer arguments; provided arguments: ${Array.from(arguments)}`);
    }

    get num() { return this.#num; }
    get den() { return this.#den; }
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
    diff(sym) { return this.args[0].diff(sym); }
})

export const neg = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\left(-${arguments[0]}\\right)`; }
    diff(sym) { return neg(this.args[0].diff(sym)); }
})

export const sin = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\sin\\left(${arguments[0]}\\right)`; }
    diff(sym) { return mul(cos(this.args[0]), this.args[0].diff(sym)); }
})

export const cos = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\cos\\left(${arguments[0]}\\right)`; }
    diff(sym) { return mul(neg(sin(this.args[0])), this.args[0].diff(sym)); }
})

export const tan = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\tan\\left(${arguments[0]}\\right)`; }
    diff(sym) { return mul(pow(sec(this.args[0], integer(2))), this.args[0].diff(sym)); }
})

export const csc = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\csc\\left(${arguments[0]}\\right)`; }
    diff(sym) { return mul(neg(mul(csc(this.args[0]), cot(this.args[0]))), this.args[0].diff(sym)); }
})

export const sec = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\sec\\left(${arguments[0]}\\right)`; }
    diff(sym) { return mul(mul(sec(this.args[0]), tan(this.args[0])), this.args[0].diff(sym)); }
})

export const cot = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\cot\\left(${arguments[0]}\\right)`; }
    diff(sym) { return mul(neg(pow(csc(this.args[0], integer(2)))), this.args[0].diff(sym)); }
})

export const sqrt = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\sqrt{${arguments[0]}}`; }
    diff(sym) { return mul(div(integer(1), mul(integer(2), sqrt(this.args[0]))), this.args[0].diff(sym)); }
})

export const abs = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\left|${arguments[0]}\\right|`; }
    diff(sym) { return mul(div(this.args[0], abs(this.args[0])), this.args[0].diff(sym)); }
})

export const exp = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `e^{${arguments[0]}}`; }
    diff(sym) { return mul(exp(this.args[0]), this.args[0].diff(sym)); }
})

export const ln = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\ln\\left(${arguments[0]}\\right)`; }
    diff(sym) { return mul(div(integer(1), this.args[0]), this.args[0].diff(sym)); }
})









export const BinaryFunc = class extends Func {
    constructor() {
        if (arguments.length === 2) super(arguments[0], arguments[1]);
        else throw new Error(`BinaryFunc must receive two arguments; provided arguments: ${Array.from(arguments)}`);
    }
}

export const add = callable(class extends BinaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\left(${arguments[0]}\\right)+\\left(${arguments[1]}\\right)`; }
    diff(sym) { return add(this.args[0].diff(sym), this.args[1].diff(sym)); }
})

export const sub = callable(class extends BinaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\left(${arguments[0]}\\right)-\\left(${arguments[1]}\\right)`; }
    diff(sym) { return sub(this.args[0].diff(sym), this.args[1].diff(sym)); }
})

export const mul = callable(class extends BinaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\left(${arguments[0]}\\right)\\cdot\\left(${arguments[1]}\\right)`; }
    diff(sym) { return add(mul(this.args[0].diff(sym), this.args[1]), mul(this.args[0], this.args[1].diff(sym))); }
})

export const div = callable(class extends BinaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\frac{${arguments[0]}}{${arguments[1]}}`; }
    diff(sym) { return div(sub(mul(this.args[0].diff(sym), this.args[1]), mul(this.args[0], this.args[1].diff(sym))), pow(this.args[1], integer(2))); }
})

export const pow = callable(class extends BinaryFunc {
    constructor() { super(...arguments); }
    repr() { return `${arguments[0]}^{${arguments[1]}}`; }
    diff(sym) { return add(mul(this.args[0].diff(sym), mul(this.args[1], pow(this.args[0], sub(this.args[1], integer(1))))), mul(this.args[1].diff(sym), mul(pow(this.args[0], this.args[1]), ln(this.args[0])))); }
})