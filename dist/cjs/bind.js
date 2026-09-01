"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return bind;
    }
});
var _envpathkey = /*#__PURE__*/ _interop_require_default(require("env-path-key"));
var _module = /*#__PURE__*/ _interop_require_default(require("module"));
var _modulecompat = require("module-compat");
var _nodeversionutils = require("node-version-utils");
var _semver = /*#__PURE__*/ _interop_require_default(require("semver"));
var _resolveVersionts = /*#__PURE__*/ _interop_require_default(require("./lib/resolveVersion.js"));
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_without_holes(arr) {
    if (Array.isArray(arr)) return _array_like_to_array(arr);
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) {
        return Array.from(iter);
    }
}
function _non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _to_consumable_array(arr) {
    return _array_without_holes(arr) || _iterable_to_array(arr) || _unsupported_iterable_to_array(arr) || _non_iterable_spread();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
var _require = typeof require === 'undefined' ? _module.default.createRequire(require("url").pathToFileURL(__filename).toString()) : require;
var SLEEP_MS = 60;
/**
 * Create a bound async caller for a specific version and worker.
 * Installs the version on first call (lazy) and caches it.
 *
 * @param version - Version spec ('v18.0.0', '>=18', '20')
 * @param workerPath - Path to the file to execute
 * @param options - Execution options
 * @returns A function that calls the worker with callback or Promise
 */ var functionExec = null;
function bind(version, workerPath, options) {
    var opts = options || {};
    var callbacks = opts.callbacks;
    var useSpawnOptions = opts.spawnOptions !== false; // default true
    var env = opts.env || process.env;
    var moduleType = opts.moduleType || 'auto';
    var interop = opts.interop || 'default';
    var initialized = false;
    var isLocal;
    var cachedExecPath = null;
    var cachedInstallPath = null;
    return function boundAsyncCaller() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        // Detect callback vs Promise mode (Node convention)
        var lastArg = args[args.length - 1];
        var isCallbackMode = typeof lastArg === 'function';
        var callback = isCallbackMode ? args.pop() : null;
        var execute = function execute() {
            // Initialize on first call
            if (!initialized) {
                isLocal = version === process.version || _semver.default.satisfies(process.version, version);
                if (!isLocal) {
                    var resolved = (0, _resolveVersionts.default)(version, {
                        storagePath: opts.storagePath
                    });
                    cachedExecPath = resolved.execPath;
                    cachedInstallPath = resolved.installPath;
                }
                initialized = true;
            }
            // Local execution - current process satisfies version
            if (isLocal) {
                // If worker uses callbacks, we need function-exec-sync to convert to sync
                if (callbacks) {
                    var PATH_KEY = (0, _envpathkey.default)();
                    if (opts.env && !opts.env[PATH_KEY]) {
                        throw new Error("node-version-call: options.env missing required ".concat(PATH_KEY));
                    }
                    if (!functionExec) functionExec = _require('function-exec-sync');
                    var execOptions = {
                        execPath: process.execPath,
                        sleep: SLEEP_MS,
                        callbacks: callbacks,
                        env: env,
                        moduleType: moduleType,
                        interop: interop
                    };
                    return functionExec === null || functionExec === void 0 ? void 0 : functionExec.apply(void 0, [
                        execOptions,
                        workerPath
                    ].concat(_to_consumable_array(args)));
                }
                // Use loadModuleSync for ESM support
                var fn = (0, _modulecompat.loadModuleSync)(workerPath, {
                    moduleType: moduleType,
                    interop: interop
                });
                return typeof fn === 'function' ? fn.apply(null, args) : fn;
            }
            // Remote execution - spawn child process
            if (!functionExec) functionExec = _require('function-exec-sync');
            if (useSpawnOptions) {
                var execOptions1 = (0, _nodeversionutils.spawnOptions)(cachedInstallPath, {
                    execPath: cachedExecPath,
                    sleep: SLEEP_MS,
                    callbacks: callbacks,
                    env: env,
                    moduleType: moduleType,
                    interop: interop
                });
                return functionExec === null || functionExec === void 0 ? void 0 : functionExec.apply(void 0, [
                    execOptions1,
                    workerPath
                ].concat(_to_consumable_array(args)));
            }
            var execOptions2 = {
                execPath: cachedExecPath,
                sleep: SLEEP_MS,
                callbacks: callbacks,
                env: env,
                moduleType: moduleType,
                interop: interop
            };
            return functionExec === null || functionExec === void 0 ? void 0 : functionExec.apply(null, [
                execOptions2,
                workerPath
            ].concat(_to_consumable_array(args)));
        };
        var worker = function worker(execute, cb) {
            try {
                var result = execute();
                cb(null, result);
            } catch (err) {
                cb(err);
            }
        };
        if (callback) return worker(execute, callback);
        return new Promise(function(resolve, reject) {
            return worker(execute, function(err, result) {
                return err ? reject(err) : resolve(result);
            });
        });
    };
}
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }