import Module from 'module';
import type { InstallOptions, InstallResult } from 'node-version-install';
import { sync as installSync } from 'node-version-install';
import { spawnOptions } from 'node-version-utils';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;
const SLEEP_MS = 60;

import type { VersionInfo } from './types.js';

export type * from './types.js';
export default function call(versionInfo: string | VersionInfo, filePath: string, ...args): unknown {
  if (typeof versionInfo === 'string') versionInfo = { version: versionInfo } as VersionInfo;
  const installOptions = versionInfo.storagePath ? { storagePath: versionInfo.storagePath } : ({} as InstallOptions);
  const version = versionInfo.version === 'local' ? process.version : versionInfo.version;

  // local - just call
  if (version === process.version) {
    if (versionInfo.callbacks) {
      const options = { execPath: process.execPath, sleep: SLEEP_MS, callbacks: versionInfo.callbacks };
      return _require('function-exec-sync').apply(null, [options, filePath].concat(args));
    }
    const fn = _require(filePath);
    return typeof fn === 'function' ? fn.apply(null, args) : fn;
  }

  // install and call a version of node
  const results = installSync(version, installOptions);
  if (!results) throw new Error(`node-version-call version string ${version} failed to resolve`);
  if (results.length === 0) throw new Error(`node-version-call version string ${version} resolved to zero versions.`);
  if (results.length > 1) throw new Error(`node-version-call version string ${version} resolved to ${(results as InstallResult[]).length} versions. Only one is supported`);

  const options = spawnOptions(results[0].installPath, { execPath: results[0].execPath, sleep: SLEEP_MS, callbacks: versionInfo.callbacks });
  return _require('function-exec-sync').apply(null, [options, filePath].concat(args));
}
