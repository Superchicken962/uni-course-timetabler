const container = document.querySelector("#courseInfo");
const title = document.querySelector("#courseTitle");

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

    const ignoreKeys = ["courseName", "courseOverview"];
    
    infoDiv.innerHTML = `
        <button class="btn bg-transparent w-auto" type="button" data-bs-toggle="collapse" data-bs-target="#courseInfoCollapse" aria-expanded="false" aria-controls="courseInfoCollapse">
            <i class="fa fa-chevron-down" id="couseInfoCollapseIcon"></i> Course Information
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

        <hr>
    `;

    const infoCollapse = infoDiv.querySelector("#courseInfoCollapse");
    infoCollapse.addEventListener("show.bs.collapse", () => {
        console.log(infoDiv);
        infoDiv.querySelector("i#couseInfoCollapseIcon").className = "fa fa-chevron-down";
    });
    infoCollapse.addEventListener("hide.bs.collapse", () => {
        infoDiv.querySelector("i#couseInfoCollapseIcon").className = "fa fa-chevron-right";
    });

    container.appendChild(infoDiv);
}

load(SELECTED_COURSE_ID);