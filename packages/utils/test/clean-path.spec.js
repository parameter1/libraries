import { describe, it } from 'mocha';
import { expect } from 'chai';
import cleanPath from '../src/clean-path.js';

describe('clean-path.js', () => {
  it('should return an null with empty string or null value', async () => {
    expect(cleanPath('')).to.equal(null);
    expect(cleanPath(null)).to.equal(null);
  });
  it('should return null with a string of spaces', async () => {
    expect(cleanPath('    ')).to.equal(null);
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
