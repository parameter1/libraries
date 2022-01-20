import { describe, it } from 'mocha';
import { expect } from 'chai';
import {
  createCursorQuery,
  createEmptyResponse,
  encodeCursor,
  decodeCursor,
  invertSort,

  findWithCursor,
  findWithObjects,
  findWithOffset,
} from '@parameter1/mongodb/pagination';

describe('dataloader/index.js', () => {
  it('should have the createCursorQuery default export', () => {
    expect(createCursorQuery).to.be.a('function');
  });
  it('should have the createEmptyResponse default export', () => {
    expect(createEmptyResponse).to.be.a('function');
  });
  it('should have the encodeCursor default export', () => {
    expect(encodeCursor).to.be.a('function');
  });
  it('should have the decodeCursor default export', () => {
    expect(decodeCursor).to.be.a('function');
  });
  it('should have the invertSort default export', () => {
    expect(invertSort).to.be.a('function');
  });
  it('should have the findWithCursor default export', () => {
    expect(findWithCursor).to.be.a('function');
  });
  it('should have the findWithObjects default export', () => {
    expect(findWithObjects).to.be.a('function');
  });
  it('should have the findWithOffset default export', () => {
    expect(findWithOffset).to.be.a('function');
  });
});
