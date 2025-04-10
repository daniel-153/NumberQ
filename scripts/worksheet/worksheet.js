let worksheet = null;

const _editor_functions = {
    createAsEmptyDoc,
    createAsDefault,
    print,
    appendItemAt,
    deleteItemAt,
    editTextContent
}

export const worksheet_editor = {
    static_update: _editor_functions,
    ...(new Proxy(
        _editor_functions, 
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
        if (worksheet !== null) return worksheet;
    }
    else if (item_type === 'page') {
        if (worksheet.pages[item_number] !== undefined) return worksheet.pages[item_number];
    }
    else if (item_type === 'content') {
        const [ page_index, content_index ] = item_number.split('.');
        
        if (
            worksheet.pages[page_index] !== undefined &&
            worksheet.pages[page_index].content[content_index] !== undefined
        ) {
            return worksheet.pages[page_index].content[content_index];
        }
    }
    
    return null;
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

    return null;
}

function appendItemAt(item_ID, method = 'push') {
    const [ item_type, item_number ] = item_ID.split('-');

    if (item_type === 'document') {
        // add a page to the document
        worksheet.pages[method](
            {
                content: [],
                settings: {},
            }
        );

        return 'page-' + (worksheet.pages.length - 1); // return the item_ID of the page that got added
    }
    else if (item_type === 'page') {
        worksheet.pages[Number(item_number)].content[method]({
            settings: {
                text_content: '[insert]',
                font_size: '1cm',
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
    insertWorksheetHtml(); // super quick
    MathJax.typesetPromise(['#worksheet-page-column']); // extremely costly when there's lots of problems
    fitMathOverflow(); // decently quick
    let overflow_found;
    do {
        overflow_found = pushContentOverflow(); // super quick
        if (overflow_found) {
            insertWorksheetHtml(); // super quick
            MathJax.typesetPromise(['#worksheet-page-column']); // extremely costly when there's lots of problems
            fitMathOverflow(); // decently quick
        }
    } while (overflow_found);
}

function insertWorksheetHtml() {
    function createProblemBoxHtml(content_item, box_width) {        
        return `
            <div class="content-box ${box_width}-width-box" data-item-ID="${getIdByItem(content_item)}">
                <div class="problem-number">${getProblemNumber(content_item)})</div>
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
                updated_html += createProblemBoxHtml(worksheet.pages[i].content[current_item], 'half');
                items_left--; current_item++;
                updated_html += createProblemBoxHtml(worksheet.pages[i].content[current_item], 'half');
                items_left--; current_item++;
            }
            else if (items_left === 1) {
                updated_html += createProblemBoxHtml(worksheet.pages[i].content[current_item], 'half');
                items_left--; current_item++;
            }
            updated_html += `</div>`;
        }
        
        updated_html += '</div></div></div>';
    }

    updated_html += '<div id="worksheet-preview-bottom">&nbsp;</div>'
    document.getElementById('worksheet-page-column').innerHTML = updated_html;
}


function Render() {
    function createProblemBoxHtml(content_item, box_width) {        
        return `
            <div class="content-box ${box_width}-width-box" data-item-ID="${getIdByItem(content_item)}">
                <div class="problem-number">${getProblemNumber(content_item)})</div>
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
                updated_html += createProblemBoxHtml(worksheet.pages[i].content[current_item], 'half');
                items_left--; current_item++;
                updated_html += createProblemBoxHtml(worksheet.pages[i].content[current_item], 'half');
                items_left--; current_item++;
            }
            else if (items_left === 1) {
                updated_html += createProblemBoxHtml(worksheet.pages[i].content[current_item], 'half');
                items_left--; current_item++;
            }
            updated_html += `</div>`;
        }
        
        updated_html += '</div></div></div>';
    }

    updated_html += '<div id="worksheet-preview-bottom">&nbsp;</div>'
    document.getElementById('worksheet-page-column').innerHTML = updated_html;
    MathJax.typesetPromise(['#worksheet-page-column']);
    fitMathOverflow();
}

function pushContentOverflow() {
    // define this here to avoid re-creating (re-iterating) it every time
    const page_element_list = [...document.getElementsByClassName('worksheet-page-content-area')];
    
    let overflow_found = false;
    for (let page_index = 0; page_index < worksheet.pages.length; page_index++) {
        let current_content_area = page_element_list[page_index];

        if (current_content_area.scrollHeight > current_content_area.clientHeight) {
            overflow_found = true;

            const fwbb_array = [...current_content_area.children]; // fwbb -> 'full-width-bounding-box
            if (fwbb_array.length <= 1) return; // return forEach callback (move to next element), not return pushContentOverflow
            
            const last_fwbb = fwbb_array[fwbb_array.length - 1];
            
            [...last_fwbb.children].forEach(content_box => {
                if (getItemById(`page-${page_index + 1}`) === null) {
                    appendItemAt('document'); // add a page if there is no next page to overflow content onto
                }

                appendItemAt(`page-${page_index + 1}`,'unshift');
                deleteItemAt(content_box.getAttribute('data-item-ID'));
            });
            break;
        }
    }
    return overflow_found;  
}

function fitMathOverflow() {
    [...document.getElementsByClassName('worksheet-page-content-area')].forEach(content_area => {
        [...content_area.children].forEach(block_bounding_box => {
            [...block_bounding_box.children].forEach(content_box => {
                const math_div = [...content_box.children][1];

                let scale_factor = math_div.clientWidth / math_div.scrollWidth;
                const worksheet_item = getItemById(content_box.getAttribute('data-item-ID'));
                let current_font_size = Number(worksheet_item.settings.font_size.split('c')[0]);
                while (Math.abs(scale_factor - 1) > 0.001) {
                    current_font_size = current_font_size * scale_factor; 
                    math_div.style.fontSize = current_font_size + 'cm';

                    scale_factor = math_div.clientWidth / math_div.scrollWidth;
                }
            });
        });
    });
}

function getProblemNumber(item) {
    let problem_number = 0;
    let item_found = false;
    for (let i = 0; i < worksheet.pages.length; i++) {
        for (let j = 0; j < worksheet.pages[i].content.length; j++) {
            problem_number++;
            if (item === worksheet.pages[i].content[j]) {
                item_found = true;
                break;
            }
        }
        if (item_found) break;
    }
    
    return problem_number;
}


function updateOutline() {
    let current_item_ID = 'document';
    let item_is_focused = (current_item_ID === worksheet_editor.focused_item_ID)? 'data-currently-focused="true"' : '';   
    
    let updated_html = `
        <div class="outline-item outline-document" data-item-ID="${current_item_ID}" ${item_is_focused}>
            <div class="outline-label outline-document-label">Document</div>
            <div class="outline-nav-wrapper">
                <button 
                    class="outline-button outline-plus-button"
                >+</button>
            </div>
        </div>
    `;
    for (let i = 0; i < worksheet.pages.length; i++) {
        current_item_ID = `page-${i}`;
        item_is_focused = (current_item_ID === worksheet_editor.focused_item_ID)? 'data-currently-focused="true"' : '';
        
        updated_html += `
            <div class="outline-item outline-page" data-item-ID="${current_item_ID}" ${item_is_focused}>
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
            current_item_ID = `content-${i}.${j}`;
            item_is_focused = (current_item_ID === worksheet_editor.focused_item_ID)? 'data-currently-focused="true"' : '';
            
            updated_html += `
                <div class="outline-item outline-content" data-item-ID="${current_item_ID}" ${item_is_focused}>
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




