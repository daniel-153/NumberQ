import * as GH from './prob-gen-ui-helpers.js';
import * as UH from './ui-helpers.js';
import { worksheetEditor as worksheet }  from '../worksheet/worksheet.js';

const event_listeners = [
    function homePage() {
        document.getElementById('create-worksheets-button').addEventListener('click', () => {
            UH.toggleVisibility(['worksheet-page'],['home-page-content']);
            worksheet.createAsDefault();
        });
        
        [...document.getElementsByClassName('start-button')].forEach((element) => {
            element.addEventListener(
                'click',
                () => {
                    UH.toggleVisibility(['generation-content'], ['home-page-content', 'presenation-content']);
                    GH.initiateGenerator(element.getAttribute('data-gen-type'),element.getAttribute('data-gen-func-name'));
                    window.scrollTo(0, 0);
                    history.pushState({ page: 'generator' }, '', '');
                    document.getElementById('randomize-all-checkbox').checked = false; // make sure randomize-all always starts unchecked
                    document.getElementById('settings-container').scrollTop = 0; // reset the scroll on the settings group
            });
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

        GH.setupCopyButton('Q-copy-button', 'un-rendered-Q');
        GH.setupCopyButton('A-copy-button', 'un-rendered-A');

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
    
            GH.toggleFullScreenAns('hide');
        });
    },

    function presentationPage() {
        document.getElementById('fullscreen-regen-button').addEventListener('click', () => {
            document.getElementById('generate-button').click();
        });
    
        document.getElementById('show-hide-button').addEventListener('click', () => {
            GH.toggleFullScreenAns();
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
        document.getElementById('special-test-item').addEventListener('click', () => {
            worksheet.appendNewPage();
        });
    }
];

export function registerEventListeners() {
    event_listeners.forEach(addListeners => addListeners());
}