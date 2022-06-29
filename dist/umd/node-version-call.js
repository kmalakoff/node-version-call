(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.nodeVersionCall = factory());
})(this, (function () { 'use strict';

  var path = require("path");
  var fs = require("fs");
  var tmpdir = require("os").tmpdir || require("os-shim").tmpdir;
  var suffix = require("temp-suffix");
  var mkdirp = require("mkdirp");
  var spawnSync = require("cross-spawn-cb").sync;
  var JSONBuffer = require("./json-buffer");
  var localCallFile = path.join(__dirname, "localCall.js");
  function call(filePath, version) {
      var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      var env = options.env || process.env;
      var args = options.args || [];
      var callData = {
          filePath: filePath,
          args: args
      };
      var inputFile = path.join(tmpdir(), "nvc", suffix("input"));
      var outputFile = path.join(tmpdir(), "nvc", suffix("output"));
      // store data to a file
      mkdirp.sync(path.dirname(inputFile));
      fs.writeFileSync(inputFile, JSONBuffer.stringify(callData));
      // call the function
      spawnSync("nvu", [
          version,
          "node",
          localCallFile,
          inputFile,
          outputFile
      ], {
          env: env,
          stdio: "string"
      });
      // get data and clean up
      var responseData = JSONBuffer.parse(fs.readFileSync(outputFile, "utf8"));
      try {
          fs.unlinkSync(inputFile);
      } catch (e) {
      // skip
      }
      try {
          fs.unlinkSync(outputFile);
      } catch (e1) {
      // skip
      }
      return responseData.value;
  }

  return call;

}));
//# sourceMappingURL=node-version-call.js.map
