const path = require('path');
const home = require('osenv').home();

module.exports = {
  isWindows: process.platform === 'win32',
  node: process.platform === 'win32' ? 'node.exe' : 'node',
  cacheDirectory: path.join(home, '.nvu', 'cache'),
  installDirectory: path.join(home, '.nvu', 'installed'),
};
