import { describe, it } from 'mocha';
import { expect } from 'chai';
import {
  jsonClient,
  jsonServer,
  micro,
} from '../src/index.js';

describe('index.js', () => {
  it('should have the jsonClient export', () => {
    expect(jsonClient).to.be.a('function');
    expect(jsonClient({ url: 'http://foo.com' })).to.be.an('object');
  });
  it('should have the jsonServer export', () => {
    expect(jsonServer).to.be.a('function');
  });
  it('should have the micro export', () => {
    expect(micro).to.be.a('function');
    expect(micro.send).to.be.a('function');
  });
});
