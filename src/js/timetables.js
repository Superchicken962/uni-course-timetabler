// Utility functions for timetables.

/**
 * Get user's saved timetables.
 * 
 * @return { Timetable[] }
 */
function getMyTimetables() {
    try {
        const timetables = JSON.parse((localStorage.getItem("myTimetables") ?? "{}"));
        return Object.values(timetables).map(t => Timetable.deserialize(t));
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

/**
 * @typedef { Object } ClassOption
 * 
 * @property { String } option.id - Class id
 * @property { String } option.type - Class 'type' / name, e.g. "Related class: Practical"
 * @property { String } option.instructor
 * @property { String } option.time
 * @property { String } option.day
 * @property { String } option.campus
 * @property { String } option.location - Location of class on campus.
 * @property { Object } option.timeRange - Class start and end timestamps.
 * @property { String } option.timeRange.start - ISO timestamp of start.
 * @property { String } option.timeRange.end - ISO timestamp of end.
 */

/**
 * @param { Course } course
 * @param { ClassOption } option - Option
 */
function addCourseOptionToTimetable(course, option) {
    const selectedTt = getTimetableById(getSelectedTimetable());

    selectedTt.addClass(course.courseInfo.courseId, option);

    selectedTt.save();
}


/**
 * @param { Course } course
 * @param { String } classId - Id of selected class/option to remove.
 */
function removeCourseOptionFromTimetable(course, classId) {
    const selectedTt = getTimetableById(getSelectedTimetable());

    const removed = selectedTt.removeClass(course.courseInfo.courseId, classId);

    selectedTt.save();

    return removed;
}