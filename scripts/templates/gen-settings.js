export const addsub_operation_type = {
    type: 'radio_buttons',
    display_name: 'Operation',
    radio_buttons: [['add','Addition'],['subtract','Subtraction'],['both','Both']], 
    tooltip: 'What operation should be between the numbers?'
};

export const muldiv_operation_type = {
    type: 'radio_buttons',
    display_name: 'Operation',
    radio_buttons: [['multiply','Multiplication'],['divide','Division'],['both','Both']], 
    tooltip: 'What operation should be between the numbers?'
};

export const answer_form = {
    type: 'radio_buttons',
    display_name: 'Answer Form',
    radio_buttons: [['factions & integers','Factions & Integers'],['whole part + remainder','Whole Part + Remainder']], 
    tooltip: 'What form should the answer be in?',
    prelocked: true
};

export const multiply_symbol = {
    type: 'radio_buttons',
    display_name: 'Multiply Symbol',
    radio_buttons: [[' \\cdot ','Dot a &middot; b'],[' \\times ','Cross a &times; b']], 
    tooltip: 'Which multiplication symbol should be used?',
    prelocked: true
};

export const number_type = {
    type: 'radio_buttons',
    display_name: 'Number Type',
    radio_buttons: [['integers','Integers'],['fractions','Fractions'],['both','Both']], 
    tooltip: 'What type of numbers should be in the expression?'
};

export const angular_unit = {
    type: 'radio_buttons',
    display_name: 'Angular Unit',
    radio_buttons: [['radians','Radians (0&ndash;2pi)'],['degrees','Degrees (0&ndash;360)'],['both','Both']], 
    tooltip: 'Should the trig values be in radians or degrees?'
};

export const argument_sign = {
    type: 'radio_buttons',
    display_name: 'Argument Sign',
    radio_buttons: [['positive','Positive'],['negative','Negative'],['both','Both']], 
    tooltip: 'Should the numbers inside the trig functions be positive or negative?' 
};

export const trig_function_types = {
    type: 'check_boxes',
    display_name: 'Trig Functions',
    check_boxes: [['sine','sin(&theta;)'],['cosine','cos(&theta;)'],['tangent','tan(&theta;)']], 
    tooltip: 'Which trig functions should be used? (sine, cosine, or tangent)' 
};

export const general_operation_types = {
    type: 'check_boxes',
    display_name: 'Operations',
    check_boxes: [['add','Addition'],['subtract','Subtraction'],['multiply','Multiplication'],['divide','Division']], 
    tooltip: 'Which operations should be done on the expressions?' 
};

export const randomize_order = {
    type: 'radio_buttons',
    display_name: 'Randomize Order',
    radio_buttons: [['yes','Yes (a+bi or bi+a)'],['no','No (only a+bi)']], 
    tooltip: 'Should the order of real and complex part of the complex numbers be randomized?'
};

export const force_ints_in_div = {
    type: 'radio_buttons',
    display_name: 'Force Integers',
    radio_buttons: [['yes','Yes'],['no','No']], 
    tooltip: 'In division, should the answer be required to only include integers?'
};

export const number_of_terms = {
    type: 'single_textbox',
    display_name: 'Number of Terms',
    tooltip: 'How many terms should be in the expression? (enter an integer from 2 to 10)',
    valid_values: [ 2, '--', 10 ],
    default_value: 2
};

export const term_range = {
    type: 'range_textboxes',
    code_names: ['term_range_min','term_range_max'],
    display_name: 'Number Range',
    tooltip: 'How big or small should the numbers be? (create a range with integers within ±999)',
    valid_values: {
       'term_range_min': [-999, '--', 999],
       'term_range_max': [-999, '--', 999]
    },
    default_value: {
       'term_range_min': -10,
       'term_range_max': 10 
    }
};

export const root_number = {
    type: 'single_textbox',
    display_name: 'Number Under Roots',
    tooltip: "What common number should be under the roots? (enter a non-square integer from 2 to 10)",
    valid_values: [ 2, 3, 5, 6, 7, 8, 10 ],
    default_value: 3
};

export const coef_number_size = {
    type: 'single_textbox',
    display_name: 'Numbers Before Roots',
    tooltip: "How big should the numbers in front of the roots get? (enter an integer from 2 to 20)",
    valid_values: [ 2, '--', 20 ],
    default_value: 7

};

export const polynomial_A_degree = {
    type: 'single_textbox',
    display_name: "Degree of Polynomial-A",
    tooltip: "What degree should the first polynomial in the operation have? (enter an integer from 1 to 10)",
    valid_values: [ 1, '--', 10 ],
    default_value: 3
};

export const polynomial_B_degree = {
    type: 'single_textbox',
    display_name: "Degree of Polynomial-B",
    tooltip: "What degree should the second polynomial in the operation have? (enter an integer from 1 to 10)",
    valid_values: [ 1, '--', 10 ],
    default_value: 2
};

export const coef_size = {
    type: 'single_textbox',
    display_name: "Size of Coefficients",
    tooltip: "How large should the coefficients (&plusmn;ax^n) in the polynomials be? (enter an integer from 2 to 20)",
    valid_values: [ 2, '--', 20 ],
    default_value: 8
};

export const factor_size = {
    type: 'single_textbox',
    display_name: "Size of Factors",
    tooltip: "How large should the factors (x&plusmn;a) be? (enter an integer from 1 to 10)",
    valid_values: [ 1, '--', 10 ],
    default_value: 5
};

export const division_result = {
    type: 'radio_buttons',
    display_name: 'Division Quotient Form',
    radio_buttons: [['divide_evenly','Divide Evenly'],['numerical_remainder','Numerical Remainder'],['quotient_plus_remainder','Quotient + Remainder']], 
    tooltip: 'In division, what form should the quotient be in?',
    prelocked: true
};

