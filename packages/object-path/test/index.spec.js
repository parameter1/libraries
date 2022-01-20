import { describe, it } from 'mocha';
import { expect } from 'chai';
import {
  get,
  getAsArray,
  getAsObject,
  set,
  wrap,
} from '../src/index.js';

describe('index.js', () => {
  it('should have the get export', () => {
    expect(get).to.be.a('function');
  });
  it('should have the getAsArray export', () => {
    expect(getAsArray).to.be.a('function');
  });
  it('should have the getAsObject export', () => {
    expect(getAsObject).to.be.a('function');
  });
  it('should have the set export', () => {
    expect(set).to.be.a('function');
  });
  it('should have the wrap export', () => {
    expect(wrap).to.be.a('function');
  });
});
