import { describe, it } from 'mocha';
import { expect } from 'chai';
import {
  isEmailBurner,
  isBurnerDomain,
  cleanEmail,
} from '../src/index.js';

describe('index.js', () => {
  it('should have the isEmailBurner export', () => {
    expect(isEmailBurner).to.be.a('function');
  });
  it('should have the isBurnerDomain export', () => {
    expect(isBurnerDomain).to.be.a('function');
  });
  it('should have the cleanEmail export', () => {
    expect(cleanEmail).to.be.a('function');
  });
});
