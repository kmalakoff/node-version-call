"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get bind () {
        return _bindts.default;
    },
    get bindSync () {
        return _bindSyncts.default;
    },
    get call () {
        return _callts.default;
    },
    get callSync () {
        return _callSyncts.default;
    },
    get default () {
        return _callts.default;
    }
});
var _bindts = /*#__PURE__*/ _interop_require_default(require("./bind.js"));
var _bindSyncts = /*#__PURE__*/ _interop_require_default(require("./bindSync.js"));
var _callts = /*#__PURE__*/ _interop_require_default(require("./call.js"));
var _callSyncts = /*#__PURE__*/ _interop_require_default(require("./callSync.js"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }