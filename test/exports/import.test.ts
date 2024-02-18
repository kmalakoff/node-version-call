const assert = require('assert');
const call = require('node-version-call');

describe('exports .ts', () => {
  it('defaults', () => {
    assert.equal(typeof call, 'function');
  });
});
