"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
module.exports = call;
function call(version, filePath /* arguments */ ) {
    var args = Array.prototype.slice.call(arguments, 2);
    var callbacks = false;
    if (typeof version !== "string") {
        var _callbacks;
        callbacks = (_callbacks = version.callbacks) !== null && _callbacks !== void 0 ? _callbacks : false;
        version = version.version;
        // need to unwrap callbacks
        if (callbacks && version === "local") version = process.version;
    }
    // local - just call
    if (version === "local" && !callbacks) {
        var fn = require(filePath);
        return typeof fn == "function" ? fn.apply(null, args) : fn;
    } else {
        var execPath = versionExecPath(version);
        return functionExec.apply(null, [
            {
                execPath: execPath,
                env: process.env,
                cwd: process.cwd(),
                sleep: SLEEP_MS,
                callbacks: callbacks
            },
            filePath
        ].concat(args));
    }
}
var functionExec = require("function-exec-sync");
var versionExecPath = require("./versionExecPath.js");
var SLEEP_MS = 60;
