const mongodb = require('mongodb');
const eachSeries = require('async/eachSeries');
const { isFunction: isFn } = require('@parameter1/utils');

const { MongoClient } = mongodb;

const defaults = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ignoreUndefined: true,
};

class MongoDBClient {
  /**
   *
   * @param {object} params
   * @param {string} params.url The database URL to connect to
   * @param {object} [params.options={}] Options to pass to `MongoClient.connect`
   */
  constructor({ url, options = {} } = {}) {
    this.url = url;
    this.options = { ...defaults, ...options };
  }

  /**
   * Create a new Db instance sharing the current socket connections.
   *
   * @param {object} params
   * @param {string} params.name The database name
   * @param {object} params.options Options to pass to the `MongoClient.db` method
   * @return {Promise<mongodb.Db>}
   */
  async db({ name, options } = {}) {
    const client = await this.connect();
    return client.db(name, options);
  }

  /**
   * Fetch a specific collection.
   *
   * @param {object} params
   * @param {string} params.dbName The database name
   * @param {string} params.name The collection name
   * @param {object} [params.options={}] Options to pass to the `Db.collection` method
   * @return {Promise<mongodb.Collection>}
   */
  async collection({
    dbName,
    name,
    options = {},
  } = {}) {
    const db = await this.db({ name: dbName });
    if (options && options.strict) {
      return new Promise((resolve, reject) => {
        db.collection(name, options, (err, coll) => {
          if (err) { reject(err); } else { resolve(coll); }
        });
      });
    }
    return db.collection(name, options);
  }

  /**
   * Execute a command.
   *
   * @param {object} params
   * @param {string} command The command name/hash.
   * @param {object} [params.options] Options to pass to the `Db.command` method
   * @param {string} [params.dbName=test] The database name
   * @param {object} [params.dbOptions]
   * @return {Promise}
   */
  async command(command, {
    options,
    dbName = 'test',
    dbOptions,
  } = {}) {
    const db = await this.db({ name: dbName, options: dbOptions });
    return db.command(command, options);
  }

  /**
   * Returns the admin db instance.
   *
   * @param {object} params
   * @param {string} [params.name=test] The database name
   * @param {object} [params.options] Options to pass to the `this.db` method
   * @return {Promise}
   */
  async admin({ name = 'test', options } = {}) {
    const db = await this.db({ name, options });
    return db.admin();
  }

  /**
   * Starts a new session on the server.
   *
   * @param {mongodb.SessionOptions} options
   * @return {Promise<mongodb.ClientSession>}
   */
  async startSession(options) {
    const client = await this.connect();
    return client.startSession(options);
  }

  /**
   * Runs a given operation with an implicitly created session.
   *
   * Presently the operation MUST return a Promise
   * (either explicit or implicity as an async function)
   *
   * @param {object} params
   * @param {function} params.operation An operation to execute with an implicitly created session.
   *                                    The signature of this MUST be (session) => {}
   * @param {object} [params.options] Optional settings to be appled to implicitly created session
   * @return {Promise}
   */
  async withSession({ operation, options }) {
    const client = await this.connect();
    return client.withSession(options, operation);
  }

  /**
   *
   * @param {object} params
   * @param {array} params.pipeline
   * @param {object} [params.options]
   * @return {Promise<mongodb.ChangeStream>}
   */
  async watch({ pipeline, options }) {
    const client = await this.connect();
    return client.watch(pipeline, options);
  }

  /**
   * Pings the connection for both read and write.
   *
   * @param {objects} params
   * @param {string} params.id The identifier to apply to the write ping.
   */
  async ping({ id } = {}) {
    const coll = await this.collection({ dbName: 'test', name: 'pings' });
    return Promise.all([
      this.command({ ping: 1 }),
      coll.updateOne({ _id: id }, { $set: { last: new Date() } }, { upsert: true }),
    ]);
  }

  /**
   * Connects to the server.
   *
   * @return {Promise<MongoClient>}
   */
  async connect() {
    if (!this.promise) this.promise = MongoClient.connect(this.url, this.options);
    const client = await this.promise;
    return client;
  }

  /**
   * Closes the connection to the server.
   *
   * @param {boolean} [force] Whether to forcefully close the connection.
   * @return {Promise}
   */
  async close(force) {
    if (!this.promise) return null;
    const client = await this.promise;
    return client.close(force);
  }

  /**
   * Builds indexes based on a mapping object where the key is the
   * collection name and the value is an array of indexes definitions.
   *
   * For example:
   * ```
   * {
   *   accounts: [
   *     [{ zone: 1 }, { unique: true }],
   *     { name: 1, _id: 1 },
   *   ],
   * }
   * ```
   * Would create one unique index and one regular index on the `accounts` collection.
   *
   * @param {object} params
   * @param {string} params.dbName The database to use
   * @param {object} params.obj The index mapping object
   * @param {function} [onBuild] A function to call on each index build
   * @param {object} [options] Options to pass to the `collection` method
   */
  async buildIndexesFor({
    dbName,
    obj = {},
    onBuild,
    forceBackground = false,
    options,
  } = {}) {
    if (!dbName) throw new Error('The dbName must be provided.');
    const { keys } = Object;
    const { isArray } = Array;
    const defs = [];
    keys(obj).forEach((collName) => {
      const indexes = obj[collName];
      indexes.forEach((args) => {
        const a = isArray(args) ? [...args.slice()] : [args];
        if (forceBackground) a[1] = a[1] ? { ...a[1], background: true } : { background: true };
        defs.push({ collName, args: a });
      });
    });
    await eachSeries(defs, async ({ collName, args }) => {
      const collection = await this.collection({ dbName, name: collName, options });
      await collection.createIndex(...args);
      if (isFn(onBuild)) await onBuild({ collName, args });
    });
  }
}

module.exports = MongoDBClient;
