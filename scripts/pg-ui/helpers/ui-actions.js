import { CH } from "../../helpers/canvas-helpers.js";

export function toggleFullScreenAns(method = 'toggle') {
    if (method === 'toggle') {
        if (document.getElementById('show-hide-button').getAttribute('data-status') === 'show') method = 'show';
        else if (document.getElementById('show-hide-button').getAttribute('data-status') === 'hide') method = 'hide';
        else method = 'show';
    }

    if (method === 'show') {
        document.getElementById('fullscreen-answer').style.background = 'whitesmoke';
        document.getElementById('fullscreen-answer').style.color = 'rgb(11, 5, 5)';
        document.getElementById('show-hide-button').innerHTML = 'Hide';
        document.getElementById('show-hide-button').setAttribute('data-status','hide');
        document.getElementById('fullscreen-answer').style.overflowX = 'auto';
    }
    else if (method === 'hide') {
        document.getElementById('fullscreen-answer').style.background = '';
        document.getElementById('fullscreen-answer').style.color = '';
        document.getElementById('show-hide-button').innerHTML = 'Show';
        document.getElementById('show-hide-button').removeAttribute('data-status');
        document.getElementById('show-hide-button').setAttribute('data-status','show');
        document.getElementById('fullscreen-answer').style.overflowX = 'hidden';
    }
} // method => 'show', 'hide', or 'toggle' the fullscreen answer 

export function toggleSettingsLock(settings_lock_el, method = 'toggle') {
    if (method === 'toggle') {
        const current_status = settings_lock_el.getAttribute('data-status');

        if (current_status === 'unlocked') method = 'lock';
        else if (current_status === 'locked') method = 'unlock';
    }

    const lock_image_el = [...settings_lock_el.children][0];
    if (method === 'lock') {
        lock_image_el.src = "images/lock.png";
        settings_lock_el.setAttribute('data-status', 'locked');
    }
    else if (method === 'unlock') {
        lock_image_el.src = "images/unlock.png";
        settings_lock_el.setAttribute('data-status', 'unlocked');
    }
} // lock if unlocked and unlock if locked Or -> carry out method if provided

const CCH = { // handleCopyClick helpers
    determineContentType: function(Q_or_A) { // 'latex' or 'canvas'
        const content_container = document.getElementById(`rendered-${Q_or_A}`).firstElementChild;

        if (content_container.tagName === 'CANVAS') {
            return 'canvas';
        }
        else return 'latex';
    },
    copyLatex: function(Q_or_A) {
        navigator.clipboard.writeText(document.getElementById(`un-rendered-${Q_or_A}`).textContent);
    },
    copyCanvas: async function(Q_or_A) {
        const target_canvas = document.getElementById(`rendered-${Q_or_A}`).firstElementChild;

        const blob = await new Promise(resolve => target_canvas.toBlob(resolve, 'image/png'));
        const item = new ClipboardItem({ 'image/png': blob });

        try {
            await navigator.clipboard.write([item]);
        } catch (error) {
            console.error(`Failed to copy ${Q_or_A} canvas: ${error}`);
        }
    },
    copySvgImgElToClipboard: async function(img_el) {
        return new Promise((resolve, reject) => {
            // Draw the <img> onto a canvas
            const canvas = document.createElement('canvas'); 
            canvas.width = img_el.naturalWidth || img_el.width;
            canvas.height = img_el.naturalHeight || img_el.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img_el, 0, 0);

            // Convert canvas to blob and copy it
            canvas.toBlob(async blob => {
                if (!blob) {
                    reject(new Error("Failed to convert canvas to blob"));
                    return;
                }

                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({ "image/png": blob })
                    ]);
                    resolve();
                } catch (err) {
                    reject(err);
                }
            }, 'image/png');
        });
    },
    copyMjxAsImage: async function(Q_or_A) {
        const latex_string = document.getElementById(`rendered-${Q_or_A}`).getAttribute('data-latexcode');

        const mjx_img_el = (await CH.getMathJaxAsImage([[latex_string, 15]]))[0];

        this.copySvgImgElToClipboard(mjx_img_el);
    }
};
export async function handleCopyClick(r_or_u_Q_or_A) {
    const [r_or_u, Q_or_A]  = r_or_u_Q_or_A.split('-');

    const content_type = CCH.determineContentType(Q_or_A);
    if (content_type === 'latex') {
        if (r_or_u === 'u') CCH.copyLatex(Q_or_A);
        else if (r_or_u === 'r') CCH.copyMjxAsImage(Q_or_A);
    }
    else if (content_type === 'canvas') {
        await CCH.copyCanvas(Q_or_A);
    }

    const copy_button_el = document.getElementById(`${r_or_u_Q_or_A}-copy-image-wrapper`);

    copy_button_el.setAttribute('data-status', 'copy-cooldown');

    if (copy_button_el._timeoutId) {
        clearTimeout(copy_button_el._timeoutId);
    }

    copy_button_el._timeoutId = setTimeout(() => {
        copy_button_el.setAttribute('data-status', 'default');
        copy_button_el._timeoutId = null; 
    }, 2000);
}

export function togglePresetMenu() {
    const menu_toggle_btn = document.getElementById('presets-menu-toggle-btn');
    
    let updated_menu_status;
    if (menu_toggle_btn.getAttribute('data-preset-menu-status') === 'shown') { // menu is currently shown -> hide it
        updated_menu_status = 'hidden';
    }
    else { // menu is not shown -> reveal it
        updated_menu_status = 'shown';
    }

    [
        menu_toggle_btn, 
        document.getElementById('settings-presets-tab'),
        document.getElementById('preset-list-wrapper'),
        document.getElementById('presets-menu-triangle')
    ].forEach(el => {
        el.setAttribute('data-preset-menu-status', updated_menu_status);
    });
}

export function toggleUsePresetIndicator() {
    const preset_tab = document.getElementById('settings-presets-tab');
    
    let updated_status;
    if (preset_tab.getAttribute('data-use-preset-status') === 'applied') { // preset is applied -> remove indicator
        updated_status = 'not-applied';
    }
    else { // preset is not applied -> apply indicator
        updated_status = 'applied';
    }

    [
        preset_tab,
        document.getElementById('settings-container')
    ].forEach(el => {
        el.setAttribute('data-use-preset-status', updated_status);
    });
}

export function focusPresetOption(targeted_input_el) {
    targeted_input_el.checked = true;
    document.getElementById('settings-presets-tab').setAttribute('data-focused-preset', targeted_input_el.value);
    document.getElementById('settings-preset-label').innerHTML = document.querySelector(`label[for="${targeted_input_el.id}"]`).innerHTML;
}