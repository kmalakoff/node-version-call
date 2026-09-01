import fs from 'fs';
import Module from 'module';
import { sync as installSync } from 'node-version-install';
import path from 'path';
import semver from 'semver';
import { homedir } from '../compat.js';
const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;
let nodeSemvers = null;
const DEFAULT_STORAGE_PATH = path.join(homedir(), '.nvu');
function findInstalledVersion(version, storagePath) {
    const installedDir = path.join(storagePath, 'installed');
    let dirs;
    try {
        dirs = fs.readdirSync(installedDir);
    } catch  {
        return null;
    }
    const installed = dirs.filter((d)=>d[0] === 'v' && semver.valid(d));
    if (installed.length === 0) return null;
    const match = semver.maxSatisfying(installed, version);
    if (!match) return null;
    const installPath = path.join(installedDir, match);
    const isWindows = process.platform === 'win32';
    const execPath = isWindows ? path.join(installPath, 'node.exe') : path.join(installPath, 'bin', 'node');
    if (!fs.existsSync(execPath)) return null;
    return {
        version: match,
        installPath,
        execPath,
        platform: process.platform
    };
}
function resolveAndInstall(version, installOptions) {
    if (!nodeSemvers) nodeSemvers = _require('node-semvers');
    const semvers = nodeSemvers === null || nodeSemvers === void 0 ? void 0 : nodeSemvers.loadSync();
    const resolved = semvers.resolve(version);
    if (!resolved) {
        throw new Error(`node-version-call: version "${version}" failed to resolve`);
    }
    const targetVersion = Array.isArray(resolved) ? resolved[0] : resolved;
    if (!targetVersion) {
        throw new Error(`node-version-call: version "${version}" resolved to zero versions`);
    }
    const results = installSync(targetVersion, installOptions);
    if (!results || results.length === 0) {
        throw new Error(`node-version-call: failed to install version "${targetVersion}"`);
    }
    return results[0];
}
export default function resolveVersion(version, options) {
    const storagePath = (options === null || options === void 0 ? void 0 : options.storagePath) || DEFAULT_STORAGE_PATH;
    const found = findInstalledVersion(version, storagePath);
    if (found) return {
        execPath: found.execPath,
        installPath: found.installPath
    };
    const installed = resolveAndInstall(version, {
        storagePath
    });
    return {
        execPath: installed.execPath,
        installPath: installed.installPath
    };
}
