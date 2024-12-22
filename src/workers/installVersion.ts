import path from 'path';
// @ts-ignore
import lazy from '../lib/lazy.cjs';
import type { InstallDirs } from '../types.js';

const installRelease = lazy('node-install-release');

export default function installVersion(version: string, installDirs: InstallDirs, callback: (error?: Error) => void): void {
  const { buildDirectory, cacheDirectory, installDirectory } = installDirs;
  const installPath = path.join(installDirectory, version);
  installRelease()(version, installPath, { cacheDirectory, buildDirectory }, callback);
}
