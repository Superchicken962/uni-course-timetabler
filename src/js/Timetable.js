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
}