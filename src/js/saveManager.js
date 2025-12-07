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

    const importModal = new Modal("importModal");
    
    importModal.setTitle("Import Save");
    importModal.setBody(`
        <div class="mb-3">
            <p class="lead">${Object.values(data.courses).length} Courses</p>
            <hr>

            ${Object.values(data.courses).map(course => {
                return `
                    <div class="d-flex ms-2">
                        <input class="form-check-input me-2" type="checkbox" id="${course.courseInfo.courseId}" checked>
                        <label class="form-check-label mb-1" for="${course.courseInfo.courseId}">
                            ${course.courseInfo.courseName}
                        </label>
                    </div>
                `;
            }).join("")}

            <a class="link me-2" href="#" onclick="selectAllCheckboxes(this.parentElement)">Select all</a>
            <a class="link-danger" href="#" onclick="deselectAllCheckboxes(this.parentElement)">Deselect all</a>
        </div>

        <div class="mb-2">
            <p class="lead">${Object.values(data.timetables).length} Timetables</p>
            <hr>
            
            ${Object.values(data.timetables).map(timetable => {
                const enrolCount = Object.values(timetable.courses).length;

                return `
                    <div class="d-flex ms-2">
                        <input class="form-check-input me-2" type="checkbox" id="${timetable.id}" checked>
                        <label class="form-check-label mb-1" for="${timetable.id}">
                            ${timetable.name} - <span class="text-muted">Enrolled into ${enrolCount} course${enrolCount == 1 ? "" : "s"}</span>
                        </label>
                    </div>
                `;
            }).join("")}

            <a class="link me-2" href="#" onclick="selectAllCheckboxes(this.parentElement)">Select all</a>
            <a class="link-danger" href="#" onclick="deselectAllCheckboxes(this.parentElement)">Deselect all</a>
        </div>
    `);
    importModal.setFooter(`
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button id="importBtn" type="button" class="btn btn-primary">Import</button>    
    `);
    
    importModal.show();

    // When 'import' is clicked, collect the selected data and import.
    const importBtn = importModal.querySelector("#importBtn");
    importBtn.addEventListener("click", () => {
        console.log("h")
    });
}

function selectAllCheckboxes(container) {
    container.querySelectorAll("input[type='checkbox']").forEach(c => c.checked = true)
}
function deselectAllCheckboxes(container) {
    container.querySelectorAll("input[type='checkbox']").forEach(c => c.checked = false)
}

/**
 * Imports timetable & courses into saved data.
 * Will appened to current save, overwriting any clashing courses or timetables.
 * 
 * @param { SaveFile } data 
 */
function importData(data) {
    const current = exportSave();
    
    for (const [id, course] of Object.entries(data?.courses || {})) {
        current.courses[id] = course;
    }

    for (const [id, timetable] of Object.entries(data?.timetables || {})) {
        current.timetables[id] = timetable;
    }

    return current;
}