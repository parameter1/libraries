/* eslint-disable import/no-extraneous-dependencies, no-unused-expressions */
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { sluggify } from '../src/index.js';

describe('sluggify', () => {
  it('should be a function', () => expect(sluggify).to.a('function'));

  it('should convert null value to null', () => {
    expect(sluggify(null)).to.be.null;
  });

  it('should convert NaN to null', () => {
    expect(sluggify(Number.NaN)).to.be.null;
    expect(sluggify(NaN)).to.be.null;
  });

  it('should convert undefined value to null', () => {
    expect(sluggify()).to.be.null;
    expect(sluggify(undefined)).to.be.null;
  });

  it('should convert empty string value to null', () => {
    expect(sluggify('')).to.be.null;
  });

  it('should throw an error when value is an object or an array', () => {
    expect(() => {
      sluggify({});
    }).to.throw();
    expect(() => {
      sluggify([]);
    }).to.throw();
  });

  it('should throw an error when value is a function', () => {
    expect(() => {
      sluggify(() => {});
    }).to.throw();
  });

  it('should convert strings with only spaces to null', () => {
    expect(sluggify(' ')).to.be.null;
    expect(sluggify('  ')).to.be.null;
  });

  it('should convert numbers to strings', () => {
    expect(sluggify(1)).to.eq('1');
    expect(sluggify(0)).to.eq('0');
    expect(sluggify(-1)).to.eq('1');
  });

  it('should trim whitepace', () => {
    expect(sluggify('  foo   ')).to.eq('foo');
    expect(sluggify(' foo ')).to.eq('foo');
  });

  it('should not allow repetitive dashes', () => {
    expect(sluggify('foo--bar')).to.eq('foo-bar');
    expect(sluggify('Foo     Bar   /  Baz')).to.eq('foo-bar-baz');
  });

  it('should not allow leading and trailing dashes', () => {
    expect(sluggify('--Foo   Bar-- ')).to.eq('foo-bar');
    expect(sluggify(' - -Foo   Bar- - ')).to.eq('foo-bar');
  });

  it('should convert all dashes to null', () => {
    expect(sluggify('-')).to.be.null;
    expect(sluggify('--')).to.be.null;
    expect(sluggify('-- \\ / ----  -')).to.be.null;
  });
});
