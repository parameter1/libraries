import { describe, it } from 'mocha';
import { expect } from 'chai';
import MongoDBLoader from '../src/index.js';

describe('index.js', () => {
  it('should have the MongoDBLoader default export', () => {
    expect(MongoDBLoader).to.be.a('function');
    expect(() => {
      const loader = new MongoDBLoader();
      return loader;
    }).to.throw(Error, 'No MongoDB collection was provided.');
  });
});
