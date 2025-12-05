const bc = new BroadcastChannel("courseInfoPage");

const container = document.querySelector("#courseInfo");
const title = document.querySelector("#courseTitle");

const htmlHelpers = {
    /**
     * @param { Course } course 
     */
    courseInfo: (course) => {
        const ignoreKeys = ["courseName", "courseOverview"];

        return `
            <button class="btn bg-transparent w-auto" type="button" data-bs-toggle="collapse" data-bs-target="#courseInfoCollapse" aria-expanded="true" aria-controls="courseInfoCollapse">
                <i class="fa fa-chevron-down" id="icon"></i> Course Information
            </button>

            <div class="collapse show" id="courseInfoCollapse">

                <div>
                    <div class="card mt-2 mb-3">
                        <div class="card-header">Course Information</div>

                        <div class="card-body">

                            <div class="row">
                                ${Object.entries(course.courseInfo).map(([key, val]) => {
                                    if (ignoreKeys.includes(key)) return "";

                                    return `
                                        <div class="col-md-4">
                                            <p>
                                                <b>${separateCamelCase(key)}</b><br>
                                                ${val}
                                            </p>
                                        </div>
                                    `;
                                }).join("")}
                            </div>

                        </div>
                    </div>

                    ${ !course.courseInfo.courseOverview ? "" : `
                        <h1>Course Overview</h1>
                        <p class="lead">${course.courseInfo.courseOverview}</p>  
                    `}
                </div>
            </div>
        `;
    },

    /**
     * @param { Course } course 
     */
    courseOptions: (course) => {
        console.log(course.enrolmentOptions);
        const currentTimetable = getTimetableById(getSelectedTimetable());

        // Make initial collapsible for whole thing, then use recursive function to handle enrolment options.
        // Use level 3 as max to use custom level for
        return `
            <button class="btn bg-transparent w-auto" type="button" data-bs-toggle="collapse" data-bs-target="#courseOptionsCollapse" aria-expanded="true" aria-controls="courseOptionsCollapse">
                <i class="fa fa-chevron-down" id="icon"></i> Course Options
            </button>

            <div class="collapse show" id="courseOptionsCollapse">
                <div>
                    ${renderCollapseTree(course.enrolmentOptions, null, (data) => {
                        return `
                            <div class="table-responsive ms-5">
                                <table class="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Class Number</th>
                                            <th>Capacity</th>
                                            <th>Dates</th>
                                            <th>Days</th>
                                            <th>Time</th>
                                            <th>Instructor</th>
                                            <th>Location</th>
                                            <th></th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        ${data.map(cClass => {
                                            // console.log(getUniqueItemsInArray(cClass.dates));
                                            const uniqueDates = [];
                                            for (const date of cClass.dates) {
                                                // Check for uniqueness by the time, as we only want to show more than one if the time changes.
                                                // const existing = (uniqueDates.findIndex(d => d.time === date.time) > -1);

                                                // Use class id/num for uniqueness - having changing times for same class seems too complex currently.
                                                const existing = (uniqueDates.findIndex(d => d.id === date.id) > -1);
                                                if (!existing) {
                                                    uniqueDates.push(date);
                                                }
                                            }

                                            const selectedClass = currentTimetable.getSelectedClass(course.courseInfo.courseId, cClass.classType);

                                            return uniqueDates.map(d => {
                                                const isSelected = (selectedClass?.id == cClass.classNumber);
                                                const hasConflict = currentTimetable.hasConflict(d);

                                                return `
                                                    <tr 
                                                        data-class-number="${cClass.classNumber}"
                                                        data-campus="${cClass.campus}"
                                                        data-class-type="${cClass.classType}"
                                                        data-time-start="${d.timeRange?.start}"
                                                        data-time-end="${d.timeRange?.end}"
                                                    >
                                                        <td>
                                                            ${cClass.classNumber}
                                                            ${isSelected ? `<span id="selectedTag" class="badge bg-primary">Selected</span>` : ""}
                                                        </td>
                                                        <td>${cClass.size}</td>
                                                        <td>${d.dates}</td>
                                                        <td id="day">${d.days}</td>
                                                        <td id="time">${d.time}</td>
                                                        <td id="instructor">${d.instructor}</td>
                                                        <td id="location">${d.location}</td>
                                                        <td>
                                                            <span id="conflictTag" class="badge bg-warning text-black ${ (!!hasConflict && !isSelected) ? "" : "d-none" }" title="Conflicts with another selected class">Conflict</span> 
                                                            <button class="btn btn-sm btn-primary ${ !!hasConflict ? "d-none" : "" } " id="timetableAddBtn" ${ !!selectedClass ? "disabled" : "" }>Add</button>
                                                            <button class="btn btn-sm btn-danger ${ isSelected ? "" : "d-none" }" id="timetableRemoveBtn">Unadd</button>
                                                        </td>
                                                    </tr>
                                                `;
                                            }).join("");

                                        }).join("")}
                                    </tbody>
                                </table>
                            </div>
                        `;
                    }, 3)}
                </div>
            </div>
        `;
    }
}

