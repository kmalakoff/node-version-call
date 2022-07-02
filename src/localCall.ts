const fs = require('fs');
const exit = require('exit');
const JSONBuffer = require('json-buffer');
const callFn = require('./callFn');

// get data
const inputFile = process.argv[2];
const outputFile = process.argv[3];
const callData = JSONBuffer.parse(fs.readFileSync(inputFile, 'utf8'));

// call function
const result = callFn(callData.filePath, callData.args);

// return result
fs.writeFileSync(outputFile, JSONBuffer.stringify(result), 'utf8');
exit(0);
