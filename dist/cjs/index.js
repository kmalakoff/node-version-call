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
        var temp = path.join(tmpdir(), "node-version-call", shortHash(process.cwd()));
        var input = path.join(temp, suffix("input"));
        var output = path.join(temp, suffix("output"));
        // store data to a file
        var callData = {
            filePath: filePath,
            args: args
        };
        mkdirp.sync(path.dirname(input));
        fs.writeFileSync(input, JSONBuffer.stringify(callData));
        unlinkSafe(output);
        // call the function
        var env = options.env || process.env;
        try {
            spawnSync("nvu", [
                version,
                "node",
                localCallFile,
                input,
                output
            ], {
                env: env,
                stdio: "string"
            });
        } catch (err) {
            if (err.stderr.indexOf("ExperimentalWarning") < 0) throw err;
        }
        // get data and clean up
        res = JSONBuffer.parse(fs.readFileSync(output, "utf8"));
        unlinkSafe(input);
        unlinkSafe(output);
    }
    // error res
    if (res.error) {
        var _$err = new Error(res.error.message);
        if (res.error.stack) _$err.stack = res.error.stack;
        throw _$err;
    }
    return res.value;
}
var path = require("path");
var fs = require("fs");
var tmpdir = require("os").tmpdir || require("os-shim").tmpdir;
var suffix = require("temp-suffix");
var spawnSync = require("cross-spawn-cb").sync;
var JSONBuffer = require("json-buffer");
var mkdirp = require("mkdirp");
var callFn = require("./callFn");
var shortHash = require("short-hash");
var localCallFile = path.join(__dirname, "localCall.js");
function unlinkSafe(filename) {
    try {
        fs.unlinkSync(filename);
    } catch (e) {
    // skip
    }
}
