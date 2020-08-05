const { describe, it } = require('mocha');
const { expect } = require('chai');
const filterUri = require('../../src/utils/filter-uri');

describe('utils/filter-uri.js', () => {
  it('should return the filtered uri', async () => {
    const auth = { username: 'foo', password: 'bar' };
    const client = { s: { url: 'mongodb://foo:bar@mongodb-primary:27017', options: { auth } } };
    const value = filterUri(client);
    expect(value).to.equal('mongodb://*****:*****@mongodb-primary:27017');
  });

  it('should return the uri as-is when no auth object', async () => {
    const client = { s: { url: 'mongodb://mongodb-primary:27017', options: { } } };
    const value = filterUri(client);
    expect(value).to.equal('mongodb://mongodb-primary:27017');
  });

  it('should return the uri as-is when username is not present', async () => {
    const auth = { password: 'bar' };
    const client = { s: { url: 'mongodb://mongodb-primary:27017', options: { auth } } };
    const value = filterUri(client);
    expect(value).to.equal('mongodb://mongodb-primary:27017');
  });

  it('should return the uri as-is when password is not present', async () => {
    const auth = { username: 'foo' };
    const client = { s: { url: 'mongodb://mongodb-primary:27017', options: { auth } } };
    const value = filterUri(client);
    expect(value).to.equal('mongodb://mongodb-primary:27017');
  });
});
