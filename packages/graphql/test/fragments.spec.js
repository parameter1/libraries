import { describe, it } from 'mocha';
import { expect } from 'chai';
import { extractFragmentName, extractFragmentData } from '@parameter1/graphql/fragments';

describe('fragments.js', () => {
  it('should have the extractFragmentName export', () => {
    expect(extractFragmentName).to.be.a('function');
  });
  it('should have the extractFragmentData export', () => {
    expect(extractFragmentData).to.be.a('function');
  });
});
