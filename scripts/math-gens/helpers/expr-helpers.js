export const Value = class {
    #cargs;
    
    constructor() {
        for (let i = 0; i < arguments.length; i++) {
            if (arguments[i] === Object(arguments[i])) {
                throw new Error('Value constructor must only recieve primitive type arguments.');
            }
        }
        
        this.#cargs = Object.freeze(arguments);
    }

    get cargs() { return this.#cargs; }
    get clone() {
        return () => new this.constructor(...this.#cargs);
    }
}

export const Int = class extends Value {
    constructor(value) {
        if (
            arguments.length === 1 &&
            Number.isSafeInteger(arguments[0])
        ) super(...arguments);
        else throw new Error('Provided argument to Int constructor is not an integer.');
    }

    get value() {return this.cargs[0];}
    get toString() {
        return () => String(this.value + 0);
    }
}

export const Frac = class extends Value {
    #num; #den;
    
    constructor(num, den) {
        if (
            arguments.length === 2 &&
            Number.isSafeInteger(arguments[0]) &&
            Number.isSafeInteger(arguments[1]) &&
            arguments[1] !== 0
        ) {
            super(...arguments);
            this.#num = this.cargs[0];
            this.#den = this.cargs[1];
        }
        else throw new Error('Frac constructor must recieve two integer arguments.');
    }

    get num() {return this.#num;}
    get den() {return this.#den;}

    get reduce() {
        return () => {
            let a = this.#num;;
            let b = this.#den;
            while (b !== 0) {
                const t = b;
                b = a % b;
                a = t;
            }

            this.#num /= a;
            this.#den /= a;

            if (this.#den < 0) {
                this.#num *= -1;
                this.#den *= -1;
            }
        }
    }

    get toString() {
        return () => {
            this.reduce();

            if (this.#den === 1) return String(this.#num + 0);
            else if (this.#num < 0) return `-\\frac{${Math.abs(this.#num)}}{${this.#den}}`;
            else return `\\frac{${this.#num + 0}}{${this.#den}}`;
        }
    }
}

export const Unknown = class {
    #valid_types; #value; #has_value; #typeIsValid
    
    constructor(valid_types, value) {
        if (arguments.length <= 2) {
            if (arguments.length >= 1) {
                if (
                    Array.isArray(arguments[0]) &&
                    arguments[0].every(type => typeof(type) === 'function' || typeof(type) === 'string')
                ) this.#valid_types = arguments[0];
                else throw new Error('Provided valid_types is not an array of constructors.')
            }
            else this.#valid_types = [Object, 'number', 'string', 'boolean', 'undefined'];
            
            this.#typeIsValid = function(value) {
                return this.#valid_types.some(type_indicator => (
                        typeof(type_indicator) === 'function' && 
                        value instanceof type_indicator
                    ) ||
                    (
                        typeof(type_indicator) === 'string' &&
                        typeof(value) === type_indicator
                ))
            }

            if (arguments.length >= 2) {
                if (this.#typeIsValid(arguments[1])) {
                    this.#value = arguments[1];
                    this.#has_value = true;
                }
                else throw new Error('Proposed value is not in valid types.')
            }
            else this.#has_value = false;       
        }
        else throw new Error('Unknown constructor must recieve 0-2 arguments.');
    }

    get value() {
        if (this.#value instanceof Value) return this.#value.clone();
        else return structuredClone(this.#value);
    }
    set value(value) {
        if (this.#has_value) {
            throw new Error('Cannot set unknown value because it has already been determined.')
        }
        else if (!this.#typeIsValid(value)) {
            throw new Error('Cannot set unknown value because provided value does not match preset types.')
        }
        else {
            this.#value = value;
            this.#has_value = true;
        }
    }
    
    get has_value() {return this.#has_value;}
    get valid_types() {return [...this.#valid_types];}
}

export const Coef = class extends Unknown {
    #symbol; #has_symbol;
    
    constructor(valid_types, value, symbol) {
        if (arguments.length <= 3) {
            if (arguments.length >= 2) super(arguments[0], arguments[1]);
            else if (arguments.length === 1) super(arguments[0]);
            else super([Value]);

            if (arguments.length >= 3) {
                if (typeof(arguments[2]) === 'string') this.#symbol = arguments[2];
                else throw new Error('If provided, Coef symbol must be a string.');
            }
        }
        else throw new Error('Coef constructor must recieve 0-3 arguments.');
    }

    get symbol() {return this.#symbol;}
    set symbol(value) {
        if (this.#has_symbol) {
            throw new Error('Cannot set Coef symbol because it has already been determined.');
        }
        else if (typeof(value) !== 'string') {
            throw new Error('Failed to set Coef symbol, coef symbol must be a string.');
        }
        else {
            this.#symbol = value;
            this.#has_symbol = true;
        }
    }

    get has_symbol() {return this.#has_symbol};

    get toString() {
        return () => {
            let repr;
            if (this.has_value) {
                if (typeof(this.value?.toString) === 'function') repr = this.value.toString();
                else repr = this.value;
            }
            else if (this.#has_symbol) repr = this.#symbol;
            else repr = this;

            return String(repr)
        }
    }
}

export const Oper = class extends Unknown {
    #operand1; #operand2;
    
    constructor(operand1, operand2) {
        if (
            arguments.length === 1 && 
            (arguments[0] instanceof Value || arguments[0] instanceof Coef)
        ) {
            super([Value], arguments[0]);
            this.#operand1 = new Value(undefined);
            this.#operand2 = new Value(undefined);
        }
        else if (
            arguments.length === 2 && 
            Array.from(arguments).every(arg => (
                arg instanceof Value || arg instanceof Oper || arg instanceof Coef
            ))
        ) {
            super([Value]);
            this.#operand1 = operand1;
            this.#operand2 = operand2;
        }
        else throw new Error('Oper constructor must recieve 1-2 Value, Oper, or Coef arguments.')
    }

    get evaluate() {
        return () => {
            if (this.has_value) return;
            
            [this.#operand1, this.#operand2].forEach(operand => {
                if (operand instanceof Oper) operand.evaluate();
            });
            
            super.value = this.perform();
        }
    }

    get subs() {
        return (mapping = new Map()) => {
            if (!(mapping instanceof Map)) throw new Error('Substitution mapping is not a Map.');
            
            const [subs_operand1, subs_operand2] = [
                this.#operand1, this.#operand2
            ].map(operand => {
                if (mapping.has(operand)) return mapping.get(operand);
                else if (operand instanceof Oper) return operand.subs(mapping);
                else return operand;
            });

            return new this.constructor(subs_operand1, subs_operand2);
        }
    }    

    get operand1() {return this.#operand1;}
    get operand2() {return this.#operand2;}

    get value() { return super.value; }
    set value(_) {
        throw new Error('Cannot set value on an Oper object.')
    }

    static resolveOperands(...operands) {
        return operands.map(operand => {
            if (operand instanceof Unknown) {
                if (operand.has_value) return operand.value;
                else throw new Error('Could not resolve operands; Unknown operand does not yet have a value.');
            }
            else return operand;
        });
    }
}

export const Sum = class extends Oper {
    constructor(operand1, operand2) {
        if (arguments.length === 2) super(...arguments);
        else throw new Error('Sum constructor must recieve 2 arguments.');
    }

    get perform() {
        return () => {
            const [operand1, operand2] = Oper.resolveOperands(this.operand1, this.operand2);

            if (
                operand1 instanceof Int && 
                operand2 instanceof Int
            ) {
                return new Int(operand1.value + operand2.value);
            }
            else if (
                operand1 instanceof Int &&
                operand2 instanceof Frac
            ) {
                return new Frac(operand1.value*operand2.den + operand2.num, operand2.den);
            }
            else if (
                operand1 instanceof Frac &&
                operand2 instanceof Int
            ) {
                return new Frac(operand2.value*operand1.den + operand1.num, operand1.den);
            }
            else if (
                operand1 instanceof Frac && 
                operand2 instanceof Frac
            ) {
                return new Frac(operand1.value*operand2.den + operand2.value*operand1.den, operand1.den*operand2.den);
            }
            else throw new Error('Could not perform Sum; unevaluated or invalid operand types.');
        }
    }
}

export const Mul = class extends Oper {
    constructor(operand1, operand2) {
        if (arguments.length === 2) super(...arguments);
        else throw new Error('Sum constructor must recieve 2 arguments.');
    }

    get perform() {
        return () => {
            const [operand1, operand2] = Oper.resolveOperands(this.operand1, this.operand2);

            if (
                operand1 instanceof Int && 
                operand2 instanceof Int
            ) {
                return new Int(operand1.value * operand2.value);
            }
            else if (
                operand1 instanceof Int &&
                operand2 instanceof Frac
            ) {
                return new Frac(operand1.value * operand2.num, operand2.den);
            }
            else if (
                operand1 instanceof Frac &&
                operand2 instanceof Int
            ) {
                return new Frac(operand2.value * operand1.num, operand1.den);
            }
            else if (
                operand1 instanceof Frac && 
                operand2 instanceof Frac
            ) {
                return new Frac(operand1.num * operand2.num, operand1.den*operand2.den);
            }
            else throw new Error('Could not perform Mul; unevaluated or invalid operand types.');
        }
    }
}

export const Pow = class extends Oper {
    constructor(operand1, operand2) {
        if (arguments.length === 2) super(...arguments);
        else throw new Error('Sum constructor must recieve 2 arguments.');
    }

    get perform() {
        return () => {
            let [base, exp] = Oper.resolveOperands(this.operand1, this.operand2);

            if (
                (base instanceof Int || base instanceof Frac) &&
                exp instanceof Int
            ) {
                if (exp.value < 0) {
                    if (base instanceof Int) base = new Frac(1, base.value);
                    else base = new Frac(base.den, base.num);
                    exp = new Int(-exp.value);
                }
                 
                let accum = new Mul(new Int(1), new Int(1));
                for (let n = 0; n < exp.value; n++) {
                    accum = new Mul(accum, base);
                }
                accum.evaluate();

                return accum.value;
            }
            else throw new Error('Could not perform Pow; unevaluated or invalid operand types.');
        }
    }
}