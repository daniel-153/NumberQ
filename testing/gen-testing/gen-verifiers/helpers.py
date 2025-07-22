import re
import random
from sympy import zoo, nan, Matrix, Basic
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

def tex_matrix_to_py_list(tex_matrix_str):
    # example: \begin{bmatrix} -41&-35&1&-17\\-5&-8&-21&13\\-5&-33&5&-31\\16&-26&10&-30 \end{bmatrix}
    tex_matrix_str = tex_matrix_str.replace('\\begin{bmatrix}', '').replace('\\end{bmatrix}', '') # break off the '\begin{bmatrix}' and the '\end{bmatrix}'
    tex_matrix_str = tex_matrix_str.replace('\\begin{pmatrix}', '').replace('\\end{pmatrix}', '') # break off the '\begin{pmatrix}' and the '\end{pmatrix}'

    return [[parse_latex(entry) for entry in row_str.split('&')] for row_str in tex_matrix_str.split('\\\\')]

def matrices_and_operator(expr_tex_str):
    end_matrix_str = None
    if '{bmatrix}' in expr_tex_str: end_matrix_str = '\\end{bmatrix}'
    elif '{pmatrix}' in expr_tex_str: end_matrix_str = '\\end{pmatrix}'

    # extract the two matrices and the operation
    matrix_A_str = matrix_B_str = operator = None
    if (end_matrix_str + '+') in expr_tex_str:
        matrix_A_str, matrix_B_str = expr_tex_str.split(end_matrix_str + '+')
        operator = '+'
    elif (end_matrix_str + '-') in expr_tex_str:
        matrix_A_str, matrix_B_str = expr_tex_str.split(end_matrix_str + '-')
        operator = '-'
    elif (end_matrix_str + '\\cdot') in expr_tex_str:
        matrix_A_str, matrix_B_str = expr_tex_str.split(end_matrix_str + '\\cdot')
        operator = '*'
    elif (end_matrix_str + '\\times') in expr_tex_str:
        matrix_A_str, matrix_B_str = expr_tex_str.split(end_matrix_str + '\\times')
        operator = '*'
    matrix_A_str  = matrix_A_str + end_matrix_str

    return {"matrix_A_str": matrix_A_str, "matrix_B_str": matrix_B_str, "operator": operator}

def matrix_scalar_from_tex(tex_matrix_str):
    scalar_str = tex_matrix_str.split('\\begin{')[0]

    if scalar_str == '': return 1 # no scalar present
    elif scalar_str == '-': return -1 # '-1' shorthand
    elif '.' in scalar_str: return float(scalar_str) # decimal scalar
    else: return int(scalar_str) # integer scalar

def parse_tex_mtrx_w_scalar(tex_str):
    scalar_num = matrix_scalar_from_tex(tex_str)
    tex_str = '\\begin{' + tex_str.split('\\begin{')[1] # break off the scalar from the string if present
    sympy_matrix = Matrix(tex_matrix_to_py_list(tex_str))

    return scalar_num * sympy_matrix

def remove_whitespace(tex_str):
    return re.sub(r'\s+', '', tex_str)

def round_with_format(number, places, keep_zeros=True):
    full_exact = Decimal(str(number))
    if places >= abs(full_exact.as_tuple().exponent): return str(full_exact) # number shouldn't end up with more places than it started with (don't round at all it the required places are more than/equal to what it has)
    quant = Decimal('1.' + '0' * places) if places > 0 else Decimal('1') # enforces number of decimals in result ('1' -> 0, '1.0' -> 1, '1.00' -> 2, ...)
    rounded = full_exact.quantize(quant, rounding=ROUND_HALF_UP)
    if keep_zeros: return str(rounded)
    else: return format(rounded.normalize(), 'f')

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

            evaluated_sympy_answer = None

            # try to convert the sympy obj to a number (int or float)
            if (sympy_answer_obj.is_number is not True) or (sympy_answer_obj.is_real is not True):
                raise Exception(f"Cannot convert sympy_answer_obj to a real number: '{sympy_answer_obj}'")
            elif sympy_answer_obj.is_Integer: 
                evaluated_sympy_answer = int(sympy_answer_obj)
            else:
                evaluated_sympy_answer = float(sympy_answer_obj)

            rounded_sympy_result = round_with_format(evaluated_sympy_answer, decimal_places, keep_rounded_zeros)

            if gens_answer_tex_string == rounded_sympy_result: return True # rounded answer strings must be exactly the same to be correct
            else: return False

        return comparer
    else:
        raise Exception(f"Could not resolve an answer form from answer_form_callback: '{answer_form}' is not equal to 'exact' or 'rounded'")