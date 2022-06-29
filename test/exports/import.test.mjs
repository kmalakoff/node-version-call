import assert from 'assert';
import call from 'node-version-call';

describe('exports .mjs', function () {
  it('defaults', function () {
    assert.equal(typeof call, 'function');
  });
});
