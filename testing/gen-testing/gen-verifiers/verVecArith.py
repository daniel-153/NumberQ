from sympy import pi, acos
from sympy.parsing.latex import parse_latex
from .helpers.gen_helpers import build_new_answer_comparer
from .helpers.linalg_helpers import vectors_and_operation, parse_tex_vector_w_scalar

def answer_form_callback(settings):
    if settings["vector_operation"] == "angle": return 'rounded'
    else: return "exact"

def verify(tex_question, tex_answer, settings):
    # extract vectors and operation
    extracted_expr = vectors_and_operation(tex_question)
    vector_A = parse_tex_vector_w_scalar(extracted_expr["vector_A_str"])
    vector_B = parse_tex_vector_w_scalar(extracted_expr["vector_B_str"])
    operator = extracted_expr["operator"]

    # ensure the vector dimensions are the same
    if vector_A.shape != vector_B.shape:
        return 'Vectors in prompt do not have the same dimension.'

    if operator == 'angle': # angle between operation (special case) | answers are rounded decimals (if not exact representable, which is the vast majority of cases)
        # first handle the possibility of an undefined angle caused by A and/or B being a zero vector 
        if (vector_A.is_zero_matrix is True) or (vector_B.is_zero_matrix is True): # the expected result should be 'is undefined' in the answer
            if '~~is~~undefined' in tex_answer:
                return None
            else: # answer was a number (or not '~~is~~undefined') when it shouldn't have been
                return "Answer was not '~~is~~undefined', but one or both vectors in the angle operation were equal to the zero vector."
        elif ('~~is~~undefined' in tex_answer) and not ((vector_A.is_zero_matrix is True) or (vector_B.is_zero_matrix is True)): # answer was '~~is~~undefined' when it shouldn't have been
            return "Answer was '~~is~~undefined', but neither vector in the angle operation was equal to the zero vector (the angle operation was performable)."
        
        # angle (correct sympy-calculated one) must be defined after this point
        requested_anglular_unit = None
        if (
            (settings["angle_unit"] == "radians") and # settings requires radians
            ('rad' in tex_question and 'rad' in tex_answer) and not # all indications of radians in the question and answer
            ('deg' in tex_question or 'deg' in tex_answer or '^\\circ' in tex_answer) # no indications of degrees in the question or answer
        ):
            requested_anglular_unit  = 'rad'
        elif (
            (settings["angle_unit"] == "degrees") and # settings requires degrees
            ('deg' in tex_question and 'deg' in tex_answer and '^\\circ' in tex_answer) and not # all indications of degrees in the question and answer
            ('rad' in tex_question or 'rad' in tex_answer) # no indications of radians in the question or answer
        ):
            requested_anglular_unit = 'deg'
        else: # requested angular unit could not be determined (question fails)
            return 'Angular unit not clear based on tex_question and answer, or not correctly specified in settings.'

        # determine whether the answer was given as an approximation (\\approx) or exact (=)
        if ('\\approx' in tex_answer) and not ('=' in tex_answer):
            eq_sign = '\\approx'
            comparison = 'approx'
        elif ('=' in tex_answer) and not ('\\approx' in tex_answer):
            eq_sign = '='
            comparison = 'exact'
        else:
            return 'Type of answer (exact or approx) could not be determined in the tex_answer.'

        if requested_anglular_unit == 'rad':
            calculated_angle = acos( (vector_A.dot(vector_B)) / (vector_A.norm()*vector_B.norm()) )
            provided_angle_str = tex_answer.split(eq_sign)[1]
        elif requested_anglular_unit == 'deg':
            calculated_angle = (acos( (vector_A.dot(vector_B)) / (vector_A.norm()*vector_B.norm()) )) * (180 / pi)
            provided_angle_str = tex_answer.split(eq_sign)[1].replace('^\\circ', '')

        if comparison == 'exact':
            if parse_latex(provided_angle_str).equals(calculated_angle) is True:
                return None
            else:
                return calculated_angle
        elif comparison == 'approx':
            if build_new_answer_comparer(settings, answer_form_callback)(provided_angle_str, calculated_angle) is True:
                return None
            else:
                return f"Sympy calculated answer of [sympy: {calculated_angle}] does not round to [gens: {provided_angle_str}] with [places: {settings["decimal_places"]}, keep_rounded_zeros: {settings["keep_rounded_zeros"]}]."
    elif operator == '+' or operator == '-' or operator == '\\times': # vectors -> vectors operations | answers always exact
        provided_answer_vector = parse_tex_vector_w_scalar(tex_answer)

        calculated_answer_vector = None # all of the following operations throw if the dimensions aren't valid
        if operator == '+':
            calculated_answer_vector = vector_A + vector_B
        elif operator == '-':
            calculated_answer_vector = vector_A - vector_B
        elif operator == '\\times':
            calculated_answer_vector = vector_A.cross(vector_B)

        if provided_answer_vector == calculated_answer_vector:
            return None
        else: 
            return calculated_answer_vector
    elif operator == '\\cdot': # vectors -> scalars operations | answers always exact
        provided_dot_prod = parse_latex(tex_answer)
        calculated_dot_prod = vector_A.dot(vector_B)

        if provided_dot_prod == calculated_dot_prod:
            return None
        else:
            return calculated_dot_prod