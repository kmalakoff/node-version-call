"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
module.exports = call;
function call(version, filePath /* arguments */ ) {
    var args = Array.prototype.slice.call(arguments, 2);
    var res;
    if (version === "local") res = callFn(filePath, args);
    else {
        var temp = path.join(tmpdir(), "node-version-call", shortHash(process.cwd()));
        var input = path.join(temp, suffix("input"));
        var output = path.join(temp, suffix("output"));
        // store data to a file
        var workerData = {
            filePath: filePath,
            args: args,
            env: process.env
        };
        mkdirp.sync(path.dirname(input));
        fs.writeFileSync(input, JSONBuffer.stringify(workerData));
        unlinkSafe(output);
        // call the function
        var execPath = versionExecPath(version);
        var worker = path.join(__dirname, "worker.js");
        cp.exec('"'.concat(execPath, '" "').concat(worker, '" "').concat(input, '" "').concat(output, '"'));
        while(!fs.existsSync(output)){
            sleep(50);
        }
        // get data and clean up
        res = JSONBuffer.parse(fs.readFileSync(output, "utf8"));
        unlinkSafe(input);
        unlinkSafe(output);
    }
    // error res
    if (res.error) {
        var err = new Error(res.error.message);
        if (res.error.stack) err.stack = res.error.stack;
        throw err;
    }
    return res.value;
}
var path = require("path");
var cp = require("child_process");
var fs = require("fs");
var tmpdir = require("os").tmpdir || require("os-shim").tmpdir;
var suffix = require("temp-suffix");
var JSONBuffer = require("json-buffer");
var mkdirp = require("mkdirp");
var shortHash = require("short-hash");
var sleep = require("thread-sleep-compat");
var versionExecPath = require("./versionExecPath");
var callFn = require("./callFn");
function unlinkSafe(filename) {
    try {
        fs.unlinkSync(filename);
    } catch (e) {
    // skip
    }
}
