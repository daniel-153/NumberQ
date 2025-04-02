let worksheet = null;

const _editorFunctions = {
    createAsEmptyDoc,
    createAsDefault,
    appendNewPage
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
// (which will probably just be empty space or lorem or something at first), then make it so you can change that content,
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

// Rendering Functions:
function render() {
    let updated_html = ``;
    for (let i = 0; i < worksheet.pages.length; i++) {
        updated_html += '<div class="worksheet-page"></div>';
    }
    document.getElementById('worksheet-page-column').innerHTML = updated_html;
    console.log('worksheet was rendered')
}

function updateOutline() {
    console.log('outline was updated')
    // more logic that will grow with time
}




