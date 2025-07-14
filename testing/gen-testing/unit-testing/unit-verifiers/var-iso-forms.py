import re
from sympy import symbols, Eq, solve, simplify
from sympy.parsing.latex import parse_latex

def verify(test_data_obj): # test_data_obj -> current_forms, form_index, eq_array, number_of_vars    
    # pre-process ambiguous latex
    eq_array = [*test_data_obj['eq_array']]
    for i in range(0, len(eq_array)):
        eq_array[i] = re.sub(r'(?<!\\)d([a-zA-Z])', r'{d}\\cdot{\1}', eq_array[i]) # de ->(d)\cdot(e) (parsed as a differential by default)
        eq_array[i] = re.sub(r'(?<=[a-zA-Z0-9])\(', r'\\cdot(', eq_array[i]) # a(b+c) -> a\cdot(b+c) (parsed as a function by default)

    # dynamically define all the needed variables as sympy symbols
    var_letter_list = []
    var_obj_dict = {}
    for i in range(0, test_data_obj['number_of_vars']):
        current_letter = chr(97 + i) 
        var_letter_list.append(current_letter)
        var_obj_dict[current_letter] = symbols(f"{current_letter}") 

    # the first eq in the array is always 'a' in terms of all the other variables, like a=(b+c)/d
    split_first_eq = eq_array[0].split('=')

    # but first check if this is not the case (which would indicate an error in the latex writing)
    if (len(split_first_eq) != 2 or split_first_eq[0] != 'a' or (var_obj_dict['a'] in parse_latex(split_first_eq[1]).free_symbols)):
        return {
            "test_result": "failed",
            "comment": "the equation for (a) was not isolated for (a) or could not be parsed"
        }
    
    # ensure this expression for 'a' makes all of the other equations true
    expression_for_a = parse_latex(split_first_eq[1])
    a_equals_equation = Eq(var_obj_dict['a'], expression_for_a)

    all_passed = True
    failed_eqs = []
    sympy_calculated_sols = {}
    supplied_eqs_w_errors = {}
    for equation_index in range(1, len(eq_array)):
        eq_side_string = eq_array[equation_index].split('=')

        eq_lhs_expr = parse_latex(eq_side_string[0])
        eq_rhs_expr = parse_latex(eq_side_string[1])

        # check for equality upon substituting the expression for 'a'
        lhs_subbed_for_a = eq_lhs_expr.subs(var_obj_dict['a'], expression_for_a)
        rhs_subbed_for_a = eq_rhs_expr.subs(var_obj_dict['a'], expression_for_a)
        lhs_a_subbed_str = str(lhs_subbed_for_a)
        rhs_a_subbed_str = str(rhs_subbed_for_a)

        if (
            lhs_subbed_for_a.equals(rhs_subbed_for_a) != True and not # sides not exactly equal
            (
                lhs_subbed_for_a**2 == rhs_subbed_for_a**2 and # and this isn't a b?=sqrt(b**2) case
                    ( # lhs appears to be a *single sqrt* expr (sqrt(...))
                        lhs_a_subbed_str.startswith('sqrt(') and
                        lhs_a_subbed_str.endswith(')') 
                    ) or
                    ( # rhs appears to be a *single sqrt* expr (sqrt(...))
                        rhs_a_subbed_str.startswith('sqrt(') and
                        rhs_a_subbed_str.endswith(')')
                    )
            ) and not simplify(lhs_subbed_for_a - rhs_subbed_for_a) == 0

        ): # (if the two sides are NOT equal after subbing)
            all_passed = False
            
            if (equation_index == len(eq_array) - 1 and test_data_obj['has_base_form']): # 'base_form' failed
                failed_eqs.append('base_form')
                sympy_calculated_sols["sympy: (base_form) solved for (a)"] = str(solve(
                    Eq(eq_lhs_expr, eq_rhs_expr), var_obj_dict['a']
                )[0])
                supplied_eqs_w_errors[f"supplied Eq for (a)"] = f"a={str(expression_for_a)}"

            else: # one of the b=,c=,d= forms failed
                failed_eqs.append(chr(97 + equation_index))
                sympy_calculated_sols[f"sympy: (a) solved for ({chr(97 + equation_index)})"] = str(solve(
                    a_equals_equation, var_obj_dict[chr(97 + equation_index)]
                )[0])
                supplied_eqs_w_errors[f"supplied Eq for ({chr(97 + equation_index)})"] = f"{str(eq_lhs_expr)}={str(eq_rhs_expr)}"


    # return the result of the test
    if (all_passed):
        return {
            "test_result": "passed"
        }
    else:
        return {
            "test_result": "failed",
            "failed_form": f"{test_data_obj['current_forms']}, index: {test_data_obj['form_index']}",
            "failed_equations": list(failed_eqs),
            "sympy_sols": sympy_calculated_sols,
            "eqs_with_errors": supplied_eqs_w_errors
        }