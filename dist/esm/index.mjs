const path = require('path');
const fs = require('fs');
const tmpdir = require('os').tmpdir || require('os-shim').tmpdir;
const suffix = require('temp-suffix');
const spawnSync = require('cross-spawn-cb').sync;
const JSONBuffer = require('json-buffer');
const callFn = require('./callFn');
const localCallFile = path.join(__dirname, 'localCall.js');
function unlinkSafe(filename) {
    try {
        fs.unlinkSync(filename);
    } catch (e) {
    // skip
    }
}
export default function call(filePath, version, options = {}) {
    const args = options.args || [];
    let res;
    if (version === 'local') res = callFn(filePath, args);
    else {
        const callData = {
            filePath,
            args
        };
        const temp = tmpdir();
        const inputFile = path.join(temp, suffix("nvc-input"));
        const outputFile = path.join(temp, suffix("nvc-output"));
        // store data to a file
        fs.writeFileSync(inputFile, JSONBuffer.stringify(callData));
        unlinkSafe(outputFile);
        // call the function
        const env = options.env || process.env;
        spawnSync('nvu', [
            version,
            'node',
            localCallFile,
            inputFile,
            outputFile
        ], {
            env,
            stdio: 'string'
        });
        // get data and clean up
        res = JSONBuffer.parse(fs.readFileSync(outputFile, 'utf8'));
        unlinkSafe(inputFile);
        unlinkSafe(outputFile);
    }
    // res res
    if (res.error) {
        const err = new Error(res.error.message);
        if (res.error.stack) err.stack = res.error.stack;
        throw err;
    }
    return res.value;
};
