from sympy.parsing.latex import parse_latex
from .helpers import parse_tex_vector_w_scalar, build_new_answer_comparer, tex_vector_to_py_list

def answer_form_callback(settings):
    if settings["vec_op_answer_form"] == "decimals":
        return 'rounded'
    else:
        return 'exact'

def verify(tex_question, tex_answer, settings):    
    # if an approximate answer was given, ensure settings allowed for an approximate answer
    if (tex_answer.startswith('\\approx')) and (settings["vec_op_answer_form"] != "decimals"): # approximate answer should *not* have been given
        return f"An approximate answer was given when settings required an exact answer [vec_op_answer_form: {settings["vec_op_answer_form"]}]"

    # determine which operation is being performed
    if tex_question.startswith('\\left\\lVert'): # magnitude | answer could be decimal or exact depending on settings
        vec_in_operation = parse_tex_vector_w_scalar(tex_question.replace('\\left\\lVert', '').replace('\\right\\rVert', '')) # break off magnitude delimiters and parse
        calculated_answer = vec_in_operation.norm()

        if  tex_answer.startswith('\\approx'): # answers are to be compared by correct rounding
            gens_rounded_value = tex_answer.replace('\\approx', '') # break off the roughly equals symbol to expose just the number
            
            if build_new_answer_comparer(settings, answer_form_callback)(gens_rounded_value, calculated_answer) is True:
                return None
            else:
                return f"Sympy calculated answer of [sympy: {calculated_answer}] does not round to [gens: {gens_rounded_value}] with [places: {settings["decimal_places"]}, keep_rounded_zeros: {settings["keep_rounded_zeros"]}]."
        else: # answers are to be compared exactly
            if parse_latex(tex_answer).equals(calculated_answer) is True:
                return None
            else:
                return calculated_answer
    elif tex_question.startswith('\\widehat{'): # unit_vector | answer entries could be decimals or exact depending on settings
        vec_in_operation = parse_tex_vector_w_scalar(tex_question.replace('\\widehat{', '')[0:-1]) # break off unit vector delimiters and parse
        
        # catch the case of a zero vector before calulating the norm
        if vec_in_operation.is_zero_matrix: # if the vector trying to be normed is a zero vector, the gens answer must be 'is undefined'
            if tex_answer.endswith('\\mathrm{~~is~~undefined}'):
                return None
            else:
                return f"The answer for the unit vector of a zero vector was not in proper form to indicate 'undefined': {tex_answer}."
        elif tex_answer.endswith('\\mathrm{~~is~~undefined}') and not (vec_in_operation.is_zero_matrix): # answer is 'undefined' when it shouldn't have been (non-zero vectors can always be normed)
            return "The answer for the norm of a non-zero vector was 'undefined'."

        # past this point, the unit vector must be calculable
        calculated_answer_vector = (1 / vec_in_operation.norm()) * vec_in_operation

        if  tex_answer.startswith('\\approx'): # vectors are to be compared by correct rounding (entry by entry)
            provided_answer_vec_list = tex_vector_to_py_list(tex_answer.replace('\\approx', '')) # keeps entries in string form

            # ensure that the calculated and provided answer have the same shape
            calculated_answer_vec_shape = calculated_answer_vector.shape
            if (
                (calculated_answer_vec_shape[0] != len(provided_answer_vec_list)) or
                (calculated_answer_vec_shape[1] != 1)
            ):
                return f"Calculated sympy vector [sympy: {calculated_answer_vector}] does not have the same dimensions as the gens answer vector [gens: {provided_answer_vec_list}]."
            
            # compare the two vectors entry-by-entry for correct rounding
            compare_answers = build_new_answer_comparer(settings, answer_form_callback)
            all_passed = True
            for entry_index in range(0, len(provided_answer_vec_list)):
                provided_vec_entry = provided_answer_vec_list[entry_index] # decimal/number string
                calculated_vec_entry = calculated_answer_vector[entry_index, 0] # sympy obj

                if compare_answers(provided_vec_entry, calculated_vec_entry) is not True:
                    all_passed = False
                    break

            if all_passed is True:
                return None
            else:
                return f"Sympy calculated vector [sympy: {calculated_answer_vector}] does not round to [gens: {provided_answer_vec_list}] with [places: {settings["decimal_places"]}, keep_rounded_zeros: {settings["keep_rounded_zeros"]}]."
        else: # vectors are to be compared exactly
            provided_answer_vector = parse_tex_vector_w_scalar(tex_answer)
            
            if provided_answer_vector.equals(calculated_answer_vector) is True:
                return None
            else:
                return calculated_answer_vector
    else: # scale | answer always exact (integer scalars on integer vectors)
        calculated_answer_vector = parse_tex_vector_w_scalar(tex_question) # using parse_w_scalar automatically applies the scalar to the returned vector (performs 'scale' automatically)
        provided_answer_vector = parse_tex_vector_w_scalar(tex_answer)

        if provided_answer_vector.equals(calculated_answer_vector) is True:
            return None
        else:
            return calculated_answer_vector