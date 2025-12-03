// Utility functions for timetables.

/**
 * @typedef { Object } Timetable
 * 
 * @property { String } id
 * @property { String } name
 */

/**
 * Get user's saved timetables.
 * 
 * @return { Timetable[] }
 */
function getMyTimetables() {
    try {
        const timetables = JSON.parse((localStorage.getItem("myTimetables") ?? "{}"));
        return Object.values(timetables);
    } catch {
        return [];
    }
}

/**
 * Save timetable.
 * 
 * @param { String } id - Timetable id.
 * @param { Timetable } data - Timetable data.
 * @returns { Timetable[] } All saved timetables including one just added.
 */
function saveTimetable(id, data) {
    let timetables;

    try {
        timetables = JSON.parse((localStorage.getItem("myTimetables") ?? "{}"));        
    } catch {
        timetables = {};
    }

    timetables[id] = data;
    localStorage.setItem("myTimetables", JSON.stringify(timetables));

    return Object.values(timetables);
}

/**
 * Get saved timetable by id.
 * 
 * @param { String } id - Timetable id
 * @returns { Timetable | null }
 */
function getTimetableById(id) {
    const tt = getMyTimetables();
    return tt.find(t => t.id == id);
}