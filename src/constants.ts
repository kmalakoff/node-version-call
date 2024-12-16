const path = require('path');
const home = require('homedir-polyfill')();
const isWindows = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE);

module.exports = {
  isWindows,
  node: isWindows ? 'node.exe' : 'node',
  cacheDirectory: path.join(home, '.nvu', 'cache'),
  buildDirectory: path.join(home, '.nvu', 'build'),
  installDirectory: path.join(home, '.nvu', 'installed'),
};
