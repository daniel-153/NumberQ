export function setupCopyButton(button_id, text_element_id) {
    const button = document.getElementById(button_id);
    button.addEventListener('click', () => {
        navigator.clipboard.writeText(document.getElementById(text_element_id).textContent);
        button.innerHTML = 'Copied!';
        button.setAttribute('data-status', 'text-was-copied');
        
        if (button._timeoutId) {
            clearTimeout(button._timeoutId);
        }
    
        button._timeoutId = setTimeout(() => {
            button.innerHTML = 'Copy';
            button.removeAttribute('data-status');
            button._timeoutId = null; 
        }, 2000);
    });
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