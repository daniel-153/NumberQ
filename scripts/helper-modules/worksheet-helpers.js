function createWorksheet() { // currently makes a worksheet with a single blank page
    return {
        pages: [
            {
                content: [],
                settings: {}
            }
        ],
        settings: {}
    };
}

// does it even makes sense to have this function? Seems like all it would be 'doing' is adding properties to the worksheet obj
function edit(command) { // format for command is ('document' or 'page#' or 'content#.#') + '/' + (action) 
    const location = command.split('/')[0];

    if (location === 'document') {

    }
    else if (location === 'page') {}
}

function render(worksheet) {

}