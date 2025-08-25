import * as PG from '../pg-ui/pg-ui.js';
import * as PGH from '../pg-ui/helpers/ui-actions.js';
import * as UH from '../helpers/ui-helpers.js';
import * as E from '../pg-ui/export-ui/export.js';

const event_listeners = [
    function homePage() {
        document.getElementById('generator-list').addEventListener('click', (event) => {
            if (event.target.matches('.start-button')) {
                UH.toggleVisibility(['generation-content'], ['home-page-content', 'presenation-content']);
                window.scrollTo(0, 0);
                history.pushState({ page: 'generator' }, '', '');
                document.getElementById('settings-preset-checkbox').checked = false; // make sure randomize-all always starts unchecked
                document.getElementById('settings-container').scrollTop = 0; // reset the scroll on the settings group
                document.getElementById('generate-button').setAttribute('data-gen-func-name', event.target.getAttribute('data-gen-func-name'));
                PG.generate(event.target.getAttribute('data-gen-func-name'), event.target.getAttribute('data-gen-type'));
            }
        });

        window.addEventListener('popstate',() => {
            UH.toggleVisibility(['home-page-content'], ['generation-content', 'FAQ-page']);
            document.body.style.overflowY = 'visible';
            history.pushState({ page: 'generator' }, '', '');
        });

        document.getElementById('feedback-button').addEventListener('click', () => {
            window.open('https://forms.gle/WecgWERFcqpR4sSEA', '_blank');
            document.getElementById('feedback-button').blur();
        });

        document.getElementById('see-info-button').addEventListener('click', () => {
            UH.toggleVisibility(['FAQ-page'], ['home-page-content']);
            window.scrollTo(0, 0);
            document.getElementById('FAQ-content-container').scrollTo(0, 0);
            history.pushState({ page: 'generator' }, '', '');
        });
    },

    function problemGenPage() {
        document.getElementById('Q-A-container').addEventListener('click', async (event) => {
            if (event.target.matches('.copy-image-wrapper') || event.target.matches('.copy-button-image')) PGH.handleCopyClick(event.target.closest('.export-image-wrapper').id.slice(0, 3));
            else if (event.target.matches('.save-image-wrapper') || event.target.matches('.save-button-image')) E.buildNewExportUi(event.target.closest('.export-image-wrapper').id.charAt(0));
        });

        document.getElementById('generate-button').addEventListener('click', () => {
            PG.generate(document.getElementById('generate-button').getAttribute('data-gen-func-name'));
        });

        document.getElementById('back-arrow-p-modes').addEventListener('click', () => {
            UH.toggleVisibility(['home-page-content'], ['generation-content']);
            document.body.style.overflowY = 'visible';
        });

        document.getElementById('settings-form').addEventListener('click', (event) => {
            if (event.target.matches('.settings-lock') || event.target.matches('.settings-lock-image')) {
                PGH.toggleSettingsLock(event.target.closest('.settings-lock'));
            }
        });

        document.getElementById('presets-menu-toggle-btn').addEventListener('click', () => {
            PGH.togglePresetMenu();
        });

        document.getElementById('settings-preset-checkbox').addEventListener('click', () => {
            PGH.toggleUsePresetIndicator();
        });

        document.getElementById('preset-list-wrapper').addEventListener('change', (event) => {
            if (event.target.matches('input[type="radio"].settings-preset-radio-btn[name="settings-preset"]')) {
                PGH.focusPresetOption(event.target);
            }
        })
    },

    function presentationPage() {
        document.getElementById('fullscreen-regen-button').addEventListener('click', () => {
            document.getElementById('generate-button').click();
        });
    
        document.getElementById('show-hide-button').addEventListener('click', () => {
            PGH.toggleFullScreenAns();
        });

        document.getElementById('fullscreen-exit-button').addEventListener('click', () => {
            UH.toggleVisibility([], ['presenation-content']);
            document.body.style.overflowY = 'visible';
        });
    },

    function FAQPage() {
        document.getElementById('back-arrow-FAQ').addEventListener('click', () => {
            UH.toggleVisibility(['home-page-content'], ['FAQ-page']);
        });
    },

    function exportPage() {
        document.getElementById('generation-content').addEventListener('click', (event) => {
            if (event.target.id === 'export-exit-button') {
                UH.toggleVisibility([], ['export-content']);
            }
            else if (event.target.id === 'download-button') {
                E.exportMath();
            }
        });
    }
];

export function registerEventListeners() {
    event_listeners.forEach(addListeners => addListeners());
}