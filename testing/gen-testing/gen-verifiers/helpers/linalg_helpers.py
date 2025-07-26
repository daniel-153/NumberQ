from sympy.parsing.latex import parse_latex
from sympy import Matrix

def tex_matrix_to_py_list(tex_matrix_str, parse = True):
    # example: \begin{bmatrix} -41&-35&1&-17\\-5&-8&-21&13\\-5&-33&5&-31\\16&-26&10&-30 \end{bmatrix}
    tex_matrix_str = tex_matrix_str.replace('\\begin{bmatrix}', '').replace('\\end{bmatrix}', '') # break off the '\begin{bmatrix}' and the '\end{bmatrix}'
    tex_matrix_str = tex_matrix_str.replace('\\begin{pmatrix}', '').replace('\\end{pmatrix}', '') # break off the '\begin{pmatrix}' and the '\end{pmatrix}'

    if parse is True: return [[parse_latex(entry) for entry in row_str.split('&')] for row_str in tex_matrix_str.split('\\\\')]
    else: return [[entry for entry in row_str.split('&')] for row_str in tex_matrix_str.split('\\\\')]


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

def get_vector_type(vector_tex_str):
    vector_type = None
    if '\\rangle' in vector_tex_str: vector_type = 'angle_brackets'
    elif '\\end{bmatrix}' in vector_tex_str: vector_type = 'bmatrix'
    elif '\\end{array}\\right)' in vector_tex_str: vector_type = 'array'

    return vector_type

def vectors_and_operation(expr_tex_str):
    vector_closing = None # becomes the string of the closing vector command (\rangle, \end{bmatrix}, or \end{array}\right))
    if '\\rangle' in expr_tex_str: vector_closing = '\\rangle'
    elif '\\end{bmatrix}' in expr_tex_str: vector_closing = '\\end{bmatrix}'
    elif '\\end{array}\\right)' in expr_tex_str: vector_closing = '\\end{array}\\right)'

    # determine the operation between the vectors
    operator = None
    if (vector_closing + '+') in expr_tex_str: operator = '+'
    elif (vector_closing + '-') in expr_tex_str: operator = '-'
    elif (vector_closing + '\\cdot') in expr_tex_str: operator = '\\cdot'
    elif (vector_closing + '\\times') in expr_tex_str: operator = '\\times'
    elif (vector_closing + ',') in expr_tex_str: operator = ',' # angle \\theta(u,v)

    vector_A_str, vector_B_str = expr_tex_str.split(vector_closing + operator)
    vector_A_str = vector_A_str + vector_closing

    if operator == ',':
        vector_A_str = vector_A_str.split('\\theta_{\\scriptscriptstyle\\mathrm{rad}}\\left(')[1] if 'rad' in expr_tex_str else vector_A_str.split('\\theta_{\\scriptscriptstyle\\mathrm{deg}}\\left(')[1]
        vector_B_str = vector_B_str[0:-7]
        operator = 'angle'

    return {"vector_A_str": vector_A_str, "vector_B_str": vector_B_str, "operator": operator}

def tex_vector_to_py_list(tex_str):
    vector_type = get_vector_type(tex_str)

    # break off the vector delimiters
    separator = '\\\\'
    if vector_type == 'bmatrix': tex_str = tex_str.replace('\\begin{bmatrix}', '').replace('\\end{bmatrix}', '')
    elif vector_type == 'array': tex_str = tex_str.replace('\\left(\\begin{array}{c}', '').replace('\\end{array}\\right)', '')
    elif vector_type == 'angle_brackets': 
        tex_str = tex_str.replace('\\left\\langle', '').replace('\\right\\rangle', '')
        separator = ','

    return tex_str.split(separator)

def py_list_to_sympy_vector(py_list):
    return Matrix([parse_latex(string_entry) for string_entry in py_list])

def parse_tex_vector_w_scalar(tex_str):
    opening_delimiter = None
    vector_type = get_vector_type(tex_str)
    if vector_type == 'bmatrix': opening_delimiter = '\\begin{bmatrix}'
    elif vector_type == 'array': opening_delimiter = '\\left(\\begin{array}{c}'
    elif vector_type == 'angle_brackets': opening_delimiter = '\\left\\langle'

    scalar_num = None
    potential_scalar_str = tex_str.split(opening_delimiter)[0]
    if potential_scalar_str == '': scalar_num = 1
    elif potential_scalar_str == '-': scalar_num = -1
    elif '.' in potential_scalar_str: scalar_num = float(potential_scalar_str)
    else: scalar_num = int(potential_scalar_str)

    tex_str = opening_delimiter + tex_str.split(opening_delimiter)[1] # break off the scalar now that it's parsed
    sympy_vector = py_list_to_sympy_vector(tex_vector_to_py_list(tex_str))
    sympy_vector = scalar_num * sympy_vector

    return sympy_vector