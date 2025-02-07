export const addsub_operation_type = {
    type: 'radio_buttons',
    code_name: 'operation_type',
    display_name: 'Operation',
    radio_buttons: [['add','Addition'],['subtract','Subtraction'],['both','Both']], 
    tooltip: 'What operation should be between the numbers?'
};

export const muldiv_operation_type = {
    type: 'radio_buttons',
    code_name: 'operation_type',
    display_name: 'Operation',
    radio_buttons: [['multiply','Multiplication'],['divide','Division'],['both','Both']], 
    tooltip: 'What operation should be between the numbers?'
};

export const answer_form = {
    type: 'radio_buttons',
    code_name: 'answer_form',
    display_name: 'Answer Form',
    radio_buttons: [['factions & integers','Factions & Integers'],['whole part + remainder','Whole Part + Remainder']], 
    tooltip: 'What form should the answer be in?'
};

export const multiply_symbol = {
    type: 'radio_buttons',
    code_name: 'multiply_symbol',
    display_name: 'Multiply Symbol',
    radio_buttons: [[' \\cdot ','Dot a &middot; b'],[' \\times ','Cross a &times; b']], 
    tooltip: 'Which multiplication symbol should be used?'
};

export const number_type = {
    type: 'radio_buttons',
    code_name: 'number_type',
    display_name: 'Number Type',
    radio_buttons: [['integers','Integers'],['fractions','Fractions'],['both','Both']], 
    tooltip: 'What type of numbers should be in the expression?'
};

export const angular_unit = {
    type: 'radio_buttons',
    code_name: 'angular_unit',
    display_name: 'Angular Unit',
    radio_buttons: [['radians','Radians (0&ndash;2pi)'],['degrees','Degrees (0&ndash;360)'],['both','Both']], 
    tooltip: 'Should the trig values be in radians or degrees?'
};

export const argument_sign = {
    type: 'radio_buttons',
    code_name: 'argument_sign',
    display_name: 'Argument Sign',
    radio_buttons: [['positive','Positive'],['negative','Negative'],['both','Both']], 
    tooltip: 'Should the numbers inside the trig functions be positive or negative?' 
};

export const trig_function_types = {
    type: 'check_boxes',
    code_name: 'trig_function_types',
    display_name: 'Trig Functions',
    check_boxes: [['sine','sin(&theta;)'],['cosine','cos(&theta;)'],['tangent','tan(&theta;)']], 
    tooltip: 'Which trig functions should be used? (sine, cosine, or tangent)' 
};

export const general_operation_types = {
    type: 'check_boxes',
    code_name: 'general_operation_types',
    display_name: 'Operations',
    check_boxes: [['add','Addition'],['subtract','Subtraction'],['multiply','Multiplication'],['divide','Division']], 
    tooltip: 'What operations should be done on the expressions?' 
};

export const randomize_order = {
    type: 'radio_buttons',
    code_name: 'randomize_order',
    display_name: 'Randomize Order',
    radio_buttons: [['yes','Yes (a+bi or bi+a)'],['no','No (only a+bi)']], 
    tooltip: 'Should the order of real and complex part of the complex numbers be randomized?'
};

export const force_ints_in_div = {
    type: 'radio_buttons',
    code_name: 'force_ints_in_div',
    display_name: 'Force Integers',
    radio_buttons: [['yes','Yes'],['no','No']], 
    tooltip: 'In division, should the answer be required to only include integers?'
};

export const number_of_terms = {
    type: 'single_textbox',
    code_name: 'number_of_terms',
    display_name: 'Number of Terms',
    tooltip: 'How many terms should be in the expression? (enter an integer from 2 to 10)'
};

export const term_range = {
    type: 'range_textboxes',
    code_names: ['term_range_min','term_range_max'],
    display_name: 'Number Range',
    tooltip: 'How big or small should the numbers be? (create a range with integers within ±999)'
};

export const root_number = {
    type: 'single_textbox',
    code_name: 'root_number',
    display_name: 'Number Under Roots',
    tooltip: "What common number should be under the roots? (enter a non-square integer from 2 to 10)"
};

export const coef_number_size = {
    type: 'single_textbox',
    code_name: 'coef_number_size',
    display_name: 'Numbers Before Roots',
    tooltip: "How big should the numbers in front of the roots get? (enter an integer from 2 to 20)"
};

export const polynomial_A_degree = {
    type: 'single_textbox',
    code_name: 'polynomial_A_degree',
    display_name: "Degree of Polynomial-A",
    tooltip: "What degree should the first polynomial in the operation have? (enter an integer from 1 to 10)"
};

export const polynomial_B_degree = {
    type: 'single_textbox',
    code_name: 'polynomial_B_degree',
    display_name: "Degree of Polynomial-B",
    tooltip: "What degree should the second polynomial in the operation have? (enter an integer from 1 to 10)"
};

export const coef_size = {
    type: 'single_textbox',
    code_name: 'coef_size',
    display_name: "Size of Coefficients",
    tooltip: "How large should the coefficients (&plusmn;ax^n) in the polynomials be? (enter an integer from 2 to 20)"
};

export const factor_size = {
    type: 'single_textbox',
    code_name: 'factor_size',
    display_name: "Size of Factors",
    tooltip: "How large should the factors (x&plusmn;a) be? (enter an integer from 1 to 10)"
};

export const division_result = {
    type: 'radio_buttons',
    code_name: 'division_result',
    display_name: 'Division Quotient Form',
    radio_buttons: [['divide_evenly','Divide Evenly'],['numerical_remainder','Numerical Remainder'],['quotient_plus_remainder','Quotient+Remainder']], 
    tooltip: 'In division, what form should the quotient be in?'
};

export const types_of_quadratics = {
    type: 'check_boxes',
    code_name: 'types_of_quadratics',
    display_name: 'Quadratic Forms',
    check_boxes: [['two_integer_factors','(x-a)(x-b)'],['two_non_integer_factors','(ax-b)(cx-d)'],['perf_square','(x-a)^2'],['diff_squares','(x+a)(x-a)'],['no_c_term','ax(x-b)'],['not_factorable','&radic;(b^2-4ac)&ne;k (QF)'],['complex_roots','b^2-4ac<0 (with i)'],['real_solvebyroots','x^2-a'],['complex_solvebyroots','x^2+a']], 
    tooltip: 'Which forms of quadratic equations should be included?' 
};

export const leading_coef = {
    type: 'single_textbox',
    code_name: 'leading_coef',
    display_name: "Common Factor",
    tooltip: "What should the common factor of the terms C(ax^2+bx+c) be? (enter a non-zero integer from -10 to 10)"
};

export const quadratic_prompt_type = {
    type: 'radio_buttons',
    code_name: 'quadratic_prompt_type',
    display_name: 'Type of Question',
    radio_buttons: [['expression','Expression P(x)'],['equation','Equation P(x)&thinsp;=&thinsp;0']], 
    tooltip: 'Should the prompt be to factor an expression or solve an equation?'
};

export const qf_answer_type = {
    type: 'radio_buttons',
    code_name: 'qf_answer_type',
    display_name: 'Answer Form',
    radio_buttons: [['single_expression','x&ThinSpace;=&ThinSpace;A&ThinSpace;&plusmn;&ThinSpace;B'],['comma_seperated_values','x&ThinSpace;=&ThinSpace;A,&ThinSpace;B']], 
    tooltip: 'What form should the answers to a quadratic equation be in?'
};


