"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return versionExecPath;
    }
});
var path = require("path");
var accessSync = require("fs-access-sync-compat");
var constants = require("./constants");
var SLEEP_MS = 200;
var installVersion = __dirname + "/installVersion.js";
var resolveVersion = null; // break dependencies
function versionExecPath(version) {
    if (!resolveVersion) resolveVersion = require("node-resolve-versions"); // break dependencies
    var versions = require("node-resolve-versions").sync(version);
    if (versions.length > 1) throw new Error("Multiple versions match: " + version + " = " + versions.join(",") + ". Please be specific");
    var installPath = path.join(constants.installDirectory, versions[0]);
    var binRoot = constants.isWindows ? installPath : path.join(installPath, "bin");
    var execPath = path.join(binRoot, constants.node);
    try {
        // check installed
        accessSync(execPath);
    } catch (err) {
        // need to install
        require("function-exec-sync")({
            cwd: process.cwd(),
            sleep: SLEEP_MS,
            callbacks: true
        }, installVersion, versions[0]);
        accessSync(execPath);
    }
    return execPath;
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}