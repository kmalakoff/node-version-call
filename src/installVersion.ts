import path from 'path';
import constants from './constants.js';
import lazy from './lib/lazy.cjs';

const installRelease = lazy('node-install-release');

export default function installVersion(version: string, callback: (error?: Error) => void): void {
  const installPath = path.join(constants.installDirectory, version);
  installRelease()(
    version,
    installPath,
    {
      cacheDirectory: constants.cacheDirectory,
      buildDirectory: constants.buildDirectory,
    },
    callback
  );
}
