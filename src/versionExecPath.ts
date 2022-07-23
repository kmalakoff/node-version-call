const path = require('path');
const accessSync = require('fs-access-sync-compat');
const constants = require('./constants');

const SLEEP_MS = 200;
const installVersion = __dirname + '/installVersion.js';

let resolveVersion = null; // break dependencies
export default function versionExecPath(version) {
  if (!resolveVersion) resolveVersion = require('node-resolve-versions'); // break dependencies

  const versions = require('node-resolve-versions').sync(version);
  if (versions.length > 1) throw new Error('Multiple versions match: ' + version + ' = ' + versions.join(',') + '. Please be specific');
  const installPath = path.join(constants.installDirectory, versions[0]);
  const binRoot = constants.isWindows ? installPath : path.join(installPath, 'bin');
  const execPath = path.join(binRoot, constants.node);

  try {
    // check installed
    accessSync(execPath);
  } catch (err) {
    // need to install
    require('function-exec-sync')({ cwd: process.cwd(), sleep: SLEEP_MS, callbacks: true }, installVersion, versions[0]);
    accessSync(execPath);
  }
  return execPath;
}
