"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
module.exports = versionExecPath;
function versionExecPath(version) {
    var versions = resolveVersion.sync(version);
    if (versions.length > 1) throw new Error("Multiple versions match: " + version + " = " + versions.join(",") + ". Please be specific");
    var installPath = path.join(versionUse.installDirectory(), versions[0]);
    try {
        // ensure installed
        accessSync(installPath);
        var binRoot = isWindows ? installPath : path.join(installPath, "bin");
        return path.join(binRoot, NODE);
    } // need to install
    catch (err) {
        throw new Error("".concat(versions[0], " is not installed at ").concat(installPath));
    }
}
var path = require("path");
var resolveVersion = require("node-resolve-versions");
var versionUse = require("node-version-use");
var accessSync = require("fs-access-sync-compat");
var isWindows = process.platform === "win32";
var NODE = isWindows ? "node.exe" : "node";
