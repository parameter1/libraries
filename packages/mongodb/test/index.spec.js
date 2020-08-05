const { describe, it } = require('mocha');
const { expect } = require('chai');
const index = require('../src');

describe('index.js', () => {
  it('should exist', async () => expect(index).to.exist);
});
