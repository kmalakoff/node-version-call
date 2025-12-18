import pathKey from 'env-path-key';
import type functionExecSync from 'function-exec-sync';
import Module from 'module';
import { type SpawnOptions, spawnOptions } from 'node-version-utils';
import semver from 'semver';

import resolveVersion from './lib/resolveVersion.ts';
import type { BindOptions, BoundCaller, CallerCallback, CallOptions, VersionInfo, WrapOptions, Wrapper } from './types.ts';

export type * from './types.ts';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;
const SLEEP_MS = 60;

let functionExec: typeof functionExecSync = null;
let wrapDeprecationWarned = false;

/**
 * Call a function in a specific Node version.
 * Installs the version if not already present.
 * Looks up/installs every time (no caching).
 *
 * @param version - Version spec ('v18.0.0', '>=18', '20')
 * @param workerPath - Path to the file to execute
 * @param options - Execution options
 * @param args - Arguments to pass to the worker
 */
export default function call(version: string, workerPath: string, options?: CallOptions, ...args: unknown[]): unknown {
  const opts = options || {};
  const callbacks = opts.callbacks === true; // default false (matches function-exec-sync)
  const useSpawnOptions = opts.spawnOptions !== false; // default true
  const env = opts.env || process.env;

  const currentSatisfies = version === process.version || semver.satisfies(process.version, version);

  if (currentSatisfies && !callbacks) {
    const fn = _require(workerPath);
    return typeof fn === 'function' ? fn.apply(null, args) : fn;
  }

  if (!functionExec) functionExec = _require('function-exec-sync');

  if (currentSatisfies) {
    const PATH_KEY = pathKey();
    if (opts.env && !opts.env[PATH_KEY]) {
      throw new Error(`node-version-call: options.env missing required ${PATH_KEY}`);
    }
    const execOptions = { execPath: process.execPath, sleep: SLEEP_MS, callbacks: true, env };
    return functionExec.apply(null, [execOptions, workerPath, ...args]);
  }

  const { execPath, installPath } = resolveVersion(version, { storagePath: opts.storagePath });

  if (useSpawnOptions) {
    const execOptions = spawnOptions(installPath, { execPath, sleep: SLEEP_MS, callbacks, env } as SpawnOptions);
    return functionExec.apply(null, [execOptions, workerPath, ...args]);
  }

  const execOptions = { execPath, sleep: SLEEP_MS, callbacks, env };
  return functionExec.apply(null, [execOptions, workerPath, ...args]);
}

/**
 * Create a bound caller for a specific version and worker.
 * Installs the version on first call (lazy) and caches it.
 *
 * @param version - Version spec ('v18.0.0', '>=18', '20')
 * @param workerPath - Path to the file to execute
 * @param options - Execution options
 * @returns A function that calls the worker with the bound version/path/options
 */
export function bind(version: string, workerPath: string, options?: BindOptions): BoundCaller {
  const opts = options || {};
  const callbacks = opts.callbacks === true; // default false (matches function-exec-sync)
  const useSpawnOptions = opts.spawnOptions !== false; // default true
  const env = opts.env || process.env;

  let initialized = false;
  let isLocal: boolean;
  let cachedExecPath: string | null = null;
  let cachedInstallPath: string | null = null;

  return function boundCaller(...args: unknown[]): unknown {
    const lastArg = args[args.length - 1];
    const hasCallback = typeof lastArg === 'function';

    const execute = (): unknown => {
      if (!initialized) {
        isLocal = version === process.version || semver.satisfies(process.version, version);
        if (!isLocal) {
          const resolved = resolveVersion(version, { storagePath: opts.storagePath });
          cachedExecPath = resolved.execPath;
          cachedInstallPath = resolved.installPath;
        }
        initialized = true;
      }

      if (isLocal && !callbacks) {
        const fn = _require(workerPath);
        return typeof fn === 'function' ? fn.apply(null, args) : fn;
      }

      if (!functionExec) functionExec = _require('function-exec-sync');

      if (isLocal) {
        const PATH_KEY = pathKey();
        if (opts.env && !opts.env[PATH_KEY]) {
          throw new Error(`node-version-call: options.env missing required ${PATH_KEY}`);
        }
        const execOptions = { execPath: process.execPath, sleep: SLEEP_MS, callbacks: true, env };
        return functionExec.apply(null, [execOptions, workerPath, ...args]);
      }

      if (useSpawnOptions) {
        const execOptions = spawnOptions(cachedInstallPath, { execPath: cachedExecPath, sleep: SLEEP_MS, callbacks, env } as SpawnOptions);
        return functionExec.apply(null, [execOptions, workerPath, ...args]);
      }

      const execOptions = { execPath: cachedExecPath, sleep: SLEEP_MS, callbacks, env };
      return functionExec.apply(null, [execOptions, workerPath, ...args]);
    };

    if (hasCallback) {
      const callback = args.pop() as CallerCallback;
      try {
        const result = execute();
        callback(null, result);
        return undefined;
      } catch (err) {
        callback(err);
        return undefined;
      }
    }

    return execute();
  };
}

/**
 * @deprecated Use `bind(version, workerPath, options)` instead.
 * Note: `wrap` takes version at call time, `bind` takes version at bind time.
 *
 * Create a wrapper for a worker that can be called with different versions.
 */
export function wrap(workerPath: string, options: WrapOptions = {}): Wrapper {
  if (!wrapDeprecationWarned) {
    console.warn('node-version-call: wrap() is deprecated. Use bind(version, workerPath, options) instead.');
    wrapDeprecationWarned = true;
  }

  const { callbacks = false, env = process.env, storagePath } = options;

  return function wrappedWorker(version: string, ...args: unknown[]): void {
    // Keep 'local' support for backwards compatibility
    const isLocal = version === 'local' || version === process.version;

    if (isLocal) {
      const fn = _require(workerPath);
      return typeof fn === 'function' ? fn.apply(null, args) : fn;
    }

    const callback = args.pop() as CallerCallback;
    try {
      const result = call(version, workerPath, { callbacks, env, storagePath }, ...args);
      callback(null, result);
    } catch (err) {
      callback(err);
    }
  };
}

// Legacy default export support - call with VersionInfo object
// This maintains backwards compatibility with:
//   call({ version: '18', callbacks: true }, workerPath, ...args)
export function legacyCall(versionInfo: string | VersionInfo, filePath: string, ...args: unknown[]): unknown {
  if (typeof versionInfo === 'string') {
    return call(versionInfo, filePath, undefined, ...args);
  }
  return call(
    versionInfo.version,
    filePath,
    {
      callbacks: versionInfo.callbacks,
      storagePath: versionInfo.storagePath,
      env: versionInfo.env,
    },
    ...args
  );
}
