import { describe, it } from 'mocha';
import { expect } from 'chai';
import {
  Kind,
  GraphQLScalarType,
} from '../src/index.js';

describe('index.js', () => {
  it('should have the Kind export', () => {
    expect(Kind).to.be.an('object');
  });
  it('should have the GraphQLScalarType export', () => {
    expect(GraphQLScalarType).to.be.a('function');
  });
});
