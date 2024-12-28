import path from 'path';
import url from 'url';
import existsSync from 'fs-exists-sync';

import { isWindows, node } from './constants.js';
// @ts-ignore
import lazy from './lib/lazy.cjs';
import packageRoot from './lib/packageRoot.js';
import type { InstallDirs } from './types.js';

const resolveVersion = lazy('node-resolve-versions');
const execFunction = lazy('function-exec-sync');

const SLEEP_MS = 200;
const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const root = packageRoot(__dirname);
const installVersionWorker = path.join(root, 'dist', 'cjs', 'workers', 'installVersion.js');

export default function installVersion(versionString: string, installDirs: InstallDirs) {
  const versions = resolveVersion().sync(versionString);
  if (versions.length > 1) throw new Error(`Multiple versions match: ${versionString} = ${versions.join(',')}. Please be specific`);
  const version = versions[0];
  const installPath = path.join(installDirs.installDirectory, version);
  const binRoot = isWindows ? installPath : path.join(installPath, 'bin');
  const execPath = path.join(binRoot, node);

  // already installed
  if (existsSync(execPath)) return { version, execPath };
  execFunction().default({ cwd: process.cwd(), sleep: SLEEP_MS, callbacks: true }, installVersionWorker, version, installDirs);
  if (!existsSync(execPath)) throw new Error(`${version} not installed. Requested: ${versionString}`); // confirm installed
  return { version, execPath };
}
