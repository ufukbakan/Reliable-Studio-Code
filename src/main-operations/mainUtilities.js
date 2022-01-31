const { dialog, ipcMain } = require("electron");
// can not initialize modal window here because app is not ready yet.

const codeExtensions = ['cs', 'java', 'c', 'cpp', 'py', 'js', 'txt', 'bat'];
const encodedExtensions = ["scs", "sjava", "sc", "scpp", "spy", "sjs", "stxt", "sbat"];
let saveWindowHandler = undefined;

let openOperation = {
    openDirectory: false,
    paths: [],
    cancel: false
};

function getFileNameFromPath(path) {
    return path.split("\\").pop().split("/").pop();
}

function getFolderPathFromFilePath(path) {
    let split = splitPath(path);
    let result = "";
    for (let i = 0; i < split[0].length - 1; i++) {
        result += split[0][i] + split[1];
    }
    return result;
}

function splitPath(path) {
    let sChar = "\\";
    let split = path.split(sChar);
    if (split.length <= 1) {
        sChar = "/"
        split = path.split(sChar);
    }
    return [split, sChar];
}

function showCodeFilesDialog(mainWindow) {
    let result = dialog.showOpenDialogSync(mainWindow, { properties: ['openFile', 'multiSelections'], filters: [{ name: 'Source code', extensions: codeExtensions }] });
    if (result) {
        openOperation.cancel = false;
        openOperation.openDirectory = false;
        openOperation.paths = result;
        openCodeFiles(mainWindow);
    }
    else {
        openOperation.cancel = true;
    }
}

function showEncodedFilesDialog(mainWindow) {
    let result = dialog.showOpenDialogSync(mainWindow, { properties: ['openFile', 'multiSelections'], filters: [{ name: 'Encoded source code', extensions: encodedExtensions }] });
    if (result) {
        openOperation.cancel = false;
        openOperation.openDirectory = false;
        openOperation.paths = result;
        openEncodedFiles(mainWindow);
    }
    else {
        openOperation.cancel = true;
    }
}

function showSaveEncodedFileDialog(mainWindow) {
    saveWindowHandler = mainWindow;
    mainWindow.webContents.send("get-file-extension-and-save", true);
}

function showSaveDialog(mainWindow) {
    saveWindowHandler = mainWindow;
    mainWindow.webContents.send("get-file-extension-and-save", false);
}

ipcMain.on("show-save-dialog-with-args", (event, extension, fileName, isEncoded) => {
    let result = dialog.showSaveDialogSync({ defaultPath: fileName, filters: [{ name: 'Encoded source code', extensions: extension }] });
    if (result) {
        console.log("Ipc message is sent to save file");
        if(isEncoded) {
            saveWindowHandler.webContents.send("save-encoded-file", result);
        }else{
            saveWindowHandler.webContents.send("save-file", result);
        }
    }
});

function openCodeFiles(mainWindow) {
    if (!openOperation.cancel && !openOperation.openDirectory) {
        mainWindow.webContents.send("open-code-files",
            {
                files: openOperation.paths.map(path => pathToFileObj(path, false)),
                askKey: false,
            }
        );
        console.log("Open code files arguments sent to renderer");
    }
}

function openEncodedFiles(mainWindow) {
    if (!openOperation.cancel && !openOperation.openDirectory) {
        mainWindow.webContents.send("open-code-files",
            {
                files: openOperation.paths.map(path => pathToFileObj(path, true)),
                askKey: true,
            }
        );
        console.log("Open encoded files arguments sent to renderer");
    }
}

function pathToFileObj(path, isEncoded) {
    return {
        fileName: getFileNameFromPath(path),
        directory: getFolderPathFromFilePath(path),
        isEncoded: isEncoded
    };
}

function openCodeFolderDialog(mainWindow) {
    let result = dialog.showOpenDialogSync(mainWindow, { properties: ['openDirectory'] })
    if (result) {
        openOperation.cancel = false;
        openOperation.openDirectory = true;
        openOperation.paths = result[0];
        openCodeFolder(mainWindow);
    }
    else {
        openOperation.cancel = true;
    }
}

function openCodeFolder(mainWindow) {
    if (!openOperation.cancel && openOperation.openDirectory) {
        mainWindow.webContents.send("async-msg", openOperation.paths);
    }
}

module.exports = {
    codeExtensions, getFileNameFromPath, getFolderPathFromFilePath, showCodeFilesDialog: showCodeFilesDialog, openCodeFolderDialog, showEncodedFilesDialog, showSaveDialog, showSaveEncodedFileDialog
}
