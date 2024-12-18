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
var path = require('path');
var constants = require('./constants');
var installRelease = null; // break dependencies
function installVersion(version, callback) {
    installRelease = require('node-install-release'); // break dependencies
    var installPath = path.join(constants.installDirectory, version);
    installRelease(version, installPath, {
        cacheDirectory: constants.cacheDirectory,
        buildDirectory: constants.buildDirectory
    }, callback);
}
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }