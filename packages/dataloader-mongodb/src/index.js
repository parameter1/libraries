const DataLoader = require('dataloader');
const { asObject } = require('@parameter1/utils');
const { createQueryMap, reduceKeys } = require('./utils');

class MongoDBLoader {
  /**
   * @param {object} params
   * @param {Collection} params.collection The MongoDB collection to load data from
   * @param {object} [params.options] Options to send to the data loader
   */
  constructor({ collection, options } = {}) {
    this.collection = collection;
    this.loader = new DataLoader(this.batchLoadFn.bind(this), {
      ...options,
      cacheKeyFn: MongoDBLoader.cacheKeyFn,
    });
  }

  /**
   * @param {object} params
   * @param {*} params.id The document id to load
   * @param {object} [params.projection] The document projection object (e.g. the fields to return)
   */
  load({ id, projection } = {}) {
    const { fields } = MongoDBLoader.prepare({ projection });
    const key = { id, fields };
    return this.loader.load(key);
  }

  /**
   * @param {object} params
   * @param {*} params.ids The document ids to load
   * @param {object} [params.projection] The document projection object (e.g. the fields to return)
   */
  loadMany({ ids, projection } = {}) {
    const { fields } = MongoDBLoader.prepare({ projection });
    const keys = ids.map((id) => ({ id, fields }));
    return this.loader.loadMany(keys);
  }

  /**
   * @private
   * @param {array} keys
   */
  async batchLoadFn(keys) {
    const idMap = reduceKeys(keys);
    const queryMap = createQueryMap(idMap);

    const promises = [];
    queryMap.forEach(({ ids, projection }) => {
      const query = { _id: { $in: ids } };
      promises.push(this.collection.find(query, { projection }).toArray());
    });
    // load all query results
    const resultSets = await Promise.all(promises);
    // reduce all result sets into a single object hased by doc id
    const resultHash = resultSets
      .reduce((o, docs) => docs.reduce((h, doc) => ({ ...h, [doc._id]: doc }), o), {});
    // return the docs in the same order as the keys
    return keys.map(({ id }) => {
      const doc = resultHash[id] || null;
      return doc;
    });
  }

  /**
   * @param {object} params
   * @param {*} params.id
   * @param {array} params.fields
   */
  static cacheKeyFn({ id, fields }) {
    return JSON.stringify({ id, fields });
  }

  /**
   * @param {object} params
   * @param {object} [params.projection]
   */
  static prepare({ projection } = {}) {
    const projectKeys = new Set(Object.keys(asObject(projection)));
    // ensure `_id` is added when projected fields are set
    // this ensures that the project cache key will be consistent
    // e.g. { foo: 1 } and { _id: 1, foo: 1 } will both resolve to { _id: 1, foo: 1 }
    if (projectKeys.size) projectKeys.add('_id');
    // sort the fields for consisten cache key resolution
    const fields = [...projectKeys].sort();
    return { fields };
  }
}

module.exports = MongoDBLoader;
