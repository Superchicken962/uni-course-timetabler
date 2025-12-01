const courseTable = document.querySelector("#courseTable");

async function updateCourses() {
    const body = courseTable.querySelector("tbody");
    body.innerHTML = "";

    const courses = getMyCourses();

    for (const course of courses) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>0</td>
            <td>N/A</td>
        `;

        body.appendChild(row);
    }
}

updateCourses();

const addCourseBtn = document.querySelector("#addCourseBtn");
const addCourseInput = document.querySelector("#addCourseInput");

addCourseBtn.addEventListener("click", async() => {
    if (!addCourseInput.value) {
        
        return;
    }

    addCourseBtn.setAttribute("disabled", true);
    addCourseBtn.textContent = "...";

    // Create new course, then update list of courses.
    try {
        await newCourse(addCourseInput.value);
    } catch(e) {
        // Handle any errors with creating.
        return;
    }

    addCourseBtn.textContent = "Add";
    addCourseBtn.removeAttribute("disabled");

    updateCourses();
});