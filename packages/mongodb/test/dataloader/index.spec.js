import { describe, it } from 'mocha';
import { expect } from 'chai';
import MongoDBDataLoader from '../../src/dataloader/index.js';

describe('dataloader/index.js', () => {
  it('should have the MongoDBDataLoader default export', () => {
    expect(MongoDBDataLoader).to.be.a('function');
    expect(() => {
      const loader = new MongoDBDataLoader();
      return loader;
    }).to.throw(Error, 'No MongoDB collection was provided.');
  });
});
