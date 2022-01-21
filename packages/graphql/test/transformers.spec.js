import { describe, it } from 'mocha';
import { expect } from 'chai';
import {
  enumDefaultValuesTransformer,
} from '@parameter1/graphql/transformers';

describe('transformers/index.js', () => {
  it('should have the enumDefaultValuesTransformer export', () => {
    expect(enumDefaultValuesTransformer).to.be.a('function');
  });
});
