/**
 * @typedef { Object } Course
 * 
 * @property { Object } courseInfo
 * @property { String } courseInfo.campus
 * @property { String } courseInfo.courseArea
 * @property { String } courseInfo.courseCoordinator
 * @property { String } courseInfo.courseId
 * @property { String } courseInfo.courseLevel
 * @property { String } courseInfo.courseName
 * @property { String } courseInfo.courseOwner
 * @property { String } courseInfo.levelOfStudy
 * @property { String } courseInfo.unitValue
 * @property { String } courseInfo.universityWideElectiveCourse
 * @property { String } courseInfo.workIntegratedLearningCourse
 */

/**
 * Get user's saved courses.
 * 
 * @return { Course[] }
 */
function getMyCourses() {
    try {
        const courses = JSON.parse((localStorage.getItem("myCourses") ?? "{}"));
        return Object.values(courses);
    } catch {
        return [];
    }
}

/**
 * Save course.
 * 
 * @param { String } id - Course id. 
 * @param { Course } data - Course data.
 * @returns { Course[] } All saved courses including one just added.
 */
function saveCourse(id, data) {
    let courses;

    try {
        courses = JSON.parse((localStorage.getItem("myCourses") ?? "{}"));        
    } catch {
        courses = {};
    }

    courses[id] = data;
    localStorage.setItem("myCourses", JSON.stringify(courses));

    return Object.values(courses);
}

/**
 * Generates course url for given id - adds a dash between the course category and code and returns it in url.
 * 
 * @param { String } id - Course id. 
 */
function getCourseUrl(id) {
    const base = "https://adelaideuni.edu.au/study/courses";

    // If there is already a dash in the id, don't need to add one so return with url now.
    if (id.includes("-")) {
        return `${base}/${id}`;
    }
    
    const [num] = id.match(/\d+/gi);
    const newId = `${id.split(num)[0]}-${num}`;

    return `${base}/${newId}`;
}

/**
 * Get the course id from a given course url.
 * 
 * @param { String } url
 * @returns { String }
 */
function getCourseIdFromUrl(url) {
    return url?.split("/study/courses/")?.[1] ?? "";
}

/**
 * Creates a course from a given url or id - calls api to scrape for course info.
 * Automatically saves to my courses.
 * 
 * @param { String } urlOrId - Url or course id to use. 
 * @returns { Promise<Course> }
 */
async function newCourse(urlOrId) {
    let isUrl = true;
    
    // Try creating url with parameter, if fails then its not a url.
    try {
        new URL(urlOrId);
    } catch {
        isUrl = false;
    }

    const courseId = (isUrl) ? getCourseIdFromUrl(urlOrId) :urlOrId;
    
    const { response, json: data } = await Req.GET(`/api/course/${courseId}`);
    if (!response.ok) {
        throw new Error("Failed to create new course", { cause: response.statusText });
    }

    saveCourse(data.courseInfo?.courseId, data);
}