import { ObjectId } from 'mongodb';
import { get } from '@parameter1/object-path';
import MongoDBDataLoader from '../dataloader/index.js';
import { findWithCursor, findWithOffset } from '../pagination/index.js';
import MongoDBClient from '../client.js';

export default class Repo {
  /**
   * @param {object} params
   * @param {string} params.name The repository name
   * @param {MongoDBClient} params.client The MongoDB client
   * @param {string} params.dbName The database to use
   * @param {string} params.collectionName The collection to use
   * @param {object[]} params.indexes Indexes defined for this collection
   * @param {object} [params.globalFindCriteria] Query criteria to apply to all _find_ methods
   * @param {object} [params.integerId={}] Whether this collection requires integer IDs
   * @param {function} [params.logger] An optional logging function.
   * @param {string[]} [params.collatableFields] Fields that should use collation when sorted
   * @param {number} [params.dupeKeyStatusCode=409] The status code to add to duplicate key errors
   */
  constructor({
    name,
    client,
    dbName,
    collectionName,
    indexes,
    globalFindCriteria,
    logger,
    collatableFields = [],
    dupeKeyStatusCode = 409,
  } = {}) {
    if (!name) throw new Error('The repository `name` param is required');
    if (!dbName || !collectionName) throw new Error('The `dbName` and `collectionName` params are required.');
    if (!(client instanceof MongoDBClient)) throw new Error('The `client` must be an instance of MongoDBClient');

    this.name = name;
    this.client = client;
    this.dbName = dbName;
    this.collectionName = collectionName;
    this.indexes = indexes;
    this.globalFindCriteria = globalFindCriteria;
    this.logger = typeof logger === 'function' ? logger : null;
    this.collatableFields = Array.isArray(collatableFields)
      ? collatableFields.reduce((o, field) => ({ ...o, [field]: true }), {})
      : {};
    this.dupeKeyStatusCode = dupeKeyStatusCode || 409;
  }

  /**
   * Creates and returns a new dataloader instance for this repo.
   *
   * Multiple calls will create separate instances and cache will not be shared
   * between them.
   */
  async createDataloader(params = {}) {
    const collection = await this.collection();
    return new MongoDBDataLoader({
      ...params,
      name: this.name,
      collection,
      logger: this.logger,
      ...(this.shouldUseGlobalCriteria(params) && { criteria: this.globalFindCriteria }),
    });
  }

  /**
   * Finds a single document by an ObjectID.
   *
   * @param {object} params
   * @param {ObjectId|string} params.id The object ID to lookup
   * @param {object} [params.options] Options to pass to the `collection.findOne` call
   */
  async findByObjectId({ id, options } = {}) {
    return this.findById({ id: Repo.coerceObjectId(id), options });
  }

  /**
   * Finds a single document by ID.
   *
   * @param {object} params
   * @param {*} params.id The ID to lookup
   * @param {object} [params.options] Options to pass to the `collection.findOne` call
   */
  async findById({ id, options } = {}) {
    const query = { _id: id };
    return this.findOne({ query, options });
  }

  /**
   * Finds a single document.
   *
   * @param {object} params
   * @param {object} params.query The query criteria
   * @param {object} [params.options] Options to pass to the `collection.findOne` call
   */
  async findOne({ query = {}, options = {} } = {}) {
    const { strict, ...opts } = options;
    const collection = await this.collection();
    const q = this.applyGlobalCriteria(query, options);
    this.log('findOne', q, opts);
    const doc = await collection.findOne(q, opts);
    if (strict && !doc) throw this.createNotFoundError();
    return doc;
  }

  /**
   * Creates a cursor for a query that can be used to iterate over results.
   *
   * @param {object} params
   * @param {object} params.query The query criteria
   * @param {object} [params.options] Options to pass to the `collection.find` call
   */
  async find({ query = {}, options } = {}) {
    const collection = await this.collection();
    const q = this.applyGlobalCriteria(query, options);
    this.log('find', q, options);
    return collection.find(q, options);
  }

