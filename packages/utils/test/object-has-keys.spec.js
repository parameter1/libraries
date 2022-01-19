import { describe, it } from 'mocha';
import { expect } from 'chai';
import objectHasKeys from '../src/object-has-keys.js';

describe('object-has-keys.js', () => {
  it('should return false when provided null or undefined', async () => {
    expect(objectHasKeys()).to.equal(false);
    expect(objectHasKeys(null)).to.equal(false);
    expect(objectHasKeys(NaN)).to.equal(false);
  });
  it('should return false when provided an empty object', async () => {
    expect(objectHasKeys({})).to.equal(false);
    expect(objectHasKeys([])).to.equal(false);
    expect(objectHasKeys('')).to.equal(false);
  });
  it('should return true when a key exists', async () => {
    expect(objectHasKeys({ foo: '' })).to.equal(true);
  });
});
