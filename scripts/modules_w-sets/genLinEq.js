import * as H from '../helper-modules/gen-helpers.js';
import * as PH from '../helper-modules/polynom-helpers.js';
import * as SH from '../helper-modules/settings-helpers.js';

function searchSols() {
    let range = 20;
    let x;

    let solutions = [];
    for (let a = 1; a <= range; a++) {
        for (let b = 1; b <= range; b++) {
            for (let c = -range; c <= range; c++) {
                x = a*b*c / (a + b);
                if (
                    a === 1 || a === -1 ||
                    b === 1 || b === -1 ||
                    a === b ||
                    a === (-1)*b ||
                    a*b*c === 0 ||
                    !Number.isInteger(x) ||
                    x > 20 ||
                    x < -20
                ) {
                    continue;
                }
                solutions.push({a, b, c, x});
            }
        }
    }

    console.table(solutions);
}

searchSols();