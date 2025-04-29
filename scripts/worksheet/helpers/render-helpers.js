import { worksheet_editor, worksheet }  from '../worksheet.js';

function _addMainHeader(settings) {
    return `
        <div class="full-width-bounding-box">
            <div class="ws-header-wrapper">
                <div class="ws-header-top-box">
                    <div class="ws-course-name">
                        Algebra 2
                    </div>
                    <div class="ws-name-period-wrapper">
                        <div class="ws-name-period-label">
                            Name:
                        </div>
                        <div class="ws-name-box">
                        </div>
                        <div class="ws-name-period-label">
                            Period:
                        </div>
                        <div class="ws-period-box">
                        </div>
                    </div>
                </div>
                <div class="ws-header-bottom-box">
                    <div class="ws-assignment-title">
                        Systems of Equations
                    </div>
                </div>
            </div>
        </div>
    `;
}

function _addContentToPage(content_item_array) {
    let output_html = '';
    for (let i = 0; i < content_item_array.length; i++) {
        const current_item = content_item_array[i];
        if (current_item.settings.type === 'directions') {
            output_html += `
                <div class="full-width-bounding-box">
                    <div 
                        class="directions-box" data-item-ID="${worksheet_editor.getIdByItem(current_item)}"
                        style="font-size: ${current_item.settings.font_size};"
                    >
                        ${current_item.settings.text_content}   
                    </div>
                </div>
            `;
        }
        else if (current_item.settings.type === 'problem') {
            const next_item = content_item_array[i + 1];
            
            if (next_item === undefined || next_item.settings.type === 'directions') { // next content item is also a problem (two in a row)
                output_html += `
                    <div class="full-width-bounding-box">
                        <div class="problem-box half-width-box" data-item-ID="${worksheet_editor.getIdByItem(current_item)}">
                            <div class="problem-number">${worksheet_editor.getProblemNumber(current_item)})</div>
                            <div class="problem-tex" data-math-container="true" style="font-size: ${current_item.settings.font_size};"></div>
                        </div>
                    </div>
                `;
            }
            else if (next_item.settings.type === 'problem') { // next content item is either directions or nothing (this is the last item)
                output_html += `
                    <div class="full-width-bounding-box">
                        <div class="problem-box half-width-box" data-item-ID="${worksheet_editor.getIdByItem(current_item)}">
                            <div class="problem-number">${worksheet_editor.getProblemNumber(current_item)})</div>
                            <div class="problem-tex" data-math-container="true" style="font-size: ${current_item.settings.font_size};"></div>
                        </div>
                        <div class="problem-box half-width-box" data-item-ID="${worksheet_editor.getIdByItem(next_item)}">
                            <div class="problem-number">${worksheet_editor.getProblemNumber(next_item)})</div>
                            <div class="problem-tex" data-math-container="true" style="font-size: ${next_item.settings.font_size};"></div>
                        </div>  
                    </div>
                `;

                i++;
            }
        }
    }

    return output_html;
}

export function insertWorksheetHtml() {
    let updated_html = '';
    for (let i = 0; i < worksheet.pages.length; i++) {
        updated_html += `
            <div class="worksheet-page-wrapper">
                <div 
                    class="worksheet-page"
                    style="
                        padding: 0.5in 0.5in 0.5in 0.5in;
                    "
                >
                    <div class="worksheet-page-content-area">
        `;

        // add the header on the first page
        if (i === 0) updated_html += _addMainHeader();

        updated_html += _addContentToPage(worksheet.pages[i].content);
        
        updated_html += '</div></div></div>';
    }

    updated_html += '<div id="worksheet-preview-bottom">&nbsp;</div>'
    document.getElementById('worksheet-page-column').innerHTML = updated_html;
}

