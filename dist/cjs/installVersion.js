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
var path = null;
var installRelease = null;
var constants = null;
var err = null;
// TODO: remove debug code
try {
    path = require("path");
    installRelease = require("node-install-release");
    constants = require("./constants");
} catch (_err) {
    err = _err;
}
function installVersion(version, callback) {
    if (err) return callback(new Error("Failed to load modules" + err.message));
    var installPath = path.join(constants.installDirectory, version);
    installRelease(version, installPath, {
        cacheDirectory: constants.cacheDirectory,
        buildDirectory: constants.buildDirectory
    }, callback);
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  for (var key in exports) exports.default[key] = exports[key];
  module.exports = exports.default;
}