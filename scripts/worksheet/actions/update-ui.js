import * as UH from "../helpers/ui-helpers.js";

export function updateUi() { // should you pass a param here, or make this function like render where it goes off of the current state?
    UH.updateOutline();
    UH.focusCurrentItem();
    UH.openItemSettings(); // does nothing currently
    // switch focus
    // open correct settings
    //...
}