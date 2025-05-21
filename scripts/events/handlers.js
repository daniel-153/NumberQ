import * as PG from '../pg-ui/pg-ui.js';
import * as PGH from '../pg-ui/helpers/ui-actions.js';
import * as UH from '../helpers/ui-helpers.js';

const event_listeners = [
    function homePage() {
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
        document.getElementById('Q-copy-button').addEventListener('click', function() {
            PGH.copyTextThenReset('un-rendered-Q', this);
        })

        document.getElementById('A-copy-button').addEventListener('click', function() {
            PGH.copyTextThenReset('un-rendered-A', this);
        })

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

        document.getElementById('settings-form').addEventListener('click', (event) => {
            if (event.target.matches('.settings-lock') || event.target.matches('.settings-lock-image')) {
                const settings_lock = event.target.closest('.settings-lock'); // direct unto the lock-div (if the target was actually the inner image)
                
                if (settings_lock.getAttribute('data-status') === 'unlocked') {
                    settings_lock.innerHTML = '<img src="images/lock.png" alt="" class="settings-lock-image"/>'
                    settings_lock.setAttribute('data-status', 'locked');
                }
                else if (event.target.closest('.settings-lock').getAttribute('data-status') === 'locked') {
                    settings_lock.innerHTML = '<img src="images/unlock.png" alt="" class="settings-lock-image"/>'
                    settings_lock.setAttribute('data-status', 'unlocked');
                }
            }
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
];

export function registerEventListeners() {
    event_listeners.forEach(addListeners => addListeners());
}