const path = require('path');
const spawnSync = require('cross-spawn-cb').sync;
const resolveVersion = require('node-resolve-versions');
const versionUse = require('node-version-use');
const accessSync = require('fs-access-sync-compat');

const isWindows = process.platform === 'win32';
const NODE = isWindows ? 'node.exe' : 'node';

export default function versionExecPath(version) {
  const versions = resolveVersion.sync(version);
  if (versions.length > 1) throw new Error('Multiple versions match: ' + version + ' = ' + versions.join(',') + '. Please be specific');
  const installPath = path.join(versionUse.installDirectory(), versions[0]);
  const binRoot = isWindows ? installPath : path.join(installPath, 'bin');
  const execPath = path.join(binRoot, NODE);

  try {
    // ensure installed
    accessSync(installPath);
  } catch (err) {
    // need to install
    try {
      spawnSync('nvu', [versions[0], NODE, '--version'], { stdio: 'string' });
    } catch (err) {
      if (!err.stderr || err.stderr.indexOf('ExperimentalWarning') < 0) throw err;
    }
  }
  return execPath;
}
