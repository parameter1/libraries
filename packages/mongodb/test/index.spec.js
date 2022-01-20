import { describe, it } from 'mocha';
import { expect } from 'chai';
import {
  ObjectId,
  MongoDBClient,
  ManagedRepo,
  RepoManager,
  Repo,
  filterMongoURL,
  iterateMongoCursor,
  MongoDBDataLoader,
} from '../src/index.js';

describe('index.js', () => {
  it('should have the ObjectId export', () => {
    expect(ObjectId).to.be.a('function');
  });
  it('should have the MongoDBClient export', () => {
    expect(MongoDBClient).to.be.a('function');
  });
  it('should have the ManagedRepo export', () => {
    expect(ManagedRepo).to.be.a('function');
  });
  it('should have the RepoManager export', () => {
    expect(RepoManager).to.be.a('function');
  });
  it('should have the Repo export', () => {
    expect(Repo).to.be.a('function');
  });
  it('should have the filterMongoURL export', () => {
    expect(filterMongoURL).to.be.a('function');
  });
  it('should have the iterateMongoCursor export', () => {
    expect(iterateMongoCursor).to.be.a('function');
  });
  it('should have the MongoDBDataLoader export', () => {
    expect(MongoDBDataLoader).to.be.a('function');
  });
});
