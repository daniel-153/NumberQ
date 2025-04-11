import * as RH from './helpers/render-helpers.js';

export function render() {
    RH.insertWorksheetHtml(); 
    RH.handleTexUpdates();
    RH.fitMathOverflow(); 
    
    RH.pushContentOverflow(); 

    RH.insertWorksheetHtml(); 
    RH.handleTexUpdates();
    RH.fitMathOverflow(); 
}