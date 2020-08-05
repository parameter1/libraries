const { describe, it } = require('mocha');
const { expect } = require('chai');
const cleanPath = require('../src/clean-path');

describe('clean-path.js', () => {
  it('should return an empty string with falsy value', async () => {
    expect(cleanPath('')).to.equal('');
    expect(cleanPath(0)).to.equal('');
    expect(cleanPath()).to.equal('');
    expect(cleanPath(null)).to.equal('');
    expect(cleanPath(NaN)).to.equal('');
    expect(cleanPath(false)).to.equal('');
  });
  it('should return an empty string with a string of spaces', async () => {
    expect(cleanPath('    ')).to.equal('');
  });
  it('should return a trimmed string', async () => {
    expect(cleanPath('  foo   ')).to.equal('foo');
  });
  it('should replace leading and trailing slashes', async () => {
    expect(cleanPath(' ///foo/bar/baz/ ')).to.equal('foo/bar/baz');
    expect(cleanPath('foo/')).to.equal('foo');
    expect(cleanPath('/bar//')).to.equal('bar');
  });
});
