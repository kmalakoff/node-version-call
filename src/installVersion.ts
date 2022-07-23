const path = require('path');
const installRelease = require('node-install-release');
const constants = require('./constants');

export default function installVersion(version: string, callback: (error?: Error) => void): void {
  const installPath = path.join(constants.installDirectory, version);
  installRelease(version, installPath, { cacheDirectory: constants.cacheDirectory, buildDirectory: constants.buildDirectory }, callback);
}
