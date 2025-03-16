export const addsub_operation_type = {
    type: 'radio_buttons',
    code_name: 'addsub_operation_type',
    display_name: 'Operation',
    radio_buttons: [['add','Addition'],['subtract','Subtraction'],['both','Both']], 
    tooltip: 'What operation should be between the numbers?'
};

export const muldiv_operation_type = {
    type: 'radio_buttons',
    code_name: 'muldiv_operation_type',
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
    tooltip: 'How many terms should be in the expression? (enter an integer from 2 to 10)',
    range: [ 2, 10 ]
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
    tooltip: "What common number should be under the roots? (enter a non-square integer from 2 to 10)",
    range: [ 2, 10 ]
};

export const coef_number_size = {
    type: 'single_textbox',
    code_name: 'coef_number_size',
    display_name: 'Numbers Before Roots',
    tooltip: "How big should the numbers in front of the roots get? (enter an integer from 2 to 20)",
    range: [ 2, 20 ]
};

export const polynomial_A_degree = {
    type: 'single_textbox',
    code_name: 'polynomial_A_degree',
    display_name: "Degree of Polynomial-A",
    tooltip: "What degree should the first polynomial in the operation have? (enter an integer from 1 to 10)",
    range: [ 1, 10 ]
};

export const polynomial_B_degree = {
    type: 'single_textbox',
    code_name: 'polynomial_B_degree',
    display_name: "Degree of Polynomial-B",
    tooltip: "What degree should the second polynomial in the operation have? (enter an integer from 1 to 10)",
    range: [ 1, 10 ]
};

export const coef_size = {
    type: 'single_textbox',
    code_name: 'coef_size',
    display_name: "Size of Coefficients",
    tooltip: "How large should the coefficients (&plusmn;ax^n) in the polynomials be? (enter an integer from 2 to 20)",
    range: [ 2, 20 ]
};

