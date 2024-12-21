import path from 'path';
import url from 'url';
import accessSync from 'fs-access-sync-compat';

import { installDirectory, isWindows, node } from './constants.js';
import existsSync from './lib/existsSync.js';
// @ts-ignore
import lazy from './lib/lazy.cjs';
import packageRoot from './lib/packageRoot.js';

const resolveVersion = lazy('node-resolve-versions');
const execFunction = lazy('function-exec-sync');

const SLEEP_MS = 200;
const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const root = packageRoot(__dirname, 'node-version-call');
const installVersion = path.join(root, 'dist', 'cjs', 'workers', 'installVersion.js');

export default function versionExecPath(versionString: string) {
  const versions = resolveVersion().sync(versionString);
  if (versions.length > 1) throw new Error(`Multiple versions match: ${versionString} = ${versions.join(',')}. Please be specific`);
  const version = versions[0];
  const installPath = path.join(installDirectory, version);
  const binRoot = isWindows ? installPath : path.join(installPath, 'bin');
  const execPath = path.join(binRoot, node);

  // need to install
  if (!existsSync(execPath)) {
    execFunction()({ cwd: process.cwd(), sleep: SLEEP_MS, callbacks: true }, installVersion, version);
    accessSync(execPath); // confirm installed
  }
  return execPath;
}
