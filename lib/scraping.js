const { default: puppeteer, trimCache } = require("puppeteer");
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

    window.getLabelValue = (label, elOverride) => {
        const el = findElementByText(elOverride || "div", label, false);
        if (!el) return "N/A";

        return el.nextElementSibling?.textContent?.trim();
    }

    window.extractDateRange = (str) => {
        const range = { start: null, end: null };

        const dates = str.split("-");
        const start = new Date(dates[0].trim());
        const end = new Date(dates[1].trim());

        start.setFullYear(2025);
        end.setFullYear(2025);

        range.start = start.toISOString();
        range.end = end.toISOString();

        return range;
    }

    // Get time range out of a string in format: 12pm - 1pm. Also uses nearest date for provided day.
    window.getTimeRange = (timeStr, dayStr) => {
        const range = { start: null, end: null };

        const times = timeStr.split("-");
        const getDate = (str) => {
            if (!str) return null;

            str = str.trim().toLowerCase();

            let [hour, min] = str.split(":").map(t => t.replaceAll("am", "").replaceAll("pm", ""));

            // Add 12 hours to create 24 hour time.
            if (str.includes("pm") && hour != "12") {
                hour = parseInt(hour) + 12;
            }

            const dt = new Date();
            dt.setMinutes(0);
            dt.setSeconds(0);

            if (dayStr) {
                const days = {
                    "monday": 1,
                    "tuesday": 2,
                    "wednesday": 3,
                    "thursday": 4,
                    "friday": 5,
                    "saturday": 6,
                    "sunday": 0,
                }

                const setDay = days[dayStr.toLowerCase()];
                if (setDay) {
                    const closestDate = getNearestDayFromNow(setDay);
                    dt.setDate(closestDate.getDate());
                }
            }

            if (min) dt.setMinutes(parseInt(min));
            dt.setHours(hour);

            return dt;
        }

        const start = getDate(times[0]);
        const end = getDate(times[1]);

        if (start) range.start = start.toISOString();
        if (end) range.end = end.toISOString();

        return range;
    }

    window.getNearestDayFromNow = (day) => {
        const now = new Date();
        const nowDay = now.getDay();

        const forwardDiff = (day - nowDay + 7) % 7;
        const backwardDiff = forwardDiff - 7;

        const dayDiff = (Math.abs(backwardDiff) < Math.abs(forwardDiff)) ? backwardDiff : forwardDiff;

        const closestDate = new Date(now);
        closestDate.setDate(now.getDate() + dayDiff);

        return closestDate;
    }
}

// 'Helpers' for getting specific bits of data from the page.
const scrapeHelpers = {
    getCourseInfo: async (page, data) => {
        const vals = await page.evaluate(() => {
            return {
                courseName: document.querySelector(".cmp-herobanner__title")?.textContent?.trim(),
                courseId: getLabelValue("Course ID"),
                courseArea: getLabelValue("Area/Catalogue"),
                campus: getLabelValue("Campus"),
                courseCoordinator: getLabelValue("Course coordinator"),
                courseOwner: getLabelValue("Course owner"),
                levelOfStudy: getLabelValue("Level of study"),
                unitValue: getLabelValue("Unit value"),
                courseLevel: getLabelValue("Course level"),
                workIntegratedLearningCourse: getLabelValue("Work Integrated Learning course"),
                universityWideElectiveCourse: getLabelValue("University-wide elective course"),
                courseOverview: getLabelValue("Course overview", "h2")
            }
        });

        data.courseInfo = vals;
    },

    getEnrolmentOptions: async (page, data) => {
        const vals = await page.evaluate(() => {
            const availabilityTxt = findElementByText("h2", "Availability");
            if (!availabilityTxt) return {};

            const optionsData = {};

            // Find semester options and then go through options.
            for (const semEl of document.querySelector("#availability #course-availability-data")?.children ?? []) {
                const semName = semEl.querySelector(".cmp-course-accordion__title")?.textContent?.trim();
                if (!semName) continue;

                optionsData[semName] = {};

                // Now loop through options for all offered campuses.
                const campuses = semEl.querySelectorAll(".cmp-course-accordion__class-details-campustitle");
                for (const campus of campuses) {
                    const campusName = campus.textContent;
                    const campusData = {};

                    // Get classes of campus and loop through.
                    const campusClasses = campus?.nextElementSibling?.querySelectorAll?.(".cmp-course-accordion--container") ?? [];
                    for (const cClass of campusClasses) {
                        const cName = cClass.querySelector("span.cmp-course-accordion__title")?.textContent?.trim();
                        campusData[cName] = [];
                        
                        // Loop through options for this class.
                        const options = cClass.querySelectorAll(".cmp-course-accordion--container-session");
                        for (const opt of options) {
                            const getFromAlt = (alt) => {
                                return opt.querySelector(`[alt='${alt}']`)?.nextElementSibling?.textContent?.replace(alt, "")?.trim() ?? "N/A";
                            }

                            // Find class num by searching for the alt text of the image, then going next sibling.
                            const classNum = getFromAlt("Class number ");
                            const classSize = getFromAlt("Size");
                            const section = getFromAlt("Section");

                            const rows = opt.querySelectorAll("tbody tr");
                            const dates = [...rows].map(r => {
                                const td = r.querySelectorAll("td");

                                const o = {
                                    dates: td[0]?.querySelector(".table-content")?.textContent?.trim(),
                                    days: td[1]?.querySelector(".table-content")?.textContent?.trim(),
                                    time: td[2]?.querySelector(".table-content")?.textContent?.trim(),
                                    campus: td[3]?.querySelector(".table-content")?.textContent?.trim(),
                                    location: td[4]?.querySelector(".table-content")?.textContent?.trim(),
                                    instructor: td[5]?.querySelector(".table-content")?.textContent?.trim(),
                                }

                                o.dateRange = extractDateRange(o.dates);
                                o.timeRange = getTimeRange(o.time, o.days);

                                return o;
                            });

                            campusData[cName].push({
                                classNumber: classNum,
                                section,
                                size: classSize,
                                dates,
                                campus: campusName,
                                classType: cName
                            });
                        }
                    }

                    // Save campus options to semester.
                    optionsData[semName][campusName] = campusData;
                }
            }

            return optionsData;
        });

        data.enrolmentOptions = vals;
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

        const data = { url: courseUrl };

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
            scrapeHelpers.getCourseInfo(page, data),
            scrapeHelpers.getEnrolmentOptions(page, data)
        ]);

        await browser.close();

        return data;
    });
}
exports.scrapeCourse = scrapeCourse;