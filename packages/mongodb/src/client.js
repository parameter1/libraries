import { MongoClient } from 'mongodb';
import { eachSeries } from 'async';
import { isFunction as isFn } from '@parameter1/utils';
import filterURL from './utils/filter-url.js';

export default class MongoDBClient {
  /**
   *
   * @param {object} params
   * @param {string} params.url The database URL to connect to
   * @param {MongoClientOptions} [params.options={}] Options to pass to `MongoClient.connect`
   */
  constructor({ url, options = {} } = {}) {
    this.client = new MongoClient(url, options);
    this.url = filterURL(this.client);
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

  /**
   * Closes the connection to the server.
   *
   * @param {boolean} [force] Whether to forcefully close the connection.
   * @return {Promise<void>}
   */
  async close(force) {
    if (!this.promise) return null;
    await this.promise;
    return this.client.close(force);
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
  async collection({ dbName, name, options = {} } = {}) {
    const db = await this.db({ name: dbName });
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
  async command(command, { options, dbName = 'test', dbOptions } = {}) {
    const db = await this.db({ name: dbName, options: dbOptions });
    return db.command(command, options);
  }

  /**
   * Connects to the server.
   *
   * @return {Promise<MongoClient>}
   */
  async connect() {
    if (!this.promise) this.promise = this.client.connect();
    return this.promise;
  }

  /**
   * Create a new Db instance sharing the current socket connections.
   *
   * @param {object} params
   * @param {string} params.name The database name
   * @param {object} params.options Options to pass to the `MongoClient.db` method
   * @return {Promise<Db>}
   */
  async db({ name, options } = {}) {
    await this.connect();
    return this.client.db(name, options);
  }

  /**
   * Lists all databases for the current connection.
   *
   * @return {Promise}
   */
  async listDatabases() {
    const admin = await this.admin();
    return admin.listDatabases();
  }

  /**
   * Pings the connection for both read and write.
   *
   * @param {objects} params
   * @param {string} params.id The identifier to apply to the write ping.
   * @param {boolean} [params.withWrite=true] Whether to perform the write operation when pinging.
   */
  async ping({ id, withWrite = true } = {}) {
    const coll = await this.collection({ dbName: 'test', name: 'pings' });
    return Promise.all([
      (async () => {
        const r = await this.command({ ping: 1 });
        if (!r.ok) {
          const err = new Error('MongoDB ping command not ok.');
          err.response = r;
          throw err;
        }
        return r;
      })(),
      withWrite
        ? coll.updateOne({ _id: id }, { $set: { last: new Date() } }, { upsert: true })
        : Promise.resolve(true),
    ]);
  }

  /**
   * Starts a new session on the server.
   *
   * @param {mongodb.SessionOptions} options
   * @return {Promise<mongodb.ClientSession>}
   */
  async startSession(options) {
    await this.connect();
    return this.client.startSession(options);
  }

  /**
   *
   * @param {object} params
   * @param {array} params.pipeline
   * @param {object} [params.options]
   * @return {Promise<mongodb.ChangeStream>}
   */
  async watch({ pipeline, options }) {
    await this.connect();
    return this.client.watch(pipeline, options);
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
    await this.connect();
    return this.client.withSession(options, operation);
  }
}
