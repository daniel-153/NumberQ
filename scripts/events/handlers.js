import * as PG from '../pg-ui/pg-ui.js';
import * as PGH from '../pg-ui/helpers/ui-actions.js';
import * as UH from '../helpers/ui-helpers.js';
import * as WPG from '../worksheet/worksheet-pg-ui/wpg-ui.js';
import { worksheet_editor }  from '../worksheet/worksheet.js';

const event_listeners = [
    function homePage() {
        UH.insertModeBanners();
        
        document.getElementById('create-worksheets-button').addEventListener('click', () => {
            UH.toggleVisibility(['worksheet-page'],['home-page-content']);
            worksheet_editor.createAsDefault();
        });
        
        document.getElementById('generator-list').addEventListener('click', (event) => {
            if (event.target.matches('.start-button')) {
                UH.toggleVisibility(['generation-content'], ['home-page-content', 'presenation-content']);
                window.scrollTo(0, 0);
                history.pushState({ page: 'generator' }, '', '');
                document.getElementById('randomize-all-checkbox').checked = false; // make sure randomize-all always starts unchecked
                document.getElementById('settings-container').scrollTop = 0; // reset the scroll on the settings group
                document.getElementById('generate-button').setAttribute('data-gen-func-name', event.target.getAttribute('data-gen-func-name'));
                PG.generate(event.target.getAttribute('data-gen-func-name'), event.target.getAttribute('data-gen-type'));
            }
        });

        window.addEventListener('popstate',() => {
            UH.toggleVisibility(['home-page-content'], ['generation-content', 'FAQ-page','worksheet-page']);
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
        UH.addTextAutofitter(document.getElementById('un-rendered-Q'), '1.2vw');
        UH.addTextAutofitter(document.getElementById('un-rendered-A'), '1.2vw');

        PGH.setupCopyButton('Q-copy-button', 'un-rendered-Q');
        PGH.setupCopyButton('A-copy-button', 'un-rendered-A');

        document.getElementById('generate-button').addEventListener('click', () => {
            PG.generate(document.getElementById('generate-button').getAttribute('data-gen-func-name'));
        })

        document.getElementById('back-arrow-p-modes').addEventListener('click', () => {
            UH.toggleVisibility(['home-page-content'], ['generation-content']);
            document.body.style.overflowY = 'visible';
        });

        document.getElementById('fullscreen-mode-button').addEventListener('click', () => {
            UH.toggleVisibility(['presenation-content'], []);
            
            // fit the TeX on the Q and A when the presentation window is first opened
            UH.updateElementMath('fullscreen-question');
            UH.updateElementMath('fullscreen-answer');
    
            // don't allow scrolling the generation content while in the presentation banner (by hiding it) (mostly for mobile)
            document.body.style.overflowY = 'hidden'; // the three ways out of here (where you need to set this back) are back-arrow, exit, and browser-back
    
            PGH.toggleFullScreenAns('hide');
        });
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

    function worksheetPage() {
        document.getElementById('outline-container').addEventListener('click', (event) => {
            // return if none of the outline items were clicked (only the background was clicked)
            if (event.target.closest('.outline-item') === null) return; 

            const targeted_item_ID = event.target.closest('.outline-item').getAttribute('data-item-ID'); 

            if (event.target.matches('.outline-plus-button') && event.target.matches('.document-plus-button')) { 
                worksheet_editor.addPageToDoc();
            }
            else if (event.target.matches('.outline-plus-button') && event.target.matches('.page-plus-button')) {
                worksheet_editor.addSectToPage(targeted_item_ID);
            }
            else if (event.target.matches('.outline-plus-button') && event.target.matches('.sect-plus-button')) {
                worksheet_editor.addContentToSect(targeted_item_ID);
            }
            else if (event.target.matches('.outline-delete-button')) { // delete and focus the parent of the item that was deleted
                worksheet_editor.deleteItemAt(targeted_item_ID);
            }
            else { // just focus the targeted item (because no specific action was specified)
                worksheet_editor.focusItemAt(targeted_item_ID);    
            }
        });

        window.addEventListener('DOMContentLoaded',() => {
            document.documentElement.style.setProperty('--worksheet-preview-scale', `${1.05 * window.innerWidth / 2560}`);
        });

        window.addEventListener('resize',() => {
            document.documentElement.style.setProperty('--worksheet-preview-scale', `${1.05 * window.innerWidth / 2560}`);
        });

        document.getElementById('worksheet-print-button').addEventListener('click', () => {
            worksheet_editor.print();
        });

        document.getElementById('item-action-buttons').addEventListener('click', (event) => {
            if (event.target.matches('.right-panel-generate-button')) {
                UH.toggleVisibility(['problem-editor-content'],[]);
                WPG.generate('genAddSub','Addition & Subtraction');
            }
        });     
    },

    function worksheetPePage() {
        document.getElementById('pe-generate-button').addEventListener('click', () => {
            WPG.generate();
        });
        
        document.getElementById('pe-exit-button').addEventListener('click', () => {
            UH.toggleVisibility([],['problem-editor-content']);
        });
        
        document.getElementById('use-problem-button').addEventListener('click', () => {
            worksheet_editor.editTextContent(
                worksheet_editor.focused_item_ID,
                document.getElementById('pe-question').getAttribute('data-latexcode')
            );
            document.getElementById('pe-exit-button').click();
        });

        document.getElementById('pe-mode-selector').addEventListener('click', (event) => {
            if (event.target.matches('.gen-select-button')) {
                WPG.generate(
                    event.target.getAttribute('data-gen-func-name'),
                    event.target.getAttribute('data-gen-type')
                );
            }
        });
    }
];

export function registerEventListeners() {
    event_listeners.forEach(addListeners => addListeners());
}