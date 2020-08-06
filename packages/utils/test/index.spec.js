const { describe, it } = require('mocha');
const { expect } = require('chai');
const index = require('../src');

describe('index.js', () => {
  it('should export all utilities', async () => {
    const keys = [
      'asArray',
      'asObject',
      'cleanPath',
      'dateToUnix',
      'getAsArray',
      'getAsObject',
      'get',
      'isFunction',
      'isObject',
      'objectHasKeys',
      'set',
      'wait',
    ];
    expect(index).to.have.all.keys(...keys);
  });
});
