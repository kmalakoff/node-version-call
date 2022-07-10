const fs = require('fs');
const JSONBuffer = require('json-buffer');
const callFn = require('./callFn');

// get data
const input = process.argv[2];
const output = process.argv[3];
const callData = JSONBuffer.parse(fs.readFileSync(input, 'utf8'));

// call function
const result = callFn(callData.filePath, callData.args);

fs.writeFile(output + '.tmp', JSON.stringify(result), function () {
  fs.rename(output + '.tmp', output, function () {
    process.exit(0);
  });
});
