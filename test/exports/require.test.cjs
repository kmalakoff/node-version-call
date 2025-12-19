const assert = require('assert');
const callDefault = require('node-version-call');
const { call, bind } = require('node-version-call');

describe('exports .cjs', () => {
  it('defaults', () => {
    assert.equal(typeof callDefault, 'function');
  });

  it('named export call is a function', () => {
    assert.equal(typeof call, 'function');
  });

  it('named export bind is a function', () => {
    assert.equal(typeof bind, 'function');
  });
});
