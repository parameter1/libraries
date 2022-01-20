import { describe, it } from 'mocha';
import { expect } from 'chai';
import { gulpfile } from './index.js';

describe('index.js', () => {
  it('should have the gulpfile export', () => {
    expect(gulpfile).to.be.a('function');
  });
});
