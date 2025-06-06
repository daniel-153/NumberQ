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
    row_operations: { // all these assume the matrix is fractionalized
        swap: function(matrix, index_1, index_2) { // swap the rows at index 1 and 2
            [matrix[index_1], matrix[index_2]] = [matrix[index_2], matrix[index_1]];
        },
        scale: function(matrix, row_index, multiplier) {
            for (let i = 0; i < matrix[row_index].length; i++) {
                matrix[row_index][i] = matrix_operations.rref_helpers.reduceFrac(
                    [matrix[row_index][i][0] * multiplier[0], matrix[row_index][i][1] * multiplier[1]]
                );
            }
        },
        add_scaled: function(matrix, changed_row_index, multiplier, scaled_row_index) { // changed_row_index, multiplier, multiplied_index => Rk -> Rk + s*Rn
            for (let i = 0; i < matrix[changed_row_index].length; i++) {
                matrix[changed_row_index][i] = matrix_operations.rref_helpers.reduceFrac([
                    matrix[changed_row_index][i][0]*multiplier[1]*matrix[scaled_row_index][i][1] + matrix[changed_row_index][i][1]*multiplier[0]*matrix[scaled_row_index][i][0],
                    matrix[changed_row_index][i][1]*multiplier[1]*matrix[scaled_row_index][i][1]
                ]);
            }
        }
    },
    rref_helpers: { // all these assume the matrix is fractionalized
        getFractionalizedMatrix: function(matrix) { // first step before row operations is to fractionalize
            return createMatrix(matrix.length, matrix[0].length, function(row, col) {
                return [matrix[row][col], 1]; // put all of the integer entries over 1
            });
        },
        reduceFrac([num, den]) { // quick reduce (likely faster than using PH)
            let a = num;
            let b = den;
            while (b !== 0) {
                const t = b;
                b = a % b;
                a = t;
            }
            return [num / a, den / a];
        },
        getLeading1: function(matrix, row_index) { // ensure the row has a leading 1 (from both leftward and upward approaches) or all zeros
            let nz_col_found = false;

            let first_nz_row, first_nz_col;
            for (first_nz_col = 0; first_nz_col < matrix[0].length; first_nz_col++) {
                for (first_nz_row = row_index; first_nz_row < matrix.length; first_nz_row++) {
                    if (matrix[first_nz_row][first_nz_col][0] !== 0) {
                        nz_col_found = true;
                        break;
                    }
                }
                if (nz_col_found) break;
            }

            if (nz_col_found) { // only continue if a non-zero column was found
                // bring the row with that entry to the top
                matrix_operations.row_operations.swap(matrix, first_nz_row, row_index);
                first_nz_row = row_index; // now this must hold

                // ensure that first entry is = to 1
                const first_nz_num = matrix[first_nz_row][first_nz_col][0];
                const first_nz_den = matrix[first_nz_row][first_nz_col][1];
                if (first_nz_num / first_nz_den !== 1) {
                    // if not 1, scale the row by the reciprocal of the leading entry (forcing the leading entry to be = to 1)
                    matrix_operations.row_operations.scale(matrix, first_nz_row, [first_nz_den, first_nz_num]); 
                }

                // last step is to 0-out any entries below that leading 1
                for (let row_below = first_nz_row + 1; row_below < matrix.length; row_below++) {
                    const current_leading_entry = matrix[row_below][first_nz_col]; // leading entry of the current row
                    if (current_leading_entry[0] !== 0) {
                        matrix_operations.row_operations.add_scaled(
                            matrix, row_below, 
                            [-current_leading_entry[0], current_leading_entry[1]],
                            first_nz_row 
                        );
                    }
                }
            }
        },
        ref: function(matrix) { // get leading 1s (from both the leftward and upward approaches) in all rows (or all zeros)
            for (let row = 0; row < matrix.length; row++) {
                this.getLeading1(matrix, row);
            }
        },
        getUpwardZeros: function(matrix, row_index) { // for the leading 1 in the row, ensure all zeros above it (if there is a leading 1)
            let leading_1_found = false;

            let leading_1_col;
            for (leading_1_col = 0; leading_1_col < matrix[0].length; leading_1_col++) {
                const current_entry = matrix[row_index][leading_1_col];
                if (current_entry[0] / current_entry[1] === 1) {
                    leading_1_found = true;
                    break;
                }
                if (leading_1_found) break;
            }

            if (leading_1_found) { // only continue if a leading 1 was found in the row
                // 0-out all the entries above that leading 1

                for (let row_above = row_index - 1; row_above >= 0; row_above--) {
                    const current_entry = matrix[row_above][leading_1_col];
                    if (current_entry[0] !== 0) {
                        matrix_operations.row_operations.add_scaled(
                            matrix, row_above, 
                            [-current_entry[0], current_entry[1]],
                            row_index 
                        );
                    }
                }
            }
        },
        ref_to_rref: function(matrix) {
            for (let row = matrix.length - 1; row >= 0; row--) {
                this.getUpwardZeros(matrix, row);
            }
        }
    },
    inverse_helpers: {
        indentityMatrix: function(matrix) { // get the indentity matrix at the current dimension (assumes the matrix is square)
            return createMatrix(matrix.length, matrix.length,
                function(row, col) {
                    return (row === col)? 1 : 0; // 1's in the main diagonal, 0's everywhere else
                }
            );
        },
        connectMatrices(matrix_1, matrix_2) { // specifically for creating [A | I] (nothing else)
            let result = [];

            for (let row = 0; row < matrix_1.length; row++) {
                result[row] = [...matrix_1[row], ...matrix_2[row]]; // connect each row
            }

            return result;
        },
        isIdentityMatrix: function(matrix) { // only meant to take in fractionalized matrices
            // start traversing the matrix, left to right, *bottom* to top
            for (let row = matrix.length - 1; row >= 0; row--) {
                for (let col = 0; col < matrix[0].length; col++) {
                    const current_entry = matrix[row][col];
                    if (row === col) {
                        if (current_entry[0] / current_entry[1] !== 1) return false;
                    } 
                    else if (current_entry[0] !== 0) return false;
                }
            }
            return true;
        }
    },
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
    },
    minor: function(matrix, row, col) {
        const minor = JSON.parse(JSON.stringify(matrix));

        minor.splice(row, 1); // delete the specified row

        minor.forEach(sub_array => sub_array.splice(col, 1)); // delete the specified column

        return minor;
    },
    det: function(matrix) {
        if (matrix.length === 1 && matrix[0].length === 1) return matrix[0][0]; // determinant of a 1x1 is just the [0][0] entry 
        
        let running_sum = 0;
        
        for (let j = 0; j <= matrix.length - 1; j++) {
            running_sum += ((-1)**(j)) * (matrix[0][j]) * this.det(this.minor(matrix, 0, j));
        }

        return running_sum;
    },
    transpose: function(matrix) {
        return createMatrix(matrix[0].length, matrix.length,
            function(row, col) {
                return matrix[col][row];
            }
        ); 
    },
    rref: function(matrix) {
        const rref_matrix = this.rref_helpers.getFractionalizedMatrix(matrix);

        this.rref_helpers.ref(rref_matrix);
        this.rref_helpers.ref_to_rref(rref_matrix);

        return rref_matrix;
    },
    inverse: function(matrix) {
        // reduced row echelon form of the [A | I] augmented matrix        
        const A_I_rref = this.rref(
            this.inverse_helpers.connectMatrices(
                matrix, this.inverse_helpers.indentityMatrix(matrix)
            )
        );

        const possible_I = createMatrix(matrix.length, matrix.length,
            (row, col) => A_I_rref[row][col] // left half of the A_I_rref
        );
        if (this.inverse_helpers.isIdentityMatrix(possible_I)) {
            return createMatrix(matrix.length, matrix.length, 
                (row, col) => A_I_rref[row][col + matrix.length] // right half of the A_I_rref
            );
        }
        else return 'undefined'; // matrix doesn't have an inverse
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



export function tempTestFunc() {
    const myarr = [1,2,3,4,5]; 
    matrix_operations.row_operations.swap(myarr, 1, 4)
    console.log(myarr);
}


//const LAH = await import('http://127.0.0.1:5500/scripts/math-gens/helpers/linalg-helpers.js');

