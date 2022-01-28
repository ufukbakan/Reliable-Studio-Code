const os = require('os');
const path = require('path');
const { readFile, writeFile } = require('../renderer-operations/readerWriter');
const desktop = path.join(os.homedir(), 'Desktop');

test("Reading writing test", () => {
    expect(readFile(path.join(desktop, 'test.txt'))).toStrictEqual("This code definetly works");
    expect(writeFile(path.join(desktop, 'test2.txt'),"Make it better"));
    expect(readFile(path.join(desktop, 'test2.txt'))).toStrictEqual("Make it better");
});