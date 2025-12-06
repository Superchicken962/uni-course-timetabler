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
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        `;

        tableBody.appendChild(row);
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