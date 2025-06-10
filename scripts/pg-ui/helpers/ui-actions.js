export function copyTextThenReset(text_element_id, copy_button_el) {
    navigator.clipboard.writeText(document.getElementById(text_element_id).textContent);
    copy_button_el.innerHTML = 'Copied!';
    copy_button_el.setAttribute('data-status', 'text-was-copied');
    
    if (copy_button_el._timeoutId) {
        clearTimeout(copy_button_el._timeoutId);
    }

    copy_button_el._timeoutId = setTimeout(() => {
        copy_button_el.innerHTML = 'Copy';
        copy_button_el.removeAttribute('data-status');
        copy_button_el._timeoutId = null; 
    }, 2000);
}

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