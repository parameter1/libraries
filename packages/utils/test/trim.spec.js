/* eslint-disable import/no-extraneous-dependencies, no-unused-expressions */
import { describe, it } from 'mocha';
import { expect } from 'chai';
import trim from '../src/trim.js';

describe('trim', () => {
  it('should be a function', () => expect(trim).to.a('function'));
  it('should return null with a null value', () => expect(trim(null)).to.be.null);
  it('should return null with an undefined value', () => expect(trim()).to.be.null);
  it('should return null with an empty string value', () => {
    expect(trim('')).to.be.null;
    expect(trim('   ')).to.be.null;
  });
  it('should return an empty string with an empty value when using a different default', () => expect(trim(null, '')).to.eq(''));
  it('should return null with an object value', () => expect(trim({})).to.be.null);
  it('should return null with an array value', () => expect(trim([])).to.be.null);
  it('should return null with a function value', () => expect(trim(() => {})).to.be.null);
  it('should return null with a NaN value', () => expect(trim(NaN)).to.be.null);
  it('should return numbers and stringified numbers', () => {
    expect(trim(0)).to.eq('0');
    expect(trim(1)).to.eq('1');
    expect(trim(-1)).to.eq('-1');
  });
  it('should trim the string', () => {
    expect(trim(' foo  ')).to.eq('foo');
  });
});
