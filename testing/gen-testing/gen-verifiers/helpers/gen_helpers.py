import re
import random
from sympy import zoo, nan, Basic
from sympy.parsing.latex import parse_latex
from decimal import Decimal, ROUND_HALF_UP

def get_adjusted_tex_str(tex_str): # helper
   tex_str = re.sub(r'(?<=[a-zA-Z0-9])\(', r'\\cdot(', tex_str) # a(b+c) -> a\cdot(b+c) (parsed as a function by default)
   tex_str = re.sub(r'\\[a-zA-Z]+', lambda m: '`'.join(m.group(0)), tex_str) # mark latex commands so they don't get replaced/modified in the following
   tex_str = re.sub(r'(?<!`)d', r'{d}', tex_str) # d -> {d} as long as not in latex command (marked by `)
   tex_str = tex_str.replace('`', '') # remove marking backticks

   return tex_str

def var_from_prompt(solve_for_statement):
    var_to_solve_str = solve_for_statement.split('~')[1].split('}\\text{:}')[0]
    if '\\geq 0' in var_to_solve_str: var_to_solve_str = var_to_solve_str.replace('\\geq 0', '') # remove the >= 0 if present

    return var_to_solve_str

def get_rand_int_dict(range_min, range_max, symbols_list): # helper
    int_dict = {}

    for var_obj in symbols_list:
        int_dict[var_obj] = random.randint(range_min, range_max)

    return int_dict

def test_det_expr(det_expr, test_values_sign, num_tests): # helper
    expr_vars_list = list(det_expr.free_symbols)

    range_min = range_max = None
    if test_values_sign == 'non-negative':
        range_min = 0
        range_max = 1000
    elif test_values_sign == 'non-positive':
        range_min = -1000
        range_max = 0
    elif test_values_sign == 'either':
        range_min = -1000
        range_max = 1000
    
    all_tests_passed = True # no non-zero (but still defined) values found
    no_defined_values = True # not one single input was defined (test result un-interpretable)
    for i in range(0, num_tests):
        subs_dict = get_rand_int_dict(range_min, range_max, expr_vars_list)
        current_det_value = det_expr.subs(subs_dict)
        
        if (current_det_value == zoo) or (current_det_value == nan): # inputs outside of domain
            continue
        else: # inputs yielded a number
            no_defined_values = False

            if (current_det_value != 0): # but that value wasn't equal to zero (test failed)
                all_tests_passed = False
                break

    if no_defined_values:
        raise Exception('Equation is untestable: no defined values could be found for det_func.')
    
    return all_tests_passed

def remove_whitespace(tex_str):
    return re.sub(r'\s+', '', tex_str)

def round_with_format(number, places, keep_zeros=True):
    full_exact = Decimal(str(number))
    if places >= abs(full_exact.as_tuple().exponent): return str(full_exact) # number shouldn't end up with more places than it started with (don't round at all it the required places are more than/equal to what it has)
    quant = Decimal('1.' + '0' * places) if places > 0 else Decimal('1') # enforces number of decimals in result ('1' -> 0, '1.0' -> 1, '1.00' -> 2, ...)
    rounded = full_exact.quantize(quant, rounding=ROUND_HALF_UP)
    if keep_zeros: rounded_result = str(rounded)
    else: rounded_result = format(rounded.normalize(), 'f')
    return rounded_result if rounded_result != '-0' else '0' # handle the '-0' case

