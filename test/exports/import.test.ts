import assert from 'assert';

// @ts-ignore
import call from 'node-version-call';

describe('exports .ts', () => {
  it('defaults', () => {
    assert.equal(typeof call, 'function');
  });
});
