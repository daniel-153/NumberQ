const callable = (Cls) => new Proxy(Cls, {
    apply(target, _, args) {
        return new target(...args);
    }
})

export const Func = class {
    #symbols; #args; #arity;
    
    constructor() {
        this.#symbols = new Set();
        this.#args = [];
        for (let i = 0; i < arguments.length; i++) {
            const curr_arg = arguments[i];
            if (typeof(curr_arg) === 'symbol') this.#symbols.add(curr_arg);
            else if (curr_arg instanceof Func) {
                curr_arg.symbols.forEach(sym => this.#symbols.add(sym));
            }
            else throw new Error('Func constructor must only receive Symbol or Func arguments.');

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
            if (typeof(arg) === 'symbol') return typeof(arg.description) === 'string'? arg.description : `[unlabeled_Symbol]`;
            else if (arg instanceof Func) return arg.toString();
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
})

export const neg = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\left(-${arguments[0]}\\right)`; }
})

export const sin = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\sin\\left(${arguments[0]}\\right)`; }
})

export const cos = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\cos\\left(${arguments[0]}\\right)`; }
})

export const tan = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\tan\\left(${arguments[0]}\\right)`; }
})

export const csc = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\csc\\left(${arguments[0]}\\right)`; }
})

export const sec = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\sec\\left(${arguments[0]}\\right)`; }
})

export const cot = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\cot\\left(${arguments[0]}\\right)`; }
})

export const sqrt = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\sqrt{${arguments[0]}}`; }
})

export const abs = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\left|${arguments[0]}\\right|`; }
})

export const exp = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `e^{${arguments[0]}}`; }
})

export const ln = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\ln\\left(${arguments[0]}\\right)`; }
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
})

export const sub = callable(class extends BinaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\left(${arguments[0]}\\right)-\\left(${arguments[1]}\\right)`; }
})

export const mul = callable(class extends BinaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\left(${arguments[0]}\\right)\\cdot\\left(${arguments[1]}\\right)`; }
})

export const div = callable(class extends BinaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\frac{${arguments[0]}}{${arguments[1]}}`; }
})

export const pow = callable(class extends BinaryFunc {
    constructor() { super(...arguments); }
    repr() { return `${arguments[0]}^{${arguments[1]}}`; }
})