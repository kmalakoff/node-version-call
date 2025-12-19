import bind from './bind.ts';
import type { CallOptions } from './types.ts';

/**
 * Call a function asynchronously in a specific Node version.
 * Installs the version if not already present.
 *
 * @param version - Version spec ('v18.0.0', '>=18', '20')
 * @param workerPath - Path to the file to execute
 * @param options - Execution options
 * @param args - Arguments to pass to the worker. If last arg is a function, it's treated as callback.
 * @returns Promise if no callback, undefined if callback provided
 */
export default function call(version: string, workerPath: string, options?: CallOptions, ...args: unknown[]): unknown {
  return bind(version, workerPath, options)(...args);
}
