from .helpers.gen_helpers import remove_whitespace
from .helpers.linalg_helpers import matrices_and_operator, parse_tex_mtrx_w_scalar


def verify(tex_question, tex_answer):
    # remove all whitespace and newlines (make parsing simpler)
    tex_question = remove_whitespace(tex_question)
    tex_answer = remove_whitespace(tex_answer)
    
    # ensure an operation can be deduced (need to handle the implied multiplication case) -> two matrices side by side get a \cdot inserted in between
    tex_question = tex_question.replace('\\end{bmatrix}\\begin{bmatrix}', '\\end{bmatrix}\\cdot\\begin{bmatrix}')
    tex_question = tex_question.replace('\\end{pmatrix}\\begin{pmatrix}', '\\end{pmatrix}\\cdot\\begin{pmatrix}')

    # extract the two matrices and the operation
    destructuring_result = matrices_and_operator(tex_question)
    matrix_A_str = destructuring_result["matrix_A_str"]
    matrix_B_str = destructuring_result["matrix_B_str"]
    operator = destructuring_result["operator"]

    # break off the scalars and apply them (to reduce the problem to just A [operator] B)
    matrix_A = parse_tex_mtrx_w_scalar(matrix_A_str) # scalar included (if present)
    matrix_B = parse_tex_mtrx_w_scalar(matrix_B_str) # scalar included (if present)

    # do the operation
    operation_result = None
    if operator == '+':
        operation_result = matrix_A + matrix_B
    elif operator == '-':
        operation_result = matrix_A - matrix_B
    elif operator == '*':
        operation_result = matrix_A * matrix_B

    provided_answer_matrix = parse_tex_mtrx_w_scalar(tex_answer)

    if operation_result == provided_answer_matrix:
        return None
    else:
        return operation_result    