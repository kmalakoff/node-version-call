"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return installVersion;
    }
});
var path = require("path");
var installRelease = require("node-install-release");
var constants = require("./constants");
function installVersion(version, callback) {
    var installPath = path.join(constants.installDirectory, version);
    installRelease(version, installPath, {
        cacheDirectory: constants.cacheDirectory,
        buildDirectory: constants.buildDirectory
    }, callback);
}
/* CJS INTEROP */ if (exports.__esModule && exports.default) { module.exports = exports.default; for (var key in exports) module.exports[key] = exports[key]; }