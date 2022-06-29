const assert = require('assert');
const call = require('node-version-call');
const isVersion = require('is-version');

const path = require('path');
const DATA = path.resolve(__dirname, '..', 'data');

describe('node-version-call', function () {
  describe('process result', function () {
    it('can call on current node', function () {
      const processVersion = path.join(DATA, 'processVersion.js');
      assert.equal(require(processVersion)(), process.version);
    });

    it('can call on node 0.8.28', function () {
      this.timeout(10000);
      const processVersion = path.join(DATA, 'processVersion.js');
      assert.equal(call(processVersion, '0.8.28'), 'v0.8.28');
    });

    it('can call on node lts', function () {
      this.timeout(10000);
      const processVersion = path.join(DATA, 'processVersion.js');
      const result = call(processVersion, 'lts');
      assert.equal(result[0], 'v');
      assert.ok(isVersion(result.slice(1)));
    });
  });
  describe('arguments', function () {
    it('can call on current node', function () {
      const args = [{ field2: 1 }, 1];
      const returnArguments = path.join(DATA, 'returnArguments.js');
      const result = require(returnArguments).apply(null, args);
      assert.equal(JSON.stringify(result), JSON.stringify(args));
    });
    it('can call on node 0.8.28', function () {
      this.timeout(10000);
      const args = [{ field2: 1 }, 1];
      const returnArguments = path.join(DATA, 'returnArguments.js');
      const result = call(returnArguments, '0.8.28', { args });
      assert.equal(JSON.stringify(result), JSON.stringify(args));
    });
    it('can call on node lts', function () {
      this.timeout(10000);
      const args = [{ field2: 1 }, 1];
      const returnArguments = path.join(DATA, 'returnArguments.js');
      const result = call(returnArguments, 'lts', { args });
      assert.equal(JSON.stringify(result), JSON.stringify(args));
    });
  });
});
