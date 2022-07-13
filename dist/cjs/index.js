"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
module.exports = call;
function call(version, filePath /* arguments */ ) {
    var args = Array.prototype.slice.call(arguments, 2);
    // local - just call
    if (version === "local") {
        var fn = require(filePath);
        return typeof fn == "function" ? fn.apply(null, args) : fn;
    } else {
        var execPath = versionExecPath(version);
        return functionExec.apply(void 0, [
            {
                execPath: execPath,
                env: process.env,
                cwd: process.cwd(),
                sleep: SLEEP_MS
            },
            filePath
        ].concat(_toConsumableArray(args)));
    }
}
function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
var functionExec = require("function-exec-sync");
var versionExecPath = require("./versionExecPath.js");
var SLEEP_MS = 60;
