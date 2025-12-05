function getSelectedTimetable() {
    return localStorage.getItem("selectedTimetable");
}
function setSelectedTimetable(timetableId) {
    localStorage.setItem("selectedTimetable", timetableId);
}

(() => {
    createDefaultTimetable();
    loadTimetablesOptions();

    const ttSelect = document.querySelector("#timetableSelect");
    const selectedTt = getSelectedTimetable();
    
    const opt = ttSelect.querySelector(`option[value='${selectedTt}']`);
    if (opt) opt.selected = true;

    ttSelect.addEventListener("input", (ev) => {
        let ttId = ttSelect.value;

        // Create new timetable when value is selected.
        if (ttSelect.value === "newTimetable^") {
            const newTimetable = new Timetable().save();
            loadTimetablesOptions();
            
            ttSelect.value = newTimetable.id;
            ttId = newTimetable.id;
        }

        setSelectedTimetable(ttId);

        // Dispatch an event when the version is changed.
        const changeEv = new CustomEvent("TimetableSelected", { detail: ttId });
        document.dispatchEvent(changeEv);
    });
})();

function tt() {
    try {
        const timetables = JSON.parse((localStorage.getItem("myTimetables") ?? "{}"));
        return Object.values(timetables);
    } catch {
        return [];
    }
}

function loadTimetablesOptions() {
    const ttSelect = document.querySelector("#timetableSelect");
    const savedContainer = ttSelect.querySelector("#savedTimetables");

    const timetables = tt();
    savedContainer.innerHTML = "";

    for (const tt of timetables) {
        const opt = document.createElement("option");
        opt.value = tt.id;
        opt.textContent = tt.name;

        savedContainer.appendChild(opt);
    }

    const selected = getSelectedTimetable();
    if (selected) {
        ttSelect.value = selected;
    }
}

/**
 * Creates a default timetable if one does not exist.
 */
function createDefaultTimetable() {
    if (tt().length > 0) return;

    const newTt = new Timetable(null, "Default Timetable").save();
    setSelectedTimetable(newTt.id);
}