function load(courseId) {
    const course = getCourseById(courseId);
    if (!course) {
        container.innerHTML = `
            <div class="alert alert-warning">Course not found! Go to <a href="/courses">my courses</a> to save new courses.</div>
        `;

        return;
    }

    title.textContent = course.courseInfo.courseName;
    document.title = course.courseInfo.courseName;

    const infoDiv = document.createElement("div");
    infoDiv.className = "row mb-3";
    
    infoDiv.innerHTML = `
        ${htmlHelpers.courseInfo(course)}

        <hr>

        ${htmlHelpers.courseOptions(course)}
    `;

    container.appendChild(infoDiv);

    const timetableAddButtons = document.querySelectorAll("#timetableAddBtn");
    for (const btn of timetableAddButtons) {
        btn.addEventListener("click", () => {
            const row = btn.parentElement.parentElement;

            const classNum = row.getAttribute("data-class-number");
            const classType = row.getAttribute("data-class-type");

            // Remove selected tag from previous class, and add it to newly selected one.
            row.parentElement.querySelector("#selectedTag")?.remove();
            row.querySelector("td").innerHTML = `
                ${classNum}
                <span id="selectedTag" class="badge bg-primary">Selected</span>
            `;

            // Calculate conflicts again after choosing class.
            updateConflicts();

            // Now since the btn was selected, specifically add unadd button for that.
            row.querySelector("#conflictTag").classList.add("d-none");
            row.querySelector("#timetableRemoveBtn").classList.remove("d-none");
            btn.classList.add("d-none");

            // Disable the other options once this is selected.
            disableOtherAddButtons(row.parentElement);

            addCourseOptionToTimetable(course, {
                id: classNum,
                type: classType,
                instructor: row.querySelector("#instructor")?.textContent,
                time: row.querySelector("#time")?.textContent,
                day: row.querySelector("#day")?.textContent,
                location: row.querySelector("#location")?.textContent,
                campus: row.getAttribute("data-campus"),
                timeRange: {
                    start: row.getAttribute("data-time-start"),
                    end: row.getAttribute("data-time-end")
                }
            });
            
            // Post message so other tabs can update conflicts, taking into account the newly added course.
            bc.postMessage("courseChanged");
        });
    }

    const timetableRemoveButtons = document.querySelectorAll("#timetableRemoveBtn");
    for (const btn of timetableRemoveButtons) {
        const row = btn.parentElement.parentElement;

        btn.addEventListener("click", () => {
            removeCourseOptionFromTimetable(course, row.getAttribute("data-class-number"));

            row.parentElement.querySelector("#selectedTag")?.remove();

            updateConflicts();

            // Post message so other tabs can update conflicts, taking into account the newly removed course.
            bc.postMessage("courseChanged");
        });
    }
}

function updateConflicts() {
    const timetableAddButtons = document.querySelectorAll("#timetableAddBtn");
    const currentTimetable = getTimetableById(getSelectedTimetable());

    for (const b of timetableAddButtons) {
        const r = b.parentElement.parentElement;

        // Skip class if it is selected - cannot conflict with self.
        const isSelected = !!r.querySelector("#selectedTag");
        if (isSelected) continue;

        const hasConflict = currentTimetable.hasConflict({
            timeRange: {
                start: b.parentElement.parentElement.getAttribute("data-time-start"),
                end: b.parentElement.parentElement.getAttribute("data-time-end")
            }
        });

        const conflictTag = r.querySelector("#conflictTag");
        const removeBtn = r.querySelector("#timetableRemoveBtn");

        // By default, show the add button and hide all else.
        conflictTag.classList.add("d-none");
        removeBtn.classList.add("d-none");
        b.classList.remove("d-none");

        // Re-enable other add buttons after this is removed.
        enableOtherAddButtons(r.parentElement);

        // Show conflict tag + hide buttons if this conflicts.
        if (hasConflict) {
            conflictTag.classList.remove("d-none");
            removeBtn.classList.add("d-none");
            b.classList.add("d-none");
        }
    }
}

function disableOtherAddButtons(tableBody) {
    tableBody.querySelectorAll("#timetableAddBtn").forEach(b => b.setAttribute("disabled", true));
}
function enableOtherAddButtons(tableBody) {
    tableBody.querySelectorAll("#timetableAddBtn").forEach(b => b.removeAttribute("disabled"));
}

load(SELECTED_COURSE_ID);

document.addEventListener("show.bs.collapse", (ev) => {
    const icon = ev.target.previousElementSibling?.querySelector("i");
    if (!icon) return;
   
    icon.classList.replace("fa-chevron-right", "fa-chevron-down");
});
document.addEventListener("hide.bs.collapse", (ev) => {
    const icon = ev.target.previousElementSibling?.querySelector("i");
    if (!icon) return;

    icon.classList.replace("fa-chevron-down", "fa-chevron-right");
});

// If another tab has selected a course, update conflicts on this page to reflect it.
bc.onmessage = (ev) => {
    if (ev.data === "courseChanged") {
        updateConflicts();
    }
}