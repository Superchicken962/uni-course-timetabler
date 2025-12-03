const courseTable = document.querySelector("#courseTable");

async function updateCourses() {
    const body = courseTable.querySelector("tbody");
    body.innerHTML = "";

    const courses = getMyCourses();

    for (const course of courses) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${course.courseInfo.courseId}</td>
            <td>${course.courseInfo.courseArea}</td>
            <td>${course.courseInfo.courseName}</td>
            <td>${course.courseInfo.courseCoordinator}</td>
            <td>${course.courseInfo.levelOfStudy}</td>
            <td>${course.courseInfo.unitValue}</td>
            <td>${course.courseInfo.campus}</td>
            <td>${course.courseInfo.courseOwner}</td>
            <td>${course.courseInfo.universityWideElectiveCourse}</td>
            <td>${course.courseInfo.workIntegratedLearningCourse}</td>
            <td>
                <a class="btn btn-primary" href="${course.url}" target="_blank">Open <i class="fa fa-external-link"></i></a>
                <a class="btn btn-primary mt-2" href="/course/${course.courseInfo.courseId}">See More</a>
                <button class="btn btn-danger mt-2" id="removeCourseBtn">Remove</button>
            </td>
        `;

        const removeBtn = row.querySelector("#removeCourseBtn");

        let confirmReset;
        removeBtn.addEventListener("click", () => {
            if (removeBtn.getAttribute("data-click-to-confirm") == "true") {
                clearTimeout(confirmReset);
                removeCourse(course.courseInfo.courseId);
                updateCourses();
                return;
            }

            removeBtn.setAttribute("data-click-to-confirm", true);
            removeBtn.textContent = "Confirm";

            confirmReset = setTimeout(() => {
                removeBtn.removeAttribute("data-click-to-confirm");
                removeBtn.textContent = "Remove";            
            }, 3000);
        });

        body.appendChild(row);
    }
}

updateCourses();

const addCourseBtn = document.querySelector("#addCourseBtn");
const addCourseInput = document.querySelector("#addCourseInput");

addCourseBtn.addEventListener("click", async() => {
    if (!addCourseInput.value) {
        // TODO: Show error.
        return;
    }

    addCourseBtn.setAttribute("disabled", true);
    addCourseBtn.textContent = "...";
    const enteredVal = addCourseInput.value;

    // Create new course, then update list of courses.
    try {
        await newCourse(enteredVal);
    } catch(e) {
        addCourseBtn.textContent = "Add";
        addCourseBtn.removeAttribute("disabled");

        console.log(e.message, e.cause);
        // Handle any errors with creating.
        return;
    }

    addCourseBtn.textContent = "Add";
    addCourseBtn.removeAttribute("disabled");

    // If input still has the added course code, then reset the input value.
    if (addCourseInput.value === enteredVal)
        addCourseInput.value = "";

    updateCourses();
});