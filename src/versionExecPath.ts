const path = require('path');
const resolveVersion = require('node-resolve-versions');
const accessSync = require('fs-access-sync-compat');

const constants = require('./constants');

export default function versionExecPath(version) {
  const versions = resolveVersion.sync(version);
  if (versions.length > 1) throw new Error('Multiple versions match: ' + version + ' = ' + versions.join(',') + '. Please be specific');
  const installPath = path.join(constants.installDirectory, versions[0]);
  const binRoot = constants.isWindows ? installPath : path.join(installPath, 'bin');
  const execPath = path.join(binRoot, constants.node);

  try {
    // ensure installed
    accessSync(installPath);
  } catch (err) {
    // need to install
    try {
      require('cross-spawn-cb').sync('nvu', [versions[0], constants.node, '--version'], { stdio: 'string' });
    } catch (err) {
      if (!err.stderr || err.stderr.indexOf('ExperimentalWarning') < 0) throw err;
    }
  }
  return execPath;
}