export function handleTexUpdates() {
    [...document.getElementsByClassName('problem-box')].forEach(content_box => {
        // make sure we filter out any content that isn't a question
        const current_item = worksheet_editor.getItemById(content_box.getAttribute('data-item-ID'));
        if (current_item.settings.type !== 'problem') return;

        const tex_container = content_box.lastElementChild;
        
        if (current_item.settings.mjx_status === 'rendered') {
            tex_container.innerHTML = current_item.settings.mjx_content;
        }
        else if (current_item.settings.mjx_status === 'not-rendered') {
            tex_container.innerHTML = `\\(${current_item.settings.text_content}\\)`;
            MathJax.typesetPromise([tex_container]);
            current_item.settings.mjx_status = 'rendered';
            current_item.settings.mjx_content = tex_container.innerHTML;
        }
    });
}

export function pushContentOverflow() {    
    const page_element_list = [...document.getElementsByClassName('worksheet-page-content-area')];
    const fwbb_height_series = []; // array of arrays of heights
    for (let i = 0; i < page_element_list.length; i++) {
        fwbb_height_series.push([]);
    }

    let overflow_detected = false;
    for (let page_index = 0; page_index < worksheet.pages.length; page_index++) {
        // we need the logic below because the current page might not exist in the DOM yet if it was created due to previous overflow
        let fwbb_element_list;
        let current_page_height;
        if (page_element_list[page_index] !== undefined) {
            current_page_height = page_element_list[page_index].clientHeight;
            fwbb_element_list = [...page_element_list[page_index].children];
        }
        else {
            // !!!!temporary!!!! (obviously you would need to actually find what the real page height would be here)
            // If there are document-level settings that modify the margins of the content areas this will be wrong
            // If the screen resolution isn't the same as where I got this px value for 9in, this will be wrong
            current_page_height = 864;
            fwbb_element_list = [];
        }

        const current_fwbb_heights = fwbb_height_series[page_index];

        for (let fwbb_index = 0; fwbb_index < fwbb_element_list.length; fwbb_index++) {
            current_fwbb_heights.push(fwbb_element_list[fwbb_index].clientHeight);
        }

        // while (the sum of fwbb heights is greater than the page height)
        while (current_fwbb_heights.reduce((accumulator, current_value) => accumulator + current_value, 0) > current_page_height) {
            // move the top fwbb to the next page (in the worksheet) (create new page if needed)
            const last_fwbb = fwbb_element_list[fwbb_element_list.length - 1];
            [...last_fwbb.children].forEach(content_box => {
                if (worksheet_editor.getItemById(`page-${page_index + 1}`) === null) {
                    worksheet_editor.static_update.addPageToDoc(); // add a page if there is no next page to overflow content onto
                    fwbb_height_series.push([]); // add another array to the height series 
                }

                // save the overflowing item's settings before deleting it
                const item_settings = worksheet_editor.getItemById(content_box.getAttribute('data-item-ID')).settings; 
                console.log(item_settings)

                // delete the overflowing item and add it to the next page
                worksheet_editor.static_update.deleteItemAt(content_box.getAttribute('data-item-ID'));
                worksheet_editor.static_update.addContentToPage(
                    `page-${page_index + 1}`,
                    '_', 
                    item_settings,
                    'unshift'
                );
            });

            // push the height of the fwbb we moved to the next array
            fwbb_height_series[page_index + 1].push(current_fwbb_heights[current_fwbb_heights.length - 1]);
            current_fwbb_heights.pop();

            overflow_detected = true; // if we entered this while() a single time, that means something overflowed; if not, nothing overflowed
        }
    }
    

    return overflow_detected;
}

export function fitMathOverflow() {
    [...document.getElementsByClassName('worksheet-page-content-area')].forEach(content_area => {
        [...content_area.children].forEach(block_bounding_box => {
            [...block_bounding_box.children].forEach(content_box => {
                if (!content_box.classList.contains('problem-box')) return; // skip all content boxes except for problem boxes
                const math_div = [...content_box.children][1];

                let scale_factor = math_div.clientWidth / math_div.scrollWidth;
                const worksheet_item = worksheet_editor.getItemById(content_box.getAttribute('data-item-ID'));
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