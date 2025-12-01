const { default: puppeteer } = require("puppeteer");
const cache = require("./cache");

// Add functions that can be used inside of page evaluates.
function initPageHelpers() {
    window.findElementByText = (tag, text, caseSensitive = true) => {
        for (const el of document.getElementsByTagName(tag)) {
            const check = (caseSensitive) ? (el.textContent.trim() === text) : (el.textContent.toLowerCase().trim() === text.toLowerCase());
            if (check) return el;
        }

        return null;
    }

    window.getLabelValue = (label) => {
        const el = findElementByText("div", label, false);
        if (!el) return "N/A";

        return el.nextElementSibling?.textContent?.trim();
    }
}

// 'Helpers' for getting specific bits of data from the page.
const scrapeHelpers = {
    getCourseInfo: async (page, data) => {
        const vals = await page.evaluate(() => {
            return {
                courseId: getLabelValue("Course ID"),
                campus: getLabelValue("Campus"),
                courseCoordinator: getLabelValue("Course coordinator"),
                courseOwner: getLabelValue("Course owner"),
                levelOfStudy: getLabelValue("Level of study"),
                unitValue: getLabelValue("Unit value"),
                courseLevel: getLabelValue("Course level"),
                workIntegratedLearningCourse: getLabelValue("Work Integrated Learning course"),
                universityWideElectiveCourse: getLabelValue("University-wide elective course")
            }
        });

        for (const [key, val] of Object.entries(vals)) {
            data[key] = val ?? "";
        }
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

        await page.evaluateOnNewDocument(initPageHelpers);
        await page.goto(courseUrl, { waitUntil: "domcontentloaded", timeout: 45000 });

        const data = {};

        // Check if course was not found by checking if 'page not found' is displayed.
        const notFound = await page.evaluate(() => {
            return !!window.findElementByText("h1", "Page not found", false);
        });

        if (notFound) {
            await browser.close(); // Make sure to close browser.

            return null;
        }

        // Close cookie popup - probably not needed.
        // await page.evaluate(() => {
        //     const cookieAccept = document.querySelector(".cmp-cookiebanner__action-link.cookie-accept");
        //     if (cookieAccept) cookieAccept.click();
        // });

        await Promise.all([
            scrapeHelpers.getCourseInfo(page, data)
        ]);

        await browser.close();

        return data;
    });
}
exports.scrapeCourse = scrapeCourse;