  /**
   * Inserts a single document.
   *
   * @param {object} params
   * @param {object} params.doc The payload to insert
   * @param {object} [params.options] Options to pass to the `collection.insertOne` call
   * @param {object} [params.options.withDates=false]
   */
  async insertOne({ doc, options = {} } = {}) {
    const collection = await this.collection();
    const {
      withDates = false,
      now = new Date(),
      ...opts
    } = options;
    const payload = withDates ? { ...doc, createdAt: now, updatedAt: now } : doc;
    try {
      const r = await collection.insertOne(payload, opts);
      return { ...payload, _id: r.insertedId };
    } catch (e) {
      if (e.code === 11000) throw Repo.createError(this.dupeKeyStatusCode, `Unable to create ${this.name}: a record already exists with the provided criteria.`);
      throw e;
    }
  }

  /**
   * Inserts a multiple documents.
   *
   * @param {object} params
   * @param {object[]} params.docs The documents to insert
   * @param {object} [params.options] Options to pass to the `collection.insertMany` call
   * @param {object} [params.options.withDates=false]
   */
  async insertMany({ docs, options = {} } = {}) {
    const collection = await this.collection();
    const { withDates = false, ...opts } = options;

    let toInsert = docs;
    if (withDates) {
      const now = new Date();
      toInsert = docs.map((doc) => ({ ...doc, createdAt: now, updatedAt: now }));
    }
    return collection.insertMany(toInsert, opts);
  }

  /**
   * @param {object} params
   * @param {object} params.dataloader An (optional) dataloader to use to batch load the sorted docs
   */
  async paginate({
    query,
    sort,
    projection,
    pagination,
    dataloader,
  } = {}) {
    const collection = await this.collection();
    const sortField = get(sort, 'field');

    const params = {
      query,
      sort,
      limit: get(pagination, 'limit'),
      projection,
      collate: this.collatableFields[sortField],
    };

    const type = get(pagination, 'using', 'cursor');
    if (type === 'cursor') {
      return findWithCursor(collection, {
        ...params,
        cursor: get(pagination, 'cursor.value'),
        direction: get(pagination, 'cursor.direction'),
        dataloader,
      });
    }
    return findWithOffset(collection, {
      ...params,
      skip: get(pagination, 'offset.value'),
    });
  }

  /**
   * Updates a single document.
   *
   * @param {object} params
   * @param {object} params.query The criteria to select the document to update
   * @param {object} params.update The update criteria
   * @param {object} params.options Options to pass to the `collection.updateOne` call
   */
  async updateOne({ query = {}, update, options = {} } = {}) {
    const collection = await this.collection();
    const { strict, ...opts } = options;
    const q = this.applyGlobalCriteria(query, options);

    try {
      const result = await collection.updateOne(q, update, opts);
      if (strict && !result.matchedCount) throw this.createNotFoundError();
      return result;
    } catch (e) {
      if (e.code === 11000) throw Repo.createError(this.dupeKeyStatusCode, `Unable to update ${this.name}: a record already exists with the provided criteria.`);
      throw e;
    }
  }

  /**
   * Updates multiple documents.
   *
   * @param {object} params
   * @param {object} params.query The criteria to select the documents to update
   * @param {object} params.update The update criteria to apply to all docs
   * @param {object} params.options Options to pass to the `collection.updateMany` call
   */
  async updateMany({ query = {}, update, options } = {}) {
    const collection = await this.collection();
    const q = this.applyGlobalCriteria(query, options);
    return collection.updateMany(q, update, options);
  }

  /**
   * Deletes a single document.
   *
   * @param {object} params
   * @param {object} params.query The criteria to select the document to remove
   * @param {object} params.options Options to pass to the `collection.deleteOne` call
   */
  async deleteOne({ query = {}, options = {} } = {}) {
    const { strict, ...opts } = options;
    const collection = await this.collection();
    const q = this.applyGlobalCriteria(query, options);
    const result = await collection.deleteOne(q, opts);
    if (strict && !result.deletedCount) throw this.createNotFoundError();
    return result;
  }

  /**
   * Deletes multiple documents.
   *
   * @param {object} params
   * @param {object} params.query The criteria to select the documents to remove
   * @param {object} params.options Options to pass to the `collection.deleteMany` call
   */
  async deleteMany({ query = {}, options } = {}) {
    const collection = await this.collection();
    const q = this.applyGlobalCriteria(query, options);
    return collection.deleteMany(q, options);
  }

