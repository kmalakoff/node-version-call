import path from 'path';
import homeDir from 'homedir-polyfill';

const home = homeDir();

export const isWindows = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE);
export const node = isWindows ? 'node.exe' : 'node';
export const cacheDirectory = path.join(home, '.nvu', 'cache');
export const buildDirectory = path.join(home, '.nvu', 'build');
export const installDirectory = path.join(home, '.nvu', 'installed');
