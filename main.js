// Commands
const fs = require("node:fs");
const path = require("node:path");

const procArgs = process.argv;
procArgs.splice(0, 2);

const COMMANDS = {
    "onDay": {
        "description": "Get the offered courses on a given day, using a given text file.",
        "args": [
            "<File path>",
            "<Day>",
        ],
        run: fromText
    }
};

const command = procArgs[0];
run(command);

function run(cmd) {
    if (!cmd || !COMMANDS[cmd]) {
        console.log("Please enter a valid command:");
        for (const [cName, cData] of Object.entries(COMMANDS)) {
            console.log(`${cName} • ${cData.description}\n    - ${cData.args.map(a => a).join(" ")}`)
        }

        return;
    }

    const cmdArgs = [...procArgs];
    cmdArgs.splice(0, 1);

    COMMANDS[cmd]?.run(...cmdArgs);
}

function fromText(...args) {
    const pth = path.join(__dirname, args[0] ?? "");

    if (!args[0] || !fs.existsSync(pth)) {
        console.log("Please enter a valid path!");
        return;
    }

    const day = args[1];
    if (!day) {
        console.log("Please enter a valid day!");
        return;
    }

    const content = fs.readFileSync(pth, "utf-8");
    console.log(content);
}