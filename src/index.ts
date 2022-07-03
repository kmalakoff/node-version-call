const path = require('path');
const fs = require('fs');
const tmpdir = require('os').tmpdir || require('os-shim').tmpdir;
const suffix = require('temp-suffix');
const spawnSync = require('cross-spawn-cb').sync;
const JSONBuffer = require('json-buffer');
const mkdirp = require('mkdirp');
const callFn = require('./callFn');
const shortHash = require('short-hash');

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
  let res;
  if (version === 'local') res = callFn(filePath, args);
  else {
    const temp = path.join(tmpdir(), 'node-version-call', shortHash(process.cwd()));
    const input = path.join(temp, suffix('input'));
    const output = path.join(temp, suffix('output'));

    // store data to a file
    const callData = { filePath, args };
    mkdirp.sync(path.dirname(input));
    fs.writeFileSync(input, JSONBuffer.stringify(callData));
    unlinkSafe(output);

    // call the function
    const env = options.env || process.env;
    try {
      spawnSync('nvu', [version, 'node', localCallFile, input, output], { env, stdio: 'string' });
    } catch (err) {
      if (err.stderr.indexOf('ExperimentalWarning') < 0) throw err;
    }

    // get data and clean up
    res = JSONBuffer.parse(fs.readFileSync(output, 'utf8'));
    unlinkSafe(input);
    unlinkSafe(output);
  }

  // error res
  if (res.error) {
    const err = new Error(res.error.message);
    if (res.error.stack) err.stack = res.error.stack;
    throw err;
  }
  return res.value;
}
