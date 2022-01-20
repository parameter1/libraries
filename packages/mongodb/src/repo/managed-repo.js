import Repo from './repo.js';
import RepoManager from './manager.js';

export default class ManagedRepo extends Repo {
  /**
   * @param {object} params
   * @param {RepoManager} params.manager The RepoManager instance
   * @param {...object} params.rest The remaining Repo constructor params
   */
  constructor({ manager, ...rest }) {
    if (!(manager instanceof RepoManager)) throw new Error('The `manager` must be an instance of RepoManager');
    super(rest);
    this.manager = manager;
  }
}
