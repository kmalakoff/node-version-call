let path = null;
let installRelease = null;
let constants = null;
let err = null;

// TODO: remove debug code
try {
  path = require('path');
  installRelease = require('node-install-release');
  constants = require('./constants');
} catch (_err) {
  err = err;
}

export default function installVersion(version: string, callback: (error?: Error) => void): void {
  if (err) return callback(new Error('Failed to load modules' + err.message));

  const installPath = path.join(constants.installDirectory, version);
  installRelease(version, installPath, { cacheDirectory: constants.cacheDirectory, buildDirectory: constants.buildDirectory }, callback);
}
