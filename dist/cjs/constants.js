"use strict";
var path = require("path");
var home = require("osenv").home();
module.exports = {
    isWindows: process.platform === "win32",
    node: process.platform === "win32" ? "node.exe" : "node",
    cacheDirectory: path.join(home, ".nvu", "cache"),
    buildDirectory: path.join(home, ".nvu", "build"),
    installDirectory: path.join(home, ".nvu", "installed")
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { module.exports = exports.default; for (var key in exports) module.exports[key] = exports[key]; }