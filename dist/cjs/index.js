"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
module.exports = call;
function call(version, filePath /* arguments */ ) {
    var args = Array.prototype.slice.call(arguments, 2);
    var workerData = {
        filePath: filePath,
        args: args,
        env: process.env,
        cwd: process.cwd()
    };
    // local - just call
    if (version === "local") {
        var fn = require(workerData.filePath);
        return typeof fn == "function" ? fn.apply(null, workerData.args) : fn;
    }
    var temp = path.join(tmpdir(), "node-version-call", shortHash(process.cwd()));
    var input = path.join(temp, suffix("input"));
    var output = path.join(temp, suffix("output"));
    // store data to a file
    mkdirp.sync(path.dirname(input));
    fs.writeFileSync(input, serialize(workerData, {
        unsafe: true
    }), "utf8");
    unlinkSafe(output);
    // call the function
    var execPath = versionExecPath(version);
    var worker = path.join(__dirname, "worker.js");
    cp.exec('"'.concat(execPath, '" "').concat(worker, '" "').concat(input, '" "').concat(output, '"'));
    while(!fs.existsSync(output)){
        sleep(SLEEP_MS);
    }
    // get data and clean up
    var res = eval("(".concat(fs.readFileSync(output, "utf8"), ")"));
    unlinkSafe(input);
    unlinkSafe(output);
    // throw error from the worker
    if (res.error) {
        var err = new Error(res.error.message);
        if (res.error.stack) err.stack = res.error.stack;
        throw err;
    }
    return res.value;
}
require("./polyfills.js");
var path = require("path");
var cp = require("child_process");
var fs = require("fs");
var tmpdir = require("os").tmpdir || require("os-shim").tmpdir;
var suffix = require("temp-suffix");
var serialize = require("serialize-javascript");
var mkdirp = require("mkdirp");
var shortHash = require("short-hash");
var sleep = require("thread-sleep-compat");
var versionExecPath = require("./versionExecPath.js");
var SLEEP_MS = 60;
function unlinkSafe(filename) {
    try {
        fs.unlinkSync(filename);
    } catch (e) {
    // skip
    }
}
