const fs = require('fs');
const JSONBuffer = require('json-buffer');
const assign = require('just-extend');
const callFn = require('./callFn');

// get data
const input = process.argv[2];
const output = process.argv[3];
const callData = JSONBuffer.parse(fs.readFileSync(input, 'utf8'));

// set up env
if (process.cwd() !== callData.cwd) process.chdir(callData.cwd);
for (const key in process.env) delete process.env[key];
assign(process.env, callData.env);

// call function
const result = callFn(callData.filePath, callData.args);

fs.writeFile(output + '.tmp', JSON.stringify(result), function () {
  fs.rename(output + '.tmp', output, function () {
    process.exit(0);
  });
});
