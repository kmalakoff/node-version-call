import path from 'path';
import home from 'homedir-polyfill';
import getInstallDirs from './getInstallDirs.js';
import type { VersionInfo } from './types.js';
import versionExecPath from './versionExecPath.js';

// @ts-ignore
import lazy from './lib/lazy.cjs';
const functionExec = lazy('function-exec-sync');
const SLEEP_MS = 60;

const NVC_DIR = path.join(home(), '.nvc');
const NVC_DIRS_DEFAULT = getInstallDirs(NVC_DIR);

export * from './types.js';

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export default function call(version: string | VersionInfo, filePath: string, ...args): any {
  let callbacks = false;
  let installDirs = NVC_DIRS_DEFAULT;

  if (typeof version !== 'string') {
    if ((version as VersionInfo).callbacks) callbacks = true;
    if ((version as VersionInfo).installDir) installDirs = getInstallDirs((version as VersionInfo).installDir);
    version = (version as VersionInfo).version;

    // need to unwrap callbacks
    if (callbacks && version === 'local') version = process.version;
  }

  // local - just call
  if (version === 'local' && !callbacks) {
    const fn = lazy(filePath)();
    return typeof fn === 'function' ? fn.apply(null, args) : fn;
  }

  // call a version of node
  const execPath = versionExecPath(version, installDirs);
  const options = {
    execPath,
    env: process.env,
    cwd: process.cwd(),
    sleep: SLEEP_MS,
    callbacks,
  };
  return functionExec()(options, filePath, ...args);
}
