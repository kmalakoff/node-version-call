import * as install from 'node-version-install';
import type { InstallResult } from 'node-version-install';

import Module from 'module';
import lazy from 'lazy-cache';
const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;
const functionExec = lazy(_require)('function-exec-sync');
const SLEEP_MS = 60;

import type { VersionInfo } from './types.js';

const isArray = Array.isArray || ((value: unknown) => Object.prototype.toString.call(value) === '[object Array]');

export * from './types.js';
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export default function call(version: string | VersionInfo, filePath: string, ...args): any {
  let callbacks = false;
  let installPath = undefined;

  if (typeof version !== 'string') {
    if ((version as VersionInfo).callbacks) callbacks = true;
    if ((version as VersionInfo).installPath) installPath = (version as VersionInfo).installPath;
    version = (version as VersionInfo).version;

    // need to unwrap callbacks
    if (callbacks && version === 'local') version = process.version;
  }

  // local - just call
  if (version === 'local' && !callbacks) {
    const fn = _require(filePath);
    return typeof fn === 'function' ? fn.apply(null, args) : fn;
  }

  // call a version of node
  const results = install.sync(version, installPath ? { installPath } : {});
  if (!results) throw new Error(`node-version-call version string ${version} failed to resolve`);
  if (isArray(results)) {
    if ((results as InstallResult[]).length === 0) throw new Error(`node-version-call version string ${version} resolved to zero versions.`);
    if ((results as InstallResult[]).length > 1) throw new Error(`node-version-call version string ${version} resolved to ${(results as InstallResult[]).length} versions. Only one is supported`);
  }

  const options = { execPath: results[0].execPath, sleep: SLEEP_MS, callbacks };
  return functionExec()(options, filePath, ...args);
}
