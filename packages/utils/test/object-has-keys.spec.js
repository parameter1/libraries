const { describe, it } = require('mocha');
const { expect } = require('chai');
const objectHasKeys = require('../src/object-has-keys');

describe('object-has-keys.js', () => {
  it('should return false when provided null or undefined', async () => {
    expect(objectHasKeys()).to.be.false;
    expect(objectHasKeys(null)).to.be.false;
    expect(objectHasKeys(NaN)).to.be.false;
  });
  it('should return false when provided an empty object', async () => {
    expect(objectHasKeys({})).to.be.false;
    expect(objectHasKeys([])).to.be.false;
    expect(objectHasKeys('')).to.be.false;
  });
  it('should return true when a key exists', async () => {
    expect(objectHasKeys({ foo: '' })).to.be.true;
  });
});
