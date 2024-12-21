import path from 'path';
import { buildDirectory, cacheDirectory, installDirectory } from '../constants.js';
// @ts-ignore
import lazy from '../lib/lazy.cjs';

const installRelease = lazy('node-install-release');

export default function installVersion(version: string, callback: (error?: Error) => void): void {
  const installPath = path.join(installDirectory, version);
  installRelease()(version, installPath, { cacheDirectory, buildDirectory }, callback);
}
