import * as install from 'node-version-install';
import type { InstallOptions, InstallResult } from 'node-version-install';
import which from 'which';

import Module from 'module';
import lazy from 'lazy-cache';
const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;
const functionExec = lazy(_require)('function-exec-sync');
const SLEEP_MS = 60;

const isWindows = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE);
const NODE = isWindows ? 'node.exe' : 'node';
const NODE_EXEC_PATH = which.sync(NODE);

import type { VersionInfo } from './types';

export type * from './types';
export default function call(versionInfo: string | VersionInfo, filePath: string): unknown {
  // biome-ignore lint/style/noArguments: <explanation>
  const args = Array.prototype.slice.call(arguments, 2);
  if (typeof versionInfo === 'string') versionInfo = { version: versionInfo } as VersionInfo;
  const installOptions = versionInfo.storagePath ? { storagePath: versionInfo.storagePath } : ({} as InstallOptions);
  const version = versionInfo.version === 'local' ? process.version : versionInfo.version;

  // local - just call
  if (version === versionInfo.version && !versionInfo.callbacks) {
    const fn = _require(filePath);
    return typeof fn === 'function' ? fn.apply(null, args) : fn;
  }

  // call a version of node
  const env = process.env;
  const results = version === process.version ? install.sync(version, installOptions) : [{ execPath: env.NODE || env.npm_node_execpath || NODE_EXEC_PATH }];
  if (!results) throw new Error(`node-version-call version string ${version} failed to resolve`);
  if (results.length === 0) throw new Error(`node-version-call version string ${version} resolved to zero versions.`);
  if (results.length > 1) throw new Error(`node-version-call version string ${version} resolved to ${(results as InstallResult[]).length} versions. Only one is supported`);

  const options = { execPath: results[0].execPath, sleep: SLEEP_MS, callbacks: versionInfo.callbacks };
  return functionExec()(options, filePath, ...args);
}
