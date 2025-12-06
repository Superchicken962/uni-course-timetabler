class DateHelpers {
    /**
     * Get the day name from a given day index.
     * 
     * @param { Number } dayIndex - Day index, i.e. 0 = Sunday 
     * @returns { String }
     */
    static getDayName(dayIndex) {
        // 07/12/2025 is Sunday, so add index to the date to use the specified day.
        const date = new Date(2025, 11, 7 + dayIndex);

        // Return the weekday name.
        return new Intl.DateTimeFormat("default", { weekday: "long" }).format(date);
    }

    /**
     * Get day index from a given day name.
     * 
     * @param { String } dayName - Day name, i.e. Sunday = 0.
     */
    static getDayIndex(dayName) {
        const days = {
            "sunday": 0,
            "monday": 1,
            "tuesday": 2,
            "wednesday": 3,
            "thursday": 4,
            "friday": 5,
            "saturday": 6
        }

        return days[dayName.toLowerCase()] ?? -1;
    }
}