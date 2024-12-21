import lazy from './lib/lazy.cjs';
import versionExecPath from './versionExecPath.js';

const functionExec = lazy('function-exec-sync');

const SLEEP_MS = 60;

export type VersionInfo = {
  version: string;
  callbacks: boolean;
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export default function call(version: string | VersionInfo, filePath: string, ...args): any {
  let callbacks = false;
  if (typeof version !== 'string') {
    callbacks = (version as VersionInfo).callbacks ?? false;
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
  const execPath = versionExecPath(version);
  const env = { ...process.env };
  // biome-ignore lint/performance/noDelete: <explanation>
  delete env.NODE_OPTIONS;

  const options = {
    execPath,
    env: env,
    cwd: process.cwd(),
    sleep: SLEEP_MS,
    callbacks,
  };
  return functionExec()(options, filePath, ...args);
}
