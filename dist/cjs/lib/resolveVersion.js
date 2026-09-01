"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return resolveVersion;
    }
});
var _fs = /*#__PURE__*/ _interop_require_default(require("fs"));
var _module = /*#__PURE__*/ _interop_require_default(require("module"));
var _nodeversioninstall = require("node-version-install");
var _path = /*#__PURE__*/ _interop_require_default(require("path"));
var _semver = /*#__PURE__*/ _interop_require_default(require("semver"));
var _compatts = require("../compat.js");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
var _require = typeof require === 'undefined' ? _module.default.createRequire(require("url").pathToFileURL(__filename).toString()) : require;
var nodeSemvers = null;
var DEFAULT_STORAGE_PATH = _path.default.join((0, _compatts.homedir)(), '.nvu');
function findInstalledVersion(version, storagePath) {
    var installedDir = _path.default.join(storagePath, 'installed');
    var dirs;
    try {
        dirs = _fs.default.readdirSync(installedDir);
    } catch (unused) {
        return null;
    }
    var installed = dirs.filter(function(d) {
        return d[0] === 'v' && _semver.default.valid(d);
    });
    if (installed.length === 0) return null;
    var match = _semver.default.maxSatisfying(installed, version);
    if (!match) return null;
    var installPath = _path.default.join(installedDir, match);
    var isWindows = process.platform === 'win32';
    var execPath = isWindows ? _path.default.join(installPath, 'node.exe') : _path.default.join(installPath, 'bin', 'node');
    if (!_fs.default.existsSync(execPath)) return null;
    return {
        version: match,
        installPath: installPath,
        execPath: execPath,
        platform: process.platform
    };
}
function resolveAndInstall(version, installOptions) {
    if (!nodeSemvers) nodeSemvers = _require('node-semvers');
    var semvers = nodeSemvers === null || nodeSemvers === void 0 ? void 0 : nodeSemvers.loadSync();
    var resolved = semvers.resolve(version);
    if (!resolved) {
        throw new Error('node-version-call: version "'.concat(version, '" failed to resolve'));
    }
    var targetVersion = Array.isArray(resolved) ? resolved[0] : resolved;
    if (!targetVersion) {
        throw new Error('node-version-call: version "'.concat(version, '" resolved to zero versions'));
    }
    var results = (0, _nodeversioninstall.sync)(targetVersion, installOptions);
    if (!results || results.length === 0) {
        throw new Error('node-version-call: failed to install version "'.concat(targetVersion, '"'));
    }
    return results[0];
}
function resolveVersion(version, options) {
    var storagePath = (options === null || options === void 0 ? void 0 : options.storagePath) || DEFAULT_STORAGE_PATH;
    var found = findInstalledVersion(version, storagePath);
    if (found) return {
        execPath: found.execPath,
        installPath: found.installPath
    };
    var installed = resolveAndInstall(version, {
        storagePath: storagePath
    });
    return {
        execPath: installed.execPath,
        installPath: installed.installPath
    };
}
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }