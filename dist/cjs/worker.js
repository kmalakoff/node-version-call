"use strict";
var fs = require("fs");
var JSONBuffer = require("json-buffer");
var assign = require("just-extend");
var callFn = require("./callFn");
// get data
var input = process.argv[2];
var output = process.argv[3];
var callData = JSONBuffer.parse(fs.readFileSync(input, "utf8"));
// set up env
if (process.cwd() !== callData.cwd) process.chdir(callData.cwd);
for(var key in process.env)delete process.env[key];
assign(process.env, callData.env);
// call function
var result = callFn(callData.filePath, callData.args);
fs.writeFile(output + ".tmp", JSON.stringify(result), function() {
    fs.rename(output + ".tmp", output, function() {
        process.exit(0);
    });
});
