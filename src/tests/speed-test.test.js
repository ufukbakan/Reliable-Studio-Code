const { performance } = require('perf_hooks');
const path = require('path');
const { readFile } = require('../renderer-operations/readerWriter');
const { encode, decode } = require("../renderer-operations/encoderDecoder");
const os = require('os');
const desktop = path.join(os.homedir(), 'Desktop');
const txt = path.join(desktop, 'test.txt');
const encodedTxt = path.join(desktop, 'test.stxt');

test("Speed test", ()=>{
    let time0 = performance.now();
    let pureTxt = readFile(txt);
    let time1 = performance.now();
    let pureReadingTime = time1 - time0;

    time0 = performance.now();
    let decoded = decode(readFile(encodedTxt), "Secret Passphrase")
    time1 = performance.now();
    let decodingTime = time1 - time0;

    expect(pureTxt).toStrictEqual("This code definetly works");
    expect(decoded).toStrictEqual("This code definetly works");
    expect(decodingTime).toBeLessThan(pureReadingTime*1.5);
});