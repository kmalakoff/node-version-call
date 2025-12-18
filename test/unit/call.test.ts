// remove NODE_OPTIONS to not interfere with tests
delete process.env.NODE_OPTIONS;

import assert from 'assert';
import pathKey from 'env-path-key';
import { safeRm } from 'fs-remove-compat';
import isVersion from 'is-version';
import keys from 'lodash.keys';
import call from 'node-version-call';
import path from 'path';
import semver from 'semver';
import url from 'url';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const DATA = path.join(__dirname, '..', 'data');
const TMP_DIR = path.join(__dirname, '..', '..', '.tmp');
const OPTIONS = {
  storagePath: path.join(TMP_DIR),
};

// Versions that can be installed (including ranges)
const versions = [process.version, '>0', '>=14', '0.8.28', '12', '18', '20', '>=18', '>=20'];
function addTests(fn: (version: string) => () => void) {
  for (let i = 0; i < versions.length; i++) {
    it(`works with version ${versions[i]}`, fn(versions[i]));
  }
}

describe('call', () => {
  before((cb) => safeRm(TMP_DIR, cb));
  after((cb) => safeRm(TMP_DIR, cb));

  describe('callbacks', () => {
    addTests((version) => () => {
      const fnPath = path.join(DATA, 'callbacks.cjs');
      const result = call(version, fnPath, { callbacks: true, ...OPTIONS }, 'arg1');
      assert.equal(result, 'arg1');
    });
  });

  describe('no export', () => {
    addTests((version) => () => {
      const fnPath = path.join(DATA, 'noExport.cjs');
      const result = call(version, fnPath, { callbacks: false, ...OPTIONS });
      assert.equal(keys(result).length, 0);
    });
  });

  describe('process version', () => {
    addTests((version) => () => {
      const fnPath = path.join(DATA, 'processVersion.cjs');
      const result = call(version, fnPath, { callbacks: false, ...OPTIONS }) as string;

      if (version === process.version) {
        assert.equal(result, process.version);
      } else if (version[0] === '>' || version[0] === '<' || version[0] === '^' || version[0] === '~') {
        // For semver ranges, verify result satisfies the range
        assert.equal(result[0], 'v');
        assert.ok(isVersion(result.slice(1)));
        assert.ok(semver.satisfies(result, version), `${result} should satisfy ${version}`);
      } else {
        assert.equal(result.indexOf(`v${version}`), 0);
        assert.ok(isVersion(result.slice(1)));
        assert.ok(result.slice(1).indexOf(version) === 0);
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
      const result = call(version, fnPath, { callbacks: false, ...OPTIONS }, ...args);
      assert.equal(JSON.stringify(result), JSON.stringify(args));
    });
  });

  describe('throw error', () => {
    addTests((version) => () => {
      const fnPath = path.join(DATA, 'throwError.cjs');
      try {
        call(version, fnPath, { callbacks: false, ...OPTIONS });
        assert.ok(false);
      } catch (err) {
        assert.equal((err as Error).message, 'boom');
      }
    });
  });

  describe('env passing', () => {
    addTests((version) => () => {
      const fnPath = path.join(DATA, 'envCheck.cjs');
      const PATH_KEY = pathKey();
      const result = call(version, fnPath, { callbacks: true, env: { TEST_ENV_VAR: 'passed', [PATH_KEY]: process.env[PATH_KEY] }, ...OPTIONS });
      assert.equal(result, 'passed');
    });
  });

  describe('error on version not found', () => {
    it('throws when no matching Node version', () => {
      const fnPath = path.join(DATA, 'processVersion.cjs');
      try {
        call('>=9999', fnPath, { callbacks: false, ...OPTIONS });
        assert.ok(false, 'Should have thrown');
      } catch (err) {
        assert.ok(err);
      }
    });
  });

  describe('spawnOptions', () => {
    it('defaults spawnOptions to true', () => {
      const fnPath = path.join(DATA, 'processVersion.cjs');
      const result = call(process.version, fnPath, { callbacks: false, ...OPTIONS }) as string;
      assert.equal(result, process.version);
    });

    it('works with spawnOptions: false', () => {
      const fnPath = path.join(DATA, 'processVersion.cjs');
      const result = call(process.version, fnPath, { callbacks: false, spawnOptions: false, ...OPTIONS }) as string;
      assert.equal(result, process.version);
    });

    it('spawnOptions ensures child processes use correct Node version', () => {
      const fnPath = path.join(DATA, 'childProcessVersion.cjs');
      const result = call('18', fnPath, { callbacks: false, ...OPTIONS }) as { workerVersion: string; childVersion: string };
      // Worker and child should both be v18
      assert.equal(result.workerVersion, result.childVersion);
      assert.ok(semver.satisfies(result.workerVersion, '18'), `${result.workerVersion} should satisfy 18`);
    });
  });
});
