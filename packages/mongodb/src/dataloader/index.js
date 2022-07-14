import DataLoader from 'dataloader';
import { asObject, isFunction as isFn } from '@parameter1/utils';
import { get } from '@parameter1/object-path';
import escapeRegex from 'escape-string-regexp';
import { createQueryMap, reduceKeys } from './utils/index.js';

export default class MongoDBDataLoader {
  /**
   * @param {object} params
   * @param {string} params.name The dataloader name
   * @param {Collection} params.collection The MongoDB collection to load data from
   * @param {object} [params.options] Options to send to the data loader
   * @param {object} [params.logger] A key logger to use when loading
   * @param {function} [params.coercionFn] An optional identifier value coercion function
   * @param {function} [params.batchLoadFn] An optional custom batch load function
   * @param {object?} [params.criteria] Global query criteria to add to all lookups
   */
  constructor({
    name,
    collection,
    options,
    logger,
    batchLoadFn,
    coercionFn,
    criteria,
  } = {}) {
    const hasCustomBatchFn = isFn(batchLoadFn);
    if (!hasCustomBatchFn && !collection) throw new Error('No MongoDB collection was provided.');
    this.name = name || collection?.s.namespace;
    this.collection = collection;
    this.logger = logger;
    this.coercionFn = coercionFn;
    this.criteria = criteria;

    const loadFn = hasCustomBatchFn ? (keys) => {
      const idMap = reduceKeys(keys);
      const queryMap = createQueryMap(idMap);
      return batchLoadFn({ keys, idMap, queryMap });
    } : this.batchLoadFn.bind(this);
    this.loader = new DataLoader(loadFn, {
      ...options,
      cacheKeyFn: MongoDBDataLoader.cacheKeyFn,
    });
  }

  /**
   * @param {object} params
   * @param {string} [params.foreignField=_id] The foreign field to query.
   * @param {*} params.value The document id value to load
   * @param {object} [params.projection] The document projection object (e.g. the fields to return)
   * @param {boolean} [params.strict=false] Whether to throw an error when the document is not found
   */
  async load({
    foreignField = '_id',
    value,
    projection,
    strict = false,
  } = {}) {
    const { fields } = MongoDBDataLoader.prepare({ foreignField, projection });
    const key = {
      foreignField,
      value,
      fields,
      strict,
    };
    const result = await this.loader.load(key);
    if (result instanceof Error) throw result;
    return result;
  }

  /**
   * @param {object} params
   * @param {string} [params.foreignField=_id] The foreign field to query.
   * @param {*[]} params.values The document id values to load
   * @param {object} [params.projection] The document projection object (e.g. the fields to return)
   * @param {boolean} [params.strict=false] Whether to throw an error when the document is not found
   */
  async loadMany({
    foreignField = '_id',
    values,
    projection,
    strict = false,
  } = {}) {
    const { fields } = MongoDBDataLoader.prepare({ foreignField, projection });
    const keys = values.map((value) => ({
      foreignField,
      value,
      fields,
      strict,
    }));
    const results = await this.loader.loadMany(keys);
    return results.map((result) => {
      if (result instanceof Error) throw result;
      return result;
    });
  }

  /**
   * @private
   * @param {array} keys
   */
  async batchLoadFn(keys) {
    const {
      coercionFn,
      logger,
      name,
      criteria,
    } = this;
    const idMap = reduceKeys(keys);
    const queryMap = createQueryMap(idMap);

    const promises = [];
    queryMap.forEach(({ foreignField, values, projection }) => {
      const coerced = isFn(coercionFn) ? values.map(coercionFn) : values;
      const query = {
        [foreignField]: { $in: coerced },
        ...(criteria && { $and: [criteria] }),
      };
      if (isFn(logger)) logger('Loader keys:', { name, query, projection });
      promises.push((async () => {
        const cursor = await this.collection.find(query, { projection });
        const docs = await cursor.toArray();
        return { foreignField, docs };
      })());
    });
    // load all query results
    const resultSets = await Promise.all(promises);
    // reduce all result sets into a single map keyed by foreign field + lookup value
    const resultMap = new Map();
    resultSets.forEach(({ foreignField, docs }) => {
      docs.forEach((doc) => {
        const key = `${foreignField}:${get(doc, foreignField)}`;
        resultMap.set(key, doc);
      });
    });
    return keys.map(({ foreignField, value, strict }) => {
      const key = `${foreignField}:${value}`;
      const doc = resultMap.get(key) || null;
      if (!doc) {
        const error = new Error(`No ${name} record was found for ${key}`);
        error.status = 404;
        if (strict) return error;
        process.emitWarning(`WARNING: ${error.message}`);
      }
      return doc;
    });
  }

  /**
   * @param {object} params
   * @param {string} params.foreignField
   * @param {*} params.value
   * @param {array} params.fields
   */
  static cacheKeyFn({ foreignField, value, fields }) {
    return JSON.stringify({ [foreignField]: value, fields });
  }

  /**
   * @param {object} params
   * @param {string} params.foreignField
   * @param {object} [params.projection]
   */
  static prepare({ foreignField, projection } = {}) {
    const projectKeys = new Set(Object.keys(asObject(projection)));

    // clear the "most-specific" project keys
    projectKeys.forEach((key) => {
      const pattern = new RegExp(`^${escapeRegex(key)}\\.`);
      projectKeys.forEach((toTest) => {
        if (key === toTest) return;
        if (pattern.test(toTest)) projectKeys.delete(toTest);
      });
    });

    // ensure `_id` and foreignField is added when projected fields are set
    // this ensures that the project cache key will be consistent
    // also ensure the foreign field is projected
    if (projectKeys.size) {
      projectKeys.add('_id');
      projectKeys.add(foreignField);
    }
    // sort the fields for consistent cache key resolution
    const fields = [...projectKeys].sort();
    return { fields };
  }
}
