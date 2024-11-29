const path = require('path');
const home = require('homedir-polyfill')();

module.exports = {
  isWindows: process.platform === 'win32',
  node: process.platform === 'win32' ? 'node.exe' : 'node',
  cacheDirectory: path.join(home, '.nvu', 'cache'),
  buildDirectory: path.join(home, '.nvu', 'build'),
  installDirectory: path.join(home, '.nvu', 'installed'),
};
