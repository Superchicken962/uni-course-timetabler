function capitaliseWord(word) {
    return word.charAt(0).toUpperCase() + word.slice(1, word.length).toLowerCase();
}

/**
 * Separates camel case string into separate, capitalised words.
 * 
 * @param { String } string
 * @returns { String }
 */
function separateCamelCase(string) {
    string = string.replace(/([A-Z])/g, " $1");
    string = string.charAt(0).toUpperCase() + string.slice(1);

    return string.trim();
}


/**
 * Recursively render collapsibles.
 * 
 * @param { Object } data - Data to recurse through.
 * @param { String } parentId - Parent id, null to start with
 * @param { (data: Object) => String } dataSetter - Callback that is called when the tree reaches the finally level.
 * @param { Number } stopAtLevel - Optional level to stop at and call dataSetter. Useful to prevent from going all the way down to values.
 * @returns { String } HTML String
 */
function renderCollapseTree(data, parentId, dataSetter, stopAtLevel, atLevel = 0) {
    if (atLevel == stopAtLevel) {
        return dataSetter(data);
    }

    return Object.entries(data).map(([key, value]) => {
        const id = `${parentId}-${key.replace(/\s+/g, "")}`;
        const isObject = (typeof value === "object" && value !== null);

        return `
            <div class="ms-3 mt-2">
                <button class="btn bg-transparent w-auto" 
                        data-bs-toggle="collapse"
                        data-bs-target="#${id}">
                    <i class="fa fa-chevron-right"></i> ${key}
                </button>

                <div class="collapse" id="${id}">
                    ${isObject ? renderCollapseTree(value, id, dataSetter, stopAtLevel, atLevel + 1) : dataSetter?.(value) }
                </div>
            </div>
        `;
    }).join("");
}

/**
 * Get dictionary of saved collapsible states.
 */
function getSavedCollapsedStates() {
    try {
        const states = localStorage.getItem("collapsibleStates") ?? "{}";
        return JSON.parse(states);
    } catch {
        return {};
    }
}
function saveCollapsibleState(id, state) {
    const states = getSavedCollapsedStates();

    states[id] = state;

    localStorage.setItem("collapsibleStates", JSON.stringify(states));
}

/**
 * Creates a 2-dimensional array, filled with null values or a provided value.
 * 
 * @param { Number } rows - Number of rows to use (height).
 * @param { Number } cols - Number of columns to use (width).
 * @param { any? } initialValue - Initial value to set in each spot.
 * @returns { any[][] }
 */
function create2DArray(rows = 2, cols = 2, initialValue = null) {
    return Array.from({ length: rows }, () => new Array(cols).fill(initialValue));
}

function getRandomColour() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);

    return rgbToHex(r, g, b);
}

/**
 * Convert rgb values into hex string.
 * 
 * @param { Number } r 
 * @param { Number } g 
 * @param { Number } b 
 * @returns { String }
 */
function rgbToHex(r, g, b) {
    r = parseInt(r).toString(16);
    g = parseInt(g).toString(16);
    b = parseInt(b).toString(16);

    const f = (n) => ("0"+n).slice(-2);

    return "#" + f(r)+f(g)+f(b);
}

/**
 * Creates a file input and clicks it to prompt the user to upload a file.
 * 
 * @param { String } accepts - File types to accept. (e.g. '.json')
 * @param { (fileName: string, content: string) => {} } onUpload - Callback when file is uploaded.
 * @param { (e: ProgressEvent<FileReader>) => void } onError - Callback if error occurs.
 */
function getFileUpload(accepts, onUpload, onError) {
    // Create file input, then click and handle file upload.
    const fileInp = document.createElement("input");
    fileInp.setAttribute("type", "file");
    fileInp.setAttribute("accept", accepts);

    fileInp.addEventListener("input", (ev) => {
        const file = ev.target.files[0];
        if (!file) return;

        const fReader = new FileReader();

        fReader.onload = (e) => {
            onUpload?.(file.name, e.target.result);
        }

        fReader.onerror = (e) => {
            onError?.(e);
        }

        fReader.readAsText(file);
    });

    fileInp.click();
    fileInp.remove();
}