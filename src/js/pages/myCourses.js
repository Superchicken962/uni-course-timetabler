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
        `;

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

    // Create new course, then update list of courses.
    try {
        await newCourse(addCourseInput.value);
    } catch(e) {
        addCourseBtn.textContent = "Add";
        addCourseBtn.removeAttribute("disabled");

        console.log(e.message, e.cause);
        // Handle any errors with creating.
        return;
    }

    addCourseBtn.textContent = "Add";
    addCourseBtn.removeAttribute("disabled");

    addCourseInput.value = "";

    updateCourses();
});