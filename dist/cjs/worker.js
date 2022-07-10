"use strict";
var fs = require("fs");
var JSONBuffer = require("json-buffer");
var callFn = require("./callFn");
// get data
var input = process.argv[2];
var output = process.argv[3];
var callData = JSONBuffer.parse(fs.readFileSync(input, "utf8"));
// call function
var result = callFn(callData.filePath, callData.args);
fs.writeFile(output + ".tmp", JSON.stringify(result), function() {
    fs.rename(output + ".tmp", output, function() {
        process.exit(0);
    });
});
