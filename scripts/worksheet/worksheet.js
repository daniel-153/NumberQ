let worksheet = null;

const _editorFunctions = {
    createAsEmptyDoc,
    createAsDefault,
    appendNewPage,
    deletePageAt,
    appendContentToPage,
    deleteContentAt,
    print,
    appendItemAt,
    deleteItemAt
}

export const worksheetEditor = {
    static_update: _editorFunctions,
    ...(new Proxy(
        _editorFunctions, 
        {
            get: function(target_obj, property) { 
                if (Object.prototype.hasOwnProperty.call(target_obj, property) && property !== 'print') { 
                    return function(...args) { 
                        const return_value = target_obj[property](...args); 
                        render(); 
                        updateOutline();
                        return return_value;
                    }
                }
                else return target_obj[property];
            }
        }
    )),
    render: render,
    updateOutline: updateOutline,
    focused_item: null 
};

// TODO (next step): make it so you can add AND remove pages from the worksheet, then make it so can add and remove 'content'
// (which will probably just be empty space or lorem or something at first), then make sure the printing can work
// then make it so you can change that content,
// then the ability to change the pages, then the ability to change the doc (begin to add options for everything) 

// Editor Functions:
function createAsEmptyDoc() {
    worksheet = {
        pages: [],
        settings: {}
    };
}

function createAsDefault() { 
    createAsEmptyDoc();
    appendNewPage();
}

function appendNewPage() {
    worksheet.pages.push(
        {
            content: [],
            settings: {}
        }
    );
}

function deletePageAt(index) {
    worksheet.pages.splice(index, 1);
}

function appendContentToPage(page_index) { // just a test
    worksheet.pages[Number(page_index)].content.push({
        text_content: '\\frac{x^{2}-9x+18}{x+5}\\cdot\\frac{x^{2}-2x-35}{x^{2}-8x+15}'
    });
}

function deleteContentAt(content_id) {
    let [ page_index, content_index ] = content_id.split('.');
    worksheet.pages[page_index].content.splice(content_index, 1);
}

function appendItemAt(item_ID) {
    const [ item_type, item_number ] = item_ID.split('-');

    if (item_type === 'document') {
        // add a page to the document
        worksheet.pages.push(
            {
                content: [],
                settings: {}
            }
        );

        return 'page-' + (worksheet.pages.length - 1); // return the item_ID of the page that got added
    }
    else if (item_type === 'page') {
        worksheet.pages[Number(item_number)].content.push({
            settings: {
                text_content: '\\frac{x^{2}-9x+18}{x+5}\\cdot\\frac{x^{2}-2x-35}{x^{2}-8x+15}'
            }
        });

        return 'content-' + item_number + '.' + (worksheet.pages[Number(item_number)].content.length - 1); // return the item_ID of the content that got added
    }
}

function deleteItemAt(item_ID) {
    const [ item_type, item_number ] = item_ID.split('-');

    if (item_type === 'document') {
        worksheet = null;
    }
    else if (item_type === 'page') {
        worksheet.pages.splice(Number(item_number), 1);

        return 'document'; // indicate the focus should be "moved" to the docuement
    }
    else if (item_type === 'content') {
        const [ page_index, content_index ] = item_number.split('.');
        worksheet.pages[page_index].content.splice(content_index, 1);

        return 'page-' + page_index; // indicate the focus should be "moved" to the page where the content got deleted
    }
}


// Rendering Functions:
function render() {
    let updated_html = '';
    for (let i = 0; i < worksheet.pages.length; i++) {
        updated_html += `
            <div class="worksheet-page-wrapper">
                <div class="worksheet-page">
            `;
        
        for (let j = 0; j < worksheet.pages[i].content.length; j++) {
            updated_html += `
                <div class="worksheet-page-content">${worksheet.pages[i].content[j].settings.text_content}</div>
            `;

        }
        
        updated_html += '</div></div>';
    }

    updated_html += '<div id="worksheet-preview-bottom">&nbsp;</div>'
    document.getElementById('worksheet-page-column').innerHTML = updated_html;
}

function updateOutline() {
    let updated_html = `
        <div class="outline-item outline-document" data-item-ID="document">
            <div class="outline-label outline-document-label">Document</div>
            <div class="outline-nav-wrapper">
                <button 
                    class="outline-button outline-plus-button"
                >+</button>
            </div>
        </div>
    `;
    for (let i = 0; i < worksheet.pages.length; i++) {
        updated_html += `
            <div class="outline-item outline-page" data-item-ID="page-${i}">
                <div class="outline-label outline-page-label">Page ${i + 1}</div>
                <div class="outline-nav-wrapper">
                    <button 
                        class="outline-button outline-delete-button"
                    >X</button>    
                    <button 
                        class="outline-button outline-plus-button"
                    >+</button>
                </div>
            </div>
        `;
        for (let j = 0; j < worksheet.pages[i].content.length; j++) {
            updated_html += `
                <div class="outline-item outline-content" data-item-ID="content-${i}.${j}">
                    <div class="outline-label outline-content-label">Content ${i + 1}.${j + 1}</div>
                    <div class="outline-nav-wrapper">
                        <button 
                            class="outline-button outline-delete-button"
                        >X</button>    
                    </div>
                </div>
            `;
        }
    }
    document.getElementById('outline-container').innerHTML = updated_html;
}

function print() {    
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




