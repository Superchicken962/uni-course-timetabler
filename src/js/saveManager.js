/**
 * @typedef { Object } SaveFile
 * 
 * @property { Object } timetables
 * @property { Object } courses
 */

/**
 * Essentially get the data from localStorage into an exportable / savable format.
 * 
 * @returns { SaveFile }
 */
function exportSave() {
    let ttData, courseData;

    try {
        ttData = JSON.parse(localStorage.getItem("myTimetables") ?? "{}");
        courseData = JSON.parse(localStorage.getItem("myCourses") ?? "{}");
    } catch {}

    return { timetables: ttData, courses: courseData };
}

/**
 * Downloads a file containing snapshot of current save data.
 * 
 * @param { String } name
 */
function downloadSave(name) {
    // Create anchor element with download attribute, then trigger click to download.
    const anchor = document.createElement("a");
    anchor.setAttribute("href", `data:text/plain;charset=utf-8,${encodeURIComponent(JSON.stringify(exportSave()))}`);
    anchor.setAttribute("download", name);

    anchor.click();

    return anchor;
}

/**
 * Handle data import - showing modal and replacing or appending data. 
 * 
 * @param { SaveFile } data
 */
function handleImport(data) {
    if (!data.courses || !data.timetables) {
        throw new Error("Unexpected save structure");
    }

    console.log(data);
}