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