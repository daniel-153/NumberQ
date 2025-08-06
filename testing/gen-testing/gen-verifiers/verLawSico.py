from .helpers.cmd_helpers import CmdPath, number, pos_number, image, build_cmd_history_validator
from .helpers.geom_helpers import triangle_info_from_points, match_side_angle_vertex_labels, parse_contentful_label, match_congruence_form
from .helpers.gen_helpers import build_new_answer_comparer, exact_decimal_to_frac, str_is_int_or_decimal, attempt_known_side_label_parse, attempt_known_angle_label_parse
from shapely import Point
from sympy import acos, sqrt, sin, cos, deg, rad
from sympy.parsing.latex import parse_latex

question_cmds_validator = build_cmd_history_validator([
    {'action': 'canvas_modification', 'property_name': 'width', 'new_value': pos_number}, # 0
    {'action': 'canvas_modification', 'property_name': 'height', 'new_value': CmdPath(-1)}, # 1
    {"action": "method_call", "method_name": "scale", "args": [pos_number, pos_number]}, # 2
    {"action": "property_set", "property_name": "lineWidth", "new_value": 5.5}, # 3
    {"action": "method_call", "method_name": "save", "args": []}, # 4 
    {"action": "method_call", "method_name": "translate", "args": [0, CmdPath(-5)]}, # 5
    {"action": "method_call", "method_name": "scale", "args": [1, -1]}, # 6
    {"action": "method_call", "method_name": "save", "args": []}, # 7
    {"action": "property_set", "property_name": "lineCap", "new_value": "square"}, # 8
    {"action": "method_call", "method_name": "beginPath", "args": []}, # 9
    {'action': 'method_call', 'method_name': 'moveTo', 'args': [number, number]}, # 10
    {'action': 'method_call', 'method_name': 'lineTo', 'args': [CmdPath(-1, 0), CmdPath(-1,1)]}, # 11
    {'action': 'method_call', 'method_name': 'lineTo', 'args': [number, number]}, # 12
    {'action': 'method_call', 'method_name': 'lineTo', 'args': [number, number]}, # 13
    {'action': 'method_call', 'method_name': 'lineTo', 'args': [CmdPath(-4, 0), CmdPath(-4, 1)]}, # 14
    {"action": "method_call", "method_name": "stroke", "args": []}, # 15
    {"action": "method_call", "method_name": "restore", "args": []}, # 16
    {"action": "method_call", "method_name": "restore", "args": []}, # 17
    {'action': 'method_call', 'method_name': 'drawImage', 'args': [image, number, number, number, number]}, # 18
    {'action': 'method_call', 'method_name': 'drawImage', 'args': [image, number, number, number, number]}, # 19
    {'action': 'method_call', 'method_name': 'drawImage', 'args': [image, number, number, number, number]}, # 20
    {'action': 'method_call', 'method_name': 'drawImage', 'args': [image, number, number, number, number]}, # 21
    {'action': 'method_call', 'method_name': 'drawImage', 'args': [image, number, number, number, number]}, # 22
    {'action': 'method_call', 'method_name': 'drawImage', 'args': [image, number, number, number, number]}, # 23
    {'action': 'method_call', 'method_name': 'drawImage', 'args': [image, number, number, number, number]}, # 24
    {'action': 'method_call', 'method_name': 'drawImage', 'args': [image, number, number, number, number]}, # 25
    {'action': 'method_call', 'method_name': 'drawImage', 'args': [image, number, number, number, number]}, # 26
    {'action': 'method_call', 'method_name': 'drawImage', 'args': [image, number, number, number, number]} # 27
])

def answer_form_callback(settings): # answers are always rounded in genLawSico (there is no setting to force exact representations)
    return 'rounded'

