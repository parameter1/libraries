import { describe, it } from 'mocha';
import { expect } from 'chai';
import { mapSchema } from '@parameter1/graphql/utils';

describe('utils.js', () => {
  it('should have the mapSchema export', () => {
    expect(mapSchema).to.be.a('function');
  });
});
