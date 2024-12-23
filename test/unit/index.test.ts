// remove NODE_OPTIONS from ts-dev-stack
// biome-ignore lint/performance/noDelete: <explanation>
delete process.env.NODE_OPTIONS;

import assert from 'assert';
import isVersion from 'is-version';
import keys from 'lodash.keys';
import call from 'node-version-call';
import rimraf2 from 'rimraf2';

import path from 'path';
import url from 'url';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const DATA = path.resolve(__dirname, '..', 'data');
const TMP = path.resolve(__dirname, '..', '..', '.tmp');

const versions = ['local', '0.8.28', '12', '18', 'lts'];
function addTests(fn) {
  for (let i = 0; i < versions.length; i++) {
    it(`can call on ${versions[i]}`, fn(versions[i]));
  }
}

describe('node-version-call', function () {
  this.timeout(600000);
  this.beforeAll(rimraf2.bind(null, TMP, { disableGlob: true }));
  // this.afterAll(rimraf2.bind(null, TMP, { disableGlob: true }));

  describe('callbacks', () => {
    addTests((version) => () => {
      const fnPath = path.join(DATA, 'callbacks.cjs');
      const result = call({ version, callbacks: true, installDir: TMP }, fnPath, 'arg1');
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
      const result = call(version, fnPath);

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
          assert.ok(result.slice(1).startsWith(version));
          break;
      }
    });
  });

  describe('return arguments', () => {
    addTests((version) => () => {
      const args = [
        { field2: 1 },
        1,
        function hey() {
          return null;
        },
        new URL('https://hello.com'),
        new Map(),
        new Set(),
      ];
      const fnPath = path.join(DATA, 'returnArguments.cjs');
      const result = call(version, fnPath, ...args);
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
});