def verify(question_cmds, tex_answer, settings):
    # gather info for the question (prompt) triangle
    try:
        q_triangle_info = triangle_info_from_points(*[Point(command['args'][0], command['args'][1]) for command in question_cmds[11:13 + 1]])
        q_triangle_labels = match_side_angle_vertex_labels( # side, angle, and vertex labels
            q_triangle_info, question_cmds[18:26 + 1], 
            question_cmds[1]['new_value']
        )
        prompt_tex_str = parse_contentful_label(question_cmds[27]['args'], question_cmds[1]['new_value'])['latex_content']
    except Exception as e:
        raise Exception(f"Failed to gather info for Question triangle: {e}")
    
    # ensure the vertex labels are present when they need to be
    if (
        (settings['sico_labels'] == 'all_vert' or settings['sico_labels'] == 'all_vert_and_unknown') and # labeling settings require vertices to be labeled
        not (set(list(q_triangle_labels['vertices'].values())) == set(['A','B','C'])) # labels are NOT 'A','B','C' in some order
    ):
        return f"Settings required vertices to be labeled, but vertices were not labeled or not labeled properly; [vertex labels: {q_triangle_labels['vertices']}]."
    
    # sort info on prompt triangle (for all of sides and angles -> labeling_type: labeled_known, labeled_unknown, not_labeled | label_tex_str | numerical_value)
    side_labels_sorted = {}
    for side_name, label_value in q_triangle_labels['sides'].items():
        if settings['sico_solve_for'] == 'one_unknown':
            if settings['sico_labels'] == 'all_vert':
                if label_value is None:
                    side_labels_sorted[side_name] = {
                        'type': 'labeled_unknown',
                        'tex_str': ''.join([letter for letter in ['A','B','C'] if letter.lower() != side_name]), # a -> BC, b -> AC, c -> AB
                        'numerical_value': None
                    }
                else:
                    attempt_known_side_label_parse(label_value, side_labels_sorted, side_name)
            elif settings['sico_labels'] == 'all_vert_and_unknown':
                    if label_value is None:
                        side_labels_sorted[side_name] = {
                            'type': 'not_labeled',
                            'tex_str': None,
                            'numerical_value': None
                        }
                    elif label_value in ['a','b','c']:
                        side_labels_sorted[side_name] = {
                            'type': 'labeled_unknown',
                            'tex_str': label_value,
                            'numerical_value': None
                        }
                    else:
                        attempt_known_side_label_parse(label_value, side_labels_sorted, side_name)
            elif settings['sico_labels'] == 'only_unknown':
                    if label_value is None:
                        side_labels_sorted[side_name] = {
                            'type': 'not_labeled',
                            'tex_str': None,
                            'numerical_value': None
                        }
                    elif label_value == 'x':
                        side_labels_sorted[side_name] = {
                            'type': 'labeled_unknown',
                            'tex_str': label_value,
                            'numerical_value': None
                        }
                    else:
                        attempt_known_side_label_parse(label_value, side_labels_sorted, side_name)
        elif settings['sico_solve_for'] == 'whole_triangle':
            if settings['sico_labels'] == 'all_vert':
                if label_value is None:
                        side_labels_sorted[side_name] = {
                            'type': 'labeled_unknown',
                            'tex_str': ''.join([letter for letter in ['A','B','C'] if letter.lower() != side_name]), # a -> BC, b -> AC, c -> AB
                            'numerical_value': None
                        }
                else:
                    attempt_known_side_label_parse(label_value, side_labels_sorted, side_name)
            elif settings['sico_labels'] == 'all_vert_and_unknown':
                if label_value is None:
                    return f"Labeling setting was 'all_vert_and_unknown' but one or more sides was left unlabeled; [side labels: {q_triangle_labels['sides']}]"
                elif label_value in ['a','b','c']:
                    side_labels_sorted[side_name] = {
                            'type': 'labeled_unknown',
                            'tex_str': label_value,
                            'numerical_value': None
                        }
                else:
                    attempt_known_side_label_parse(label_value, side_labels_sorted, side_name)
            elif settings['sico_labels'] == 'only_unknown':
                return "Labeling setting was 'only_unknown' but the prompt was to solve for the 'whole_triangle'"
    
    angle_labels_sorted = {}
    for angle_name, label_value in q_triangle_labels['angles'].items():
        if settings['sico_labels'] == 'all_vert' or settings['sico_labels'] == 'all_vert_and_unknown':
            if label_value is None:
                angle_labels_sorted[angle_name] = {
                    'type': 'labeled_unknown',
                    'tex_str': '\\text{m}\\angle ' + angle_name,
                    'numerical_value': None
                }
            else:
                attempt_known_angle_label_parse(label_value, angle_labels_sorted, angle_name)
        elif settings['sico_labels'] == 'only_unknown':
            if label_value is None:
                angle_labels_sorted[angle_name] = {
                    'type': 'not_labeled',
                    'tex_str': None,
                    'numerical_value': None
                }
            elif label_value == '\\theta':
                angle_labels_sorted[angle_name] = {
                    'type': 'labeled_unknown',
                    'tex_str': label_value,
                    'numerical_value': None
                }
            else:
                attempt_known_angle_label_parse(label_value, angle_labels_sorted, angle_name)

    # combine sorted side and angle labels
    sorted_labels = side_labels_sorted.copy()
    sorted_labels.update(angle_labels_sorted)

    # ensure usage of units (km, mm, cm, etc) is correct in the side labels + extract the unit if the usage is correct
    units_used_in_sides = None
    unit_str = ''
    unit_usage_is_correct = True
    first_known_label_found = False
    for sorted_label in side_labels_sorted.values():
        if sorted_label['type'] == 'labeled_known' and (not first_known_label_found): # first known label (all others must match it)
            units_used_in_sides = (not str_is_int_or_decimal(sorted_label['tex_str']))
            unit_str = '\\,\\mathrm' + sorted_label['tex_str'].split('\\,\\mathrm')[1] if units_used_in_sides else ''
            first_known_label_found = True
        elif sorted_label['type'] == 'labeled_known': # a known label following the first one found
            if units_used_in_sides is True:
                unit_usage_is_correct = (sorted_label['tex_str'].count(unit_str) == 1 and str_is_int_or_decimal(sorted_label['tex_str'].replace(unit_str, '')))
            elif units_used_in_sides is False:
                unit_usage_is_correct = str_is_int_or_decimal(sorted_label['tex_str'])
            else:
                unit_usage_is_correct = False
    
    if not unit_usage_is_correct:
        return f"Incorrect unit usage in side labels [side labels: {q_triangle_labels['sides']}]"

    # ensure the triangle has exactly 3 knowns (givens) to start
    number_of_givens = 0
    for sorted_label_info in sorted_labels.values():
        if sorted_label_info['type'] == 'labeled_known':
            number_of_givens += 1

    if number_of_givens != 3:
        return f"Prompt triangle does not have the correct number of given measures; has: '{number_of_givens}'; required: 3"

    solved_triangle_values = {'a': None, 'b': None, 'c': None, 'A': None, 'B': None, 'C': None}
    matched_congruence = match_congruence_form({
        'a': sorted_labels['a']['numerical_value'],
        'b': sorted_labels['b']['numerical_value'],
        'c': sorted_labels['c']['numerical_value'],
        'A': sorted_labels['A']['numerical_value'],
        'B': sorted_labels['B']['numerical_value'],
        'C': sorted_labels['C']['numerical_value'],
    })
    congruence_type = matched_congruence['congruence_type']
    matched_letters = matched_congruence['measure_names']
    matched_values = matched_congruence['measure_values']
    if congruence_type == 'SSS':
        letter_a, letter_b, letter_c = matched_letters
        a, b, c = matched_values

        # triangle validity checks
        if not (
            all(val > 0 for val in [a, b, c]) and
            a + b > c and
            a + c > b and
            b + c > a
        ):
            return f"Triangle was in SSS form but measures do not form a valid triangle [SSS values: {[a, b, c]}]."
        
        # solving for remaining sides
        letter_A = letter_a.upper()
        A = deg( acos((b**2 + c**2 - a**2) / (2*b*c)) )

        letter_B = letter_b.upper()
        B = deg( acos((a**2 + c**2 - b**2) / (2*a*c)) )

        letter_C = letter_c.upper()
        C = 180 - A - B
    elif congruence_type == 'SAS':
        letter_a, letter_B, letter_c = matched_letters
        a, B, c = matched_values

        # triangle validity checks
        if not (
            all(val > 0 for val in [a, B, c]) and
            B < 180
        ):
            return f"Triangle was in SAS form but measures do not form a valid triangle [SAS values: {[a, B, c]}]."
        
        # solving for remaining sides
        letter_b = letter_B.lower()
        b = sqrt( a**2 + c**2 - 2*a*c * cos( rad(B) ) )

        letter_A = letter_a.upper()
        A = deg( acos((b**2 + c**2 - a**2) / (2*b*c)) )

        letter_C = letter_c.upper()
        C = 180 - A - B
    elif congruence_type == 'ASA':
        letter_A, letter_b, letter_C = matched_letters
        A, b, C = matched_values

        # triangle validity checks
        if not (
            all(val > 0 for val in [A, b, C]) and
            A + C < 180
        ):
            return f"Triangle was in ASA form but measures do not form a valid triangle [ASA values: {[A, b, C]}]."
        
        # solving for remaining sides
        letter_B = letter_b.upper()
        B = 180 - A - C

        letter_a = letter_A.lower()
        a = sin( rad(A) ) * ( b / sin( rad(B) ) )

        letter_c = letter_C.lower()
        c = sin( rad(C) ) * ( b / sin( rad(B) ) )
    elif congruence_type == 'AAS':
        letter_A, letter_B, letter_a = matched_letters
        A, B, a = matched_values

        # triangle validity checks
        if not (
            all(val > 0 for val in [A, B, a]) and
            A + B < 180
        ):
            return f"Triangle was in AAS form but measures do not form a valid triangle [AAS values: {[A, B, a]}]."
        
        letter_b = letter_B.lower()
        b = sin( rad(B) ) * ( a / sin( rad(A) ))

        letter_C = [letter for letter in ['A','B','C'] if letter not in [letter_A, letter_B]][0]
        C = 180 - A - B

        letter_c = letter_C.lower()
        c = sin( rad(C) ) * ( a / sin( rad(A) ))
    else:
        return "Given measures in provided triangle are not in SSS, SAS, ASA, or AAS form."
    
    solved_triangle_values[letter_a] = a
    solved_triangle_values[letter_b] = b
    solved_triangle_values[letter_c] = c
    solved_triangle_values[letter_A] = A
    solved_triangle_values[letter_B] = B
    solved_triangle_values[letter_C] = C

    # parse the tex_answer LaTeX 'array' into a dict (example: '\begin{array}{c}\text{m}\angle C=76^\circ,\\BC\approx22.37,\\AB\approx43.4\end{array}')
    equality_statements = tex_answer.replace('\\begin{array}{c}', '').replace('\\end{array}', '').split(',\\\\')
    provided_solved_vars = {}
    for equality_statement in equality_statements:
        if equality_statement.count('=') == 1 and equality_statement.count('\\approx') == 0:
            provided_solved_vars[equality_statement.split('=')[0]] = {
                'equality_type': 'exact',
                'tex_str_value': equality_statement.split('=')[1]
            }
        elif equality_statement.count('=') == 0 and equality_statement.count('\\approx') == 1:
            provided_solved_vars[equality_statement.split('\\approx')[0]] = {
                'equality_type': 'approx',
                'tex_str_value': equality_statement.split('\\approx')[1]
            }
        else:
            return f"Equality statement in tex_answer [ '{tex_answer}' ] is malformed: '{equality_statement}'"

    # determine everything the prompt asked to solve for + match provided to calculated values
    # examples of prompt: '\text{Find}~AC\mkern1.5mu{:}\mkern1.5mu' or '\text{Solve}\mkern1.5mu{:}\mkern1.5mu'
    prompt_tex = prompt_tex_str.replace('\\mkern1.5mu{:}\\mkern1.5mu', '')
    requested_values = []
    if prompt_tex.startswith('\\text{Find}~'): # solving for one unknown
        # search for the single requested variable in the sorted labels
        requested_var_name = prompt_tex.split('\\text{Find}~')[1]
        for side_or_angle_name, label_info_dict in sorted_labels.items():
            if label_info_dict['tex_str'] == requested_var_name:
                # ensure that the var being asked for is currently unknown + is labeled (so it can actually be solved)
                if label_info_dict['type'] != 'labeled_unknown':
                    return f"Requested variable to solve for is not a labeled unknown (either it is a known or it is not labeled): '{requested_var_name}'"
                
                requested_values.append({
                    "side_or_angle_name": side_or_angle_name,
                    "tex_str": label_info_dict['tex_str'],
                    "sympy_calced_value": solved_triangle_values[side_or_angle_name]
                })
    elif prompt_tex.startswith('\\text{Solve}'): # solving for all unknowns in the triangle
        # extract all unknown values from the sorted labels
        for side_or_angle_name, label_info_dict in sorted_labels.items():
            if label_info_dict['type'] == 'labeled_unknown':
                requested_values.append({
                    "side_or_angle_name": side_or_angle_name,
                    "tex_str": label_info_dict['tex_str'],
                    "sympy_calced_value": solved_triangle_values[side_or_angle_name]
                })
    else:
        return f"Prompt tex str is malformed: '{prompt_tex_str}'"
    
    # ensure that at least one unknown was requested (otherwise the following check will be incorrectly skipped)
    if len(requested_values) == 0:
        return f"Requested unknowns could not be determined from prompt: '${prompt_tex_str}'."

    # for every unknown that was requested, ensure the provided value matches the sympy value (+ usage of '=' and 'approx' is correct)
    is_rounded_correctly = build_new_answer_comparer(settings, answer_form_callback)
    for requested_value_info_dict in requested_values:
        equality_type = provided_solved_vars[requested_value_info_dict['tex_str']]['equality_type']
        tex_str_value = provided_solved_vars[requested_value_info_dict['tex_str']]['tex_str_value']
        sympy_calced_ans = requested_value_info_dict['sympy_calced_value']

        provided_ans_unitless = None
        if requested_value_info_dict['side_or_angle_name'] in ['a','b','c']: # side
            # check that the provided answer still maintains the proper units
            if not (unit_str in tex_str_value and str_is_int_or_decimal(tex_str_value.replace(unit_str, ''))):
                return f"Provided side value answer does not maintain proper unit usage: [side value answer: {tex_str_value}, units: '{unit_str}']"
            
            provided_ans_unitless = tex_str_value.replace(unit_str, '')
        elif requested_value_info_dict['side_or_angle_name'] in ['A','B','C']: # angle
            # check that the provided answer contains a degree symbol
            if not (tex_str_value.count('^\\circ') == 1):
                return f"Provided angle value answer does not make correct use of the degree symbol [angle value answer: {tex_str_value}]"
            
            provided_ans_unitless = tex_str_value.replace('^\\circ', '')

        if equality_type == 'exact': # exact equals ('=') was used
            provided_ans = parse_latex(str(exact_decimal_to_frac(provided_ans_unitless)))

            current_var_matched_correctly = (
                provided_ans.equals(sympy_calced_ans) or # exact symbolic equality
                provided_ans.evalf(20) == sympy_calced_ans.evalf(20) # correct to 20 places (needed for things like 180*acos(sqrt(2 - 2*cos(41*pi/90))/2)/pi (= to 49) which sympy won't reduce to an integer)
            )
        elif equality_type == 'approx':
            current_var_matched_correctly = ( # approx equals ('\\approx') was used
                is_rounded_correctly(provided_ans_unitless, sympy_calced_ans) and # correct by rounding
                not (parse_latex(str(exact_decimal_to_frac(provided_ans_unitless))).equals(sympy_calced_ans)) # not exactly equal (approx should not have been used if exactly equal)
            )

        if current_var_matched_correctly is not True: # as soon as the comparison fails with any var, note the discrepency + exit
            return f"Answer discrepency: [sympy: {requested_value_info_dict['tex_str']}={sympy_calced_ans}] does not match [gens: {requested_value_info_dict['tex_str']} '{equality_type}' {tex_str_value}] with [places: {settings['decimal_places']}, keep_rounded_zeros: {settings['keep_rounded_zeros']}]."

    return None