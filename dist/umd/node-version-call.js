(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.nodeVersionCall = factory());
})(this, (function () { 'use strict';

  var path = require("path");
  var fs = require("fs");
  var tmpdir = require("os").tmpdir || require("os-shim").tmpdir;
  var suffix = require("temp-suffix");
  var spawnSync = require("cross-spawn-cb").sync;
  var JSONBuffer = require("json-buffer");
  var mkdirp = require("mkdirp");
  var callFn = require("./callFn");
  var localCallFile = path.join(__dirname, "localCall.js");
  function unlinkSafe(filename) {
      try {
          fs.unlinkSync(filename);
      } catch (e) {
      // skip
      }
  }
  function call(filePath, version) {
      var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      var args = options.args || [];
      var res;
      if (version === "local") res = callFn(filePath, args);
      else {
          var temp = path.join(tmpdir(), "nvc");
          var input = path.join(temp, suffix("input"));
          var output = path.join(temp, suffix("output"));
          // store data to a file
          var callData = {
              filePath: filePath,
              args: args
          };
          mkdirp.sync(path.dirname(input));
          fs.writeFileSync(input, JSONBuffer.stringify(callData));
          unlinkSafe(output);
          // call the function
          var env = options.env || process.env;
          spawnSync("nvu", [
              version,
              "node",
              localCallFile,
              input,
              output
          ], {
              env: env,
              stdio: "string"
          });
          // get data and clean up
          res = JSONBuffer.parse(fs.readFileSync(output, "utf8"));
          unlinkSafe(input);
          unlinkSafe(output);
      }
      // error res
      if (res.error) {
          var err = new Error(res.error.message);
          if (res.error.stack) err.stack = res.error.stack;
          throw err;
      }
      return res.value;
  }

  return call;

}));
//# sourceMappingURL=node-version-call.js.map
