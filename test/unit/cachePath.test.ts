// remove NODE_OPTIONS to not interfere with tests
delete process.env.NODE_OPTIONS;

import assert from 'assert';
import fs from 'fs';
import { callSync } from 'node-version-call';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, '..', 'data');
const TMP_DIR = path.join(__dirname, '..', '..', '.tmp');
const CACHE_DIR = path.join(__dirname, '..', '..', '.cache', 'node-install-release');
// a fresh folder per run, so the install is always a real one (fs.rmSync does not exist on old Node)
const STORAGE_DIR = path.join(TMP_DIR, `cache-path-storage-${process.pid}-${Date.now()}`);

function cleanup() {
  if (typeof fs.rmSync === 'function') fs.rmSync(STORAGE_DIR, { recursive: true, force: true });
}

describe('cachePath option', () => {
  after(cleanup);

  it('installs from the archive already in the given cache folder', () => {
    // both versions are already in the cache folder, so nothing is downloaded;
    // a version other than the running one, because the running one is never installed
    const version = process.version === 'v12.22.12' ? '0.8.28' : '12.22.12';
    const before = fs.readdirSync(CACHE_DIR).sort();
    assert.ok(before.some((name) => name.indexOf(`node-v${version}-`) === 0));

    const result = callSync(version, path.join(DATA, 'returnArguments.cjs'), { storagePath: STORAGE_DIR, cachePath: CACHE_DIR }, 'arg1');
    assert.deepEqual(result, ['arg1']);

    assert.ok(fs.existsSync(path.join(STORAGE_DIR, 'installed', `v${version}`)));
    assert.deepEqual(fs.readdirSync(CACHE_DIR).sort(), before);
  });
});
