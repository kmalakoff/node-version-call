const path = require('path');
const cp = require('child_process');
const fs = require('fs');
const tmpdir = require('os').tmpdir || require('os-shim').tmpdir;
const suffix = require('temp-suffix');
const JSONBuffer = require('json-buffer');
const mkdirp = require('mkdirp');
const shortHash = require('short-hash');
const sleep = require('thread-sleep-compat');

const versionExecPath = require('./versionExecPath');
const callFn = require('./callFn');

function unlinkSafe(filename) {
  try {
    fs.unlinkSync(filename);
  } catch {
    // skip
  }
}

export default function call(version: string, filePath: string /* arguments */): any {
  const args = Array.prototype.slice.call(arguments, 2);
  let res;
  if (version === 'local') res = callFn(filePath, args);
  else {
    const temp = path.join(tmpdir(), 'node-version-call', shortHash(process.cwd()));
    const input = path.join(temp, suffix('input'));
    const output = path.join(temp, suffix('output'));

    // store data to a file
    const workerData = { filePath, args, env: process.env, cwd: process.cwd() };
    mkdirp.sync(path.dirname(input));
    fs.writeFileSync(input, JSONBuffer.stringify(workerData));
    unlinkSafe(output);

    // call the function
    const execPath = versionExecPath(version);
    const worker = path.join(__dirname, 'worker.js');
    cp.exec(`"${execPath}" "${worker}" "${input}" "${output}"`);
    while (!fs.existsSync(output)) {
      sleep(50);
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
