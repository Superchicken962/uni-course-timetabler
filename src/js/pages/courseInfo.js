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
                                                const existing = (uniqueDates.findIndex(d => d.time === date.time) > -1);
                                                if (!existing) {
                                                    uniqueDates.push(date);
                                                }
                                            }

                                            const selectedClass = currentTimetable.getSelectedClass(course.courseInfo.courseId, cClass.classType);

                                            return uniqueDates.map(d => {
                                                const isSelected = (selectedClass?.id == cClass.classNumber);

                                                return `
                                                    <tr data-class-number="${cClass.classNumber}" data-campus="${cClass.campus}" data-class-type="${cClass.classType}">
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
                                                            <a class="btn btn-primary" id="timetableAddBtn">Add</a>
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

            addCourseOptionToTimetable(course, {
                id: classNum,
                type: classType,
                instructor: row.querySelector("#instructor")?.textContent,
                time: row.querySelector("#time")?.textContent,
                day: row.querySelector("#day")?.textContent,
                location: row.querySelector("#location")?.textContent,
                campus: row.getAttribute("data-campus")
            });
        });
    }
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