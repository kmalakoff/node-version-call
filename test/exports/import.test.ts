import assert from 'assert';
import call from 'node-version-call';

describe('exports .ts', () => {
  it('defaults', () => {
    assert.equal(typeof call, 'function');
  });
});
