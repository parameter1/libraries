/* eslint-disable import/no-extraneous-dependencies, no-unused-expressions */
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { createPath } from '../src/index.js';

describe('createPath', () => {
  it('should be a function', () => expect(createPath).to.a('function'));

  it('should throw an error when value is not an array', () => {
    expect(() => {
      createPath();
    }).to.throw();
    expect(() => {
      createPath('foo');
    }).to.throw();
  });

  it('should not throw when the value is an array', () => {
    expect(() => {
      createPath([]);
    }).to.not.throw();
  });

  it('should convert empty arrays to null', () => {
    expect(createPath([])).to.be.null;
  });

  it('should convert arrays with empty-like values to null', () => {
    expect(createPath([
      '',
      null,
      undefined,
      '     ',
      '---- ---',
    ])).to.be.null;
  });

  it('should convert into a path using the default seperator', () => {
    expect(createPath([
      '',
      null,
      'Foo Is nice',
      'Bar/Stool/',
      undefined,
      '     ',
      '--Baz',
      '---- ---',
    ])).to.equal('foo-is-nice/bar-stool/baz');
  });

  it('should convert into a path using an alternate seperator', () => {
    expect(createPath([
      '',
      null,
      'Foo Is nice ',
      'Bar',
      undefined,
      '     ',
      '--Baz',
      '---- ---',
    ], '_')).to.equal('foo-is-nice_bar_baz');
  });
});
