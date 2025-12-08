const app = require("express")();
const config = require("./config.json");
const PORT = config.port;
const path = require("node:path");
const fs = require("node:fs");
const appVersion = require("./package.json").version;

app.engine("html", require('ejs').renderFile);
app.set("view-engine", "html");
app.set("views", path.join(__dirname, "src/views"));

if (config.production) process.env.TZ = "Australia/Adelaide";

app.use("*all", async(req, res, next) => {
    res.locals.path = req.originalUrl;
    res.locals.appVersion = appVersion;

    next();
});


app.get("/", (req, res) => {
    res.render("index.html");
});

app.get("/courses", (req, res) => {
    res.render("courses.html");
});

app.get("/course/:id", (req, res) => {
    res.render("courseInfo.html", { courseId: req.params.id });
});

app.get("/timetable", (req, res) => {
    res.render("timetable.html");
});

app.get("/share", (req, res) => {
    res.render("shareData.html");
});

app.use("/api", require("./api"));


app.get(["/js/*a", "/css/*a"], (req, res, next) => {    
    let requestPath = req.path;

    // Remove a trailing '/' if it is there.
    if (requestPath.slice(-1) === "/") {
        requestPath = requestPath.slice(0, -1);
    }

    let filePath = path.join(__dirname, "src/"+requestPath);

    // If path is for a css file, but an extension is not given then we add the .css ourselves.
    if (requestPath.startsWith("/css") && !filePath.endsWith(".css")) {
        filePath += ".css";
    }
    // Do the same for JavaScript files.
    if (requestPath.startsWith("/js") && !filePath.endsWith(".js")) {
        filePath += ".js";
    }

    if (!fs.existsSync(filePath) || !filePath.endsWith(".css") && !filePath.endsWith(".js")) {
        next();
        return
    }

    res.sendFile(filePath);
});

app.use("*remaining", (req, res) => {
    res.status(404).send("Not found!");
});

app.listen(PORT, () => {
    console.log(`Web listening on port ${PORT}`); 
});