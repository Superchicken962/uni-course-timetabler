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
        <div class="mb-3" id="courses">
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

        <div class="mb-2" id="timetables">
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
    const checkboxes = importModal.querySelectorAll("input[type='checkbox']");
    
    // When checkboxes are checked, check the amount that are checked and if it's none, disable button. 
    checkboxes.forEach(e => e.addEventListener("change", (ev) => {
        const checked = [...checkboxes].filter(c => c.checked).length;

        // If there are no checkboxes checked, disable import button.
        if (checked > 0) importBtn.removeAttribute("disabled", true);
        else importBtn.setAttribute("disabled", true);
    }));

    importBtn.addEventListener("click", () => {
        importBtn.setAttribute("disabled", true);

        const getSelected = (containerId, data) => {
            // Filter checkboxes to checked ones, and return array of ids.
            const checkboxes = [...importModal.querySelectorAll(`#${containerId} input[type='checkbox']`)]
                .filter(e => e.checked)
                .map(e => e.id);

            // Filter object entries by checked courses - filter object values, then recreate object from entries using Map.
            const selectedData = Object.fromEntries(new Map(
                Object.entries(data).filter(([id]) => checkboxes.includes(id))
            ));

            return selectedData;
        }

        const selectedCourses = getSelected("courses", data.courses);
        const selectedTimetables = getSelected("timetables", data.timetables);

        // Now import the selected courses and timetables.
        importData({ courses: selectedCourses, timetables: selectedTimetables });

        // Close import modal, and open a new one for saying it was a success.
        importModal.close();

        const successModal = new Modal("importSuccess");

        successModal.setTitle("Import Successful");
        successModal.setBody(`
            Successfully imported ${Object.values(selectedCourses).length} courses and ${Object.values(selectedTimetables).length} timetables!
        `);
        successModal.setFooter(`
            <p class="text-muted">You may need to refresh the page to see changes.</p>
        `);

        successModal.show();
    });
}

function selectAllCheckboxes(container) {
    container.querySelectorAll("input[type='checkbox']").forEach(c => {
        c.checked = true;
        c.dispatchEvent(new Event("change"));
    });
}
function deselectAllCheckboxes(container) {
    container.querySelectorAll("input[type='checkbox']").forEach(c => {
        c.checked = false;
        c.dispatchEvent(new Event("change"));
    });
}

/**
 * Imports timetable & courses into saved data.
 * Will appened to current save, overwriting any clashing courses or timetables.
 * 
 * @param { SaveFile } data 
 */
function importData(data) {
    const current = exportSave();
    
    // Apply new imported data to the existing save.
    for (const [id, course] of Object.entries(data?.courses || {})) {
        current.courses[id] = course;
    }

    for (const [id, timetable] of Object.entries(data?.timetables || {})) {
        current.timetables[id] = timetable;
    }

    // Resave the data.
    localStorage.setItem("myCourses", JSON.stringify(current.courses));
    localStorage.setItem("myTimetables", JSON.stringify(current.timetables));

    return current;
}