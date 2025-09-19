import "./math-jax/interface.js";
import { insertModeBanners } from "./helpers/ui-helpers.js";
import { registerEventListeners } from "./events/handlers.js";

(function init() {
    insertModeBanners();
    registerEventListeners();
    mjx_loader.typesetPromise();
})();