const path = require('path')
const resolveVersion = require('node-resolve-versions');
const versionUse = require('node-version-use');
const accessSync = require('fs-access-sync-compat');

const isWindows = process.platform === 'win32';
const NODE = isWindows ? 'node.exe' : 'node';

export default function versionExecPath(version) {
  const versions = resolveVersion.sync(version);
  if (versions.length > 1) throw new Error('Multiple versions match: ' + version + ' = ' + versions.join(',') + '. Please be specific')
  const installPath = path.join(versionUse.installDirectory(), versions[0]);

  try {
    // ensure installed
    accessSync(installPath);
    const binRoot = isWindows ? installPath : path.join(installPath, 'bin');
    return path.join(binRoot, NODE);    
  } 
  // need to install
  catch (err) {
    throw new Error(`${versions[0]} is not installed at ${installPath}`);
  }
}
