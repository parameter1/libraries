const MongoDBClient = require('../client');

class RepoManager {
  /**
   *
   */
  constructor({ client, dbName } = {}) {
    if (!(client instanceof MongoDBClient)) throw new Error('The `client` must be an instance of MongoDBClient');
    if (!dbName) throw new Error('The `dbName` param is required.');
    this.client = client;
    this.dbName = dbName;
    this.repos = {};
  }

  /**
   * @param {object} params
   * @param {string} params.name The repo name
   * @param {string} params.collectionName The collection name to use
   * @param {ManageRepo} params.Repo The ManageRepo class to instantiate
   */
  add({ name, collectionName, Repo } = {}) {
    if (this.repos[name]) throw new Error(`A repository for '${name}' has already been added.`);
    this.repos[name] = new Repo({
      name,
      collectionName,
      manager: this,
    });
  }

  /**
   *
   */
  get(name) {
    const repo = this.repos[name];
    if (!repo) throw new Error(`No repository exists for '${name}'`);
    return this.repos[name];
  }

  /**
   * An alias for `get`
   */
  $(name) {
    return this.get(name);
  }
}

module.exports = RepoManager;
