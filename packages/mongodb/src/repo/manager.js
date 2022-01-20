import MongoDBClient from '../client.js';

export default class RepoManager {
  /**
   *
   */
  constructor({ client, dbName } = {}) {
    if (!(client instanceof MongoDBClient)) throw new Error('The `client` must be an instance of MongoDBClient');
    if (!dbName) throw new Error('The `dbName` param is required.');
    this.client = client;
    this.dbName = dbName;
    this.repos = new Map();
  }

  /**
   * Adds and instantiates a new managed repo.
   *
   * @param {object} params
   * @param {string} params.key The repo key
   * @param {string} params.name The repo name - will fallback to the key if not set
   * @param {ManagedRepo} params.ManagedRepo The ManagedRepo class to instantiate
   * @param {...object} params.rest The remaining Repo constructor params
   */
  add({
    key,
    name,
    ManagedRepo,
    ...rest
  } = {}) {
    if (this.repos.has(key)) return this;
    this.repos.set(key, new ManagedRepo({
      name: name || key,
      client: this.client,
      dbName: this.dbName,
      ...rest,
      manager: this,
    }));
    return this;
  }

  /**
   * Gets a repository for the provided key.
   */
  get(key) {
    const repo = this.repos.get(key);
    if (!repo) throw new Error(`No repository exists for '${key}'`);
    return repo;
  }

  /**
   * An alias for `get`
   */
  $(name) {
    return this.get(name);
  }
}
