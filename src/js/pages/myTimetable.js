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
loadDetails();

function updateTimetable() {
    
}


// This event is called when timetable is changed on header - update page when this is done.
document.addEventListener("TimetableSelected", (ev) => {
    loadDetails();
    updateTimetable();
});