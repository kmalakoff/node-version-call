const assert = require('assert');
const call = require('node-version-call');
const isVersion = require('is-version');
const keys = require('lodash.keys');

const path = require('path');
const DATA = path.resolve(__dirname, '..', 'data');

const versions = ['local', '0.8.28', 'lts'];
function addTests(fn) {
  for (let i = 0; i < versions.length; i++) {
    it('can call on ' + versions[i], fn(versions[i]));
  }
}

describe('node-version-call', function () {
  describe('callbacks', function () {
    addTests(function (version) {
      return function () {
        this.timeout(200000);
        const fnPath = path.join(DATA, 'callbacks.js');
        const result = call({ version, callbacks: true }, fnPath, 'arg1');
        assert.equal(result, 'arg1');
      };
    });
  });

  describe('no export', function () {
    addTests(function (version) {
      return function () {
        this.timeout(200000);
        const fnPath = path.join(DATA, 'noExport.js');
        const result = call(version, fnPath);
        assert.equal(keys(result).length, 0);
      };
    });
  });

  describe('process version', function () {
    addTests(function (version) {
      return function () {
        this.timeout(200000);
        const fnPath = path.join(DATA, 'processVersion.js');
        const result = call(version, fnPath);
        if (version === 'local') assert.equal(result, process.version);
        else if (version === 'lts') {
          assert.equal(result[0], 'v');
          assert.ok(isVersion(result.slice(1)));
        } else assert.equal(result, 'v' + version);
      };
    });
  });

  describe('return arguments', function () {
    addTests(function (version) {
      return function () {
        this.timeout(200000);
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
        const fnPath = path.join(DATA, 'returnArguments.js');
        const result = call(version, fnPath, ...args);
        assert.equal(JSON.stringify(result), JSON.stringify(args));
      };
    });
  });

  describe('throw error', function () {
    addTests(function (version) {
      return function () {
        this.timeout(200000);
        const fnPath = path.join(DATA, 'throwError.js');
        try {
          call(version, fnPath);
          assert.ok(false);
        } catch (err) {
          assert.equal(err.message, 'boom');
        }
      };
    });
  });
});
