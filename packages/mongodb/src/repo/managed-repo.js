const Repo = require('./repo');
const RepoManager = require('./manager');

class ManagedRepo extends Repo {
  /**
   * @param {object} params
   * @param {string} params.name The repo name
   * @param {string} params.collectionName The collection to use
   * @param {RepoManager} params.manager The RepoManager instance
   */
  constructor({ name, collectionName, manager }) {
    if (!(manager instanceof RepoManager)) throw new Error('The `manager` must be an instance of RepoManager');
    super({
      name,
      client: manager.client,
      dbName: manager.dbName,
      collectionName,
    });
    this.manager = manager;
  }
}

module.exports = ManagedRepo;
