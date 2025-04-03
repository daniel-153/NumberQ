let worksheet = null;

const _editorFunctions = {
    createAsEmptyDoc,
    createAsDefault,
    appendNewPage,
    deletePageAt,
    appendContentToPage,
    deleteContentAt
}

export const worksheetEditor = {
    static_update: _editorFunctions,
    ...(new Proxy(
        _editorFunctions, 
        {
            get: function(target_obj, property) { 
                if (Object.prototype.hasOwnProperty.call(target_obj, property)) { 
                    return function(...args) { 
                        target_obj[property](...args); 
                        render(); 
                        updateOutline();
                    }
                }
                else return target_obj[property];
            }
        }
    )),
    render: render,
    updateOutline: updateOutline
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

// Rendering Functions:
function render() {
    let updated_html = '';
    for (let i = 0; i < worksheet.pages.length; i++) {
        updated_html += '<div class="worksheet-page">';
        
        for (let j = 0; j < worksheet.pages[i].content.length; j++) {
            updated_html += `
                <div class="worksheet-page-content">${worksheet.pages[i].content[j].text_content}</div>
            `;

        }
        
        updated_html += '</div>';
    }
    document.getElementById('worksheet-page-column').innerHTML = updated_html;
}

function updateOutline() {
    let updated_html = `
        <div class="outline-item outline-document">
            <div class="outline-label outline-document-label">Document</div>
            <div class="outline-nav-wrapper">
                <button 
                    class="outline-button outline-options-button"
                >#</button>
                <button 
                    class="outline-button outline-plus-button"
                >+</button>
            </div>
        </div>
    `;
    for (let i = 0; i < worksheet.pages.length; i++) {
        updated_html += `
            <div class="outline-item outline-page" data-page-number="${i}">
                <div class="outline-label outline-page-label">Page ${i + 1}</div>
                <div class="outline-nav-wrapper">
                    <button 
                        class="outline-button outline-delete-button"
                    >X</button>    
                    <button 
                        class="outline-button outline-options-button"
                    >#</button>
                    <button 
                        class="outline-button outline-plus-button"
                    >+</button>
                </div>
            </div>
        `;
        for (let j = 0; j < worksheet.pages[i].content.length; j++) {
            updated_html += `
                <div class="outline-item outline-content" data-content-id="${i}.${j}">
                    <div class="outline-label outline-content-label">Content ${i + 1}.${j + 1}</div>
                    <div class="outline-nav-wrapper">
                        <button 
                            class="outline-button outline-delete-button"
                        >X</button>    
                        <button 
                            class="outline-button outline-options-button"
                        >#</button>
                    </div>
                </div>
            `;
        }
    }
    document.getElementById('outline-container').innerHTML = updated_html;
}




