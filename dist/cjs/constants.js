"use strict";
var path = require('path');
var home = require('homedir-polyfill')();
var isWindows = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE);
module.exports = {
    isWindows: isWindows,
    node: isWindows ? 'node.exe' : 'node',
    cacheDirectory: path.join(home, '.nvu', 'cache'),
    buildDirectory: path.join(home, '.nvu', 'build'),
    installDirectory: path.join(home, '.nvu', 'installed')
};
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }