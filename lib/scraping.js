const { default: puppeteer } = require("puppeteer");
const cache = require("./cache");

const scrapeHelpers = {
    findElementByText: (tag, text, caseSensitive = true) => {
        for (const el of document.getElementsByTagName(tag)) {
            const check = (caseSensitive) ? (el.textContent === text) : (el.textContent.toLowerCase() === text.toLowerCase());
            if (check) return el;
        }

        return null;
    },
    
    getCourseCoordinator: function() {
        const el = this.findElementByText("span", "Course Coordinator", false);
        return el.textContent;
    }
}

/**
 * @typedef { Object } CoursePageInfo
 * 
 * @property { String } courseCoordinator
 */

/**
 * Scrapes course information.
 * 
 * @param { String } courseId 
 * @param { String } courseUrl
 * @returns { Promise<CoursePageInfo> }
 */
async function scrapeCourse(courseId, courseUrl) {
    return cache.wrap(`course:${courseId}`, async() => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(courseUrl);
        const data = await page.evaluate((scrapeHelpers) => {
            const page = {};

            page.courseCoordinator = scrapeHelpers.getCourseCoordinator();

            return page;
        }, scrapeHelpers); // Pass function into the evaluate function.

        await browser.close();

        return data;
    });
}
exports.scrapeCourse = scrapeCourse;