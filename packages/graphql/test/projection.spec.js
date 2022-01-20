import { describe, it } from 'mocha';
import { expect } from 'chai';
import { getProjectionForConnection, getProjectionForType, getProjection } from '@parameter1/graphql/projection';

describe('projection/index.js', () => {
  it('should have the getProjectionForConnection export', () => {
    expect(getProjectionForConnection).to.be.a('function');
  });
  it('should have the getProjectionForType export', () => {
    expect(getProjectionForType).to.be.a('function');
  });
  it('should have the getProjection export', () => {
    expect(getProjection).to.be.a('function');
  });
});
