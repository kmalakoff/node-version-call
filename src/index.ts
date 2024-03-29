const versionExecPath = require('./versionExecPath.ts');

const SLEEP_MS = 60;

export type VersionInfo = {
  version: string;
  callbacks: boolean;
};

let functionExec = null; // break dependencies
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export default function call(version: string | VersionInfo, filePath: string, ...args): any {
  if (!functionExec) functionExec = require('function-exec-sync'); // break dependencies

  let callbacks = false;
  if (typeof version !== 'string') {
    callbacks = (version as VersionInfo).callbacks ?? false;
    version = (version as VersionInfo).version;

    // need to unwrap callbacks
    if (callbacks && version === 'local') version = process.version;
  }

  // local - just call
  if (version === 'local' && !callbacks) {
    const fn = require(filePath);
    return typeof fn === 'function' ? fn.apply(null, args) : fn;
  }

  // call a version of node

  const execPath = versionExecPath(version);
  return functionExec.apply(
    null,
    [
      {
        execPath,
        env: process.env,
        cwd: process.cwd(),
        sleep: SLEEP_MS,
        callbacks,
      },
      filePath,
    ].concat(args)
  );
}
