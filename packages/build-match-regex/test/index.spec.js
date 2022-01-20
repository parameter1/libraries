import { describe, it } from 'mocha';
import { expect } from 'chai';
import buildMatchRegex from '../src/index.js';

describe('index.js', () => {
  it('should have the default export', () => {
    expect(buildMatchRegex).to.be.a('function');
    expect(buildMatchRegex({ phrase: 'foo' })).to.be.an.instanceOf(RegExp);
  });
});
