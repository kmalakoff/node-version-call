// remove NODE_OPTIONS to not interfere with tests
delete process.env.NODE_OPTIONS;

import assert from 'assert';
import fs from 'fs';
import { safeRmSync } from 'fs-remove-compat';
import { callSync } from 'node-version-call';
import path from 'path';
import url from 'url';
import { CACHE_DIR } from '../lib/constants.ts';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, '..', 'data');
const TMP_DIR = path.join(__dirname, '..', '..', '.tmp');
// a fresh folder per run, so the install is always a real one
const STORAGE_DIR = path.join(TMP_DIR, `cache-path-storage-${process.pid}-${Date.now()}`);
const SEED_DIR = path.join(TMP_DIR, `cache-path-seed-${process.pid}-${Date.now()}`);

function cleanup() {
  safeRmSync(STORAGE_DIR);
  safeRmSync(SEED_DIR);
}

describe('cachePath option', () => {
  after(cleanup);

  it('installs from the archive already in the given cache folder', () => {
    // a version other than the running one, because the running one is never installed
    const version = process.version === 'v12.22.12' ? '0.8.28' : '12.22.12';
    const data = path.join(DATA, 'returnArguments.cjs');

    // the first install puts the archive in the cache folder (a clean checkout has none); the second must reuse it
    callSync(version, data, { storagePath: SEED_DIR, cachePath: CACHE_DIR }, 'arg1');
    const before = fs.readdirSync(CACHE_DIR).sort();
    // 0.8.x on Windows is cached as the bare `node-v0.8.28`; every other build carries a platform suffix
    assert.ok(before.some((name) => name === `node-v${version}` || name.indexOf(`node-v${version}-`) === 0));

    const result = callSync(version, data, { storagePath: STORAGE_DIR, cachePath: CACHE_DIR }, 'arg1');
    assert.deepEqual(result, ['arg1']);

    assert.ok(fs.existsSync(path.join(STORAGE_DIR, 'installed', `v${version}`)));
    assert.deepEqual(fs.readdirSync(CACHE_DIR).sort(), before);
  });
});
