"use strict";
var fs = require("fs");
var exit = require("exit");
var JSONBuffer = require("./json-buffer");
// get data
var inputFile = process.argv[2];
var outputFile = process.argv[3];
var callData = JSONBuffer.parse(fs.readFileSync(inputFile, "utf8"));
// call function
var fn = require(callData.filePath);
var value = fn.apply(null, callData.args || []);
// return result
fs.writeFileSync(outputFile, JSONBuffer.stringify({
    value: value
}), "utf8");
exit(0);
