"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return path;
    }
});
var accessSync = require("fs-access-sync-compat");
function path(path) {
    try {
        accessSync(path);
        return true;
    } catch (_err) {
        return false;
    }
}
/* CJS INTEROP */ if (exports.__esModule && exports.default) { module.exports = exports.default; for (var key in exports) module.exports[key] = exports[key]; }