export const types_of_quadratics = {
    type: 'check_boxes',
    display_name: 'Quadratic Forms',
    check_boxes: [['two_integer_factors','(x-a)(x-b)'],['two_non_integer_factors','(ax-b)(cx-d)'],['perf_square','(x-a)&sup2;'],['diff_squares','(x+a)(x-a)'],['no_c_term','x(x-a)'],['not_factorable','&radic;(b&sup2;-4ac)&ne;k (QF)'],['complex_roots','b&sup2;-4ac<0 (with i)'],['real_solvebyroots','x&sup2;-a'],['complex_solvebyroots','x&sup2;+a']], 
    tooltip: 'Which forms of quadratic equations should be included?' 
};

export const leading_coef = {
    type: 'single_textbox',
    display_name: "Common Factor",
    tooltip: "What should the common factor of the terms C(ax&sup2;+bx+c) be? (enter a non-zero integer from -10 to 10)",
    valid_values: [ -10, '--', 10 ],
    excluded_values: [0],
    default_value: 1
};

export const quadratic_prompt_type = {
    type: 'radio_buttons',
    display_name: 'Type of Question',
    radio_buttons: [['expression','Expression P(x)'],['equation','Equation P(x)&thinsp;=&thinsp;0']], 
    tooltip: 'Should the prompt be to factor an expression or solve an equation?'
};

export const qf_answer_type = {
    type: 'radio_buttons',
    display_name: 'Answer Form',
    radio_buttons: [['single_expression','x&ThinSpace;=&ThinSpace;A&ThinSpace;&plusmn;&ThinSpace;B'],['comma_seperated_values','x&ThinSpace;=&ThinSpace;A,&ThinSpace;B']], 
    tooltip: 'What form should the answers to a quadratic equation be in?',
    prelocked: true
};

export const solution_point = {
    type: 'point_check_boxes',
    code_names: ['sys_eqs_x_solution','sys_eqs_y_solution','randomize_solutions'],
    display_name: 'Solution (x,&ThinSpace;y)',
    tooltip: 'What should the solution (x,y) be? (enter integers from -20 to 20 or randomize)',
    valid_values: {
        'sys_eqs_x_solution': [-20, '--', 20],
        'sys_eqs_y_solution': [-20, '--', 20],
        'randomize_solutions': ['is_checked', undefined]
    },
    default_value: {
        'sys_eqs_x_solution': 1,
        'sys_eqs_y_solution': 1
    }
};

export const sys_eqs_coef_size = {
    type: 'single_textbox',
    display_name: "Size of Coefficients",
    tooltip: "How large should the coefficients (&plusmn;ax &  &plusmn;by) in the equations be? (enter an integer from 1 to 20)",
    valid_values: [ 1, '--', 20 ],
    default_value: 7
};

export const linear_equation_form = {
    type: 'radio_buttons',
    display_name: 'Equation Form',
    radio_buttons: [['standard','ax+by=c (standard)'],['equal_to_zero','ax+by+c=0 (= to 0)'],['slope_intercept','y=mx+b (slope-int)'],['randomized','Randomized']], 
    tooltip: 'What form should the equations be in?'
};

export const sys_eqs_term_number = {
    type: 'radio_buttons',
    display_name: 'Number of Terms',
    radio_buttons: [['2_x_2_y','2 Xs, 2 Ys'],['1_x_2_y','1 X, 2 Ys'],['2_x_1_y','2 Xs, 1 Y'],['1_x_1_y','1 X, 1 Y']], 
    tooltip: 'How many x terms and y terms should be in the system?'
};

export const solution_size_range = {
    type: 'radio_buttons',
    display_name: 'Solution Size',
    radio_buttons: [['single_digit','Single Digit (-9 to 9)'],['multi_digit','Multi Digit (-99 to 99)']], 
    tooltip: 'How large should the solutions to the equations be?'
};

export const lin_eq_equation_form = {
    type: 'radio_buttons',
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
    display_name: 'Solution Form',
    radio_buttons: [['integers','Integers'],['fractions','Fractions'],['both','Both']], 
    tooltip: 'Should the solutions be integers or fractions?'
};

export const variable_letter = {
    type: 'single_textbox',
    display_name: 'Variable Letter',
    tooltip: 'What letter should represent the unknown? (enter a capital or lowercase alphabet letter)',
    valid_values: [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ],
    default_value: 'x'
};

export const flip_equation = {
    type: 'radio_buttons',
    display_name: 'Flip Equation',
    radio_buttons: [['yes','Yes'],['no','No']], 
    tooltip: 'Should the equation be flipped at the equals sign?'
};

export const force_positive_coefs = {
    type: 'radio_buttons',
    display_name: 'Force Positive Coefficients',
    radio_buttons: [['yes','Yes'],['no','No']], 
    tooltip: 'Should all the coefficients in the equation be positive? (some equations may take up less space with this enabled)'
};

export const ratex_add_sub_form = {
    type: 'radio_buttons',
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
    display_name: 'Final Numerator Form',
    radio_buttons: [['factored','Factored'],['expanded','Expanded']], 
    tooltip: 'Should the numerator in the answer be factored (if possible) or expanded?',
    prelocked: true
};

export const denom_form = {
    type: 'radio_buttons',
    display_name: 'Final Denominator Form',
    radio_buttons: [['factored','Factored'],['expanded','Expanded']], 
    tooltip: 'Should the denominator in the answer be factored (if possible) or expanded?',
    prelocked: true
};

export const give_excluded_values = {
    type: 'radio_buttons',
    display_name: 'State Excluded Values',
    radio_buttons: [['yes','Yes'],['no','No']], 
    tooltip: 'Should the values that make the denominators zero (if any) be stated?',
    prelocked: true
};

export const numer_range = {
    type: 'range_textboxes',
    code_names: ['numer_range_min','numer_range_max'],
    display_name: 'Numerator Range',
    tooltip: 'How big or small should the numerators be? (create a range with integers from 1 to 100)',
    valid_values: {
        'numer_range_min': [1, '--', 100],
        'numer_range_max': [1, '--', 100]
    },
    default_value: {
        'numer_range_min': 1,
        'numer_range_max': 5
    }
};

