import pathKey from 'env-path-key';
import type functionExecSync from 'function-exec-sync';
import Module from 'module';
import type { InstallOptions, InstallResult } from 'node-version-install';
import { sync as installSync } from 'node-version-install';
import { type SpawnOptions, spawnOptions } from 'node-version-utils';

import type { BindOptions, BoundCaller, CallerCallback, CallOptions, VersionInfo, WrapOptions, Wrapper } from './types.ts';

export type * from './types.ts';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;
const SLEEP_MS = 60;

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
  const callbacks = opts.callbacks !== false; // default true
  const env = opts.env || process.env;
  const installOptions = opts.storagePath ? { storagePath: opts.storagePath } : ({} as InstallOptions);

  // Local execution - current process matches
  if (version === process.version) {
    if (callbacks) {
      const PATH_KEY = pathKey();
      if (opts.env && !opts.env[PATH_KEY]) {
        throw new Error(`node-version-call: options.env missing required ${PATH_KEY}`);
      }
      const execOptions = { execPath: process.execPath, sleep: SLEEP_MS, callbacks: true, env };
      return (_require('function-exec-sync') as typeof functionExecSync).apply(null, [execOptions, workerPath, ...args]);
    }
    const fn = _require(workerPath);
    return typeof fn === 'function' ? fn.apply(null, args) : fn;
  }

  // Install and call a version of node
  const results = installSync(version, installOptions);
  if (!results) throw new Error(`node-version-call: version "${version}" failed to resolve`);
  if (results.length === 0) throw new Error(`node-version-call: version "${version}" resolved to zero versions`);
  if (results.length > 1) throw new Error(`node-version-call: version "${version}" resolved to ${(results as InstallResult[]).length} versions. Only one is supported`);

  const execOptions = spawnOptions(results[0].installPath, { execPath: results[0].execPath, sleep: SLEEP_MS, callbacks, env } as SpawnOptions);
  return (_require('function-exec-sync') as typeof functionExecSync).apply(null, [execOptions, workerPath, ...args]);
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
  const opts = { callbacks: true, ...options };
  const callbacks = opts.callbacks !== false;
  const env = opts.env || process.env;
  const installOptions = opts.storagePath ? { storagePath: opts.storagePath } : ({} as InstallOptions);

  // Cache install result on first call (lazy)
  let initialized = false;
  let isLocal: boolean;
  let cachedInstallResult: InstallResult | null = null;

  return function boundCaller(...args: unknown[]): unknown {
    // Check if last arg is a callback first
    const lastArg = args[args.length - 1];
    const hasCallback = typeof lastArg === 'function';

    const execute = (): unknown => {
      // Lazy initialization on first call
      if (!initialized) {
        isLocal = version === process.version;
        if (!isLocal) {
          const results = installSync(version, installOptions);
          if (!results) throw new Error(`node-version-call: version "${version}" failed to resolve`);
          if (results.length === 0) throw new Error(`node-version-call: version "${version}" resolved to zero versions`);
          if (results.length > 1) throw new Error(`node-version-call: version "${version}" resolved to ${(results as InstallResult[]).length} versions. Only one is supported`);
          cachedInstallResult = results[0];
        }
        initialized = true;
      }

      if (isLocal) {
        // Local execution
        if (callbacks) {
          const PATH_KEY = pathKey();
          if (opts.env && !opts.env[PATH_KEY]) {
            throw new Error(`node-version-call: options.env missing required ${PATH_KEY}`);
          }
          const execOptions = { execPath: process.execPath, sleep: SLEEP_MS, callbacks: true, env };
          return (_require('function-exec-sync') as typeof functionExecSync).apply(null, [execOptions, workerPath, ...args]);
        }
        const fn = _require(workerPath);
        return typeof fn === 'function' ? fn.apply(null, args) : fn;
      }

      // Execute in installed Node
      const execOptions = spawnOptions(cachedInstallResult?.installPath, { execPath: cachedInstallResult?.execPath, sleep: SLEEP_MS, callbacks, env } as SpawnOptions);
      return (_require('function-exec-sync') as typeof functionExecSync).apply(null, [execOptions, workerPath, ...args]);
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

  const { callbacks = true, env = process.env, storagePath } = options;

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
