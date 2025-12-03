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

                                            return uniqueDates.map(d => {
                                                return `
                                                    <tr>
                                                        <td>${cClass.classNumber}</td>
                                                        <td>${cClass.size}</td>
                                                        <td>${d.dates}</td>
                                                        <td>${d.days}</td>
                                                        <td>${d.time}</td>
                                                        <td>${d.instructor}</td>
                                                        <td>${d.location}</td>
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
            btn.remove();
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