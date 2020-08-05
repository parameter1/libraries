const mongodb = require('mongodb');
const MongoDBClient = require('../client');

const { ObjectId } = mongodb;

class Repo {
  /**
   * @param {object} params
   * @param {MongoDBClient} params.client The MongoDB client
   * @param {string} params.name The repository name
   * @param {string} params.dbName The database to use
   * @param {string} params.collectionName The collection to use
   */
  constructor({
    name,
    client,
    dbName,
    collectionName,
  } = {}) {
    if (!name) throw new Error('The repository `name` param is required');
    if (!dbName || !collectionName) throw new Error('The `dbName` and `collectionName` params are required.');
    if (!(client instanceof MongoDBClient)) throw new Error('The `client` must be an instance of MongoDBClient');

    this.name = name;
    this.client = client;
    this.dbBame = dbName;
    this.collectionName = collectionName;
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
  async findOne({ query, options = {} } = {}) {
    const { strict, ...opts } = options;
    const collection = await this.collection();
    const doc = await collection.findOne(query, opts);
    if (strict && !doc) throw Repo.createError(404, `No ${this.name} record was found for the provided criteria.`);
    return doc;
  }

  /**
   * Inserts a single document.
   *
   * @param {object} params
   * @param {object} params.doc The payload to insert
   * @param {object} [params.options] Options to pass to the `collection.insertOne` call
   */
  async insertOne({ doc, options = {} } = {}) {
    const collection = await this.collection();
    const { withDates = true, ...opts } = options;
    const now = new Date();
    const payload = withDates ? { ...doc, createdAt: now, updatedAt: now } : doc;
    try {
      const { ops } = await collection.insertOne(payload, opts);
      return ops[0];
    } catch (e) {
      if (e.code === 11000) throw Repo.createError(400, `Unable to create ${this.name}: a record already exists with the provided criteria.`);
      throw e;
    }
  }

  /**
   * Updates a single document.
   *
   * @param {object} params
   * @param {object} params.query The criteria to select the document to update
   * @param {object} params.update The update criteria
   * @param {object} params.options Options to pass to the `collection.updateOne` call
   */
  async updateOne({ query, update, options } = {}) {
    const collection = await this.collection();
    return collection.updateOne(query, update, options);
  }

  /**
   * Deletes a single document.
   *
   * @param {object} params
   * @param {object} params.query The criteria to select the document to remove
   * @param {object} params.options Options to pass to the `collection.deleteOne` call
   */
  async deleteOne({ query, options } = {}) {
    const collection = await this.collection();
    return collection.deleteOne(query, options);
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

module.exports = Repo;
