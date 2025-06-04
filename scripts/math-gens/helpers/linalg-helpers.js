export const vector_operations = {
    add: function(array_1, array_2) {
        const result = [];

        for (let i = 0; i < array_1.length; i++) {
            result[i] = array_1[i] + array_2[i];
        }

        return result;
    },
    sub: function(array_1, array_2) {
        const result = [];

        for (let i = 0; i < array_1.length; i++) {
            result[i] = array_1[i] - array_2[i];
        }

        return result;
    },
    dot: function(array_1, array_2) {
        let result = 0;

        for (let i = 0; i < array_1.length; i++) {
            result += array_1[i] * array_2[i];
        }

        return result;
    },
    cross: function(array_1, array_2) {
        if (array_1.length !== 3 || array_2.length !== 3) {
            console.error('Cross product is only applicable to two vectors in R3. One or both vectors pased was not of length 3.');
            return;
        }

        return [
            array_1[1]*array_2[2] - array_1[2]*array_2[1],
            array_1[2]*array_2[0] - array_1[0]*array_2[2],
            array_1[0]*array_2[1] - array_1[1]*array_2[0]
        ];
    },
    scale: function(scalar, array) {
        const result = [];
        
        for (let i = 0; i < array.length; i++) {
            result[i] = array[i] * scalar;
        }

        return result;
    },
    magnitude: function(array) {
        let sum_squares = 0;

        for (let i = 0; i < array.length; i++) {
            sum_squares += array[i]**2;
        }

        return Math.sqrt(sum_squares);
    },
    sum_squared_entries: function(array) {  // [a, b, c, ...] => a^2 + b^2 + c^2 + ...
        let sum_of_squares = 0;

        for (let i = 0; i < array.length; i++) {
            sum_of_squares += array[i]**2;
        }

        return sum_of_squares;
    },
    angle: function(array_1, array_2, angular_unit = 'radians') {
        // if any zero vector is involved, the angle between is undefined (no need for additional processing)
        if (array_1.every(entry => entry === 0) || array_2.every(entry => entry === 0)) return 'undefined';
        
        const dot_prod_result = this.dot(array_1, array_2);
        const array_1_mag_squared = this.sum_squared_entries(array_1); // array_1's magnitude squared
        const array_2_mag_squared = this.sum_squared_entries(array_2);
        
        let result;
        if (array_1_mag_squared === dot_prod_result && array_2_mag_squared === dot_prod_result) { // acos arg is exactly 1
            result = 0;
        }
        else if (array_1_mag_squared === -dot_prod_result && array_2_mag_squared === -dot_prod_result) { // acos arg is exactly -1
            result = Math.PI;
        }
        else { // arg to acos is in (-1, 1) (not an edge case that is likely to cause a floating point error - by being outside acos's domain)
            result = Math.acos(this.dot(array_1, array_2) / (this.magnitude(array_1) * this.magnitude(array_2))); // radians by default
        }

        if (angular_unit === 'radians') return result;
        else if (angular_unit === 'degrees') return (result * 180) / Math.PI;
    }
};

export function createMatrix(rows, cols, valueSupplierCallback = function() {return null;}) { // return of the callback is used for each entry
    const column = [];

    for (let row = 0; row < rows; row++) {
        const nth_row = [];
        
        for (let col = 0; col < cols; col++) {
            nth_row.push(valueSupplierCallback(row, col));
        }

        column.push(nth_row);
    }

    return column;
}

export const matrix_operations = {
    add: function(matrix_1, matrix_2) {
        if (matrix_1.length !== matrix_2.length || matrix_1[0].length !== matrix_2[0].length) {
            console.error('matrix_operations.add() cannot be called on matrices with different dimensions');
            return 'undefined';
        }
        
        return createMatrix(
            matrix_1.length, matrix_1[0].length, // dimensions
            function(row, col) { // value provided for each entry
                return matrix_1[row][col] + matrix_2[row][col]; 
            }
        );
    },
    scale: function(scalar, matrix) {
        return createMatrix(
            matrix.length, matrix[0].length,
            function(row, col) {
                return scalar * matrix[row][col];
            }
        );
    },
    sub: function(matrix_1, matrix_2) {
        return this.add(matrix_1, this.scale(-1, matrix_2));
    },
    mul: function(matrix_1, matrix_2) {
        if (matrix_1[0].length !== matrix_2.length) {
            console.error('matrix_operations.mul() cannot be called on matrices A,B if num-cols-A !== num-rows-B');
            return 'undefined';
        }

        return createMatrix(
            matrix_1.length, matrix_2[0].length,
            function(row, col) {
                let sum_of_products = 0; // this is a dot product

                for (let i = 0; i < matrix_2.length; i++) {
                    sum_of_products += matrix_1[row][i] * matrix_2[i][col]
                }

                return sum_of_products;
            }
        );
    }
};

export const js_to_tex = {
    arrayOfArraysToMatrix: function(array_of_arrays, notation) {
        const matrix_type = notation.charAt(0); // 'b' for 'brackets' and 'p' for 'parens' (the two possible inputs for notation)

        return `
            \\begin{${matrix_type}matrix}
                ${JSON.parse(JSON.stringify(array_of_arrays)).map(row => row.join('&')).join('\\\\')}
            \\end{${matrix_type}matrix} 
        `;
    },
    arrayToVector: function(array, notation) {
        if (notation === 'brackets') {
            return '\\begin{bmatrix}' + array.join('\\\\') + '\\end{bmatrix}';
        }
        else if (notation === 'angle_brackets') {
            return '\\left\\langle' + array.join(',') + '\\right\\rangle';
        }
        else if (notation === 'parens') {
            return '\\left(\\begin{array}{c}' + array.join('\\\\') + '\\end{array}\\right)';
        }
    }
}

