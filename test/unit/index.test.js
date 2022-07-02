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
  describe('process result', function () {
    addTests(function (version) {
      return function () {
        this.timeout(5000);
        const processVersion = path.join(DATA, 'processVersion.js');
        const result = call(processVersion, version);
        if (version === 'local') assert.equal(result, process.version);
        else if (version === 'lts') {
          assert.equal(result[0], 'v');
          assert.ok(isVersion(result.slice(1)));
        } else assert.equal(result, 'v' + version);
      };
    });
  });
  describe('arguments', function () {
    addTests(function (version) {
      return function () {
        this.timeout(5000);
        const args = [{ field2: 1 }, 1];
        const returnArguments = path.join(DATA, 'returnArguments.js');
        const result = call(returnArguments, version, { args });
        assert.equal(JSON.stringify(result), JSON.stringify(args));
      };
    });
  });
  describe('no export', function () {
    addTests(function (version) {
      return function () {
        this.timeout(5000);
        const noExport = path.join(DATA, 'noExport.js');
        const result = call(noExport, version);
        assert.ok(result);
        assert.equal(keys(result).length, 0);
      };
    });
  });
  describe('errors', function () {
    addTests(function (version) {
      return function () {
        this.timeout(5000);
        const noExport = path.join(DATA, 'throwError.js');
        try {
          call(noExport, version);
          assert.ok(false);
        } catch (err) {
          assert.equal(err.message, 'boom');
        }
      };
    });
  });
});
