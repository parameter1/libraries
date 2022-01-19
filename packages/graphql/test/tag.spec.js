import { describe, it } from 'mocha';
import { expect } from 'chai';
import { gql } from '@parameter1/graphql/tag';

describe('tag.js', () => {
  it('should have the gql export', () => {
    expect(gql).to.be.a('function');
    const doc = gql`query { ping }`;
    expect(doc).to.be.an('object');
    expect(doc.kind).to.equal('Document');
  });
});
