from sympy.parsing.latex import parse_latex
from .helpers import parse_tex_mtrx_w_scalar, build_new_answer_comparer, tex_matrix_to_py_list

def answer_form_callback(settings):
    if settings["mtrx_op_answer_form"] == "decimals": return 'rounded'
    else: return "exact"

def verify(tex_question, tex_answer, settings):
    # extract the operation and the matrix from the question
    if tex_question.startswith('\\operatorname{rref}\\left('):
        operation = 'rref'
        matrix_in_operation = parse_tex_mtrx_w_scalar(tex_question.replace('\\operatorname{rref}\\left(', '').replace('\\right)', '')) # break off rref delimiters and parse
    elif tex_question.startswith('\\operatorname{det}\\left('):
        operation = 'det'
        matrix_in_operation = parse_tex_mtrx_w_scalar(tex_question.replace('\\operatorname{det}\\left(', '').replace('\\right)', '')) # break off det delimiters and parse
    elif tex_question.endswith('^{-1}'):
        operation = 'inv'
        matrix_in_operation = parse_tex_mtrx_w_scalar(tex_question[0:-5])
    elif tex_question.endswith('^{T}'):
        operation = 'T'
        matrix_in_operation = parse_tex_mtrx_w_scalar(tex_question[0:-4])
    else:
        return 'Matrix operation could not be determined from tex_question.'
    
    if operation == 'det': # matrix -> scalar | always exact 
        calculated_det = matrix_in_operation.det() # throws for non-square matrix
        provided_det = parse_latex(tex_answer)

        if provided_det.equals(calculated_det) is True:
            return None
        else:
            return calculated_det
    elif operation == 'T': # matrix -> matrix | always exact 
        calculated_answer_matrix = matrix_in_operation.T
        provided_answer_matrix = parse_tex_mtrx_w_scalar(tex_answer)

        if provided_answer_matrix.equals(calculated_answer_matrix) is True:
            return None
        else:
            return calculated_answer_matrix
    elif operation == 'rref' or operation == 'inv': # matrix -> matrix | answer entries can be exact or decimals
        if operation == 'rref': 
            calculated_answer_matrix = matrix_in_operation.rref()
        elif operation == 'inv': # requires special checks because may not always exist
            det_proposed_mtrx_inv = matrix_in_operation.det() # determinant of the matrix proposed for the inverse operation (throws for non-square matrix)

            if det_proposed_mtrx_inv.is_zero is True: # if determinant is zero, answer must be that the matrix has no inverse
                if tex_answer == '\\mathrm{no~~inverse}':
                    return None
                else:
                    return f"Matrix in the inverse (A^-1) operation had a determinant of zero, but gens answer was not or not clearly 'no inverse' [gens: {tex_answer}]."
            elif (tex_answer == '\\mathrm{no~~inverse}') and (det_proposed_mtrx_inv.is_nonzero is True): # answer was 'no inverse' when the inverse actually did exist
                return "Matrix in the inverse (A^-1) operation had a non-zero determinant (inverse was calculable), but gens answer was 'no inverse'."

            # past this point, the inverse matrix must exist
            calculated_answer_matrix = matrix_in_operation.inv()

        if settings["mtrx_op_answer_form"] == "exact": # matrices are to be compared exactly
            provided_answer_matrix = parse_tex_mtrx_w_scalar(tex_answer) # parse as sympy matrix

            if provided_answer_matrix.equals(calculated_answer_matrix) is True:
                return None
            else:
                return calculated_answer_matrix
        elif settings["mtrx_op_answer_form"] == "decimals": # matrices are to be compared (entry-by-entry) for correct rounding
            provided_answer_matrix = tex_matrix_to_py_list(tex_answer) # parse as a python nested list (keep entries as strings -- exactly as generated)
            
            # first ensure the matrix dimensions are correct
            calced_answer_mtrx_shape = calculated_answer_matrix.shape
            if not (
                calced_answer_mtrx_shape[0] == len(provided_answer_matrix) and # number of rows equal
                all(len(row) == calced_answer_mtrx_shape[1] for row in provided_answer_matrix) # number of columns equal
            ):
                return f"Sympy answer matrix dimensions [sympy: {calced_answer_mtrx_shape}] do not match dimensions of gens answer matrix."
                
            # compare the two matrices entry by entry for correct rounding in the gens answer (based on settings)
            compare_answer_entries = build_new_answer_comparer(settings, answer_form_callback)
            all_passed = True
            for row_index in range(0, calced_answer_mtrx_shape[0]):
                for col_index in range(0, calced_answer_mtrx_shape[1]):
                    calced_mtrx_entry = calculated_answer_matrix[row_index, col_index]
                    provided_mtrx_entry = provided_answer_matrix[row_index][col_index]

                    if compare_answer_entries(provided_mtrx_entry, calced_mtrx_entry) is not True:
                        all_passed = False
                        break
                if all_passed is not True: break

            if all_passed is True:
                return None
            else:
                return f"Sympy calculated matrix [sympy: {calculated_answer_matrix}] does not round to [gens: {provided_answer_matrix}] with [places: {settings["decimal_places"]}, keep_rounded_zeros: {settings["keep_rounded_zeros"]}]."
        else:
            return f"Matrix answer form could not be determined based on settings [mtrx_op_answer_form: {settings["mtrx_op_answer_form"]}]."