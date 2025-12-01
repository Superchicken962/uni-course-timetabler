const config = require("../config.json");

/**
 * Generates course url for given id - adds a dash between the course category and code and returns it in url.
 * 
 * @param { String } id - Course id. 
 */
function getCourseUrl(id) {
    let tempUrl;
    try {
        tempUrl = new URL(id);
    } catch {}

    // If the url was created with param, then throw error since it is not meant to be a url.
    if (tempUrl != null) throw new Error("Invalid course id!");

    // Use value from config, or use default as fallback.
    const base = config.courseBaseUrl ?? "https://adelaideuni.edu.au/study/courses/%course-id%";

    // If there is already a dash in the id, don't need to add one so return with url now.
    if (id.includes("-")) {
        return `${base}/${id}`;
    }
    
    const [num] = id.match(/\d+/gi);
    const newId = `${id.split(num)[0]}-${num}`;

    return `${base}/${newId}`;
}
exports.getCourseUrl = getCourseUrl;