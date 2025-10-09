import "../math-jax/interface.js";

mjx_loader.typesetPromise();

document.getElementById('main-contents-list').addEventListener('click', (event) => {
    if (event.target.matches('li')) {
        document.getElementById(
            event.target.getAttribute('data-scrollto-id')
        ).scrollIntoView();
    }
});