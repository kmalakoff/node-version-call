import pathKey from 'env-path-key';
import fs from 'fs';
import type functionExecSync from 'function-exec-sync';
import Module from 'module';
import type { InstallOptions, InstallResult } from 'node-version-install';
import { sync as installSync } from 'node-version-install';
import { type SpawnOptions, spawnOptions } from 'node-version-utils';
import os from 'os';
import path from 'path';
import semver from 'semver';

import type { BindOptions, BoundCaller, CallerCallback, CallOptions, VersionInfo, WrapOptions, Wrapper } from './types.ts';

export type * from './types.ts';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;
const SLEEP_MS = 60;

// Compat: os.homedir() doesn't exist in Node 0.8
function homedir(): string {
  if (typeof os.homedir === 'function') return os.homedir();
  return _require('homedir-polyfill')();
}

const DEFAULT_STORAGE_PATH = path.join(homedir(), '.nvu', 'installed');

let wrapDeprecationWarned = false;

/**
 * Find an installed version that satisfies the semver constraint.
 * Returns the InstallResult if found, null otherwise.
 */
function findInstalledVersion(version: string, storagePath?: string): InstallResult | null {
  const storage = storagePath || DEFAULT_STORAGE_PATH;

  // Check if current process satisfies
  if (version === process.version || semver.satisfies(process.version, version)) {
    return null; // Signal to use local execution
  }

  // List installed versions
  let dirs: string[];
  try {
    dirs = fs.readdirSync(storage);
  } catch {
    return null; // Storage doesn't exist yet
  }

  // Filter to valid version directories
  const installed = dirs.filter((d) => d[0] === 'v' && semver.valid(d));
  if (installed.length === 0) return null;

  // Find best matching version
  const match = semver.maxSatisfying(installed, version);
  if (!match) return null;

  // Build InstallResult
  const installPath = path.join(storage, match);
  const isWindows = process.platform === 'win32';
  const execPath = isWindows ? path.join(installPath, 'node.exe') : path.join(installPath, 'bin', 'node');

  // Verify it exists
  if (!fs.existsSync(execPath)) return null;

  return { version: match, installPath, execPath, platform: process.platform };
}

/**
 * Resolve a semver constraint to a single version and install it.
 * Uses node-semvers to find the best matching version, then installs.
 */
function resolveAndInstall(version: string, installOptions: InstallOptions): InstallResult {
  // Load available versions and find the best match
  const nodeSemvers = _require('node-semvers');
  const semvers = nodeSemvers.loadSync();
  const resolved = semvers.resolve(version);

  if (!resolved) {
    throw new Error(`node-version-call: version "${version}" failed to resolve`);
  }

  // If resolved to array, pick the first (highest) one
  const targetVersion = Array.isArray(resolved) ? resolved[0] : resolved;
  if (!targetVersion) {
    throw new Error(`node-version-call: version "${version}" resolved to zero versions`);
  }

  // Install the specific version
  const results = installSync(targetVersion, installOptions);
  if (!results || results.length === 0) {
    throw new Error(`node-version-call: failed to install version "${targetVersion}"`);
  }

  return results[0];
}

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
  const installOptions = opts.storagePath ? { storagePath: opts.storagePath } : ({} as InstallOptions);

  // Local execution - current process matches
  if (version === process.version || semver.satisfies(process.version, version)) {
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

  // Check for installed version first
  let result = findInstalledVersion(version, opts.storagePath);

  // If not installed, resolve and install
  if (!result) {
    result = resolveAndInstall(version, installOptions);
  }

  const functionExec = _require('function-exec-sync') as typeof functionExecSync;

  if (useSpawnOptions) {
    const execOptions = spawnOptions(result.installPath, { execPath: result.execPath, sleep: SLEEP_MS, callbacks, env } as SpawnOptions);
    return functionExec.apply(null, [execOptions, workerPath, ...args]);
  }

  const execOptions = { execPath: result.execPath, sleep: SLEEP_MS, callbacks, env };
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
        isLocal = version === process.version || semver.satisfies(process.version, version);
        if (!isLocal) {
          // Check for installed version first
          cachedInstallResult = findInstalledVersion(version, opts.storagePath);

          // If not installed, resolve and install
          if (!cachedInstallResult) {
            cachedInstallResult = resolveAndInstall(version, installOptions);
          }
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
      const functionExec = _require('function-exec-sync') as typeof functionExecSync;

      if (useSpawnOptions) {
        const execOptions = spawnOptions(cachedInstallResult?.installPath, { execPath: cachedInstallResult?.execPath, sleep: SLEEP_MS, callbacks, env } as SpawnOptions);
        return functionExec.apply(null, [execOptions, workerPath, ...args]);
      }

      const execOptions = { execPath: cachedInstallResult?.execPath, sleep: SLEEP_MS, callbacks, env };
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
