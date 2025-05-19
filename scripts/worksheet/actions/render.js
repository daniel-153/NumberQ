import * as RH from '../helpers/render-helpers.js';

export function render() {
    RH.insertWorksheetHtml(); 
    RH.handleProblemUpdates();
    RH.fitMathOverflow(); 
    
    if (RH.pushContentOverflow()) {
        RH.insertWorksheetHtml(); 
        RH.handleProblemUpdates();
        RH.fitMathOverflow();
    }

    RH.createAnswerKey();
}
