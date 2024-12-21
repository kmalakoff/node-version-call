import path from 'path';
import url from 'url';
import accessSync from 'fs-access-sync-compat';

import constants from './constants.js';
import existsSync from './lib/existsSync.js';
import lazy from './lib/lazy.cjs';

const resolveVersion = lazy('node-resolve-versions');
const execFunction = lazy('function-exec-sync');

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const SLEEP_MS = 200;
const installVersion = path.join(__dirname, 'installVersion.js');

export default function versionExecPath(versionString: string) {
  const versions = resolveVersion().sync(versionString);
  if (versions.length > 1) throw new Error(`Multiple versions match: ${versionString} = ${versions.join(',')}. Please be specific`);
  const version = versions[0];
  const installPath = path.join(constants.installDirectory, version);
  const binRoot = constants.isWindows ? installPath : path.join(installPath, 'bin');
  const execPath = path.join(binRoot, constants.node);

  // need to install
  if (!existsSync(execPath)) {
    execFunction()({ cwd: process.cwd(), sleep: SLEEP_MS, callbacks: true }, installVersion, version);
    accessSync(execPath); // confirm installed
  }
  return execPath;
}
