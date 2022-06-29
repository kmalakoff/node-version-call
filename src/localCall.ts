const fs = require('fs');
const exit = require('exit');
const JSONBuffer = require('./json-buffer');

// get data
const inputFile = process.argv[2];
const outputFile = process.argv[3];
const callData = JSONBuffer.parse(fs.readFileSync(inputFile, 'utf8'));

// call function
const fn = require(callData.filePath);
const value = fn.apply(null, callData.args || []);

// return result
fs.writeFileSync(outputFile, JSONBuffer.stringify({ value }), 'utf8');
exit(0);
