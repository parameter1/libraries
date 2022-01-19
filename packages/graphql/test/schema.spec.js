import { describe, it } from 'mocha';
import { expect } from 'chai';
import { makeExecutableSchema } from '@parameter1/graphql/schema';

describe('schema.js', () => {
  it('should have the makeExecutableSchema export', () => {
    expect(makeExecutableSchema).to.be.a('function');
  });
});
