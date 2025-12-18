import assert from 'assert';

import call, { bind, wrap } from 'node-version-call';

describe('exports .ts', () => {
  it('default export is call function', () => {
    assert.equal(typeof call, 'function');
  });

  it('named export bind is a function', () => {
    assert.equal(typeof bind, 'function');
  });

  it('named export wrap is a function (deprecated)', () => {
    assert.equal(typeof wrap, 'function');
  });
});
