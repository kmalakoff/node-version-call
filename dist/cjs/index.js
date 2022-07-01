"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
module.exports = call;
function call(filePath, version) {
    var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    var args = options.args || [];
    var result;
    if (version === "local") result = callFn(filePath, args);
    else {
        var callData = {
            filePath: filePath,
            args: args
        };
        var inputFile = path.join(tmpdir(), "nvc", suffix("input"));
        var outputFile = path.join(tmpdir(), "nvc", suffix("output"));
        // store data to a file
        unlinkSafe(inputFile);
        unlinkSafe(outputFile);
        mkdirp.sync(path.dirname(inputFile));
        fs.writeFileSync(inputFile, JSONBuffer.stringify(callData));
        // call the function
        var env = options.env || process.env;
        spawnSync("nvu", [
            version,
            "node",
            localCallFile,
            inputFile,
            outputFile
        ], {
            env: env,
            stdio: "string"
        });
        // get data and clean up
        result = JSONBuffer.parse(fs.readFileSync(outputFile, "utf8"));
        unlinkSafe(inputFile);
        unlinkSafe(outputFile);
    }
    // result result
    if (result.error) {
        var err = new Error(result.error.message);
        if (result.error.stack) err.stack = result.error.stack;
        throw err;
    }
    return result.value;
}
var path = require("path");
var fs = require("fs");
var tmpdir = require("os").tmpdir || require("os-shim").tmpdir;
var suffix = require("temp-suffix");
var mkdirp = require("mkdirp");
var spawnSync = require("cross-spawn-cb").sync;
var JSONBuffer = require("./json-buffer");
var callFn = require("./callFn");
var localCallFile = path.join(__dirname, "localCall.js");
function unlinkSafe(filename) {
    try {
        fs.unlinkSync(filename);
    } catch (e) {
    // skip
    }
}
