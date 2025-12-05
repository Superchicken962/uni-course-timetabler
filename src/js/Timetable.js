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
        console.log('add', courseId, classInfo);

        const course = this.courses[courseId] = (this.courses[courseId] || {});
        course[classInfo.type] = classInfo;
    }

    /**
     * Get selected time for a given course id.
     * 
     * @param { String } - Course id. 
     * @param { String } - Class type/name, e.g. 'Related class: Practical"
     */
    getSelectedClass(courseId, classType) {
        const course = this.courses[courseId];
        if (!course) return null;

        return course[classType] ?? null;
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