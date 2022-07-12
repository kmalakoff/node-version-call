"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
module.exports = versionExecPath;
function versionExecPath(version) {
    var versions = resolveVersion.sync(version);
    if (versions.length > 1) throw new Error("Multiple versions match: " + version + " = " + versions.join(",") + ". Please be specific");
    var installPath = path.join(constants.installDirectory, versions[0]);
    var binRoot = constants.isWindows ? installPath : path.join(installPath, "bin");
    var execPath = path.join(binRoot, constants.node);
    try {
        // ensure installed
        accessSync(installPath);
    } catch (err) {
        // need to install
        try {
            require("cross-spawn-cb").sync("nvu", [
                versions[0],
                constants.node,
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
var resolveVersion = require("node-resolve-versions");
var accessSync = require("fs-access-sync-compat");
var constants = require("./constants");
