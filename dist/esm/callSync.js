import bindSync from './bindSync.js';
/**
 * Call a function synchronously in a specific Node version.
 * Installs the version if not already present.
 *
 * @param version - Version spec ('v18.0.0', '>=18', '20')
 * @param workerPath - Path to the file to execute
 * @param options - Execution options
 * @param args - Arguments to pass to the worker
 * @returns The result from the worker. Throws on error.
 */ export default function callSync(version, workerPath, options, ...args) {
    return bindSync(version, workerPath, options)(...args);
}
