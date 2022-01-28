var fileOps = undefined;
if (process.env.NODE_ENV == "test") {
    const fs = require('fs');
    fileOps = {
        readFileSync(p) {
            return fs.readFileSync(p, { encoding: "UTF-8" });
        },
        existsSync(p) {
            return fs.existsSync(p);
        },
        writeFileSync(path, content) {
            return fs.writeFileSync(path, content, { encoding: "UTF-8" });
        }
    }
} else {
    fileOps = window.electron.fileOps;
}

function readFile(path) {
    try {
        let content = fileOps.readFileSync(path);
        return content;
    }
    catch (error) {
        console.log(error);
    }
}

function writeFile(path, content) {
    try {
        fileOps.writeFileSync(path, content);
    }
    catch (error) {
        console.log(error);
    }
}

module.exports = { readFile, writeFile }