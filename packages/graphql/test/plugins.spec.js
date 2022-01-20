import { describe, it } from 'mocha';
import { expect } from 'chai';
import {
  CloseFastifyPlugin,
  OnShutdownPlugin,
  OperationProfilerPlugin,

  isIntrospectionQuery,
  isQueryOperation,
} from '@parameter1/graphql/plugins';

describe('plugins/index.js', () => {
  it('should have the CloseFastifyPlugin export', () => {
    expect(CloseFastifyPlugin).to.be.a('function');
  });
  it('should have the OnShutdownPlugin export', () => {
    expect(OnShutdownPlugin).to.be.a('function');
  });
  it('should have the OperationProfilerPlugin export', () => {
    expect(OperationProfilerPlugin).to.be.a('function');
  });
  it('should have the isIntrospectionQuery export', () => {
    expect(isIntrospectionQuery).to.be.a('function');
  });
  it('should have the isQueryOperation export', () => {
    expect(isQueryOperation).to.be.a('function');
  });
});