export const denom_range = {
    type: 'range_textboxes',
    code_names: ['denom_range_min','denom_range_max'],
    display_name: 'Denominator Range',
    tooltip: 'How big or small should the denominators be? (create a range with integers from 1 to 100)',
    valid_values: {
        'denom_range_min': [1, '--', 100],
        'denom_range_max': [1, '--', 100]
    },
    default_value: {
        'denom_range_min': 6,
        'denom_range_max': 10
    }
};

export const allow_improper_fracs = {
    type: 'radio_buttons',
    display_name: 'Allow Improper Fractions',
    radio_buttons: [['yes','Yes'],['no','No']], 
    tooltip: 'Should fractions with numerator ≥ denominator be allowed? (either in the sum terms or the answer)'
};

export const add_frac_answer_form = {
    type: 'radio_buttons',
    display_name: 'Answer Form',
    radio_buttons: [['fractions','Factions'],['mixed_numbers','Mixed Numbers']], 
    tooltip: 'What form should the answers be in, fractions or mixed numbers (when applicable)?',
    prelocked: true
}; 

export const like_denoms = {
    type: 'radio_buttons',
    display_name: 'Like Denominators',
    radio_buttons: [['always','Always'],['sometimes','Sometimes'],['never','Never']], 
    tooltip: 'Should the denominators always, sometimes, or never be the same?'
};

export const allow_negatives = {
    type: 'radio_buttons',
    display_name: 'Allow Negative Numbers',
    radio_buttons: [['yes','Yes'],['no','No']], 
    tooltip: 'Should negative numbers be included in the expression?'
};

export const operation_counts = {
    type: 'textbox_table',
    code_names: ['add_count','subtract_count','multiply_count','divide_count','exponent_count'],
    display_names: ['Additions','Subtractions','Multiplications','Divisions','Exponents'],
    display_name: 'Operations',
    tooltip: "How many times should each operation appear? (enter integers from 0 to 3)",
    valid_values: {
        'add_count': [0, '--', 3],
        'subtract_count': [0, '--', 3],
        'multiply_count': [0, '--', 3],
        'divide_count': [0, '--', 3],
        'exponent_count': [0, '--', 3]
    },
    default_value: {
        'add_count': 1,
        'subtract_count': 1,
        'multiply_count': 1,
        'divide_count': 1,
        'exponent_count': 1
    }
};

export const allow_zero = {
    type: 'radio_buttons',
    display_name: 'Allow Zero',
    radio_buttons: [['yes','Yes'],['no','No']], 
    tooltip: 'Should 0 be allowed in the expression?'
};

export const allow_parentheses = {
    type: 'radio_buttons',
    display_name: 'Allow Parentheses',
    radio_buttons: [['yes','Yes'],['no','No']], 
    tooltip: 'Should parenthesis expressions like a&times;(b+c) be allowed?'
};

export const allow_nesting = {
    type: 'radio_buttons',
    display_name: 'Allow Nesting',
    radio_buttons: [['yes','Yes'],['no','No']], 
    tooltip: 'Should nested parenthesis expressions like a&times;(b-(c+d)) be allowed?'
};

export const entry_range = {
    type: 'range_textboxes',
    code_names: ['vec_entry_range_min','vec_entry_range_max'],
    display_name: 'Vector Entry Range',
    tooltip: 'How big or small should the vector entries be? (create a range with integers within ±20)',
    valid_values: {
        'vec_entry_range_min': [-20, '--', 20],
        'vec_entry_range_max': [-20, '--', 20]
    },
    default_value: {
        'vec_entry_range_min': -5,
        'vec_entry_range_max': 5 
    }
};

export const vector_operation = {
    type: 'radio_buttons',
    display_name: 'Operation',
    radio_buttons: [
        ['add','Addition (u+v)'],
        ['sub','Subtraction (u-v)'],
        ['dot','Dot Product (u&middot;v)'],
        ['cross','Cross Product (u&times;v)'],
        ['angle','Angle &angle;(u,v)']
    ], 
    tooltip: 'Which operation should be performed on the vectors?'
};

export const vector_dimension = {
    type: 'single_textbox',
    display_name: 'Dimension',
    tooltip: 'What dimension (how many rows) should the vectors have? (enter an integer from 2 to 10)',
    valid_values: [ 2, '--', 10 ],
    default_value: 2
};

export const vector_notation = {
    type: 'radio_buttons',
    display_name: 'Notation',
    radio_buttons: [['brackets','Brackets [:]'],['angle_brackets','Angle Brackets <..>'],['parens','Parentheses (:)']], 
    tooltip: 'Which vector notation should be used?',
    prelocked: true
};

export const allow_scalars = {
    type: 'radio_buttons',
    display_name: 'Allow Scalars',
    radio_buttons: [['yes','Yes'],['no','No']], 
    tooltip: 'Should scalars in front of the vectors be allowed (in addition and subtraction)?'
};

export const angle_unit = {
    type: 'radio_buttons',
    display_name: 'Angular Unit',
    radio_buttons: [['radians','Radians (0&ndash;pi)'],['degrees','Degrees (0&ndash;180)']], 
    tooltip: 'Should the angle between the vectors be given in radians or degrees?'
};

export const matrix_dimensions = {
    type: 'dimension_textboxes',
    code_names: ['matrix_rows','matrix_cols'],
    display_name: 'Matrix Dimensions',
    tooltip: 'What should the dimensions of the matrix be? (enter 2 integers from 1 to 6)',
    valid_values: {
        'matrix_rows': [1, '--', 6],
        'matrix_cols': [1, '--', 6]
    },
    default_value: {
        'matrix_rows': 2,
        'matrix_cols': 2
    }
};

export const matrix_A_dimensions = {
    type: 'dimension_textboxes',
    code_names: ['matrix_A_rows','matrix_A_cols'],
    display_name: 'Matrix A Dimensions',
    tooltip: 'What should the dimensions of the first matrix be? (enter 2 integers from 1 to 10)',
    valid_values: {
        'matrix_A_rows': [1, '--', 10],
        'matrix_A_cols': [1, '--', 10]
    },
    default_value: {
        'matrix_A_rows': 2,
        'matrix_A_cols': 2
    }
};

