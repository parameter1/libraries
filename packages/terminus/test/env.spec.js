import { describe, it } from 'mocha';
import { expect } from 'chai';
import { TERMINUS_SHUTDOWN_DELAY, TERMINUS_TIMEOUT } from '../src/env.js';

describe('env.js', () => {
  it('should have a default timeout', async () => {
    expect(TERMINUS_TIMEOUT).to.equal(1000);
  });
  it('should have a default shutdown delay', async () => {
    expect(TERMINUS_SHUTDOWN_DELAY).to.equal(0);
  });
});
