"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return existsSync;
    }
});
var accessSync = require('fs-access-sync-compat');
function existsSync(path) {
    try {
        accessSync(path);
        return true;
    } catch (_) {
        return false;
    }
}
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }