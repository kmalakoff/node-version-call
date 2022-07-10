"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
module.exports = versionExecPath;
function versionExecPath(version) {
    var versions = resolveVersion.sync(version);
    if (versions.length > 1) throw new Error("Multiple versions match: " + version + " = " + versions.join(",") + ". Please be specific");
    var installPath = path.join(versionUse.installDirectory(), versions[0]);
    var binRoot = isWindows ? installPath : path.join(installPath, "bin");
    var execPath = path.join(binRoot, NODE);
    try {
        // ensure installed
        accessSync(installPath);
    } catch (err) {
        // need to install
        try {
            spawnSync("nvu", [
                versions[0],
                NODE,
                "--version"
            ], {
                stdio: "string"
            });
        } catch (err1) {
            if (!err1.stderr || err1.stderr.indexOf("ExperimentalWarning") < 0) throw err1;
        }
    }
    return execPath;
}
var path = require("path");
var spawnSync = require("cross-spawn-cb").sync;
var resolveVersion = require("node-resolve-versions");
var versionUse = require("node-version-use");
var accessSync = require("fs-access-sync-compat");
var isWindows = process.platform === "win32";
var NODE = isWindows ? "node.exe" : "node";
