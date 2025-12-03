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
 * @property { String } courseInfo.courseOverview
 * 
 * @property { String } url - URL to course on adelaide uni website.
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

/**
 * Remove course from saved courses.
 * 
 * @param { String } id - Course id.
 * @returns { Course[] } Updated course list.
 */
function removeCourse(id) {
    let courses;

    try {
        courses = JSON.parse((localStorage.getItem("myCourses") ?? "{}"));        
    } catch {
        courses = {};
    }

    delete courses[id];
    localStorage.setItem("myCourses", JSON.stringify(courses));

    return Object.values(courses);
}

/**
 * Get saved course by id.
 * 
 * @param { String } id - Course id
 * @returns { Course | null }
 */
function getCourseById(id) {
    const courses = getMyCourses();
    return courses.find(c => c.courseInfo.courseId == id);
}

function capitaliseWord(word) {
    return word.charAt(0).toUpperCase() + word.slice(1, word.length).toLowerCase();
}

/**
 * Separates camel case string into separate, capitalised words.
 * 
 * @param { String } string
 * @returns { String }
 */
function separateCamelCase(string) {
    string = string.replace(/([A-Z])/g, " $1");
    string = string.charAt(0).toUpperCase() + string.slice(1);

    return string.trim();
}


/**
 * Recursively render collapsibles.
 * 
 * @param { Object } data - Data to recurse through.
 * @param { String } parentId - Parent id, null to start with
 * @param { (data: Object) => String } dataSetter - Callback that is called when the tree reaches the finally level.
 * @param { Number } stopAtLevel - Optional level to stop at and call dataSetter. Useful to prevent from going all the way down to values.
 * @returns { String } HTML String
 */
function renderCollapseTree(data, parentId, dataSetter, stopAtLevel, atLevel = 0) {
    if (atLevel == stopAtLevel) {
        return dataSetter(data);
    }

    return Object.entries(data).map(([key, value]) => {
        const id = `${parentId}-${key.replace(/\s+/g, "")}`;
        const isObject = (typeof value === "object" && value !== null);

        return `
            <div class="ms-3 mt-2">
                <button class="btn bg-transparent w-auto" 
                        data-bs-toggle="collapse"
                        data-bs-target="#${id}">
                    <i class="fa fa-chevron-right"></i> ${key}
                </button>

                <div class="collapse" id="${id}">
                    ${isObject ? renderCollapseTree(value, id, dataSetter, stopAtLevel, atLevel + 1) : dataSetter?.(value) }
                </div>
            </div>
        `;
    }).join("");
}