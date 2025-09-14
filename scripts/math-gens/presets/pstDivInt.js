import * as H from '../helpers/gen-helpers.js';

export default [
    {
        title: 'Reverse 5&times;5 Times Table Up To 25',
        example_problem: '12\\div 4=\\:?',
        description: 'Divisors from 1 to 5 and quotients from 1 to 5.',
        get_settings: function() {
            const P = H.randInt(1, 5);
            const Q = H.randInt(1, 5);
            const PQ = P*Q;
            
            return {
                dividend_range_min: PQ,
                dividend_range_max: PQ,
                divisor_range_min: P,
                divisor_range_max: P,
                divide_evenly: 'always'
            };
        }
    },
    {
        title: 'Reverse 10&times;10 Times Table Up To 50',
        example_problem: '36\\div 9=\\:?',
        description: 'Divisors from 1 to 10 and quotients from 1 to 5.',
        get_settings: function() {
            const P = H.randInt(1, 10);
            const Q = H.randInt(1, 5);
            const PQ = P*Q;
            
            return {
                dividend_range_min: PQ,
                dividend_range_max: PQ,
                divisor_range_min: P,
                divisor_range_max: P,
                divide_evenly: 'always'
            };
        }
    },
    {
        title: 'Reverse 10&times;10 Times Table',
        example_problem: '72\\div 8=\\:?',
        description: 'Divisors from 1 to 10 and quotients from 1 to 10.',
        get_settings: function() {
            const P = H.randInt(1, 10);
            const Q = H.randInt(1, 10);
            const PQ = P*Q;
            
            return {
                dividend_range_min: PQ,
                dividend_range_max: PQ,
                divisor_range_min: P,
                divisor_range_max: P,
                divide_evenly: 'always'
            };
        }
    },
    {
        title: 'Reverse 12&times;12 Times Table',
        example_problem: '110\\div 11=\\:?',
        description: 'Divisors from 1 to 12 and quotients from 1 to 12.',
        get_settings: function() {
            const P = H.randInt(1, 12);
            const Q = H.randInt(1, 12);
            const PQ = P*Q;
            
            return {
                dividend_range_min: PQ,
                dividend_range_max: PQ,
                divisor_range_min: P,
                divisor_range_max: P,
                divide_evenly: 'always'
            };
        }
    },
    {
        title: '2 Digits Divided By 1 Digit (no remainders)',
        example_problem: '~~~~~~6\\enclose{longdiv}{90}~~~~~~',
        description: 'Divide 2 digit numbers by 1 digit numbers without a remainder.',
        get_settings: function() {
            return {
                dividend_range_min: 10,
                dividend_range_max: 99,
                divisor_range_min: 1,
                divisor_range_max: 9,
                divide_evenly: 'always',
                divint_notation: 'long_div'
            };
        }
    },
    {
        title: '2 Digits Divided By 1 Digit (remainders)',
        example_problem: '~~~~~~3\\enclose{longdiv}{22}~~~~~~',
        description: 'Divide 2 digit numbers by 1 digit numbers with a remainder.',
        get_settings: function() {
            return {
                dividend_range_min: 10,
                dividend_range_max: 99,
                divisor_range_min: 1,
                divisor_range_max: 9,
                divide_evenly: 'never',
                divint_notation: 'long_div'
            };
        }
    },
    {
        title: '3 Digits Divided By 1 Digit (no remainders)',
        example_problem: '~~~~~~6\\enclose{longdiv}{300}~~~~~~',
        description: 'Divide 3 digit numbers by 1 digit numbers without a remainder.',
        get_settings: function() {
            return {
                dividend_range_min: 100,
                dividend_range_max: 999,
                divisor_range_min: 1,
                divisor_range_max: 9,
                divide_evenly: 'always',
                divint_notation: 'long_div'
            };
        }
    },
    {
        title: '3 Digits Divided By 1 Digit (remainders)',
        example_problem: '~~~~9\\enclose{longdiv}{224}~~~~',
        description: 'Divide 3 digit numbers by 1 digit numbers with a remainder.',
        get_settings: function() {
            return {
                dividend_range_min: 100,
                dividend_range_max: 999,
                divisor_range_min: 1,
                divisor_range_max: 9,
                divide_evenly: 'never',
                divint_notation: 'long_div'
            };
        }
    },
    {
        title: '2 Digit Dividends (general)',
        example_problem: '~~~~~~14\\enclose{longdiv}{88}~~~~~~',
        description: 'Division with 2 digit dividends (neither remainders nor even division are forced).',
        get_settings: function() {
            return {
                dividend_range_min: 10,
                dividend_range_max: 99,
                divisor_range_min: 1,
                divisor_range_max: Number('9' + H.randFromList(['', '9'])),
                divide_evenly: 'sometimes',
                divint_notation: 'long_div'
            };
        }
    },
    {
        title: '3 Digit Dividends (general)',
        example_problem: '~~~~25\\enclose{longdiv}{419}~~~~',
        description: 'Division with 3 digit dividends (neither remainders nor even division are forced).',
        get_settings: function() {
            return {
                dividend_range_min: 100,
                dividend_range_max: 999,
                divisor_range_min: 1,
                divisor_range_max: Number('9' + H.randFromList(['', '9', '99'])),
                divide_evenly: 'sometimes',
                divint_notation: 'long_div'
            };
        }
    },
    {
        title: 'Random Digit Dividends and Divisors',
        example_problem: '~~~~315\\enclose{longdiv}{12}~~~~',
        description: 'Dividends and divisors with a random number of digits.',
        get_settings: function() {
            return {
                dividend_range_min: 1,
                dividend_range_max: Number('9' + H.randFromList(['', '9', '99'])),
                divisor_range_min: 1,
                divisor_range_max: Number('9' + H.randFromList(['', '9', '99'])),
                divide_evenly: H.randFromList(['always', 'never']),
                divint_notation: 'long_div'
            };
        }
    },
    {
        title: 'Division With Negatives (5&times;5 times table)',
        example_problem: '(-21)\\div 7=\\:?',
        description: 'Division with a negative dividend, divisor, or both (divisors and quotients in [-5, 5]).',
        get_settings: function() {
            let P = H.randInt(1, 5) * (-1)**H.randInt(0, 1);
            let Q = H.randInt(1, 5) * (-1)**H.randInt(0, 1);
            if (P > 0 && Q > 0) (H.randInt(0, 1) === 0)? (P *= -1) : (Q *= -1);
            const PQ = P*Q;
            
            return {
                dividend_range_min: PQ,
                dividend_range_max: PQ,
                divisor_range_min: P,
                divisor_range_max: P,
                divide_evenly: 'always'
            };
        }
    },
    {
        title: 'Division With Negatives (12&times;12 times table)',
        example_problem: '81\\div (-9)=\\:?',
        description: 'Division with a negative dividend, divisor, or both (divisors and quotients in [-12, 12]).',
        get_settings: function() {
            let P = H.randInt(1, 12) * (-1)**H.randInt(0, 1);
            let Q = H.randInt(1, 12) * (-1)**H.randInt(0, 1);
            if (P > 0 && Q > 0) (H.randInt(0, 1) === 0)? (P *= -1) : (Q *= -1);
            const PQ = P*Q;
            
            return {
                dividend_range_min: PQ,
                dividend_range_max: PQ,
                divisor_range_min: P,
                divisor_range_max: P,
                divide_evenly: 'always'
            };
        }
    },
    {
        title: 'Divide 0',
        example_problem: '0\\div 37=\\:?',
        description: 'Identify a division of 0 by a number as 0.',
        get_settings: function() {
            return {
                dividend_range_min: 0,
                dividend_range_max: 0,
                divisor_range_min: 1,
                divisor_range_max: Number('9' + H.randFromList(['', '9', '99'])),
                divide_evenly: 'always',
                divint_zero_rule: 'only_dividend'
            };
        }
    },
    {
        title: 'Divide By 0',
        example_problem: '98\\div 0=\\:?',
        description: 'Identify a division of a number by 0 as undefined.',
        get_settings: function() {
            return {
                dividend_range_min: 0,
                dividend_range_max: Number('9' + H.randFromList(['', '9', '99'])),
                divisor_range_min: 0,
                divisor_range_max: 0,
                divide_evenly: 'never',
                divint_zero_rule: 'either'
            };
        }
    },
    {
        title: 'Divide By 1',
        example_problem: '255\\div 1=\\:?',
        description: 'Identify a division of a number by 1 as the number itself.',
        get_settings: function() {
            return {
                dividend_range_min: 0,
                dividend_range_max: Number('9' + H.randFromList(['', '9', '99'])),
                divisor_range_min: 1,
                divisor_range_max: 1,
                divide_evenly: 'always',
                divint_zero_rule: 'only_dividend'
            };
        }
    },
    {
        title: 'Divide Multiples Of 10 By 10',
        example_problem: '90\\div 10=\\:?',
        description: 'Identify division by 10 as a reduction by one place value.',
        get_settings: function() {
            const dividend = 10 * H.randInt(1, 99);

            return {
                dividend_range_min: dividend,
                dividend_range_max: dividend,
                divisor_range_min: 10,
                divisor_range_max: 10,
                divide_evenly: 'always'
            };
        }
    },
    {
        title: 'Divide Multiples Of 100 By 100',
        example_problem: '4500\\div 100=\\:?',
        description: 'Identify division by 100 as a reduction by two place values.',
        get_settings: function() {
            const dividend = 100 * H.randInt(1, 99);

            return {
                dividend_range_min: dividend,
                dividend_range_max: dividend,
                divisor_range_min: 100,
                divisor_range_max: 100,
                divide_evenly: 'always'
            };
        }
    },
]