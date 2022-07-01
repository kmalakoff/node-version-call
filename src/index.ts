const path = require('path');
const fs = require('fs');
const tmpdir = require('os').tmpdir || require('os-shim').tmpdir;
const suffix = require('temp-suffix');
const mkdirp = require('mkdirp');
const spawnSync = require('cross-spawn-cb').sync;
const JSONBuffer = require('./json-buffer');
const callFn = require('./callFn');

export interface JSONObject {
  [x: string]: any;
}
export type CallOptions = {
  args?: any[];
  env?: JSONObject;
};

const localCallFile = path.join(__dirname, 'localCall.js');

function unlinkSafe(filename) {
  try {
    fs.unlinkSync(filename);
  } catch {
    // skip
  }
}

export default function call(filePath: string, version: string, options: CallOptions = {}): any {
  const args = options.args || [];
  let result;
  if (version === 'local') result = callFn(filePath, args);
  else {
    const callData = { filePath, args };
    const inputFile = path.join(tmpdir(), 'nvc', suffix('input'));
    const outputFile = path.join(tmpdir(), 'nvc', suffix('output'));

    // store data to a file
    unlinkSafe(inputFile);
    unlinkSafe(outputFile);
    mkdirp.sync(path.dirname(inputFile));
    fs.writeFileSync(inputFile, JSONBuffer.stringify(callData));

    // call the function
    const env = options.env || process.env;
    spawnSync('nvu', [version, 'node', localCallFile, inputFile, outputFile], { env, stdio: 'string' });

    // get data and clean up
    result = JSONBuffer.parse(fs.readFileSync(outputFile, 'utf8'));
    unlinkSafe(inputFile);
    unlinkSafe(outputFile);
  }

  // result result
  if (result.error) {
    const err = new Error(result.error.message);
    if (result.error.stack) err.stack = result.error.stack;
    throw err;
  }
  return result.value;
}