  /**
   * Returns a list of distinct values for the given key across a collection.
   *
   * @param {object} params
   * @param {string} params.key Field of the document to find distinct values for
   * @param {object} params.query The query to apply the distinct filter
   * @param {object} params.options Options to pass to the `collection.distinct` call
   */
  async distinct({ key, query = {}, options } = {}) {
    const collection = await this.collection();
    const q = this.applyGlobalCriteria(query, options);
    return collection.distinct(key, q, options);
  }

  /**
   * Perform bulk write operations.
   *
   * @param {object} params
   * @param {object[]} operations An array of bulk operation objects to perform
   * @param {object} options Options to pass to the `collection.bulkWrite` call
   */
  async bulkWrite({ operations, options } = {}) {
    const collection = await this.collection();
    return collection.bulkWrite(operations, options);
  }

  /**
   * Execute an aggregation framework pipeline against the collection.
   *
   * @param {object} params
   * @param {object[]} pipeline Array containing all the aggregation framework commands
   * @param {object} options Options to pass to the `collection.aggregate` call
   */
  async aggregate({ pipeline = [], options } = {}) {
    const collection = await this.collection();
    if (this.shouldUseGlobalCriteria(options)) {
      pipeline.unshift({ $match: this.globalFindCriteria });
    }
    return collection.aggregate(pipeline, options);
  }

  /**
   * Gets the number of documents matching the query.
   *
   * @param {object} params
   * @param {object[]} query The query for the count
   * @param {object} options Options to pass to the `collection.countDocuments` call
   */
  async countDocuments({ query = {}, options } = {}) {
    const collection = await this.collection();
    const q = this.applyGlobalCriteria(query, options);
    return collection.countDocuments(q, options);
  }

  /**
   * Applies the global query criteria to the provided query when set and enabled.
   *
   * @param {object} query
   * @param {object} options
   * @returns {boolean}
   */
  applyGlobalCriteria(query, options = {}) {
    if (!this.shouldUseGlobalCriteria(options)) return query;
    return { $and: [query, this.globalFindCriteria] };
  }

  /**
   * Deterines whether global find criteria should be applied to an operation for the provided
   * options.
   *
   * @param {object} options
   * @returns {boolean}
   */
  shouldUseGlobalCriteria(options = {}) {
    const { globalFindCriteria } = this;
    const { useGlobalFindCriteria = true } = options;
    return globalFindCriteria && useGlobalFindCriteria;
  }

  log(...args) {
    const { logger } = this;
    if (logger) logger(`${this.dbName}.${this.collectionName}`, ...args);
  }

  /**
   * @param {object} [options] Options to pass to the `client.db` call
   */
  async db(options) {
    const { dbName } = this;
    return this.client.db({ dbName, options });
  }

  /**
   * @param {object} [options] Options to pass to the `client.collection` call
   */
  async collection(options) {
    const { dbName, collectionName } = this;
    return this.client.collection({ dbName, name: collectionName, options });
  }

  /**
   * Creates the defined indexes for this repo/collection, if present.
   */
  async createIndexes() {
    const { indexes } = this;
    if (!Array.isArray(indexes) || !indexes.length) return null;
    const collection = await this.collection();
    return collection.createIndexes(indexes);
  }

  /**
   * Watches this repository's collection for changes.
   *
   * @param {object} params
   * @param {object[]} params.pipeline An array of aggregation pipeline stages through which to
   *                                   pass change stream documents. This allows for filtering
   *                                   (using $match) and manipulating the change stream documents.
   * @param {object} params.options Options to pass to the `collection.watch` call
   */
  async watch({ pipeline = [], options } = {}) {
    const collection = await this.collection();
    const { globalFindCriteria } = this;
    if (globalFindCriteria) pipeline.slice().unshift({ $match: globalFindCriteria });
    return collection.watch(pipeline, options);
  }

  /**
   *
   */
  createNotFoundError() {
    return Repo.createError(404, `No ${this.name} record was found for the provided criteria.`);
  }

  /**
   * @param {number} [statusCode=500] The status code
   * @param {string} message The error message
   */
  static createError(statusCode, message) {
    const e = new Error(message);
    e.statusCode = Number(statusCode) || 500;
    return e;
  }

  /**
   * @param {string|ObjectId} id
   */
  static coerceObjectId(id) {
    if (id instanceof ObjectId) return id;
    if (/^[a-f0-9]{24}$/.test(id)) return new ObjectId(id);
    throw Repo.createError(400, `Unable to coerce '${id}' into an object ID.`);
  }
}