export const factor_size = {
    type: 'single_textbox',
    code_name: 'factor_size',
    display_name: "Size of Factors",
    tooltip: "How large should the factors (x&plusmn;a) be? (enter an integer from 1 to 10)",
    range: [ 1, 10 ]
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
    tooltip: "What should the common factor of the terms C(ax^2+bx+c) be? (enter a non-zero integer from -10 to 10)",
    range: [ -10, 10 ],
    excluded_values: [0]
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

export const solution_point = {
    type: 'point_check_boxes',
    code_names: ['sys_eqs_x_solution','sys_eqs_y_solution','randomize_solutions'],
    display_name: 'Solution (x,&ThinSpace;y)',
    tooltip: 'What should the solution (x,y) be? (enter integers from -20 to 20 or randomize)'
};

export const sys_eqs_coef_size = {
    type: 'single_textbox',
    code_name: 'sys_eqs_coef_size',
    display_name: "Size of Coefficients",
    tooltip: "How large should the coefficients (&plusmn;ax &  &plusmn;by) in the equations be? (enter an integer from 1 to 20)",
    range: [ 1, 20 ]
};

export const linear_equation_form = {
    type: 'radio_buttons',
    code_name: 'linear_equation_form',
    display_name: 'Equation Form',
    radio_buttons: [['standard','ax+by=c (standard)'],['equal_to_zero','ax+by+c=0 (= to 0)'],['slope_intercept','y=mx+b (slope-int)'],['randomized','Randomized']], 
    tooltip: 'What form should the equations be in?'
};

export const sys_eqs_term_number = {
    type: 'radio_buttons',
    code_name: 'sys_eqs_term_number',
    display_name: 'Number of Terms',
    radio_buttons: [['2_x_2_y','2 Xs, 2 Ys'],['1_x_2_y','1 X, 2 Ys'],['2_x_1_y','2 Xs, 1 Y'],['1_x_1_y','1 X, 1 Y']], 
    tooltip: 'How many x terms and y terms should be in the system?'
};

export const solution_size_range = {
    type: 'radio_buttons',
    code_name: 'solution_size_range',
    display_name: 'Solution Size',
    radio_buttons: [['single_digit','Single Digit (-9 to 9)'],['multi_digit','Multi Digit (-99 to 99)']], 
    tooltip: 'How large should the solutions to the equations be?'
};

export const lin_eq_equation_form = {
    type: 'radio_buttons',
    code_name: 'lin_eq_equation_form',
    display_name: 'Equation Form',
    radio_buttons: [
        ['all_begin','All Beginner Forms:','radio-sub-label'],
        ['begin_1','ax=b','radio-math'],
        ['begin_2','x+a=b','radio-math'],
        ['begin_3','a+x=b','radio-math'],
        ['begin_4','\\frac{x}{a}=b','radio-math'],
        ['begin_5','ax+b=c','radio-math'],
        ['begin_6','a+bx=c','radio-math'],
        ['begin_7','ax=bx+c','radio-math'],
        ['begin_8','\\frac{a}{b}x=\\frac{c}{d}','radio-math'],
        ['begin_9','x+\\frac{a}{b}=\\frac{c}{d}','radio-math'],
        ['begin_10','\\frac{x+a}{b}=c','radio-math'],
        ['begin_11','\\frac{x}{a}+b=c','radio-math'],
        ['begin_12','a+\\frac{x}{b}=c','radio-math'],
        ['begin_13','ax+bx=c','radio-math'],
        ['all_inter','All Intermediate Forms:','radio-sub-label'],
        ['inter_1','ax+b=cx+d','radio-math'],
        ['inter_2','a+bx=cx+d','radio-math'],
        ['inter_3','a(x+b)=c','radio-math'],
        ['inter_4','a(bx+c)=d','radio-math'],
        ['inter_5','a+b(cx+d)=e','radio-math'],
        ['inter_6','a(bx+c)+d=e','radio-math'],
        ['inter_7','ax+b(cx+d)=e','radio-math'],
        ['inter_8','a(bx+c)+dx=e','radio-math'],
        ['inter_9','a(bx+c)+d=ex','radio-math'],
        ['inter_10','a(bx+c)=d(ex+f)','radio-math'],
        ['inter_11','\\frac{ax+b}{c}=dx+e','radio-math'],
        ['inter_12','\\frac{x}{a}+\\frac{x}{b}=c','radio-math'],
        ['inter_13','\\frac{x}{a}+b=cx+d','radio-math'],
        ['inter_14','a(\\frac{x}{b}+c)=d','radio-math'],
        ['inter_15','\\frac{x}{a}+b=\\frac{x}{c}+d','radio-math'],
        ['inter_16','ax+b+cx=dx+e','radio-math'],
        ['all_advan','All Advanced Forms:','radio-sub-label'],
        ['advan_1','a+b(cx+d)=e(fx+g)','radio-math'],
        ['advan_2','ax+b(cx+d)=e(fx+g)','radio-math'],
        ['advan_3','a+b(cx+d)=ex+f(gx+h)','radio-math'],
        ['advan_4','a(bx+c)+d(ex+f)=g','radio-math'],
        ['advan_5','\\frac{ax+b}{c}=\\frac{dx+e}{f}','radio-math'],
        ['advan_6','\\frac{ax+b}{c}+\\frac{dx+e}{f}=g','radio-math'],
        ['advan_7','\\frac{ax+b}{c}+d=\\frac{ex+f}{g}','radio-math'],
        ['advan_8','\\frac{ax+b}{c}=d(ex+f)','radio-math'],
        ['advan_9','\\frac{ax+b}{c}+dx=ex+f','radio-math'],
        ['advan_10','\\frac{a}{b}(cx+d)=\\frac{e}{f}(gx+h)','radio-math'],
        ['advan_11','a(\\frac{x}{b}+c)=d(\\frac{x}{e}+f)','radio-math'],
        ['advan_12','a(bx+c)+d(ex+f)=g(hx+i)','radio-math'],
        ['advan_13','\\frac{a}{b}x+\\frac{c}{d}=\\frac{e}{f}x+\\frac{g}{h}','radio-math']
    ], 
    tooltip: 'What kind of linear equation should be used? (Beginner, Intermediate, or Advanced forms)' 
};

export const solution_form = {
    type: 'radio_buttons',
    code_name: 'solution_form',
    display_name: 'Solution Form',
    radio_buttons: [['integers','Integers'],['fractions','Fractions'],['both','Both']], 
    tooltip: 'Should the solutions be integers or fractions?'
};

export const variable_letter = {
    type: 'single_textbox',
    code_name: 'variable_letter',
    display_name: 'Variable Letter',
    tooltip: 'What letter should represent the unknown? (enter a capital or lowercase alphabet letter)',
    possible_values: [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ]
};

export const flip_equation = {
    type: 'radio_buttons',
    code_name: 'flip_equation',
    display_name: 'Flip Equation',
    radio_buttons: [['yes','Yes'],['no','No']], 
    tooltip: 'Should the equation be flipped at the equals sign?'
};

export const force_positive_coefs = {
    type: 'radio_buttons',
    code_name: 'force_positive_coefs',
    display_name: 'Force Positive Coefficients',
    radio_buttons: [['yes','Yes'],['no','No']], 
    tooltip: 'Should all the coefficients in the equation be positive? (some equations may take up less space with this enabled)'
};

export const ratex_add_sub_form = {
    type: 'radio_buttons',
    code_name: 'ratex_add_sub_form',
    display_name: 'Addition & Subtraction Forms',
    radio_buttons: [
        ['all_add_sub','All Forms:','radio-sub-label'],
        ['as_1','\\frac{1}{ax}\\pm\\frac{1}{bx}','radio-math-big'],
        ['as_2','\\frac{1}{x+a}\\pm\\frac{1}{x+b}','radio-math-big'],
        ['as_3','\\frac{a}{x+b}\\pm\\frac{c}{x+d}','radio-math-big'],
        ['as_4','\\frac{a}{bx+c}\\pm\\frac{d}{ex}','radio-math-big'],
        ['as_5','\\frac{a}{bx+c}\\pm\\frac{d}{ex+f}','radio-math-big'],
        ['as_6','\\frac{ax+b}{cx+d}\\pm\\frac{ex+f}{gx+h}','radio-math-big'],
        ['as_7','\\frac{ax+b}{cx+d}\\pm\\frac{e}{f}','radio-math-big'],
        ['as_8','\\frac{a}{x^2+bx+c}\\pm\\frac{d}{x+e}','radio-math-big'],
        ['as_9','\\frac{x+a}{bx^2+cx}\\pm\\frac{d}{bx+c}','radio-math-big'],
        ['as_10','\\frac{a}{bx^2+cx}\\pm\\frac{d}{ex}','radio-math-big'],
        ['as_11','\\frac{x+a}{x^2+bx+c}\\pm\\frac{x+d}{x+e}','radio-math-big'],
        ['as_12','\\frac{x+a}{x^2+bx+c}\\pm\\frac{d}{e}','radio-math-big'],
        ['as_13','\\frac{a}{bx^2}\\pm\\frac{c}{dx}','radio-math-big'],
        ['as_14','\\frac{a}{x+b}\\pm\\frac{x}{x-b}','radio-math-big'],
        ['as_15','\\frac{x+a}{x^2-b^2}\\pm\\frac{x+c}{x+b}','radio-math-big']
    ], 
    tooltip: 'If the operation is addition or subtraction, what form should the initial expression be in?'
};

export const ratex_mul_div_form = {
    type: 'radio_buttons',
    code_name: 'ratex_mul_div_form',
    display_name: 'Multiplication & Division Forms',
    radio_buttons: [
        ['all_mul_div','All Forms:','radio-sub-label'],
        ['md_1','\\frac{a}{x+b}\\cdot\\div\\frac{x+c}{d}','radio-math-big'],
        ['md_2','\\frac{a}{x+b}\\cdot\\div\\frac{c}{x+d}','radio-math-big'],
        ['md_3','\\frac{x+a}{b}\\cdot\\div\\frac{x+c}{x+d}','radio-math-big'],
        ['md_4','\\frac{x+a}{x+b}\\cdot\\div\\frac{x+c}{d}','radio-math-big'],
        ['md_5','\\frac{x+a}{x+b}\\cdot\\div\\frac{x+c}{x+d}','radio-math-big'],
        ['md_6','\\frac{ax}{b}\\cdot\\div\\frac{c}{dx}','radio-math-big'],
        ['md_7','\\frac{a}{bx}\\cdot\\div\\frac{c}{dx}','radio-math-big'],
        ['md_8','\\frac{a}{x^2+bx+c}\\cdot\\div\\frac{x+d}{x+e}','radio-math-big'],
        ['md_9','\\frac{x+a}{x^2+bx+c}\\cdot\\div\\frac{x+d}{e}','radio-math-big'],
        ['md_10','\\frac{x+a}{x^2+bx+c}\\cdot\\div\\frac{x+d}{x+e}','radio-math-big'],
        ['md_11','\\frac{x+a}{x^2+bx+c}\\cdot\\div\\frac{x^2+dx+e}{x+f}','radio-math-big'],
        ['md_12','\\frac{x+a}{x^2+bx+c}\\cdot\\div\\frac{x+d}{x^2+ex+f}','radio-math-big'],
        ['md_13','\\frac{x^2+ax+b}{x+c}\\cdot\\div\\frac{x^2+dx+e}{x^2+fx+g}','radio-math-big'],
        ['md_14','\\frac{x^2+ax+b}{x^2+cx+d}\\cdot\\div\\frac{x^2+ex+f}{x^2+gx+h}','radio-math-big'],
        ['md_15','\\frac{ax}{bx^2+cx}\\cdot\\div\\frac{x+d}{x+e}','radio-math-big'],
        ['md_16','\\frac{ax^2+bx}{cx^2+dx}\\cdot\\div\\frac{x+e}{x+f}','radio-math-big']
    ], 
    tooltip: 'If the operation is multiplication or division, what form should the initial expression be in?'
};

export const numer_form = {
    type: 'radio_buttons',
    code_name: 'numer_form',
    display_name: 'Final Numerator Form',
    radio_buttons: [['factored','Factored'],['expanded','Expanded']], 
    tooltip: 'Should the numerator in the answer be factored (if possible) or expanded?'
};

export const denom_form = {
    type: 'radio_buttons',
    code_name: 'denom_form',
    display_name: 'Final Denominator Form',
    radio_buttons: [['factored','Factored'],['expanded','Expanded']], 
    tooltip: 'Should the denominator in the answer be factored (if possible) or expanded?'
};

export const give_excluded_values = {
    type: 'radio_buttons',
    code_name: 'give_excluded_values',
    display_name: 'State Excluded Values',
    radio_buttons: [['yes','Yes'],['no','No']], 
    tooltip: 'Should the values that make the denominators zero (if any) be stated?'
};