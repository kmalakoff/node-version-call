// remove NODE_OPTIONS to not interfere with tests
delete process.env.NODE_OPTIONS;

import assert from 'assert';
import pathKey from 'env-path-key';
import { bind, bindSync } from 'node-version-call';
import path from 'path';
import Pinkie from 'pinkie-promise';
import semver from 'semver';
import url from 'url';

// Promise polyfill for old Node versions
(() => {
  if (typeof global === 'undefined') return;
  const globalPromise = global.Promise;
  before(() => {
    global.Promise = Pinkie;
  });
  after(() => {
    global.Promise = globalPromise;
  });
})();

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, '..', 'data');
const TMP_DIR = path.join(__dirname, '..', '..', '.tmp');
const OPTIONS = {
  storagePath: path.join(TMP_DIR),
};

// Versions that can be installed (including ranges)
const versions = [process.version, '>0', '>=14', '18', '20', '>=18', '>=20'];

function addTests(fn: (version: string) => () => void) {
  for (let i = 0; i < versions.length; i++) {
    it(`works with version ${versions[i]}`, fn(versions[i]));
  }
}

describe('bindSync', () => {
  describe('returns a callable function', () => {
    it('returns a function', () => {
      const fnPath = path.join(DATA, 'returnArguments.cjs');
      const worker = bindSync(process.version, fnPath, OPTIONS);
      assert.equal(typeof worker, 'function');
    });
  });

  describe('local execution (version === process.version)', () => {
    it('calls the worker with arguments', () => {
      const fnPath = path.join(DATA, 'returnArguments.cjs');
      const worker = bindSync(process.version, fnPath, { ...OPTIONS });
      const result = worker('arg1', 'arg2');
      assert.deepEqual(result, ['arg1', 'arg2']);
    });
  });

  describe('execution with callbacks option', () => {
    addTests((version) => () => {
      const fnPath = path.join(DATA, 'callbacks.cjs');
      const PATH_KEY = pathKey();
      // Worker uses callback style, but bindSync returns result sync
      const worker = bindSync(version, fnPath, { callbacks: true, env: { [PATH_KEY]: process.env[PATH_KEY] }, ...OPTIONS });
      const result = worker('test-value');
      assert.equal(result, 'test-value');
    });
  });

  describe('error handling', () => {
    it('throws errors synchronously', () => {
      const fnPath = path.join(DATA, 'throwError.cjs');
      const worker = bindSync(process.version, fnPath, { ...OPTIONS });

      try {
        worker();
        assert.ok(false, 'Should have thrown');
      } catch (err) {
        assert.equal((err as Error).message, 'boom');
      }
    });

    it('throws when no matching Node version', () => {
      const fnPath = path.join(DATA, 'processVersion.cjs');
      const worker = bindSync('>=9999', fnPath, { ...OPTIONS });

      try {
        worker();
        assert.ok(false, 'Should have thrown');
      } catch (err) {
        assert.ok(err);
      }
    });
  });

  describe('default options', () => {
    it('defaults callbacks to false', () => {
      const fnPath = path.join(DATA, 'processVersion.cjs');
      const worker = bindSync(process.version, fnPath);
      const result = worker() as string;
      assert.equal(result, process.version);
    });

    it('defaults env to process.env', () => {
      const fnPath = path.join(DATA, 'envCheckSync.cjs');
      process.env.TEST_ENV_VAR = 'from-process-env';
      const worker = bindSync(process.version, fnPath);
      const result = worker() as string;
      assert.equal(result, 'from-process-env');
      delete process.env.TEST_ENV_VAR;
    });
  });

  describe('spawnOptions', () => {
    it('defaults spawnOptions to true', () => {
      const fnPath = path.join(DATA, 'processVersion.cjs');
      const worker = bindSync(process.version, fnPath, { ...OPTIONS });
      const result = worker() as string;
      assert.equal(result, process.version);
    });

    it('works with spawnOptions: false', () => {
      const fnPath = path.join(DATA, 'processVersion.cjs');
      const worker = bindSync(process.version, fnPath, { spawnOptions: false, ...OPTIONS });
      const result = worker() as string;
      assert.equal(result, process.version);
    });

    it('spawnOptions ensures child processes use correct Node version', () => {
      const fnPath = path.join(DATA, 'childProcessVersion.cjs');
      const worker = bindSync('18', fnPath, { ...OPTIONS });
      const result = worker() as { workerVersion: string; childVersion: string };
      // Worker and child should both be v18
      assert.equal(result.workerVersion, result.childVersion);
      assert.ok(semver.satisfies(result.workerVersion, '18'), `${result.workerVersion} should satisfy 18`);
    });
  });

  describe('version is bound at bind time', () => {
    it('does not require version at call time', () => {
      const fnPath = path.join(DATA, 'returnArguments.cjs');
      // Version bound at bind time
      const worker = bindSync(process.version, fnPath, { ...OPTIONS });
      // No version passed at call time
      const result = worker('only', 'args');
      assert.deepEqual(result, ['only', 'args']);
    });
  });

  describe('caches install on first call', () => {
    it('installs once, uses cache for subsequent calls', () => {
      const fnPath = path.join(DATA, 'processVersion.cjs');
      const worker = bindSync('18', fnPath, { ...OPTIONS });

      // First call - installs
      const result1 = worker() as string;
      assert.ok(result1.indexOf('v18') === 0);

      // Second call - uses cache
      const result2 = worker() as string;
      assert.equal(result1, result2);
    });
  });
});

