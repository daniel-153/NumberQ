export const templates = [
    {
        function_name: 'genAddSub',
        category_class_name: 'arithmetic-gen',
        display_name: 'Addition & Subtraction',
        display_category: 'arithmetic',
        example_problem: '4-6+8-5'
    },
    {
        function_name: 'genMulDiv',
        category_class_name: 'arithmetic-gen',
        display_name: 'Multiplication & Division',
        display_category: 'arithmetic',
        example_problem: '4\\cdot\\frac{1}{6}\\cdot3\\cdot\\frac{1}{2}' 
    },
    {
        function_name: 'genLinEq',
        category_class_name: 'algebra-gen',
        display_name: 'Linear Equations',
        display_category: 'algebra',
        example_problem: '3x+2=14-9x',
        example_problem_class: 'slightly-shrunk-question' 
    },
    {
        function_name: 'genFacQuad',
        category_class_name: 'algebra-gen',
        display_name: 'Quadratics & Factoring',
        display_category: 'algebra',
        example_problem: '8x^{2}+10x+3' 
    },
    {
        function_name: 'genSysEqs',
        category_class_name: 'algebra-gen',
        display_name: 'Systems of Equations',
        display_category: 'algebra',
        example_problem: `
                        
                        \\begin{aligned}
                        3x - 2y = 5 \\\\
                        x + 5 = 4y
                        \\end{aligned}
                        `,
        example_problem_class: 'shrunk-question'
    },
    {
        function_name: 'genSimRad',
        category_class_name: 'algebra-gen',
        display_name: 'Simplify Radicals',
        display_category: 'algebra',
        example_problem: '\\sqrt{27}+\\sqrt{75}'
    },
    {
        function_name: 'genTrigEx',
        category_class_name: 'precalc-gen',
        display_name: 'Trig Values',
        display_category: 'pre-calculus',
        example_problem: '\\cos\\left(\\frac{4\\pi}{3}\\right)'
    },
    {
        function_name: 'genRatEx',
        category_class_name: 'precalc-gen',
        display_name: 'Rational Expressions',
        display_category: 'pre-calculus',
        example_problem: '\\frac{x+2}{x-3}+\\frac{3x+1}{5x}'
    },
    {
        function_name: 'genPolArith',
        category_class_name: 'precalc-gen',
        display_name: 'Polynomial Arithmetic',
        display_category: 'pre-calculus',
        example_problem: '(x^{2}+3x+2)(x+4)',
        example_problem_class: 'shrunk-shrunk-question'
    },
    {
        function_name: 'genComArith',
        category_class_name: 'precalc-gen',
        display_name: 'Complex Arithmetic',
        display_category: 'pre-calculus',
        example_problem: '\\frac{6+8i}{2-4i}'
    }
];

