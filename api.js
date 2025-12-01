const { scrapeCourse } = require("./lib/scraping");
const { getCourseUrl } = require("./lib/util");

const app = require("express").Router();

// API Route for scraping course.
app.get("/course/:id", async(req, res) => {
    let courseUrl;

    // This try/catch is different, as if this fails then it was a user input error.
    try {
        courseUrl = getCourseUrl(req.params.id);
    } catch {
        return res.sendStatus(400);
    }

    // If this one fails, it was likely a server error.
    try {
        const course = await scrapeCourse(req.params.id, courseUrl);

        res.json(course);
    } catch {
        res.sendStatus(500);
    }
});

module.exports = app;