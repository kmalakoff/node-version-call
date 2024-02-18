import assert from 'assert';
import call from 'node-version-call';

describe('exports .mjs', () => {
  it('defaults', () => {
    assert.equal(typeof call, 'function');
  });
});
