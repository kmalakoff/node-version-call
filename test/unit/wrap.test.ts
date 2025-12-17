// remove NODE_OPTIONS to not interfere with tests
delete process.env.NODE_OPTIONS;

import assert from 'assert';
import pathKey from 'env-path-key';
import { safeRm } from 'fs-remove-compat';
import { wrap } from 'node-version-call';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, '..', 'data');
const TMP_DIR = path.join(__dirname, '..', '..', '.tmp');
const OPTIONS = {
  storagePath: path.join(TMP_DIR),
};

const versions = ['local', process.version, '0.8.28', '12', '18', 'lts'];
function addTests(fn: (version: string) => () => void) {
  for (let i = 0; i < versions.length; i++) {
    it(`works with version ${versions[i]}`, fn(versions[i]));
  }
}

describe('wrap', () => {
  before((cb) => safeRm(TMP_DIR, cb));
  after((cb) => safeRm(TMP_DIR, cb));

  describe('local execution (version === "local")', () => {
    it('calls the worker directly without callback', () => {
      const fnPath = path.join(DATA, 'returnArguments.cjs');
      const worker = wrap(fnPath, OPTIONS);
      const result = worker('local', 'arg1', 'arg2');
      assert.deepEqual(result, ['arg1', 'arg2']);
    });

    it('calls the worker directly when version matches process.version', () => {
      const fnPath = path.join(DATA, 'returnArguments.cjs');
      const worker = wrap(fnPath, OPTIONS);
      const result = worker(process.version, 'arg1', 'arg2');
      assert.deepEqual(result, ['arg1', 'arg2']);
    });
  });

  describe('remote execution with callbacks', () => {
    addTests((version) => () => {
      const isLocal = version === 'local' || version === process.version;
      const fnPath = path.join(DATA, 'callbacks.cjs');
      const PATH_KEY = pathKey();
      const worker = wrap(fnPath, { ...OPTIONS, env: { [PATH_KEY]: process.env[PATH_KEY] } });

      if (isLocal) {
        // Local execution returns directly
        const result = worker(version, 'test-value', (err: unknown, res: unknown) => {
          assert.equal(err, null);
          assert.equal(res, 'test-value');
        });
        // For local, the callback is called by the worker itself
        assert.equal(result, undefined);
      } else {
        // Remote execution uses callback pattern
        let called = false;
        worker(version, 'test-value', (err: unknown, res: unknown) => {
          called = true;
          assert.equal(err, null);
          assert.equal(res, 'test-value');
        });
        assert.equal(called, true);
      }
    });
  });

  describe('error handling', () => {
    it('passes errors to callback for remote execution', () => {
      const fnPath = path.join(DATA, 'throwError.cjs');
      const worker = wrap(fnPath, OPTIONS);

      let errorCaught = false;
      worker('12', (err: unknown) => {
        errorCaught = true;
        assert.ok(err);
        assert.equal((err as Error).message, 'boom');
      });
      assert.equal(errorCaught, true);
    });
  });

  describe('default options', () => {
    it('defaults callbacks to true', () => {
      const fnPath = path.join(DATA, 'callbacks.cjs');
      const worker = wrap(fnPath);
      // Should work with callbacks enabled by default
      const result = worker('local', 'value', (err: unknown, res: unknown) => {
        assert.equal(err, null);
        assert.equal(res, 'value');
      });
      assert.equal(result, undefined);
    });

    it('defaults env to process.env', () => {
      const fnPath = path.join(DATA, 'envCheck.cjs');
      process.env.TEST_ENV_VAR = 'from-process-env';
      const worker = wrap(fnPath);
      // envCheck.cjs expects a callback - it calls callback(null, process.env.TEST_ENV_VAR)
      worker('local', (err: unknown, result: unknown) => {
        assert.equal(err, null);
        assert.equal(result, 'from-process-env');
      });
      delete process.env.TEST_ENV_VAR;
    });
  });
});
