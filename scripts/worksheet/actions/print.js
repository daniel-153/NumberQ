export function print() {    
    // hide all body elements (but mark ones that were already hidden)
    Array.from(document.body.children).forEach(element => {
        if (element.classList.contains('hidden-content')) element.setAttribute('previously-hidden', 'true');
        element.classList.add('hidden-content');
    });

    // copy the html for all the worksheet pages
    const worksheet_page_array = [...document.getElementsByClassName('worksheet-page')];
    let running_html = '';
    for (let i = 0; i < worksheet_page_array.length; i++) {
        let page_element = worksheet_page_array[i];
        page_element.classList.add('print-worksheet-page');
        running_html += page_element.outerHTML;
        page_element.classList.remove('print-worksheet-page');
    }
    
    // insert the copied worksheet pages at the end of the body
    document.body.insertAdjacentHTML('beforeend', running_html);

    window.print();

    // remove the copies worksheet pages
    document.querySelectorAll('.print-worksheet-page').forEach(element => element.remove());

    // show all the elements that we hid at the start (Except for the ones that were already hidden)
    Array.from(document.body.children).forEach(element => {
        if (element.getAttribute('previously-hidden') === 'true') {
            element.removeAttribute('previously-hidden');
        }
        else {
            element.classList.remove('hidden-content');
        }
    });   
}