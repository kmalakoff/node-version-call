require('./polyfills.ts');
const path = require('path');
const cp = require('child_process');
const fs = require('fs');
const tmpdir = require('os').tmpdir || require('os-shim').tmpdir;
const suffix = require('temp-suffix');
const serialize = require('serialize-javascript');
const mkdirp = require('mkdirp');
const shortHash = require('short-hash');
const sleep = require('thread-sleep-compat');

const versionExecPath = require('./versionExecPath.ts');
const SLEEP_MS = 60;

function unlinkSafe(filename) {
  try {
    fs.unlinkSync(filename);
  } catch {
    // skip
  }
}

export default function call(version: string, filePath: string /* arguments */): any {
  const args = Array.prototype.slice.call(arguments, 2);
  const workerData = { filePath, args, env: process.env, cwd: process.cwd() };

  // local - just call
  if (version === 'local') {
    const fn = require(workerData.filePath);
    return typeof fn == 'function' ? fn.apply(null, workerData.args) : fn;
  }

  const temp = path.join(tmpdir(), 'node-version-call', shortHash(process.cwd()));
  const input = path.join(temp, suffix('input'));
  const output = path.join(temp, suffix('output'));

  // store data to a file
  mkdirp.sync(path.dirname(input));
  fs.writeFileSync(input, serialize(workerData, { unsafe: true }), 'utf8');
  unlinkSafe(output);

  // call the function
  const execPath = versionExecPath(version);
  const worker = path.join(__dirname, 'worker.js');
  cp.exec(`"${execPath}" "${worker}" "${input}" "${output}"`);
  while (!fs.existsSync(output)) {
    sleep(SLEEP_MS);
  }
  // get data and clean up
  const res = eval(`(${fs.readFileSync(output, 'utf8')})`);
  unlinkSafe(input);
  unlinkSafe(output);

  // throw error from the worker
  if (res.error) {
    const err = new Error(res.error.message);
    if (res.error.stack) err.stack = res.error.stack;
    throw err;
  }
  return res.value;
}
