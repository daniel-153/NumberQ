const callable = (Cls) => new Proxy(Cls, {
    apply(target, _, args) {
        return new target(...args);
    }
})

export const Func = callable(class {
    #symbols; #args; #arity;
    
    constructor() {
        if (arguments.length === 0) {
            throw new Error('Func constructor must recieve at least one argument.');
        }
        else {
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
})




export const UnaryFunc = callable(class extends Func {
    constructor() {
        if (arguments.length === 1) super(arguments[0]);
        else throw new Error(`UnaryFunc must receive a single argument; provided arguments: ${Array.from(arguments)}`);
    }
})

export const identity = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `${arguments[0]}`; }
})

export const sin = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\sin\\left(${arguments[0]}\\right)`; }
})

export const cos = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\cos\\left(${arguments[0]}\\right)`; }
})

export const sqrt = callable(class extends UnaryFunc {
    constructor() { super(...arguments); }
    repr() { return `\\sqrt{${arguments[0]}}`; }
})






export const BinaryFunc = callable(class extends Func {
    constructor() {
        if (arguments.length === 2) super(arguments[0], arguments[1]);
        else throw new Error(`BinaryFunc must receive two arguments; provided arguments: ${Array.from(arguments)}`);
    }
})

export const add = callable(class extends BinaryFunc {
    constructor() { super(...arguments); }
    repr() { return `${arguments[0]}+${arguments[1]}`; }
})

export const subtract = callable(class extends BinaryFunc {
    constructor() { super(...arguments); }
    repr() { return `${arguments[0]}-${arguments[1]}`; }
})

export const multiply = callable(class extends BinaryFunc {
    constructor() { super(...arguments); }
    repr() { return `${arguments[0]}\\cdot ${arguments[1]}`; }
})

let x = Symbol('x')