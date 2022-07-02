"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
module.exports = call;
function call(filePath, version) {
    var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    var args = options.args || [];
    var res;
    if (version === "local") res = callFn(filePath, args);
    else {
        var callData = {
            filePath: filePath,
            args: args
        };
        var temp = tmpdir();
        var inputFile = path.join(temp, suffix("nvc-input"));
        var outputFile = path.join(temp, suffix("nvc-output"));
        // store data to a file
        fs.writeFileSync(inputFile, JSONBuffer.stringify(callData));
        unlinkSafe(outputFile);
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
        res = JSONBuffer.parse(fs.readFileSync(outputFile, "utf8"));
        unlinkSafe(inputFile);
        unlinkSafe(outputFile);
    }
    // res res
    if (res.error) {
        var err = new Error(res.error.message);
        if (res.error.stack) err.stack = res.error.stack;
        throw err;
    }
    return res.value;
}
var path = require("path");
var fs = require("fs");
var tmpdir = require("os").tmpdir || require("os-shim").tmpdir;
var suffix = require("temp-suffix");
var spawnSync = require("cross-spawn-cb").sync;
var JSONBuffer = require("json-buffer");
var callFn = require("./callFn");
var localCallFile = path.join(__dirname, "localCall.js");
function unlinkSafe(filename) {
    try {
        fs.unlinkSync(filename);
    } catch (e) {
    // skip
    }
}
