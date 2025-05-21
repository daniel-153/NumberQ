import { insertModeBanners } from "./helpers/ui-helpers.js";
import { registerEventListeners } from "./events/handlers.js";

(function init() {
    insertModeBanners();
    registerEventListeners();
})();