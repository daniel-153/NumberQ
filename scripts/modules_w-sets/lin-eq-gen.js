function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
} //returns a randint between the bounds (inclusive)




function randFromList(array) {
    return array[randInt(0,array.length - 1)];
} //returns a random element from the array you input




function randomizeList(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
} //randomizes the order of the array you input (Fisher-Yates)




function integerArray(min, max) {
    let result = [];
    for (let i = min; i <= max; i++) {
        result.push(i);
    }
    return result;
} //creates an array of integers from one bound to the other (inclusive)




function removeFromArray(elementsToRemove, array) {
    // Convert single number input to an array
    if (!Array.isArray(elementsToRemove)) {
        elementsToRemove = [elementsToRemove];
    }




    return array.filter(item => !elementsToRemove.includes(item));
} // Removes all instances of elementsToRemove from the array you pass; can take a single number or an array



// NOTE: instead of passing all these parameters, you should likely just pass one parameter (an object) and do something like config.sol, config.max, and so on
function genLinEQ(NoXTerms,NoCTerms,sol,maxTerm,IntSols,IntCoefs) {
    let maxCoef,NZCoefArray;
   
    const sideDeterminant = [randInt(0,1),randInt(0,1),randInt(0,1),randInt(0,1)]; // Which side each term will be on
    let a,b,c,d,A,B,C,D;




    // Need 4 if-blocks here (for onlyIntSols and onlyIntCoef)
    // also, you should return the type AND subtype
    if ((IntSols === true) && (IntCoefs === true)) {
        maxCoef = Math.floor(0.5 * (-1 + Math.sqrt((4 * maxTerm) + 1))); // Given maxTerm, this limits how big any one component number can be
        NZCoefArray = removeFromArray(0,integerArray((-1) * maxCoef,maxCoef)); // Non-zero coefficient array


        if ((NoXTerms === 2) && (NoCTerms === 2)) {
            c = sol;
            a = randFromList(NZCoefArray);
            b = randFromList(removeFromArray((-1) * a, NZCoefArray));
            d = randFromList(removeFromArray(b * c, NZCoefArray));
   
            return {
                coefficients: [a, (-1)*(a + b), b*c - d, d],
                sides: sideDeterminant,
                solution: c,
                subtype: 'B2',
                type: 'intSol-intCoef'
            };
        } // B2 -> ax + bx + c + d = 0
        else if ((NoXTerms === 2) && (NoCTerms === 1)) {
            c = (sol !== 0) ? sol : sol + (-1)**(randInt(0,1)); // ensure c can't be 0 in this case
            a = randFromList(NZCoefArray);
            b = randFromList(removeFromArray((-1) * a, NZCoefArray));
   
            return {
                coefficients: [(-1)*(a + b), a, b*c],
                sides: sideDeterminant,
                solution: c,
                subtype: 'B1',
                type: 'intSol-intCoef'
            };
        } // B1 -> ax + bx + c = 0
        else if ((NoXTerms === 2) && (NoCTerms === 0)) {
            a = randFromList(NZCoefArray);
            b = randFromList(removeFromArray((-1) * a, NZCoefArray));
   
            return {
                coefficients: [a, b],
                sides: sideDeterminant,
                solution: 0,
                subtype: 'B0',
                type: 'intSol-intCoef'
            };
        } // B0 -> ax + bx = 0
        else if ((NoXTerms === 1) && (NoCTerms === 2)) {
            b = sol;
            a = randFromList(NZCoefArray);
            c = randFromList(removeFromArray((-1)*a*b, NZCoefArray));
   
            return {
                coefficients: [a, (-1)*(a*b + c), c],
                sides: sideDeterminant,
                solution: b,
                subtype: 'A2',
                type: 'intSol-intCoef'
            }
        } // A2 -> ax + b + c = 0
        else if ((NoXTerms === 1) && (NoCTerms === 1)) {
            a = randFromList(NZCoefArray);
            if (sideDeterminant[1] === 1) a = randFromList(removeFromArray(1,NZCoefArray));
            b = sol;
   
            return {
                coefficients: [a,b],
                sides: sideDeterminant,
                solution: b,
                subtype: 'A1',
                type: 'intSol-intCoef'
            }
        } // A1 -> ax + b = 0 (beware of x = b here {exclude it})
        else if ((NoXTerms === 1) && (NoCTerms === 0)) {
            a = randFromList(NZCoefArray);
   
            return {
                coefficients: [a],
                sides: sideDeterminant,
                solution: 0,
                subtype: 'A0',
                type: 'intSol-intCoef'
            }
        } // A0 -> ax = 0
    }
    else if ((IntSols === true) && (IntCoefs === false)) {
        maxCoef = Math.floor(Math.cbrt(maxTerm)); // Given maxTerm, this limits how big any one component number can be
        NZCoefArray = removeFromArray(0,integerArray((-1) * maxCoef,maxCoef)); // Non-zero coefficient array


        if ((NoXTerms === 2) && (NoCTerms === 2)) {
            a = randFromList(NZCoefArray);
            b = randFromList(NZCoefArray);
            A = randFromList(NZCoefArray);
            B = randFromList(NZCoefArray);
            C = randFromList(NZCoefArray);
            D = randFromList(NZCoefArray);
            c = sol;
            d = randFromList(removeFromArray([(-1)*b,(-1)*(a + b)],NZCoefArray));
           
            return {
                coefficients: [a,b,c,d,A,B,C,D],
                sides: sideDeterminant,
                solution: c,
                subtype: 'B2',
                type: 'intSol-ratCoef'
            }
        } // B2 -> ax + bx + c + d = 0
        else if ((NoXTerms === 2) && (NoCTerms === 1)) {
            a = randFromList(NZCoefArray);
            b = randFromList(NZCoefArray);
            A = randFromList(NZCoefArray);
            B = randFromList(NZCoefArray);
            C = randFromList(NZCoefArray);
            b = randFromList(removeFromArray((-1)*a,NZCoefArray));
            c = sol;


            return {
                coefficients: [a,b,c,A,B,C],
                sides: sideDeterminant,
                solution: c,
                subtype: 'B1',
                type: 'intSol-ratCoef'
            }
        } // B1 -> ax + bx + c = 0
        else if ((NoXTerms === 2) && (NoCTerms === 0)) {
            a = randFromList(NZCoefArray);
            b = randFromList(NZCoefArray);
            A = randFromList(NZCoefArray);
            B = randFromList(removeFromArray((-1)*b*A/a,NZCoefArray));


            return {
                coefficients: [a,b,A,B],
                sides: sideDeterminant,
                solution: 0,
                subtype: 'B0',
                type: 'intSol-ratCoef'
            }
        } // B0 -> ax + bx = 0
        else if ((NoXTerms === 1) && (NoCTerms === 2)) {
            a = randFromList(NZCoefArray);
            b = randFromList(NZCoefArray);
            c = randFromList(NZCoefArray);
            A = randFromList(NZCoefArray);
            B = randFromList(NZCoefArray);
            C = randFromList(NZCoefArray);


            return {
                coefficients: [a,b,c,A,B,C],
                sides: sideDeterminant,
                solution: (-1)*(b + c),
                subtype: 'A2',
                type: 'intSol-ratCoef'
            }
        } // A2 -> ax + b + c = 0
        else if ((NoXTerms === 1) && (NoCTerms === 1)) {
            a = randFromList(NZCoefArray);
            b = randFromList(NZCoefArray);
            A = randFromList(NZCoefArray);
            B = randFromList(NZCoefArray);


            return {
                coefficients: [a,b,A,B],
                sides: sideDeterminant,
                solution: B,
                subtype: 'A1',
                type: 'intSol-ratCoef'
            }
        } // A1 -> ax + b = 0 (beware of x = b here {exclude it})
        else if ((NoXTerms === 1) && (NoCTerms === 0)) {
            a = randFromList(NZCoefArray);
            A = randFromList(NZCoefArray);


            return {
                coefficients: [a,A],
                sides: sideDeterminant,
                solution: 0,
                subtype: 'A0',
                type: 'intSol-ratCoef'
            }
        } // A0 -> ax = 0
    }
    else if ((IntSols === false) && (IntCoefs === true)) {
        maxCoef = Math.floor(maxTerm);
        NZCoefArray = randFromList(removeFromArray(0,integerArray((-1)*maxCoef, maxCoef)));


       


    }
}
// Note: the lowest you could ever set maxTerm while still being able to generate properly is 2
// (assuming you are in integer coefficients)




let maxTerm = randInt(2,110);
let maxCoef = Math.floor(Math.cbrt(maxTerm));


let newObj = genLinEQ(randInt(1,2),randInt(0,2),randInt((-1)*maxCoef, maxCoef), maxTerm,true,false);
console.log('coefs',newObj.coefficients);
console.log('sides',newObj.sides);
console.log('sol',newObj.solution);
console.log('subtype',newObj.subtype);
console.log('type',newObj.type);







