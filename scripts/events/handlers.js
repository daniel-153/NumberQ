import * as PG from '../pg-ui/pg-ui.js';
import * as PGH from '../pg-ui/helpers/ui-actions.js';
import * as UH from '../helpers/ui-helpers.js';
import * as E from '../pg-ui/export-ui/export.js';
import * as P from '../pg-ui/present-ui/present.js';

const event_listeners = [
    function homePage() {
        document.getElementById('generator-list').addEventListener('click', (event) => {
            if (event.target.matches('.start-button')) {
                UH.open('generation-content');
                window.scrollTo(0, 0);
                PGH.resetSettingsVisualUi(event.target.getAttribute('data-gen-func-name'));
                document.getElementById('generate-button').setAttribute('data-gen-func-name', event.target.getAttribute('data-gen-func-name'));
                PG.generate(event.target.getAttribute('data-gen-func-name'), event.target.getAttribute('data-gen-type'));
            }
        });

        document.getElementById('feedback-button').addEventListener('click', () => {
            window.open('https://forms.gle/WecgWERFcqpR4sSEA', '_blank');
        });

        document.getElementById('see-info-button').addEventListener('click', () => {
            window.open(`${window.location.origin}/docs/info.html`, '_blank');
        });
    },

    function problemGenPage() {
        document.getElementById('Q-A-container').addEventListener('click', (event) => {
            if (event.target.matches('.copy-image-wrapper') || event.target.matches('.copy-button-image')) {
                PGH.handleCopyClick(event.target.closest('.export-image-wrapper').id.slice(0, 3));
            }
            else if (event.target.matches('.save-image-wrapper') || event.target.matches('.save-button-image')) {
                UH.open('export-content');
                E.buildNewExportUi(event.target.closest('.export-image-wrapper').id.charAt(0));
            }
        });

        document.getElementById('generate-button').addEventListener('click', () => {
            PG.generate(document.getElementById('generate-button').getAttribute('data-gen-func-name'));
        });

        document.getElementById('pgui-back-arrow').addEventListener('click', () => {
            UH.open('home-page-content');
            document.body.style.overflowY = 'visible';
        });

        document.getElementById('settings-form').addEventListener('click', (event) => {
            if (event.target.matches('.settings-lock') || event.target.matches('.settings-lock-image')) {
                PGH.toggleSettingsLock(event.target.closest('.settings-lock'));
                if (document.getElementById('settings-preset-checkbox').checked) PGH.updateOverrideIndicators(); 
            }
        });

        document.getElementById('presets-menu-toggle-btn').addEventListener('click', () => {
            PGH.togglePresetMenu();
        });

        document.getElementById('settings-preset-checkbox').addEventListener('click', () => {
            PGH.toggleUsePresetIndicator();
            PGH.updateOverrideIndicators();
        });

        document.getElementById('preset-list-wrapper').addEventListener('change', (event) => {
            if (event.target.matches('input[type="radio"].settings-preset-radio-btn[name="settings-preset"]')) {
                PGH.focusPresetOption(event.target);
                if (document.getElementById('settings-preset-checkbox').checked) PGH.updateOverrideIndicators(); 
            }
        });
    },

    function presentationPage() {
        document.getElementById('generation-content').addEventListener('click', async (event) => {
            if (event.target.id === 'present-ui-button' || event.target.id === 'present-image') {
                UH.open('present-content');
                P.buildNewPresentUi();
                document.body.style.overflowY = 'hidden';
            }
            else if (event.target.id === 'present-exit-button') {
                UH.close('present-content');
                document.body.style.overflowY = 'visible';
            }
            else if (event.target.closest('.present-button')) {
                if (event.target.closest('#present-generate-btn')) {
                    const present_gen_btn = event.target.closest('#present-generate-btn');
                    if (!present_gen_btn.__has_cooldown) {
                        try {
                            present_gen_btn.__has_cooldown = true;
                            await PG.generate(document.getElementById('generate-button').getAttribute('data-gen-func-name'));
                            await P.updateProblem();
                        } finally {
                            present_gen_btn.__has_cooldown = false;
                        }
                    }
                }
                else if (event.target.closest('#present-copy-btn')) {
                    P.copyCanvas();
                }
                else if (event.target.closest('#present-save-btn')) {
                    P.downloadCanvas();
                }
            }
        });
    },

    function exportPage() {
        document.getElementById('generation-content').addEventListener('click', (event) => {
            if (event.target.id === 'export-exit-button') {
                UH.close('export-content');
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