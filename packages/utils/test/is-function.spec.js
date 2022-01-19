import { describe, it } from 'mocha';
import { expect } from 'chai';
import isFn from '../src/is-function.js';

describe('is-function.js', () => {
  it('should return false when provided null or undefined', async () => {
    expect(isFn()).to.equal(false);
    expect(isFn(null)).to.equal(false);
    expect(isFn(NaN)).to.equal(false);
  });
  it('should return false when provided a non-function', async () => {
    expect(isFn('')).to.equal(false);
    expect(isFn(0)).to.equal(false);
    expect(isFn({})).to.equal(false);
    expect(isFn([])).to.equal(false);
  });
  it('should return true with a function value', async () => {
    const fn1 = () => {};
    const fn2 = function foo() {};
    expect(isFn(fn1)).to.equal(true);
    expect(isFn(fn2)).to.equal(true);
    // eslint-disable-next-line
    expect(isFn(new Function())).to.equal(true);
  });
});
