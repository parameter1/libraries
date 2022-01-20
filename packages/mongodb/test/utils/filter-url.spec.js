import { describe, it } from 'mocha';
import { expect } from 'chai';
import filterUrl from '../../src/utils/filter-url.js';

describe('utils/filter-url.js', () => {
  it('should return the filtered uri', async () => {
    const auth = { username: 'foo', password: 'bar' };
    const client = { s: { url: 'mongodb://foo:bar@mongodb-primary:27017', options: { auth } } };
    const value = filterUrl(client);
    expect(value).to.equal('mongodb://*****:*****@mongodb-primary:27017');
  });

  it('should return the uri as-is when no auth object', async () => {
    const client = { s: { url: 'mongodb://mongodb-primary:27017', options: { } } };
    const value = filterUrl(client);
    expect(value).to.equal('mongodb://mongodb-primary:27017');
  });

  it('should return the uri as-is when username is not present', async () => {
    const auth = { password: 'bar' };
    const client = { s: { url: 'mongodb://mongodb-primary:27017', options: { auth } } };
    const value = filterUrl(client);
    expect(value).to.equal('mongodb://mongodb-primary:27017');
  });

  it('should return the uri as-is when password is not present', async () => {
    const auth = { username: 'foo' };
    const client = { s: { url: 'mongodb://mongodb-primary:27017', options: { auth } } };
    const value = filterUrl(client);
    expect(value).to.equal('mongodb://mongodb-primary:27017');
  });
});
