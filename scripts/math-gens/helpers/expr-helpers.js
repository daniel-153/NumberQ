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

    static SizeError = class extends RangeError {
        constructor(message) {
            super(message);
            this.name = this.constructor.name;
        }
    }
}

export const Int = class extends Value {
    constructor(value) {
        if (
            arguments.length === 1 &&
            Number.isSafeInteger(arguments[0])
        ) super(...arguments);
        else if (arguments.length !== 1) throw new Error ('Int constructor must recieve a single argument.');
        else if (Number.isInteger(arguments[0])) {
            throw new Value.SizeError('Argument to Int constructor exceeds safe integer size.');
        }
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
        else if (arguments.length !== 2) throw new Error('Frac constructor must recieve two arguments.');
        else if (Number.isInteger(arguments[0]) && Number.isInteger(arguments[1])) {
            throw new Value.SizeError('One or both arguments to Frac constructor exceed safe integer size.');
        }
        else throw new Error('Frac constructor must recieve integer arguments.');
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
            else repr = 'C_{?}';

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
                return new Frac(operand1.num*operand2.den + operand2.num*operand1.den, operand1.den*operand2.den);
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

export const ArrayLikeExpr = class {
    #length; #valid_types; #typeIsValid;
    
    constructor(valid_types) {
        if (arguments.length >= 1) {
            if (
                Array.isArray(arguments[0]) &&
                arguments[0].every(type => typeof(type) === 'function' || typeof(type) === 'string')
            ) this.#valid_types = [...arguments[0]];
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
            ));
        }
        
        if (arguments.length >= 2) {
            for (let i = 1; i < arguments.length; i++) {
                if (this.#typeIsValid(arguments[i])) this[i - 1] = arguments[i];
                else throw new Error(`Provided ArrayLikeExpr arg at idx[${i}] is not in valid types.`);
            }
            this.#length = arguments.length - 1;
        }
        else this.#length = 0;

        Object.freeze(this);
    }

    *[Symbol.iterator]() {
        for (let i = 0; i < this.#length; i++) {
            yield this[i];
        }
    }
    get length() {return this.#length}

    toString() {
        let acc_str = '';
        for (let i = 0; i < this.length; i++) {
            let el_str;
            if (typeof(this.elToString) === 'function') el_str = this.elToString(i, ...arguments);
            else if (typeof(this[i]?.toString) === 'function') el_str = this[i].toString();
            else el_str = String(this[i]); 

            if (el_str !== '0') {
                if (
                    acc_str.length > 0 && 
                    el_str.length > 0 && 
                    el_str.charAt(0) !== '-'
                ) acc_str += `+${el_str}`;
                else acc_str += el_str;
            }
        }

        return acc_str.length > 0? acc_str : '0';
    }
}

export const PolynomArray = class extends ArrayLikeExpr {
    constructor() {
        super([Coef, Oper], ...arguments);
    }

    elToString(i, variable = 't') {
        if (this[i] instanceof Coef) {
            let coef_str = this[i].toString();
            if (coef_str === '0') return '0';
            else if (i === 0) return coef_str;
            else {
                if (coef_str === '1') coef_str = '';
                else if (coef_str === '-1') coef_str = '-';

                return `${coef_str}${variable}${i > 1? `^{${i}}` : ''}`;
            }
        }
        else throw new Error('Failed to convert polynom element to string: element is an operation.');
    }

    exprAtZero() {
        return new Mul(new Int(1), this[0]);
    }

    static scale(polynom_arr, scalar) {
        if (!(polynom_arr instanceof PolynomArray)) {
            throw new Error('PolynomArray.scale: first argument must be a PolynomArray.');
        }
        if (!(scalar instanceof Value || scalar instanceof Coef || scalar instanceof Oper)) {
            throw new Error('PolynomArray.scale: second argument must be a Value, Coef, or Oper.');
        }
        return new PolynomArray(...Array.from(polynom_arr, coef => new Mul(scalar, coef)));
    }

    static add(polynom_arr1, polynom_arr2) {
        if (!(polynom_arr1 instanceof PolynomArray)) {
            throw new Error('PolynomArray.add: first argument must be a PolynomArray.');
        }
        if (!(polynom_arr2 instanceof PolynomArray)) {
            throw new Error('PolynomArray.add: second argument must be a PolynomArray.');
        }
        const [shorter_poly, longer_poly] = polynom_arr2.length > polynom_arr1.length? [polynom_arr1, polynom_arr2] : [polynom_arr2, polynom_arr1];

        const sum_poly = [];
        for (let i = 0; i < longer_poly.length; i++) {
            const long_term = longer_poly[i];
            const short_term = i < shorter_poly.length? shorter_poly[i] : new Coef([Int], new Int(0));
            sum_poly.push(new Sum(short_term, long_term));
        }

        return new PolynomArray(...sum_poly);
    }

    static diff(polynom_arr) {
        if (!(polynom_arr instanceof PolynomArray)) {
            throw new Error('PolynomArray.diff: argument must be a PolynomArray.');
        }
        const diffed_poly = [];

        for (let n = 1; n < polynom_arr.length; n++) {
            diffed_poly.push(new Mul(new Int(n), polynom_arr[n]));
        }
        if (diffed_poly.length == 0) diffed_poly.push(new Coef([Int], new Int(0)));

        return new PolynomArray(...diffed_poly);
    }
};

export const PolExpTrig = class {
    #pet_values = {};
    
    constructor(pet_obj) {
        if (arguments.length <= 1) {
            const proposed_obj = arguments.length === 1? arguments[0] : {};
            if (proposed_obj instanceof Object) {
                ['degree', 'trig_freq', 'exp_freq'].forEach(pet_value => {
                    if (Object.prototype.hasOwnProperty.call(proposed_obj, pet_value)) {
                        if (pet_value === 'degree') {
                            if (proposed_obj[pet_value] instanceof Int && proposed_obj[pet_value].value >= 0) {
                                this.#pet_values[pet_value] = proposed_obj[pet_value];
                            }
                            else throw new Error('Invalid degree, PolExpTrig degree must be a non-negative Int.');
                        }
                        else if (proposed_obj[pet_value] instanceof Int || proposed_obj[pet_value] instanceof Frac) {
                            this.#pet_values[pet_value] = proposed_obj[pet_value];
                        }
                        else throw new Error(`Invalid ${pet_value}, PolExpTrig ${pet_value} must be an Int or Frac.`);
                    }
                    else this.#pet_values[pet_value] = new Int(0);
                });

                ['polynom_c', 'polynom_s'].forEach(pet_value => {
                    if (Object.prototype.hasOwnProperty.call(proposed_obj, pet_value)) {
                        if (
                            proposed_obj[pet_value] instanceof PolynomArray && 
                            proposed_obj[pet_value].length === this.#pet_values.degree.value + 1
                        ) this.#pet_values[pet_value] = proposed_obj[pet_value];
                        else throw new Error(`Provided ${pet_value} is not a polynom, or its degree differs from the pet degree.`);
                    }
                    else this.#pet_values[pet_value] = new PolynomArray(...Array.from(
                        {length: this.#pet_values.degree.value + 1},
                        (this.#pet_values.trig_freq.value === 0 && pet_value === 'polynom_s')? 
                        (() => new Coef([Int, Frac], new Int(0))) : (() => new Coef([Int, Frac]))
                    ));
                });
            }
            else throw new Error(`Invalid argument to PolExpTrig, typeof '${typeof(proposed_obj)}'.`);
        }
        else throw new Error('PolExpTrig constructor must recieve 0 or 1 arguments.');
    }

    get degree() {return this.#pet_values.degree}
    get trig_freq() {return this.#pet_values.trig_freq}
    get exp_freq() {return this.#pet_values.exp_freq}
    get polynom_c() {return this.#pet_values.polynom_c}
    get polynom_s() {return this.#pet_values.polynom_s}

    toString(variable = 't') {
        if (this.trig_freq.value !== 0) {
            let freq_coef = this.trig_freq.toString();
            if (freq_coef === '1') freq_coef = '';
            else if (freq_coef === '-1') freq_coef = '-';

            let sin_cos_expr = '';
            [
                ['sin', this.polynom_s], 
                ['cos', this.polynom_c]
            ].forEach(func_pol_pair => {
                const [func_str, polynom_arr] = func_pol_pair;
                let polynom_str = polynom_arr.toString(variable);

                if (polynom_str === '0') return;
                else {
                    let curr_trig_term;
                    if (Array.from(polynom_arr).filter(coef => coef.value?.value !== 0).length === 1) {
                        let t_n_coef = polynom_str.split(variable)[0];
                        polynom_str = polynom_str.replace(t_n_coef, '');
                        if (t_n_coef === '1') t_n_coef = '';
                        else if (t_n_coef === '-1') t_n_coef = '-';

                        curr_trig_term = `${t_n_coef}${polynom_str}\\${func_str}(${freq_coef}${variable})`;
                    }
                    else {
                        curr_trig_term = `(${polynom_str})\\${func_str}(${freq_coef}${variable})`;
                    }

                    if (sin_cos_expr !== '' && curr_trig_term.charAt(0) !== '-') {
                        sin_cos_expr += `+${curr_trig_term}`;
                    }
                    else sin_cos_expr += curr_trig_term;
                }
            });

            if (sin_cos_expr === '') return '0';
            else if (this.exp_freq.value !== 0) {
                let exp_coef = this.exp_freq.toString();
                if (exp_coef === '1') exp_coef = '';
                else if (exp_coef === '-1') exp_coef = '-';

                const exp_expr = `e^{${exp_coef}${variable}}`;
                
                const includes_sin = sin_cos_expr.includes('\\sin');
                const includes_cos = sin_cos_expr.includes('\\cos');

                if (includes_sin && includes_cos) {
                    return `${exp_expr}(${sin_cos_expr})`;
                }
                else {
                    const included_trig = includes_sin? '\\sin' : '\\cos';
                    const [pre_trig, post_trig] = sin_cos_expr.split(included_trig, 2);
                    const trig_alone = `${included_trig}${post_trig}`;

                    return `${pre_trig}${exp_expr}${trig_alone}`;
                }
            }
            else return sin_cos_expr;
        }
        else {
            let polynom_str = this.polynom_c.toString(variable);

            if (polynom_str === '0') return '0';
            else if (this.exp_freq.value !== 0) {
                let exp_coef = this.exp_freq.toString();
                if (exp_coef === '1') exp_coef = '';
                else if (exp_coef === '-1') exp_coef = '-';

                const exp_expr = `e^{${exp_coef}${variable}}`;

                if (Array.from(this.polynom_c).filter(coef => coef.value?.value !== 0).length === 1) {
                    let t_n_coef = polynom_str.split(variable)[0];
                    polynom_str = polynom_str.replace(t_n_coef, '');
                    if (t_n_coef === '1') t_n_coef = '';
                    else if (t_n_coef === '-1') t_n_coef = '-';

                    return `${t_n_coef}${polynom_str}${exp_expr}`;
                }
                else {
                    return `${exp_expr}(${polynom_str})`;
                }
            }
            else return polynom_str;
        }
    }

    exprAtZero() {
        return this.#pet_values.polynom_c.exprAtZero();
    }

    static diff(pet_obj) {
        if (pet_obj instanceof PolExpTrig) {
            return new PolExpTrig({
                exp_freq: pet_obj.exp_freq,
                trig_freq: pet_obj.trig_freq,
                degree: pet_obj.degree,
                polynom_c: PolynomArray.add(
                    PolynomArray.scale(pet_obj.polynom_c, pet_obj.exp_freq),
                    PolynomArray.add(
                        PolynomArray.diff(pet_obj.polynom_c),
                        PolynomArray.scale(pet_obj.polynom_s, pet_obj.trig_freq)
                    )
                ),
                polynom_s: PolynomArray.add(
                    PolynomArray.scale(pet_obj.polynom_s, pet_obj.exp_freq),
                    PolynomArray.add(
                        PolynomArray.diff(pet_obj.polynom_s),
                        PolynomArray.scale(pet_obj.polynom_c, new Mul(new Int(-1), pet_obj.trig_freq))
                    )
                )
            });
        }
        else throw new Error('PolExpTrig.diff can only be applied to a PolExpTrig instance.');
    }
}

export const PolExpTrigArray = class extends ArrayLikeExpr {
    constructor() {
        super([PolExpTrig], ...arguments);
    }

    elToString(i, variable = 't') {
        return this[i].toString(variable);
    }

    exprAtZero() {
        let acc_expr = new Sum(new Int(0), new Int(0));
        for (let i = 0; i < this.length; i++) {
            acc_expr = new Sum(acc_expr, this[i].exprAtZero());
        }
        return acc_expr;
    }

    static diff(pet_obj_arr) {
        if (pet_obj_arr instanceof PolExpTrigArray) {
            const diffed_pets = [];
            for (let i = 0; i < pet_obj_arr.length; i++) {
                diffed_pets.push(PolExpTrig.diff(pet_obj_arr[i]));
            }
            return new PolExpTrigArray(...diffed_pets);
        }
        else throw new Error('PolExpTrigArray.diff can only be applied to a PolExpTrigArray instance.');
    }
}