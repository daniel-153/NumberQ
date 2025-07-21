import re
import random
from sympy import zoo, nan, Matrix
from sympy.parsing.latex import parse_latex

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