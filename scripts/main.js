import { insertHomeMath, insertModeBanners } from "./helpers/ui-helpers.js";
import { registerEventListeners } from "./events/handlers.js";

(function init() {
    insertHomeMath();
    insertModeBanners();
    registerEventListeners();
})();