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
}

// 'Helpers' for getting specific bits of data from the page.
const scrapeHelpers = {
    getCourseCoordinator: async (page, data) => {
        const val = await page.evaluate(() => {
            const el = findElementByText("span", "Course Coordinator", false);
            return el?.textContent;
        });

        data.courseCoordinator = val ?? "";
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
            return null;
        }

        // Close cookie popup - probably not needed.
        // await page.evaluate(() => {
        //     const cookieAccept = document.querySelector(".cmp-cookiebanner__action-link.cookie-accept");
        //     if (cookieAccept) cookieAccept.click();
        // });

        await Promise.all([
            scrapeHelpers.getCourseCoordinator(page, data) 
        ]);

        await page.close();
        await browser.close();

        return data;
    });
}
exports.scrapeCourse = scrapeCourse;