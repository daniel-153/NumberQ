export const templates = [
    {
        function_name: 'genAddSub',
        category_class_name: 'arithmetic-gen',
        display_name: 'Addition & Subtraction',
        display_category: 'arithmetic',
        example_problem: '4-6+8-5',
        short_name: 'add-subtract'
    },
    {
        function_name: 'genMulDiv',
        category_class_name: 'arithmetic-gen',
        display_name: 'Multiplication & Division',
        display_category: 'arithmetic',
        example_problem: '4\\cdot\\frac{1}{6}\\cdot3\\cdot\\frac{1}{2}',
        short_name: 'multiply-divide' 
    },
    {
        function_name: 'genAddFrac',
        category_class_name: 'arithmetic-gen',
        display_name: 'Adding Fractions',
        display_category: 'arithmetic',
        example_problem: '\\frac{3}{4}+\\frac{2}{5}',
        short_name: 'fraction'
    },
    {
        function_name: 'genOrdOp',
        category_class_name: 'arithmetic-gen',
        display_name: 'Order of Operations',
        display_category: 'arithmetic',
        example_problem: '3\\times\\left(5+2^{3}\\right)-8\\div4',
        example_problem_class: 'shrunk-question',
        short_name: 'pemdas'
    },
    {
        function_name: 'genLinEq',
        category_class_name: 'algebra-gen',
        display_name: 'Linear Equations',
        display_category: 'algebra',
        example_problem: '3x+2=14-9x',
        example_problem_class: 'slightly-shrunk-question',
        short_name: 'equation' 
    },
    {
        function_name: 'genVarIso',
        category_class_name: 'algebra-gen',
        display_name: 'Variable Isolation',
        display_category: 'algebra',
        example_problem: 'a=\\frac{b}{c+d} \\rightarrow d=\\frac{b-ac}{a}',
        example_problem_class: 'medium-shrunk-question',
        short_name: 'equation' 
    },
    {
        function_name: 'genFacQuad',
        category_class_name: 'algebra-gen',
        display_name: 'Quadratics & Factoring',
        display_category: 'algebra',
        example_problem: '8x^{2}+10x+3',
        short_name: 'quadratic' 
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
        example_problem_class: 'shrunk-question',
        short_name: 'system'
    },
    {
        function_name: 'genSimRad',
        category_class_name: 'algebra-gen',
        display_name: 'Simplify Radicals',
        display_category: 'algebra',
        example_problem: '\\sqrt{27}+\\sqrt{75}',
        short_name: 'radical'
    },
    {
        function_name: 'genPyTheo',
        category_class_name: 'geometry-gen',
        display_name: 'Pythagorean Theorem',
        display_category: 'geometry',
        example_problem: 'a^{2}+b^{2}=c^{2}',
        short_name: 'pythagorean'
    },
    {
        function_name: 'genSpTri',
        category_class_name: 'geometry-gen',
        display_name: 'Special Right Triangles',
        display_category: 'geometry',
        example_problem: 'x\\sqrt{2}\\:\\;\\,2x\\:\\;\\,x\\sqrt{3}',
        short_name: 'special-triangles'
    },
    {
        function_name: 'genLawSico',
        category_class_name: 'geometry-gen',
        display_name: 'Law of Sines & Cosines',
        display_category: 'geometry',
        example_problem: 'c^2=a^2+b^2-2ab\\cos(C)',
        example_problem_class: 'shrunk-question',
        short_name: 'sines-cosines'
    },
    {
        function_name: 'genTrigEx',
        category_class_name: 'precalc-gen',
        display_name: 'Trig Values',
        display_category: 'pre-calculus',
        example_problem: '\\cos\\left(\\frac{4\\pi}{3}\\right)',
        short_name: 'trig-value'
    },
    {
        function_name: 'genRatEx',
        category_class_name: 'precalc-gen',
        display_name: 'Rational Expressions',
        display_category: 'pre-calculus',
        example_problem: '\\frac{x+2}{x-3}+\\frac{3x+1}{5x}',
        short_name: 'rational'
    },
    {
        function_name: 'genPolArith',
        category_class_name: 'precalc-gen',
        display_name: 'Polynomial Arithmetic',
        display_category: 'pre-calculus',
        example_problem: '(x^{2}+3x+2)(x+4)',
        example_problem_class: 'shrunk-shrunk-question',
        short_name: 'polynomial'
    },
    {
        function_name: 'genComArith',
        category_class_name: 'precalc-gen',
        display_name: 'Complex Arithmetic',
        display_category: 'pre-calculus',
        example_problem: '\\frac{6+8i}{2-4i}',
        short_name: 'complex-number'
    },
    {
        function_name: 'genVecOp',
        category_class_name: 'linalg-gen',
        display_name: 'Vector Operations',
        display_category: 'linear algebra',
        example_problem: `
                            \\left\\lVert \\vec{v} \\right\\rVert \\:\\;\\, 
                            c\\vec{v} \\:\\;\\, 
                            \\frac{\\vec{v}}{\\left\\lVert \\vec{v} \\right\\rVert}`,
        example_problem_class: 'slightly-shrunk-question',
        short_name: 'vector'
    },
    {
        function_name: 'genVecArith',
        category_class_name: 'linalg-gen',
        display_name: 'Vector Arithmetic',
        display_category: 'linear algebra',
        example_problem: `2\\begin{bmatrix}
                            1\\\\
                            3
                          \\end{bmatrix} + 
                          4\\begin{bmatrix}
                            5\\\\
                            2
                          \\end{bmatrix}`,
        example_problem_class: 'shrunk-3x-question',
        short_name: 'vector'
    },
    {
        function_name: 'genMtrxOp',
        category_class_name: 'linalg-gen',
        display_name: 'Matrix Operations',
        display_category: 'linear algebra',
        example_problem: `  
                            \\operatorname{det}(A) \\:\\;\\, 
                            A^{-1} \\:\\;\\, 
                            \\operatorname{rref}(A)`,
        example_problem_class: 'shrunk-question',
        short_name: 'matrix'
    },
    {
        function_name: 'genMtrxArith',
        category_class_name: 'linalg-gen',
        display_name: 'Matrix Arithmetic',
        display_category: 'linear algebra',
        example_problem: `\\begin{bmatrix}
                            3 & 1 \\\\
                            2 & 5
                          \\end{bmatrix} 
                          \\begin{bmatrix}
                            2 & 4 \\\\
                            1 & 6
                          \\end{bmatrix}`,
        example_problem_class: 'shrunk-3x-question',
        short_name: 'matrix'
    }
];

