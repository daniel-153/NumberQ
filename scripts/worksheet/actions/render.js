import * as RH from '../helpers/render-helpers.js';

export function render() {
    RH.insertWorksheetHtml(); 
    RH.handleMathUpdates('problems');
    RH.fitMathOverflow(); 
    
    if (RH.pushContentOverflow()) {
        RH.insertWorksheetHtml(); 
        RH.handleMathUpdates('problems');
        RH.fitMathOverflow();
    }

    RH.createAnswerKey();
    RH.handleMathUpdates('answers');
    RH.fitMathOverflow();
}
