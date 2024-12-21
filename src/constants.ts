import path from 'path';
import homeDir from 'homedir-polyfill';

const home = homeDir();
const isWindows = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE);

export default {
  isWindows,
  node: isWindows ? 'node.exe' : 'node',
  cacheDirectory: path.join(home, '.nvu', 'cache'),
  buildDirectory: path.join(home, '.nvu', 'build'),
  installDirectory: path.join(home, '.nvu', 'installed'),
};
