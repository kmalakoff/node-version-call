"use strict";
var fs = require("fs");
var exit = require("exit");
var JSONBuffer = require("json-buffer");
var callFn = require("./callFn");
// get data
var inputFile = process.argv[2];
var outputFile = process.argv[3];
var callData = JSONBuffer.parse(fs.readFileSync(inputFile, "utf8"));
// call function
var result = callFn(callData.filePath, callData.args);
// return result
fs.writeFileSync(outputFile, JSONBuffer.stringify(result), "utf8");
exit(0);
