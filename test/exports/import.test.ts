const assert = require('assert');
const call = require('node-version-call');

describe('exports .ts', function () {
  it('defaults', function () {
    assert.equal(typeof call, 'function');
  });
});
