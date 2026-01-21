export const Value = class {
    #value;
    
    constructor(value) {
        if (arguments.length === 1) {
            this.#value = arguments[0];
        }
        else throw new Error('Value constructor must recieve a single argument.');
    }

    get value() {return structuredClone(this.#value);}
}

export const Int = class extends Value {
    constructor(value) {
        if (Number.isSafeInteger(arguments[0])) {
            super(...arguments);
        }
        else throw new Error('Provided argument to Int constructor is not an integer.');
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
            super({num: arguments[0], den: arguments[1]});
            this.#num = arguments[0];
            this.#den = arguments[1];
        }
        else throw new Error('Frac constructor must recieve two integer arguments.');
    }

    get num() {return this.#num;}
    get den() {return this.#den;}
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
            
            const proposed_value = (arguments.length >= 2)? arguments[1] : undefined;

            this.#has_value = (arguments.length >= 2);
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

            if (this.#typeIsValid(proposed_value)) this.#value = proposed_value;
            else throw new Error('Proposed value is not in valid types.')
        }
        else throw new Error('Unknown constructor must recieve 0-2 arguments.');
    }

    get value() {return structuredClone(this.#value);}
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
    #symbol;
    
    constructor(valid_types, value, symbol) {
        if (arguments.length <= 3) {
            const proposed_types = (arguments.length >= 1)? arguments[0] : [Value, 'undefined'];
            const proposed_value = (arguments.length >= 2)? arguments[1] : undefined;
            super(proposed_types, proposed_value);

            if (arguments.length >= 3) {
                if (typeof(arguments[2]) === 'string') this.#symbol = arguments[2];
                else throw new Error('If provided, Coef symbol must be a string.');
            }
            else this.#symbol = 'C';
        }
        else throw new Error('Coef constructor must recieve 0-3 arguments.');
    }

    get symbol() {return this.#symbol;}
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
            [this.#operand1, this.#operand2].forEach(operand => {
                if (operand instanceof Oper) operand.evaluate();
            });
            
            this.perform();
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

    set value(_) {
        throw new Error('Cannot set value on an Oper object.')
    }

    static resolveCoefOperands(...operands) {
        return operands.map(operand => {
            if (operand instanceof Coef) {
                if (operand.has_value) return operand.value;
                else throw new Error('Could not resolve Coef operands; a Coef does not yet have a value.')
            }
            else return operand;
        })
    }
}

export const Sum = class extends Oper {
    constructor(operand1, operand2) {
        if (arguments.length === 2) super(...arguments);
        else throw new Error('Sum constructor must recieve 2 arguments.');
    }

    get perform() {
        return () => {
            const [operand1, operand2] = Oper.resolveCoefOperands(this.operand1, this.operand2);

            if (
                operand1 instanceof Int && 
                operand2 instanceof Int
            ) {
                this.value = new Int(operand1.value + operand2.value);
            }
            else if (
                operand1 instanceof Int &&
                operand2 instanceof Frac
            ) {
                this.value = new Frac(operand1.value*operand2.den + operand2.num, operand2.den);
            }
            else if (
                operand1 instanceof Frac &&
                operand2 instanceof Int
            ) {
                this.value = new Frac(operand2.value*operand1.den + operand1.num, operand1.den);
            }
            else if (
                operand1 instanceof Frac && 
                operand2 instanceof Frac
            ) {
                this.value = new Frac(operand1.value*operand2.den + operand2.value*operand1.den, operand1.den*operand2.den);
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
            const [operand1, operand2] = Oper.resolveCoefOperands(this.operand1, this.operand2);

            if (
                operand1 instanceof Int && 
                operand2 instanceof Int
            ) {
                this.value = new Int(operand1.value * operand2.value);
            }
            else if (
                operand1 instanceof Int &&
                operand2 instanceof Frac
            ) {
                this.value = new Frac(operand1.value * operand2.num, operand2.den);
            }
            else if (
                operand1 instanceof Frac &&
                operand2 instanceof Int
            ) {
                this.value = new Frac(operand2.value * operand1.num, operand1.den);
            }
            else if (
                operand1 instanceof Frac && 
                operand2 instanceof Frac
            ) {
                this.value = new Frac(operand1.num * operand2.num, operand1.den*operand2.den);
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
            const [base, exp] = Oper.resolveCoefOperands(this.operand1, this.operand2);

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

                this.value = accum.value;
            }
            else throw new Error('Could not perform Pow; unevaluated or invalid operand types.');
        }
    }
}