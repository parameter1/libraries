const { describe, it } = require('mocha');
const { expect } = require('chai');
const index = require('../../src/utils');

describe('utils/index.js', () => {
  it('should export all utilities', async () => {
    const keys = [
      'filterUri',
      'iterateCursor',
    ];
    expect(index).to.have.all.keys(...keys);
  });
});
