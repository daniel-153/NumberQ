import { worksheet_editor, worksheet }  from '../worksheet.js';

export function insertWorksheetHtml() {
    function createProblemBoxHtml(content_item, box_width) {        
        return `
            <div class="content-box ${box_width}-width-box" data-item-ID="${worksheet_editor.getIdByItem(content_item)}">
                <div class="problem-number">${worksheet_editor.getProblemNumber(content_item)})</div>
                <div class="problem-tex" data-math-container="true" style="font-size: ${content_item.settings.font_size};"></div>
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

export function handleTexUpdates() {
    [...document.getElementsByClassName('content-box')].forEach(content_box => {
        // make sure we filter out any content that isn't a question
        const current_item = worksheet_editor.getItemById(content_box.getAttribute('data-item-ID'));
        if (current_item.settings.type !== 'question') return;

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
                    worksheet_editor.appendItemAt('document'); // add a page if there is no next page to overflow content onto
                    fwbb_height_series.push([]); // add another array to the height series
                }

                worksheet_editor.appendItemAt(`page-${page_index + 1}`,'unshift');
                worksheet_editor.deleteItemAt(content_box.getAttribute('data-item-ID'));
            });

            // push the height of the fwbb we moved to the next array
            fwbb_height_series[page_index + 1].push(current_fwbb_heights[current_fwbb_heights.length - 1]);
            current_fwbb_heights.pop();
        }
    }
}

export function fitMathOverflow() {
    [...document.getElementsByClassName('worksheet-page-content-area')].forEach(content_area => {
        [...content_area.children].forEach(block_bounding_box => {
            [...block_bounding_box.children].forEach(content_box => {
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