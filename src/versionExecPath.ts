const path = require('path');
const accessSync = require('fs-access-sync-compat');

const constants = require('./constants');
const existsSync = require('./existsSync');

const SLEEP_MS = 200;
const installVersion = path.join(__dirname, 'installVersion.js');

let resolveVersion = null; // break dependencies
let execFunction = null; // break dependencies
export default function versionExecPath(versionString: string) {
  if (!resolveVersion) resolveVersion = require('node-resolve-versions'); // break dependencies
  if (!execFunction) execFunction = require('function-exec-sync'); // break dependencies

  const versions = resolveVersion.sync(versionString);
  if (versions.length > 1) throw new Error(`Multiple versions match: ${versionString} = ${versions.join(',')}. Please be specific`);
  const version = versions[0];
  const installPath = path.join(constants.installDirectory, version);
  const binRoot = constants.isWindows ? installPath : path.join(installPath, 'bin');
  const execPath = path.join(binRoot, constants.node);

  // need to install
  if (!existsSync(execPath)) {
    execFunction({ cwd: process.cwd(), sleep: SLEEP_MS, callbacks: true }, installVersion, version);
    accessSync(execPath); // confirm installed
  }
  return execPath;
}
