const { describe, it } = require('mocha');
const { expect } = require('chai');
const isFn = require('../src/is-function');

describe('is-function.js', () => {
  it('should return false when provided null or undefined', async () => {
    expect(isFn()).to.be.false;
    expect(isFn(null)).to.be.false;
    expect(isFn(NaN)).to.be.false;
  });
  it('should return false when provided a non-function', async () => {
    expect(isFn('')).to.be.false;
    expect(isFn(0)).to.be.false;
    expect(isFn({})).to.be.false;
    expect(isFn([])).to.be.false;
  });
  it('should return true with a function value', async () => {
    const fn1 = () => {};
    const fn2 = function() {};
    expect(isFn(fn1)).to.be.true;
    expect(isFn(fn2)).to.be.true;
    expect(isFn(new Function())).to.be.true;
  });
});
