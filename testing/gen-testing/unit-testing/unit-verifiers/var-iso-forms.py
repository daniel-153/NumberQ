import re
from sympy import symbols
from sympy.parsing.latex import parse_latex

def verify(test_data_obj): # test_data_obj -> current_forms, form_index, eq_array, number_of_vars
    # pre-process ambiguous latex
    eq_array = [*test_data_obj['eq_array']]
    for i in range(0, len(eq_array)):
        eq_array[i] = re.sub(r'(?<=[a-zA-Z0-9])\(', r'\\cdot(', eq_array[i]) # a(b+c) -> a\cdot(b+c) (parsed as a function by default)
        eq_array[i] = re.sub(r'(?<!\\)d([a-zA-Z])', r'{d}\\cdot{\1}', eq_array[i]) # de ->(d)\cdot(e) (parsed as a differential by default)
    
    print(eq_array)
    print(parse_latex(eq_array[2].split('=')[1]))

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

    all_passed = True
    failed_eqs = []
    for equation_index in range(1, len(eq_array)):
        eq_side_string = eq_array[equation_index].split('=')

        eq_lhs_expr = parse_latex(eq_side_string[0])
        eq_rhs_expr = parse_latex(eq_side_string[1])
        
        # check for equality upon substituting the expression for 'a'
        if (eq_lhs_expr.subs(var_obj_dict['a'], expression_for_a).equals(
            eq_rhs_expr.subs(var_obj_dict['a'], expression_for_a)) != True
        ): # (if the two sides are NOT equal after subbing)
            all_passed = False
            
            if (equation_index == len(eq_array) - 1 and test_data_obj['has_base_form']): # 'base_form' failed
                failed_eqs.append('base_form')
            else: # one of the b=,c=,d= forms failed
                failed_eqs.append(chr(97 + equation_index))

    # return the result of the test
    if (all_passed):
        return {
            "test_result": "passed"
        }
    else:
        return {
            "test_result": "failed",
            "failed_form": f"{test_data_obj['current_forms']}, index: {test_data_obj['form_index']}",
            "failed_equations": list(failed_eqs)
        }