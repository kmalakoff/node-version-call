"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, // biome-ignore lint/suspicious/noExplicitAny: <explanation>
"default", {
    enumerable: true,
    get: function() {
        return call;
    }
});
var versionExecPath = require("./versionExecPath.js");
var SLEEP_MS = 60;
var functionExec = null; // break dependencies
function call(version, filePath) {
    for(var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++){
        args[_key - 2] = arguments[_key];
    }
    if (!functionExec) functionExec = require("function-exec-sync"); // break dependencies
    var callbacks = false;
    if (typeof version !== "string") {
        var _version_callbacks;
        callbacks = (_version_callbacks = version.callbacks) !== null && _version_callbacks !== void 0 ? _version_callbacks : false;
        version = version.version;
        // need to unwrap callbacks
        if (callbacks && version === "local") version = process.version;
    }
    // local - just call
    if (version === "local" && !callbacks) {
        var fn = require(filePath);
        return typeof fn === "function" ? fn.apply(null, args) : fn;
    }
    // call a version of node
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
/* CJS INTEROP */ if (exports.__esModule && exports.default) { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) exports.default[key] = exports[key]; module.exports = exports.default; }