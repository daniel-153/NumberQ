let worksheet = null;

const _editorFunctions = {
    createAsEmptyDoc,
    createAsDefault,
    print,
    appendItemAt,
    deleteItemAt,
    editTextContent
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
    getItemById: getItemById,
    focused_item_ID: null 
};

// TODO (next step): make it so you can add AND remove pages from the worksheet, then make it so can add and remove 'content'
// (which will probably just be empty space or lorem or something at first), then make sure the printing can work
// then make it so you can change that content,
// then the ability to change the pages, then the ability to change the doc (begin to add options for everything) 

// Editor Functions:
function createAsEmptyDoc() {
    worksheet = {
        pages: [],
        settings: {},
    };
}

function createAsDefault() { 
    createAsEmptyDoc();
    appendItemAt('document');
}

function getItemById(item_ID) {
    const [ item_type, item_number ] = item_ID.split('-');

    if (item_type === 'document') {
        return worksheet;
    }
    else if (item_type === 'page') {
        return worksheet.pages[item_number];
    }
    else if (item_type === 'content') {
        const [ page_index, content_index ] = item_number.split('.');
        
        return worksheet.pages[page_index].content[content_index];
    }
    else {
        console.error(`Cannot get item with ID="${item_ID}".`);
        return null;
    }
}

function getIdByItem(item_obj) {
    let id_found = false;
    if ('pages' in item_obj) {
        if (item_obj === worksheet) {
            id_found = true;
            return 'document';
        }
    }
    else if ('content' in item_obj) {
        while (!id_found) {
            for (let i = 0; i < worksheet.pages.length; i++) {
                if (item_obj === worksheet.pages[i]) { // check for strict (reference) object equality (same obj)
                    id_found = true;
                    return 'page-' + i;
                }
            }
        }
    }
    else {
        while (!id_found) {
            for (let i = 0; i < worksheet.pages.length; i++) {
                for (let j = 0; j < worksheet.pages[i].content.length; j++) {
                    if (item_obj === worksheet.pages[i].content[j]) {
                        id_found = true;
                        return 'content-' + i +'.' + j;
                    }
                }
            }
        }
    }

    // if we made it past the if-else above, no item matching item_obj was found
    console.error(`item_object=${item_obj} was not found.`);
}

function appendItemAt(item_ID) {
    const [ item_type, item_number ] = item_ID.split('-');

    if (item_type === 'document') {
        // add a page to the document
        worksheet.pages.push(
            {
                content: [],
                settings: {},
            }
        );

        return 'page-' + (worksheet.pages.length - 1); // return the item_ID of the page that got added
    }
    else if (item_type === 'page') {
        worksheet.pages[Number(item_number)].content.push({
            settings: {
                text_content: '[insert]',
                font_size: '1cm'
            },
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

function editTextContent(item_ID, value) {
    if (item_ID.split('-')[0] !== 'content') {
        console.error("Cannot call 'editTextContent()' on docuement or page");
        return;
    }

    const content_item = getItemById(item_ID);

    content_item.settings.text_content = value;
}

// Rendering Functions:
function render() {
    function createProblemBoxHtml(content_item, problem_number, box_width) {
        return `
            <div class="content-box ${box_width}-width-box" data-item-ID="${getIdByItem(content_item)}">
                <div class="problem-number">${problem_number}.</div>
                <div class="problem-tex" data-math-container="true" style="font-size: ${content_item.settings.font_size};">
                    \\(${content_item.settings.text_content}\\)
                </div>
            </div>
        `;
    }

    let updated_html = '';
    for (let i = 0; i < worksheet.pages.length; i++) {
        updated_html += `
            <div class="worksheet-page-wrapper">
                <div 
                    class="worksheet-page"
                    style="
                        padding: 1in 1in 1in 1in;
                    "
                >
                    <div class="worksheet-page-content-area">
        `;
        
        let items_left = worksheet.pages[i].content.length;
        let current_item = 0;
        while (items_left > 0) {
            updated_html += `<div class="full-width-bounding-box">`;
            if (items_left > 1) {
                updated_html += createProblemBoxHtml(worksheet.pages[i].content[current_item], current_item + 1, 'half');
                items_left--; current_item++;
                updated_html += createProblemBoxHtml(worksheet.pages[i].content[current_item], current_item + 1, 'half');
                items_left--; current_item++;
            }
            else if (items_left === 1) {
                updated_html += createProblemBoxHtml(worksheet.pages[i].content[current_item], current_item + 1, 'half');
                items_left--; current_item++;
            }
            updated_html += `</div>`
        }
        
        updated_html += '</div></div></div>';
    }

    updated_html += '<div id="worksheet-preview-bottom">&nbsp;</div>'
    document.getElementById('worksheet-page-column').innerHTML = updated_html;
    MathJax.typesetPromise(['#worksheet-page-column']);
}

function fitWorksheetOverflow() {
    function fitMathToElementCM(element) {
        let scale_factor = element.clientWidth / element.scrollWidth;




    }
    
    
    [...document.getElementById('worksheet-page-content-area').children].forEach(block_bounding_box => {
        [...block_bounding_box.children].forEach(content_box => {
            const math_div = content_box.lastChild;

        });
    });
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




