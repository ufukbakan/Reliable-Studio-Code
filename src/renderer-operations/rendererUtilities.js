export const encodedExtensions = ["scs", "sjava", "sc", "scpp", "spy", "sjs", "stxt", "sbat"];

export function areObjectsEqual(a, b) {
    if(typeof a === "object" && typeof b === "object"){
        let result = true;
        if(Object.keys(a).length == Object.keys(b).length){
            Object.keys(a).forEach(key => {
                if(a[key] != b[key]){
                    result = false;
                }
            })
        }
        else{
            result = false;
        }
        return result;
    }
    else{
        throw new Error("Non-object argument was given");
    }
}

export function removeObjectFromArray(array, element) {
    return [...array].filter(o=>!areObjectsEqual(o, element));
}

export function DoesArrContainObj(arr, obj) {
    let found = false;
    let typeMatch = (o1, o2) => typeof (o1) == typeof (o2);
    if (typeof (obj) == 'object') {
        for (let element of arr) {
            found = true;
            if (!typeMatch(element, obj)) {
                found = false;
            }
            else if(areObjectsEqual(element, obj)) {
                return true;
            }
            else{
                found = false;
            }
        }
    }
    else {
        found = false;
        for (let element of arr) {
            if (element === obj) {
                return true;
            }
        }
    }
    return found;
}

function getFileNameFromPath(path) {
    return path.split("\\").pop().split("/").pop();
}

export function getFolderName(path) {
    if (path.endsWith("\\") || path.endsWith("/")) {
        return getFileNameFromPath(path.substr(0, path.length - 1));
    }
    return getFileNameFromPath(path);
}

export function toggleClassList(classList, className) {
    if (classList.includes(className)) {
        return classList.filter(c => c != className);
    }
    else {
        return [...classList, className];
    }
}

export function classListToString(classList) {
    let result = "";
    let i;
    for (i = 0; i < classList.length - 1; i++) {
        result += classList[i] + " ";
    }
    return classList[i] ? result + classList[i] : result;
}

export function sortFiles(a, b) {
    if (a.fileName.toLowerCase() < b.fileName.toLowerCase())
        return -1;
    if (a.fileName.toLowerCase() > b.fileName.toLowerCase())
        return 1;
    return 0;
}

export function sortFolders(a, b) {
    if (a < b)
        return -1;
    if (a > b)
        return 1;
    return 0;
}

export function splitPath(path) {
    let sChar = "\\";
    let split = path.split(sChar);
    if (split.length <= 1) {
        sChar = "/"
        split = path.split(sChar);
    }
    return [split, sChar];
}

export function calculateLevelOfFolder(folder, folders) {
    let numberOfParentFolders = 0;
    let split = splitPath(folder);
    while (split[0].length > 0) {
        split[0].pop();
        if (DoesArrContainObj(folders, concatSplittedPathArray(split)))
            numberOfParentFolders++;
    }
    return numberOfParentFolders;
}

export function concatSplittedPathArray(split) {
    let result = "";
    for (let i = 0; i < split[0].length; i++) {
        result += split[0][i] + split[1];
    }
    return result;
}

export function getFullPathFromFileObj(file){
    return file.directory + file.fileName;
}