describe('bind (async)', () => {
  describe('returns a callable function', () => {
    it('returns a function', () => {
      const fnPath = path.join(DATA, 'returnArguments.cjs');
      const worker = bind(process.version, fnPath, OPTIONS);
      assert.equal(typeof worker, 'function');
    });
  });

  describe('local execution with callback', () => {
    it('calls the worker with arguments', () => {
      const fnPath = path.join(DATA, 'returnArguments.cjs');
      const worker = bind(process.version, fnPath, { ...OPTIONS });
      let called = false;
      worker('arg1', 'arg2', (err: unknown, result: unknown) => {
        called = true;
        assert.equal(err, null);
        assert.deepEqual(result, ['arg1', 'arg2']);
      });
      assert.equal(called, true);
    });
  });

  describe('local execution with Promise', () => {
    it('calls the worker with arguments', async () => {
      const fnPath = path.join(DATA, 'returnArguments.cjs');
      const worker = bind(process.version, fnPath, { ...OPTIONS });
      const result = await worker('arg1', 'arg2');
      assert.deepEqual(result, ['arg1', 'arg2']);
    });
  });

  describe('error handling with callback', () => {
    it('passes errors to callback', () => {
      const fnPath = path.join(DATA, 'throwError.cjs');
      const worker = bind(process.version, fnPath, { ...OPTIONS });
      let called = false;
      worker((err: unknown, result: unknown) => {
        called = true;
        assert.ok(err);
        assert.equal((err as Error).message, 'boom');
        assert.equal(result, undefined);
      });
      assert.equal(called, true);
    });
  });

  describe('error handling with Promise', () => {
    it('rejects Promise on error', async () => {
      const fnPath = path.join(DATA, 'throwError.cjs');
      const worker = bind(process.version, fnPath, { ...OPTIONS });
      try {
        await worker();
        assert.ok(false, 'Should have thrown');
      } catch (err) {
        assert.equal((err as Error).message, 'boom');
      }
    });
  });

  describe('version not found with callback', () => {
    it('passes error to callback', () => {
      const fnPath = path.join(DATA, 'processVersion.cjs');
      const worker = bind('>=9999', fnPath, { ...OPTIONS });
      let called = false;
      worker((err: unknown, result: unknown) => {
        called = true;
        assert.ok(err);
        assert.equal(result, undefined);
      });
      assert.equal(called, true);
    });
  });

  describe('version not found with Promise', () => {
    it('rejects Promise', async () => {
      const fnPath = path.join(DATA, 'processVersion.cjs');
      const worker = bind('>=9999', fnPath, { ...OPTIONS });
      try {
        await worker();
        assert.ok(false, 'Should have thrown');
      } catch (err) {
        assert.ok(err);
      }
    });
  });

  describe('caches install on first call', () => {
    it('installs once, uses cache for subsequent calls', async () => {
      const fnPath = path.join(DATA, 'processVersion.cjs');
      const worker = bind('18', fnPath, { ...OPTIONS });

      // First call - installs
      const result1 = (await worker()) as string;
      assert.ok(result1.indexOf('v18') === 0);

      // Second call - uses cache
      const result2 = (await worker()) as string;
      assert.equal(result1, result2);
    });
  });
});
