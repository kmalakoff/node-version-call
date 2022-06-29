const path = require('path');
const fs = require('fs');
const tmpdir = require('os').tmpdir || require('os-shim').tmpdir;
const suffix = require('temp-suffix');
const mkdirp = require('mkdirp');
const spawnSync = require('cross-spawn-cb').sync;
const JSONBuffer = require('./json-buffer');
const localCallFile = path.join(__dirname, 'localCall.js');
export default function call(filePath, version, options = {}) {
    const env = options.env || process.env;
    const args = options.args || [];
    const callData = {
        filePath,
        args
    };
    const inputFile = path.join(tmpdir(), 'nvc', suffix('input'));
    const outputFile = path.join(tmpdir(), 'nvc', suffix('output'));
    // store data to a file
    mkdirp.sync(path.dirname(inputFile));
    fs.writeFileSync(inputFile, JSONBuffer.stringify(callData));
    // call the function
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
    const responseData = JSONBuffer.parse(fs.readFileSync(outputFile, 'utf8'));
    try {
        fs.unlinkSync(inputFile);
    } catch (e) {
    // skip
    }
    try {
        fs.unlinkSync(outputFile);
    } catch (e1) {
    // skip
    }
    return responseData.value;
};
