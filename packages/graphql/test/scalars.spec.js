import { describe, it } from 'mocha';
import { expect } from 'chai';
import { GraphQLDateTime, GraphQLMonth, GraphQLObjectId } from '@parameter1/graphql/scalars';

describe('fragments.js', () => {
  it('should have the GraphQLDateTime export', () => {
    expect(GraphQLDateTime.name).to.equal('DateTime');
  });
  it('should have the GraphQLMonth export', () => {
    expect(GraphQLMonth).to.be.a('function');
    expect(GraphQLMonth().name).to.equal('Month');
  });
  it('should have the GraphQLObjectId export', () => {
    expect(GraphQLObjectId).to.be.a('function');
    expect(GraphQLObjectId().name).to.equal('ObjectID');
  });
});
