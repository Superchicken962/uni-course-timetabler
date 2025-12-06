const timetableNameInp = document.querySelector("input#timetableName");
timetableNameInp.addEventListener("input", function(ev) {
    this.value = this.value.replace("^", "");
});

const saveChangeBtn = document.querySelector("#saveChangeBtn");
saveChangeBtn.addEventListener("click", () => {
    const selected = getTimetableById(getSelectedTimetable());
    selected.name = timetableNameInp.value;

    saveTimetable(selected.id, selected);

    loadDetails();
    loadTimetablesOptions(); // Updates timetable option on header.
});

function loadDetails() {
    const selected = getTimetableById(getSelectedTimetable());

    timetableNameInp.value = selected?.name ?? "";
}

function updateTimetable() {
    const selected = getTimetableById(getSelectedTimetable());
    if (!selected) return;

    const tt = selected.getTimetabledCourses();
    
    const tableBody = document.querySelector("#timetableTable tbody");
    tableBody.innerHTML = "";

    const FIRST_HOUR = 8;
    const LAST_HOUR = 22;
    
    // Create array of all times from start to finish. E.g. [8, 9, 10, ... 21, 22]
    const times = Array.from({ length: LAST_HOUR-(FIRST_HOUR-1) }, (_, i) => FIRST_HOUR + i);

    for (const time of times) {
        const row = document.createElement("tr");

        const amOrPm = (time >= 12) ? "PM" : "AM";
        const formattedTime = (time > 12) ? time-12 : time;

        row.innerHTML = `
            <td>${formattedTime}:00 ${amOrPm}</td>
            ${
                [0,1,2,3,4].map(i => { 
                    return buildCourseColumn(tt[time][i]);
                }).join("")
            }
        `;

        tableBody.appendChild(row);
    }

    updateColourOptions(selected);
}

/**
 * Builds course element for timetable.
 * 
 * @param { ClassOption } data 
 */
function buildCourseColumn(data) {
    if (!data) return "<td></td>";
    // 'continued' means the data/course is continued from the previous row (is not first hour of class).
    // Return empty string in this case so the empty td does not distort the table.
    if (data.continued) return "";

    const start = new Date(data.timeRange?.start);
    const end = new Date(data.timeRange?.end);

    // Minus hours to get approximate duration - so lengths like 110 mins shows as 2 hours.
    const duration = end.getHours() - start.getHours();

    return `
        <td rowspan="${duration}">
            <div class="courseTimetableBlock py-0">
                <b>${data.courseName}</b><br>

                ${formatClassType(data.type)} (Class ${data.id})<br><br>

                <small>${data.location}</small><br>
                <small>${data.instructor}</small>
            </div>
        </td>
    `;
}

/**
 * Formats class type - removes any preceding titles, so it just returns "Practical" for example.
 */
function formatClassType(type) {
    return type.replace("Enrolment class:", "").replace("Related class:", "").trim();
}

function updateColourOptions(timetable) {
    return;
    const container = document.querySelector("#colourOptions");

    container.innerHTML = "<h3>Course Colours</h3>";
    for (const [courseId, data] of Object.entries(timetable.courses)) {
        const courseName = Object.values(data)[0].courseName;

        const inputDiv = document.createElement("div");

        inputDiv.innerHTML = `
            <label for="courseColourInp:${courseId}" class="form-label">${courseName}</label>
            <input type="color" class="form-control form-control-color" id="courseColourInp:${courseId}" value="#563d7c">
        `;

        container.appendChild(inputDiv);
    }
}


const updatePage = () => {
    loadDetails();
    updateTimetable();
}
updatePage();

// This event is called when timetable is changed on header - update page when this is done.
document.addEventListener("TimetableSelected", (ev) => {
    updatePage();
});