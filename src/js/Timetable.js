function generateId(length = 24) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdfhgejiklomnopqrstuv0xz123456789!#$";
    let code = "";

    for (let i = 0; i < length; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }

    return code;
}

class Timetable {
    constructor(id, name) {
        this.id = id ?? generateId(24);
        
        if (!name) {
            name = `My Timetable #${Object.values(this.#getAll()).length+1}`;
        }

        this.name = name;
        this.courses = {};
    }

    #getAll() {
        try {
            const timetables = localStorage.getItem("myTimetables") ?? "{}";
            return JSON.parse(timetables);
        } catch {
            return {};
        }
    }

    /**
     * @returns { Timetable }
     */
    save() {
        const timetables = this.#getAll();
        timetables[this.id] = JSON.parse(JSON.stringify(this));

        localStorage.setItem("myTimetables", JSON.stringify(timetables));

        return this;
    }

    /**
     * 
     * @param { String } courseId 
     * @param { ClassOption } classInfo
     */
    addClass(courseId, classInfo) {
        const course = this.courses[courseId] = (this.courses[courseId] || {});
        course[classInfo.type] = classInfo;
    }

    /**
     * Removes a selected course option from the timetable. 
     * 
     * @param { String } courseId 
     * @param { String } classId 
     * @returns { Boolean } Was class removed?
     */
    removeClass(courseId, classId) {
        const course = this.courses[courseId];
        if (!course) return;

        let removeKey;

        // Search through selected course options for a matching class id.
        for (const cls of Object.values(course)) {
            if (cls.id == classId) {
                // Set key so that it can be removed from course object later.
                removeKey = cls.type;
                break;
            }
        }

        if (!removeKey) return false;

        // Delete class from course;
        delete course[removeKey];

        return true;
    }

    /**
     * Get selected time for a given course id.
     * 
     * @param { String } - Course id. 
     * @param { String } - Class type/name, e.g. 'Related class: Practical"
     * @returns { ClassOption | null }
     */
    getSelectedClass(courseId, classType) {
        const course = this.courses[courseId];
        if (!course) return null;

        return course[classType] ?? null;
    }

    /**
     * Check if a given class has a timing conflict with already selected/enrolled classes.
     * 
     * @param { ClassOption } classInfo - Class info, at a very minimum provide the timeRange property.
     * @returns { ClassOption | null } Returns null if no conflict, or the conflicting class.
     */
    hasConflict(classInfo) {
        if (!classInfo) return false;

        const classStart = new Date(classInfo.timeRange?.start);
        const classEnd = new Date(classInfo.timeRange?.end);

        for (const course of Object.values(this.courses)) {
            for (const cls of Object.values(course)) {
                if (cls === classInfo) continue;

                const thisStart = new Date(cls.timeRange.start);
                const thisEnd = new Date(cls.timeRange.end);

                // Obviously not a conflict if the days are different - skip to next class.
                if (thisStart.getDay() !== classStart.getDay()) continue;

                // Check if the given class is within the start and end times of existing class. If so, return the conflicting class.
                if (thisStart.getHours() >= classStart.getHours() && thisEnd.getHours() <= classEnd.getHours()) {
                    return cls;
                }

                console.log(classStart, thisStart);
            }
        }

        return false;
    }

    /**
     * Deserialize a regular object into a Timetable object.
     * 
     * @param { Object } obj - Object to use.
     * @returns { Timetable }
     */
    static deserialize(obj) {
        const inst = new Timetable(obj.id, obj.name);
        inst.courses = obj.courses ?? {};

        return inst;
    }
}