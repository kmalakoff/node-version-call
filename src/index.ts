import * as install from 'node-version-install';
import type { InstallOptions, InstallResult } from 'node-version-install';

import Module from 'module';
import lazy from 'lazy-cache';
const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;
const functionExec = lazy(_require)('function-exec-sync');
const SLEEP_MS = 60;

import type { VersionInfo } from './types';

export type * from './types';
export default function call(versionInfo: string | VersionInfo, filePath: string): unknown {
  // biome-ignore lint/style/noArguments: <explanation>
  const args = Array.prototype.slice.call(arguments, 2);
  if (typeof versionInfo === 'string') versionInfo = { version: versionInfo } as VersionInfo;
  const installOptions = versionInfo.storagePath ? { storagePath: versionInfo.storagePath } : ({} as InstallOptions);
  const version = versionInfo.version === 'local' ? process.version : versionInfo.version;

  // local - just call
  if (version === process.version) {
    if (versionInfo.callbacks) {
      const options = { execPath: process.execPath, sleep: SLEEP_MS, callbacks: versionInfo.callbacks };
      return functionExec().apply(null, [options, filePath].concat(args));
    }
    const fn = _require(filePath);
    return typeof fn === 'function' ? fn.apply(null, args) : fn;
  }

  // install and call a version of node
  const results = install.sync(version, installOptions);
  if (!results) throw new Error(`node-version-call version string ${version} failed to resolve`);
  if (results.length === 0) throw new Error(`node-version-call version string ${version} resolved to zero versions.`);
  if (results.length > 1) throw new Error(`node-version-call version string ${version} resolved to ${(results as InstallResult[]).length} versions. Only one is supported`);

  const options = { execPath: results[0].execPath, sleep: SLEEP_MS, callbacks: versionInfo.callbacks };
  return functionExec().apply(null, [options, filePath].concat(args));
}
