import { describe, it } from 'mocha';
import { expect } from 'chai';
import {
  arrayDirectiveTransformer,
  connectionProjectDirectiveTransformer,
  deprecatedDirectiveTransformer,
  interfaceFieldsDirectiveTransformer,
  objectDirectiveTransformer,
  projectDirectiveTransformer,
  trimDirectiveTransformer,
} from '@parameter1/graphql/directives';

describe('directives/index.js', () => {
  it('should have the arrayDirectiveTransformer export', () => {
    expect(arrayDirectiveTransformer).to.be.a('function');
  });
  it('should have the connectionProjectDirectiveTransformer export', () => {
    expect(connectionProjectDirectiveTransformer).to.be.a('function');
  });
  it('should have the deprecatedDirectiveTransformer export', () => {
    expect(deprecatedDirectiveTransformer).to.be.a('function');
  });
  it('should have the interfaceFieldsDirectiveTransformer export', () => {
    expect(interfaceFieldsDirectiveTransformer).to.be.a('function');
  });
  it('should have the objectDirectiveTransformer export', () => {
    expect(objectDirectiveTransformer).to.be.a('function');
  });
  it('should have the projectDirectiveTransformer export', () => {
    expect(projectDirectiveTransformer).to.be.a('function');
  });
  it('should have the trimDirectiveTransformer export', () => {
    expect(trimDirectiveTransformer).to.be.a('function');
  });
});