export const matrix_B_dimensions = {
    type: 'dimension_textboxes',
    code_names: ['matrix_B_rows','matrix_B_cols'],
    display_name: 'Matrix B Dimensions',
    tooltip: 'What should the dimensions of the second matrix be? (enter 2 integers from 1 to 10)',
    valid_values: {
        'matrix_B_rows': [1, '--', 10],
        'matrix_B_cols': [1, '--', 10]
    },
    default_value: {
        'matrix_B_rows': 2,
        'matrix_B_cols': 2
    }
};

export const matrix_operation = {
    type: 'radio_buttons',
    display_name: 'Operation',
    radio_buttons: [
        ['add','Addition (A+B)'],
        ['sub','Subtraction (A-B)'],
        ['mul','Multiplication (AB)'],
    ], 
    tooltip: 'Which operation should be performed on the matrices?'
};

export const matrix_entry_range = {
    type: 'range_textboxes',
    code_names: ['mtrx_entry_range_min','mtrx_entry_range_max'],
    display_name: 'Matrix Entry Range',
    tooltip: 'How big or small should the matrix entries be? (create a range with integers within ±20)',
    valid_values: {
       'mtrx_entry_range_min': [-20, '--', 20],
       'mtrx_entry_range_max': [-20, '--', 20] 
    },
    default_value: {
        'mtrx_entry_range_min': -5,
        'mtrx_entry_range_max': 5
    }
};

export const allow_matrix_scalars = {
    type: 'radio_buttons',
    display_name: 'Allow Scalars',
    radio_buttons: [['yes','Yes'],['no','No']], 
    tooltip: 'Should scalars in front of the matrices be allowed (in addition and subtraction)?'
};

export const matrix_notation = {
    type: 'radio_buttons',
    display_name: 'Notation',
    radio_buttons: [['brackets','Brackets [::]'],['parens','Parentheses (::)']], 
    tooltip: 'Which matrix notation should be used?',
    prelocked: true
};

export const matrix_multiply_symbol = {
    type: 'radio_buttons',
    display_name: 'Multiply Symbol',
    radio_buttons: [['no_symbol','No Symbol (AB)'],['\\cdot','Dot (A&middot;B)'],['\\times','Cross (A&times;B)']], 
    tooltip: 'Which symbol should be used for matrix multiplication?',
    prelocked: true
};

export const single_vector_operation = {
    type: 'radio_buttons',
    display_name: 'Operation',
    radio_buttons: [
        ['scale','Scale \\( \\,c\\vec{v} \\)'],
        ['mag','Magnitude&nbsp;\\( \\left\\lVert \\vec{v}\\right\\rVert \\)', 'radio-no-scroll radio-realigned'],
        ['unit','Unit Vector \\( \\hat{\\mathbf{v}} \\)']
    ], 
    tooltip: 'Which operation should be performed on the vector?'
};

export const vec_op_answer_form = {
    type: 'radio_buttons',
    display_name: 'Answer Form',
    radio_buttons: [
        ['rationalized','Rationalized&nbsp;\\( \\frac{a\\sqrt{b}}{b} \\)', 'radio-realigned'],
        ['not-rationalized','Not Rationalized&nbsp;\\( \\frac{a}{\\sqrt{b}} \\)', 'radio-realigned'],
        ['decimals','Rounded Decimals']
    ], 
    tooltip: 'How should non-integers in the answer be represented?',
    prelocked: true
};

export const rounding_rules = {
    type: 'textbox_w_checkbox',
    code_names: ['decimal_places','keep_rounded_zeros'],
    display_name: 'Decimal Values',
    display_names: ['Places','Keep Rounded Zeros'],
    tooltip: 'How many places should decimal values be rounded to (0-4)? Should rounded zeros be kept? (3.95 &asymp; 4 or 4.0 when rounded to 1 place?)',
    valid_values: {
        'decimal_places': [0, '--', 4],
        'keep_rounded_zeros': ['is_checked', undefined]
    },
    default_value: {
        'decimal_places': 3
    },
    prelocked: true
};

export const single_matrix_operation = {
    type: 'radio_buttons',
    display_name: 'Operation',
    radio_buttons: [
        ['rref','RREF \\(\\operatorname{rref}(A)\\)'],
        ['det','Determinant \\(\\operatorname{det}(A)\\)'],
        ['inverse','Inverse \\(A^{-1}\\)'],
        ['transpose','Transpose \\(A^{T}\\)'] 
    ], 
    tooltip: 'Which operation should be performed on the matrix?'
};

export const mtrx_op_answer_form = {
    type: 'radio_buttons',
    display_name: 'Answer Form',
    radio_buttons: [
        ['exact', 'Reduced Fractions'],
        ['decimals','Rounded Decimals']
    ], 
    tooltip: 'How should non-integers in the answer matrix (if any) be represented?',
    prelocked: true
};