def build_new_answer_comparer(settings, answer_form_callback):
    def check_arg_types(gens_answer, sympy_answer): # helper
        gens_answer_type = type(gens_answer).__name__
        sympy_answer_type = type(sympy_answer).__name__
        if gens_answer_type != 'str':
            raise Exception(f"Only LaTeX strings are allowed in comparisons with sympy objects: '{gens_answer_type}' is not allowed.")
        if not isinstance(sympy_answer, Basic):
            raise Exception(f"Only Basic sympy objects are allowed for comparisons with gens LaTeX strings: '{sympy_answer_type}' is not allowed.")

    # answer_form_callback determines whether provided gens answer needs to be exact or rounded based on settings
    answer_form = answer_form_callback(settings)
    if answer_form == 'exact':
        def comparer(gens_answer_tex_string, sympy_answer_obj):
            check_arg_types(gens_answer_tex_string, sympy_answer_obj)
            
            parsed_gens_answer = parse_latex(gens_answer_tex_string)
            result = parsed_gens_answer.equals(sympy_answer_obj)

            if result == True: return result
            else: return False

        return comparer
    elif answer_form == 'rounded':
        decimal_places = int(settings["decimal_places"]) # automatically throws if can't be converted to an integer
        keep_rounded_zeros = None
        if settings["keep_rounded_zeros"] == "is_checked":
            keep_rounded_zeros = True
        elif settings["keep_rounded_zeros"] == "undefined":
            keep_rounded_zeros = False
        else:
            raise Exception(f"Could not resolve keep_rounded_zeros with a value of: '{settings["keep_rounded_zeros"]}'")

        def comparer(gens_answer_tex_string, sympy_answer_obj):
            check_arg_types(gens_answer_tex_string, sympy_answer_obj)

            evaluated_sympy_answer = sympy_answer_obj.evalf()

            # ensure the sympy answer is a real number
            if (evaluated_sympy_answer.is_number is not True) or (evaluated_sympy_answer.is_real is not True):
                raise Exception(f"Cannot represent sympy_answer_obj as a real number: '{sympy_answer_obj}'")

            rounded_sympy_result = round_with_format(evaluated_sympy_answer, decimal_places, keep_rounded_zeros)

            if gens_answer_tex_string == rounded_sympy_result: return True # rounded answer strings must be exactly the same to be correct
            else: return False

        return comparer
    else:
        raise Exception(f"Could not resolve an answer form from answer_form_callback: '{answer_form}' is not equal to 'exact' or 'rounded'")
    
def exact_decimal_to_frac(exact_decimal_str):
    # ensure the decimal str is valid
    if not isinstance(exact_decimal_str, str): raise Exception(f"exact_decimal_to_frac only handles strings; input was of type: '{type(exact_decimal_str)}'")
    float(exact_decimal_str) # throws if not possible to convert to a number
    if 'e' in exact_decimal_str: raise Exception(f"Numbers in e-notation are not valid exact decimal strings; input: '{exact_decimal_str}'")
    if not '.' in exact_decimal_str: return int(exact_decimal_str) # no decimal places at all

    before_decimal, after_decimal = exact_decimal_str.split('.')
    num_decimal_places = len(after_decimal)

    return '\\frac{' + str(int(before_decimal + after_decimal)) + '}{' + '1' + ('0' * num_decimal_places) + '}'

def str_is_int_or_decimal(string):
    if '.' in string: 
        if string.count('.') > 1: return False
        else: return string.replace('.', '').isdigit()
    else: return string.isdigit()

def attempt_known_side_label_parse(label_tex_str, sorted_labels_dict, side_name):
    if label_tex_str.count('\\,\\mathrm') == 1 and str_is_int_or_decimal(label_tex_str.split('\\,\\mathrm')[0]):
        sorted_labels_dict[side_name] = {
            'type': 'labeled_known',
            'tex_str': label_tex_str,
            'numerical_value': parse_latex(str(exact_decimal_to_frac(label_tex_str.split('\\,\\mathrm')[0])))
        }
    elif str_is_int_or_decimal(label_tex_str):
        sorted_labels_dict[side_name] = {
            'type': 'labeled_known',
            'tex_str': label_tex_str,
            'numerical_value': parse_latex(str(exact_decimal_to_frac(label_tex_str)))
        }
    else:
        raise Exception(f"Known side label not parse-able or is invalid: '{label_tex_str}'")
    
def attempt_known_angle_label_parse(label_tex_str, sorted_labels_dict, angle_name):
    if label_tex_str.count('^\\circ') == 1 and str_is_int_or_decimal(label_tex_str.split('^\\circ')[0]):
        sorted_labels_dict[angle_name] = {
            'type': 'labeled_known',
            'tex_str': label_tex_str,
            'numerical_value': parse_latex(str(exact_decimal_to_frac(label_tex_str.split('^\\circ')[0])))
        }
    else:
        raise Exception(f"Known angle label not parse-able or is invalid: '{label_tex_str}'")