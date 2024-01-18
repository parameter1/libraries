import { describe, it } from 'mocha';
import { expect } from 'chai';
import {
  bootService,
  isFn,
  emitError,
  log,
  wait,
  createTerminus,
  HealthCheckError,
} from '../src/index.js';

describe('index.js', () => {
  it('should have the bootService export', () => {
    // eslint-disable-next-line
    expect(bootService).to.exist;
  });
  it('should export utility functions', () => {
    expect(isFn).to.be.a('function');
    expect(emitError).to.be.a('function');
    expect(log).to.be.a('function');
    expect(wait).to.be.a('function');
  });
  it('should export terminus', () => {
    expect(createTerminus).to.be.a('function');
    expect(HealthCheckError).to.be.a('function');
  });
});