export const triangle_length_unit = {
    type: 'single_textbox',
    display_name: 'Unit of Length',
    tooltip: 'What length unit should the triangle sides be in (in, cm, m, km, etc)? Enter 1-2 lowercase letters or leave blank for no unit.',
    valid_values: [
        "__char_slots__", 
        {
            "0": ['','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
            "1": ['','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
        }
    ],
    default_value: '',
    prelocked: true
};

export const triangle_number_type = {
    type: 'radio_buttons',
    display_name: 'Given Length Numbers',
    radio_buttons: [
        ['integers_only', 'Integers Only'],
        ['allow_decimals','Allow Decimals']
    ], 
    tooltip: 'Should the given side lengths always be integers, or include decimals?',
    prelocked: true
};

export const force_py_theo_triples = {
    type: 'radio_buttons',
    display_name: 'Pythagorean Triples',
    radio_buttons: [['always','Always'],['sometimes','Sometimes']], 
    tooltip: 'Should all triangles be pythagorean triples (like 3-4-5, 5-12-13, and 1.5-2-2.5), or should non-triples also be included?'
};

export const py_theo_unknown = {
    type: 'radio_buttons',
    display_name: 'Solve For',
    radio_buttons: [['leg','A Leg'],['hypotenuse','The Hypotenuse']], 
    tooltip: 'Which part of the right triangle should be unknown, a leg or the hypotenuse?'
};

export const py_theo_unknown_marker = {
    type: 'radio_buttons',
    display_name: 'Unknown Symbol',
    radio_buttons: [
        ['question_mark','Question Mark (?)'],
        ['letter_x','(x)'],
        ['appropriate_side','(b) or (c)'],
        ['nothing','Nothing']
    ], 
    tooltip: 'What should mark the unknown side? (a question mark, the letter x, the corresponding a-b-c letter, or nothing)',
    prelocked: true
};

export const triangle_rotation = {
    type: 'textbox_w_checkbox',
    code_names: ['rotation_deg','randomize_rotation'],
    display_name: 'Triangle Rotation',
    display_names: ['Degrees&nbsp;(CCW)','Randomize'],
    tooltip: 'How many degrees should the triangle be rotated by? (enter an integer value in degrees between 0 and 360, or randomize)',
    valid_values: {
        'rotation_deg': [0, '--', 360],
        'randomize_rotation': ['is_checked', undefined]
    },
    default_value: {
        'rotation_deg': 3
    },
    textbox_class: 'wide-textbox'
};

export const triangle_length_size = {
    type: 'single_textbox',
    display_name: "Side Length Size",
    tooltip: "How big or small should the given triangle side lengths be? (enter an integer from 1 to 100)",
    valid_values: [ 1, '--', 100 ],
    default_value: 75,
    textbox_class: 'wide-textbox'
};

export const py_theo_answer_form = {
    type: 'radio_buttons',
    display_name: 'Answer Form',
    radio_buttons: [['decimal_answers','Rounded Decimals'],['exact_answers','Exact Root Expressions']], 
    tooltip: 'How should answers in non-pythagorean-triples be represented? (should the answer to 1-1-? be &radic;2 or &asymp;1.414)',
    prelocked: true
};

export const right_triangle_type = {
    type: 'radio_buttons',
    display_name: 'Right Triangle Type',
    radio_buttons: [['45-45-90','45&ndash;45&ndash;90'],['30-60-90','30&ndash;60&ndash;90']], 
    tooltip: 'Which special right triangle should be used?'
};

export const sp_tri_side_length = {
    type: 'radio_buttons',
    display_name: 'Given Length',
    radio_buttons: [
        ['integer','Integer'],
        ['rand_expression','Random Expression'],
        ['matched_to_triangle','Matched to Triangle']
    ], 
    tooltip: 'Should the given side length be an integer, a random expression, or match the triangle type (forms like n&radic;2, 2n, n&radic;3, etc)?'
};

export const sp_tri_given_angles = {
    type: 'radio_buttons',
    display_name: 'Given Angles',
    radio_buttons: [['both','Both'],['just_one','Just One']], 
    tooltip: 'Should both of the 45-45 or 30-60 angles be given, or just one?'
};

export const sp_tri_unknowns = {
    type: 'radio_buttons',
    display_name: 'Unknown Sides',
    radio_buttons: [
        ['x_y','x & y'],
        ['y_z','y & z'],
        ['a_b','a & b'],
        ['c_d','c & d'],
        ['p_q','p & q'],
        ['v_w','v & w']
    ], 
    tooltip: 'Which two letters should represent the unknown sides?'
};

export const rationalize_answers = {
    type: 'radio_buttons',
    display_name: 'Answer Form',
    radio_buttons: [
        ['yes','Rationalized&nbsp;\\( \\frac{a\\sqrt{b}}{b} \\)'],
        ['no','Not Rationalized&nbsp;\\( \\frac{a}{\\sqrt{b}} \\)']
    ], 
    tooltip: "When square root expressions appear in the answers' denominators, should the answers be rationalized?",
    prelocked: true
};

export const triangle_reflection = {
    type: 'check_boxes',
    display_name: 'Triangle Reflection',
    check_boxes: [['horizontal','Horizontal'],['vertical','Vertical']], 
    tooltip: 'Should the triangle be flipped horizontally or vertically (to change its orientation)?',
    required: false
};

export const sp_tri_number_size = {
    type: 'single_textbox',
    display_name: "Given Length Size",
    tooltip: "How large should the numbers in the given side lengths be? (enter an integer from 1 to 30)",
    valid_values: [ 1, '--', 30 ],
    default_value: 15
};

export const law_sin_or_cos = {
    type: 'radio_buttons',
    display_name: 'Triangle Law',
    radio_buttons: [
        ['sines','Law of Sines'],
        ['cosines','Law of Cosines'],
        ['random', 'Random']
    ], 
    tooltip: "Which triangle law should be required to solve for the unknowns?"
};

export const sico_solve_for = {
    type: 'radio_buttons',
    display_name: 'Solve For',
    radio_buttons: [
        ['one_unknown','One Unknown'],
        ['whole_triangle','The Whole Triangle']
    ], 
    tooltip: "Should the prompt be to solve for a single unknown, or to solve all three triangle angles and sides?",
    prelocked: true
};

export const sico_labels = {
    type: 'radio_buttons',
    display_name: 'Label',
    radio_buttons: [
        ['all_vert','All Vertices'],
        ['all_vert_and_unknown','All Vertices & <br> Unknown Side'],
        ['only_unknown','Only The Unknown <br> (x or &theta;)']
    ], 
    tooltip: "How should the triangle sides and vertices be labeled?",
    prelocked: true
};

export const var_iso_var_letters = {
    type: 'radio_buttons',
    display_name: 'Variable Letters',
    radio_buttons: [
        ['lower_rand_progress', 'Lowercase Progression'],
        ['upper_rand_progess', 'Uppercase Progression'],
        ['rand_lower_except','Random Lowercase <br> (excl. e,i,l,o,s,z)'],
        ['rand_upper_except','Random Uppercase <br> (excl. I,O,S,Z)'],
        ['rand_any', 'Random (any letter)'],
        ['alpha_lower', 'Lowercase Alphabetical'],
        ['alpha_upper', 'Uppercase Alphabetical']
    ], 
    tooltip: "How should the letters that represent the unknowns be picked?"
};

export const var_iso_match_form = {
    type: 'radio_buttons',
    display_name: 'Keep Known Equation Letters',
    radio_buttons: [
        ['yes','Yes'],
        ['no','No']
    ], 
    tooltip: "Should algebra, geometry, physics, and chemistry equations keep their typical letters, or be replaced with the letters required by other settings?",
    prelocked: true
};

export const var_iso_solving_var = {
    type: 'radio_buttons',
    display_name: 'Letter To Solve For',
    radio_buttons: [
        ['any','Any Letter'],
        ['always_x','Always x']
    ], 
    tooltip: "Should the letter to solve for be random, or always be x?",
    prelocked: true
};

export const var_iso_num_vars = {
    type: 'radio_buttons',
    display_name: 'Number of Variables',
    radio_buttons: [
        ['random','Random'],
        ['two_or_three','2 or 3'],
        ['four_or_five_plus', '4 or 5+']
    ], 
    tooltip: "How many variables should the equations have?"
};

export const var_iso_allow_exponents = {
    type: 'radio_buttons',
    display_name: 'Allow Exponents',
    radio_buttons: [
        ['yes','Yes'],
        ['no','No']
    ], 
    tooltip: "Should equations with exponents (like V=s³) be allowed?",
    prelocked: true
};

export const var_iso_allow_sign_rest = {
    type: 'radio_buttons',
    display_name: 'Allow Sign Restrictions',
    radio_buttons: [
        ['yes','Yes'],
        ['no','No']
    ], 
    tooltip: "Should equations with sign restrictions (like 'Solve A=s² for s&#8805;0') be allowed?",
    prelocked: true
};

export const var_iso_eq_type = {
    type: 'radio_buttons',
    display_name: 'Equation Type',
    radio_buttons: [
        ['random','Random (any type)'],
        ['pure_var_random_forms','Random Without Coefficients'],
        ['numerical_random_forms', 'Random With Coefficients'],
        ['algebra_forms', 'Algebra Equations'],
        ['geometry_forms', 'Geometry Equations'],
        ['physics_forms', 'Physics Equations'],
        ['chemistry_forms', 'Chemistry Equations']
    ], 
    tooltip: "What type of equations should be used? (random forms like ab+c=d, or ones from specific topics)?"
};

export const first_term_range = {
    type: 'range_textboxes',
    code_names: ['first_term_range_min','first_term_range_max'],
    display_name: 'First Term Range',
    tooltip: 'How big or small should the first term be? (create a range with integers from -9999 to 9999)',
    valid_values: {
        'first_term_range_min': [-9999, '--', 9999],
        'first_term_range_max': [-9999, '--', 9999]
    },
    default_value: {
        'first_term_range_min': 1,
        'first_term_range_max': 9
    },
    number_range_class: 'wide-range-box'
};

export const second_term_range = {
    type: 'range_textboxes',
    code_names: ['second_term_range_min','second_term_range_max'],
    display_name: 'Second Term Range',
    tooltip: 'How big or small should the second term be? (create a range with integers from -9999 to 9999)',
    valid_values: {
        'second_term_range_min': [-9999, '--', 9999],
        'second_term_range_max': [-9999, '--', 9999]
    },
    default_value: {
        'second_term_range_min': 1,
        'second_term_range_max': 9
    },
    number_range_class: 'wide-range-box'
};

export const allow_zero_terms = {
    type: 'radio_buttons',
    display_name: 'Allow Zero',
    radio_buttons: [
        ['yes','Yes'],
        ['no','No']
    ], 
    tooltip: "Should sums or differences with zero (like 0 + 3 or 7 - 0) be allowed?"
};

export const force_non_neg_sub = {
    type: 'radio_buttons',
    display_name: 'Force Non-Negative Subtraction',
    radio_buttons: [
        ['yes','Yes'],
        ['no','No']
    ], 
    tooltip: "Should subtractions with non-negative numbers always stay non-negative? (this prevents subtractions like 3 - 5, which result in negative numbers)"
};

export const addsub_notation = {
    type: 'radio_buttons',
    display_name: 'Notation',
    radio_buttons: [
        ['stacked','\\( \\begin{array}{@{}r@{}}a\\\\[-0.4em]\\underline{\\smash[b]{+~b}}\\end{array} \\)&thinsp;'],
        ['flat_with_eq','\\( a+b= \\)&thinsp;'],
        ['flat_with_eq_and_q','\\( a+b=\\:? \\) &thinsp;'],
        ['flat_without_eq','\\( a+b \\)&thinsp;']
    ], 
    tooltip: "Which arithmetic notation should be used? (note that stacked notation only applies to non-negative numbers)",
    prelocked: true
};

export const addsub_operation = {
    type: 'radio_buttons',
    display_name: 'Operation',
    radio_buttons: [['add','Addition'],['subtract','Subtraction'],['either','Either']], 
    tooltip: 'Which operation should be between the numbers?'
};

export const wrap_negatives = {
    type: 'radio_buttons',
    display_name: 'Wrap Negative Numbers',
    radio_buttons: [
        ['always','Always'],
        ['only_middle','Only When Needed']
    ], 
    tooltip: "Should parentheses always be placed around negative numbers ((-1)+(-2)), or only when negatives are in the middle of the expression (-1+(-2))?",
    prelocked: true
};

export const muldiv_notation = {
    type: 'radio_buttons',
    display_name: 'Notation',
    radio_buttons: [
        ['stacked','\\( \\begin{array}{@{}r@{}}a\\\\[-0.4em]\\underline{\\smash[b]{\\times~b}}\\end{array} \\)&thinsp;'],
        ['flat_with_eq','\\( a\\times b= \\)&thinsp;'],
        ['flat_with_eq_and_q','\\( a\\times b=\\:? \\)&thinsp;'],
        ['flat_without_eq','\\( a\\times b \\)&thinsp;']
    ], 
    tooltip: "Which multiplication notation should be used? (note that stacked notation only applies to non-negative numbers)",
    prelocked: true
};

export const muldiv_allow_zero = {
    type: 'radio_buttons',
    display_name: 'Allow Zero',
    radio_buttons: [
        ['yes','Yes'],
        ['no','No']
    ], 
    tooltip: "Should products with zero (like 0 &times; 3 or 7 &times; 0) be allowed?"
};

export const stacked_notation_rule = {
    type: 'radio_buttons',
    display_name: 'Stacking',
    radio_buttons: [
        ['a_geq_b','\\( \\operatorname{digits}(a)\\geq\\operatorname{digits}(b) \\)&nbsp;'],
        ['no_restriction','No Restriction']
    ], 
    tooltip: "Should the upper number always have the same or more digits than the lower number in stacked multiplication notation?",
    prelocked: true
};

export const frac_operations = {
    type: 'check_boxes',
    display_name: 'Operations',
    check_boxes: [['add','Addition'],['subtract','Subtraction'],['multiply','Multiplication'],['divide','Division']], 
    tooltip: 'Which operations should be done on the fractions? (note that division requires improper fractions to be allowed)'
};

export const add_equals_sign = {
    type: 'radio_buttons',
    display_name: 'Add Equals Sign',
    radio_buttons: [
        ['yes','Yes \\( \\frac{a}{b}+\\frac{c}{d}= \\)&thinsp;'],
        ['no','No \\( \\frac{a}{b}+\\frac{c}{d} \\)&thinsp;']
    ], 
    tooltip: "Should an equals sign be added at the end of the prompt?",
    prelocked: true
};

export const dividend_range = {
    type: 'range_textboxes',
    code_names: ['dividend_range_min','dividend_range_max'],
    display_name: 'Dividend Range',
    tooltip: 'How big or small should the dividend, (a) in a &divide; b, be? (create a range with integers from -9999 to 9999)',
    valid_values: {
        'dividend_range_min': [-9999, '--', 9999],
        'dividend_range_max': [-9999, '--', 9999]
    },
    default_value: {
        'dividend_range_min': 1,
        'dividend_range_max': 9
    },
    number_range_class: 'wide-range-box'
};

export const divisor_range = {
    type: 'range_textboxes',
    code_names: ['divisor_range_min','divisor_range_max'],
    display_name: 'Divisor Range',
    tooltip: 'How big or small should the divisor, (b) in a &divide; b, be? (create a range with integers from -999 to 999)',
    valid_values: {
        'divisor_range_min': [-999, '--', 999],
        'divisor_range_max': [-999, '--', 999]
    },
    default_value: {
        'divisor_range_min': 1,
        'divisor_range_max': 9
    },
    number_range_class: 'wide-range-box'
};

export const divide_evenly = {
    type: 'radio_buttons',
    display_name: 'Divide Evenly',
    radio_buttons: [
        ['always','Always'],
        ['sometimes','Sometimes'],
        ['never','Never']
    ], 
    tooltip: "Should the numbers always, sometimes, or never divide evenly? (note that this may modify the dividend range and 'always' is required for negative numbers)"
};

export const divint_notation = {
    type: 'radio_buttons',
    display_name: 'Notation',
    radio_buttons: [
        ['flat_without_eq','\\( a\\div b \\) &nbsp;'],
        ['long_div','\\( b \\enclose{longdiv}{a} \\) &nbsp;'],
        ['flat_with_eq','\\( a\\div b= \\) &nbsp;'],
        ['flat_with_eq_and_q','\\( a\\div b=\\:? \\) &nbsp;'],
    ], 
    tooltip: "Which division notation should be used?",
    prelocked: true
};

export const divint_zero_rule = {
    type: 'radio_buttons',
    display_name: 'Allow Zero',
    radio_buttons: [
        ['never','Never'],
        ['only_dividend','Only in Dividends'],
        ['only_divisor','Only in Divisors'],
        ['either','Dividends or Divisors']
    ], 
    tooltip: "Should zero be allowed in the division? (note that if the divisor is zero, the answer will be 'undefined')"
};

export const sim_sqrt_term_order = {
    type: 'radio_buttons',
    display_name: 'Term Order',
    radio_buttons: [
        ['a_plus_root_b', '\\(a + \\sqrt{b}\\)&nbsp;'],
        ['root_b_plus_a', '\\(\\sqrt{b} + a\\)&nbsp;'],
        ['random', 'Random']
    ], 
    tooltip: 'When a sum of an integer and a square root appears, how should it be ordered?',
    prelocked: true
};

export const sim_sqrt_form = {
    type: 'radio_buttons',
    display_name: 'Expression Form',
    radio_buttons: [
        ['all_basic','All Beginner Forms:','radio-sub-label'],
        ['basic_1','\\sqrt{a}','radio-math'],
        ['basic_2','a\\sqrt{b}','radio-math'],
        ['basic_3','\\sqrt{a}\\cdot\\sqrt{b}','radio-math'],
        ['basic_4','\\sqrt{a}+\\sqrt{b}','radio-math'],
        ['all_begin','All Intermediate Forms:','radio-sub-label'],
        ['begin_1','\\frac{a}{\\sqrt{b}}','radio-math'],
        ['begin_2','\\frac{\\sqrt{a}}{\\sqrt{b}}','radio-math'],
        ['begin_3','\\sqrt{a}+\\sqrt{b}+\\sqrt{c}','radio-math'],
        ['begin_4','\\frac{a\\sqrt{b}}{\\sqrt{c}}','radio-math'],
        ['begin_5','\\sqrt{a}\\cdot\\sqrt{b}\\cdot\\sqrt{c}','radio-math'],
        ['begin_6','(a+\\sqrt{b})+(c+\\sqrt{d})','radio-math'],
        ['begin_7','\\sqrt{\\frac{a}{b}}','radio-math'],
        ['begin_8','a\\sqrt{b}\\cdot c\\sqrt{d}','radio-math'],
        ['begin_9','a\\sqrt{b} + c\\sqrt{d}','radio-math'],
        ['begin_10','a(b+\\sqrt{c})','radio-math'],
        ['begin_11','\\sqrt{a}(b+\\sqrt{c})','radio-math'],
        ['all_inter','All Advanced Forms:','radio-sub-label'],
        ['inter_1','(a+\\sqrt{b})^{2}','radio-math'],
        ['inter_2','\\frac{\\sqrt{a}\\cdot\\sqrt{b}}{\\sqrt{c}}','radio-math'],
        ['inter_3','\\frac{a}{b+\\sqrt{c}}','radio-math'],
        ['inter_4','\\frac{a+\\sqrt{b}}{c+\\sqrt{d}}','radio-math'],
        ['inter_5','(a+\\sqrt{b})(c+\\sqrt{d})','radio-math'],
        ['inter_6','\\sqrt{a}+\\sqrt{b}+\\sqrt{c}+\\sqrt{d}','radio-math'],
        ['inter_7','\\frac{a}{b\\sqrt{c}}','radio-math'],
        ['inter_8','\\frac{a\\sqrt{b}}{c\\sqrt{d}}','radio-math'],
        ['inter_9','\\frac{a+\\sqrt{b}}{\\sqrt{c}}','radio-math'],
        ['inter_10','\\frac{\\sqrt{a}}{b+\\sqrt{c}}','radio-math'],
        ['inter_11','a\\sqrt{b}+c\\sqrt{d}+e\\sqrt{f}','radio-math'],
        ['inter_12','\\frac{a}{\\sqrt{b}+\\sqrt{c}}','radio-math'],
        ['inter_13','\\frac{a}{\\sqrt{b}}+\\frac{c}{\\sqrt{d}}','radio-math'],
        ['inter_14','\\frac{\\sqrt{a}}{\\sqrt{b}+\\sqrt{c}}','radio-math'],
        ['inter_15','\\frac{a}{b\\sqrt{c}+d\\sqrt{e}}','radio-math']
    ],
    tooltip: 'What kind of expressions should appear? (Beginner, Intermediate, or Advanced forms)' 
};

export const sim_sqrt_allow_negatives = {
    type: 'radio_buttons',
    display_name: 'Allow Negatives',
    radio_buttons: [
        ['yes','Yes'],
        ['no','No']
    ], 
    tooltip: "Should negative numbers or subtractions be allowed in the expressions?"
};

export const sim_sqrt_frac_rule = {
    type: 'radio_buttons',
    display_name: 'Simplify Irreducible Fractions',
    radio_buttons: [
        ['together', 'Together \\(\\frac{a+\\sqrt{b}}{c}\\)&nbsp;'],
        ['separate', 'Separate \\(\\frac{a}{c}+\\frac{\\sqrt{b}}{c}\\)&nbsp;']
    ], 
    tooltip: 'How should irreducible fractions in (a+&radic;b)/c form be simplified?',
    prelocked: true
};

export const diff_notation = {
    type: 'radio_buttons',
    display_name: 'Derivative Notation',
    radio_buttons: [
        ['prime', 'Prime \\(y\'\\)&nbsp;'],
        ['frac', 'Ratio \\(\\frac{dy}{dx}\\)&nbsp;'],
        ['dot', 'Dot \\(\\dot{y}\\)&nbsp;'] 
    ], 
    tooltip: 'Which notation should represent the derivative?',
    prelocked: true
};

export const sys_diff_vars = {
    type: 'radio_buttons',
    display_name: 'Unknown Functions',
    radio_buttons: [
        ['x_y', '\\(x\\) and \\(y\\)&nbsp;'],
        ['x1_x2', '\\(x_{1}\\) and \\(x_{2}\\)&nbsp;'],
        ['y1_y2', '\\(y_{1}\\) and \\(y_{2}\\)&nbsp;'] 
    ], 
    tooltip: 'Which symbols should represent the unknown functions?'
};

export const sys_diff_eigenvals = {
    type: 'radio_buttons',
    display_name: 'Eigenvalues',
    radio_buttons: [
        ['real_dis', 'Real Distinct \\(\\lambda_{1},\\lambda_{2}\\)&nbsp;'],
        ['real_rep', 'Real Repeated \\(\\lambda=a\\)&nbsp;'],
        ['complex', 'Complex \\(\\lambda=a\\pm bi\\)&nbsp;'] 
    ], 
    tooltip: 'What should the eigenvalue(s) of the matrix that describes the system be?'
};

export const sys_diff_initcond = {
    type: 'radio_buttons',
    display_name: 'Initial Condition',
    radio_buttons: [
        ['yes', 'Yes'],
        ['no', 'No'] 
    ], 
    tooltip: 'Should the system have initial conditions to solve for?',
    prelocked: true
};

export const func_notation = {
    type: 'radio_buttons',
    display_name: 'Function Notation',
    radio_buttons: [
        ['explicit', 'Explicit \\(y(t)\\)&nbsp;'],
        ['implicit', 'Implicit \\(y\\)&nbsp;'] 
    ], 
    tooltip: 'Should function notation be used, or should functions be implied?',
    prelocked: true
};

export const left_brace = {
    type: 'radio_buttons',
    display_name: 'Include Left Brace',
    radio_buttons: [
        ['yes', 'Yes  \\(~\\begin{cases} x \\\\ y \\end{cases}\\) &nbsp;'],
        ['no', 'No \\(~~~\\begin{aligned} x \\\\ y \\end{aligned}\\) &nbsp;'] 
    ], 
    tooltip: 'Should the system be enclosed by a left brace?',
    prelocked: true
};

export const sys_diff_degenerate = {
    type: 'radio_buttons',
    display_name: 'Allow Degenerate Cases',
    radio_buttons: [
        ['yes', 'Yes'],
        ['no', 'No'] 
    ], 
    tooltip: 'Should systems that are solvable without system techniques be allowed?',
    prelocked: true
};