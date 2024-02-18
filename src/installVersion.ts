const path = require('path');
const constants = require('./constants');

let installRelease = null; // break dependencies
export default function installVersion(version: string, callback: (error?: Error) => void): void {
  installRelease = require('node-install-release'); // break dependencies

  const installPath = path.join(constants.installDirectory, version);
  installRelease(
    version,
    installPath,
    {
      cacheDirectory: constants.cacheDirectory,
      buildDirectory: constants.buildDirectory,
    },
    callback
  );
}
