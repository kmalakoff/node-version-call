// remove NODE_OPTIONS from ts-dev-stack
delete process.env.NODE_OPTIONS;

import assert from 'assert';
import { safeRm } from 'fs-remove-compat';
import isVersion from 'is-version';
import keys from 'lodash.keys';
import call from 'node-version-call';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, '..', 'data');
const TMP_DIR = path.join(__dirname, '..', '..', '.tmp');
const OPTIONS = {
  storagePath: path.join(TMP_DIR),
};

const versions = ['local', '0.8.28', '12', '18', 'lts'];
function addTests(fn) {
  for (let i = 0; i < versions.length; i++) {
    it(`can call on ${versions[i]}`, fn(versions[i]));
  }
}

describe('node-version-call', () => {
  before((cb) => safeRm(TMP_DIR, cb));
  after((cb) => safeRm(TMP_DIR, cb));

  describe('callbacks', () => {
    addTests((version) => () => {
      const fnPath = path.join(DATA, 'callbacks.cjs');
      const result = call({ version, callbacks: true, ...OPTIONS }, fnPath, 'arg1');
      assert.equal(result, 'arg1');
    });
  });

  describe('no export', () => {
    addTests((version) => () => {
      const fnPath = path.join(DATA, 'noExport.cjs');
      const result = call(version, fnPath);
      assert.equal(keys(result).length, 0);
    });
  });

  describe('process version', () => {
    addTests((version) => () => {
      const fnPath = path.join(DATA, 'processVersion.cjs');
      const result = call({ version, ...OPTIONS }, fnPath) as string;

      switch (version) {
        case 'local':
          assert.equal(result, process.version);
          break;
        case 'lts':
          assert.equal(result[0], 'v');
          assert.ok(isVersion(result.slice(1)));
          break;
        default:
          assert.equal(result.indexOf(`v${version}`), 0);
          assert.ok(isVersion(result.slice(1)));
          assert.ok(result.slice(1).indexOf(version) === 0);
          break;
      }
    });
  });

  describe('return arguments', () => {
    addTests((version) => () => {
      const major = version.indexOf('.') >= 0 ? +version.split('.')[0] : +process.versions.node.split('.')[0];

      const args = [
        { field2: 1 },
        1,
        function hey() {
          return null;
        },
        major > 0 ? [typeof URL === 'undefined' ? null : new URL('https://hello.com'), typeof Map === 'undefined' ? null : new Map(), typeof Set === 'undefined' ? null : new Set()] : [],
      ];
      const fnPath = path.join(DATA, 'returnArguments.cjs');
      const result = call({ version, ...OPTIONS }, fnPath, ...args);
      assert.equal(JSON.stringify(result), JSON.stringify(args));
    });
  });

  describe('throw error', () => {
    addTests((version) => () => {
      const fnPath = path.join(DATA, 'throwError.cjs');
      try {
        call(version, fnPath);
        assert.ok(false);
      } catch (err) {
        assert.equal(err.message, 'boom');
      }
    });
  });

  describe('env passing', () => {
    addTests((version) => () => {
      const fnPath = path.join(DATA, 'envCheck.cjs');
      const result = call({ version, callbacks: true, env: { TEST_ENV_VAR: 'passed' }, ...OPTIONS }, fnPath);
      assert.equal(result, 'passed');
    });
  });
});
