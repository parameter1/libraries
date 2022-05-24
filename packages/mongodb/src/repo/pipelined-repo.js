import { PropTypes, attempt, validateAsync } from '@parameter1/prop-types';
import { get } from '@parameter1/object-path';
import { isFunction as isFn } from '@parameter1/utils';
import { customAlphabet } from 'nanoid';

import ManagedRepo from './managed-repo.js';
import { CleanDocument } from '../utils/clean-document.js';
import Expr from '../utils/pipeline-expr.js';
import runTransaction from '../utils/run-transaction.js';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);

const {
  any,
  array,
  boolean,
  func,
  object,
  objectId,
  propTypeObject,
  string,
} = PropTypes;
const { $inc } = Expr;
const { error: logError } = console;

export const contextSchema = object({
  userId: objectId(),
  ip: string().allow(null).empty(null),
  ua: string().allow(null).empty(null),
}).default();

export const propsSchema = array().items(object({
  path: string().required(),
  value: any(),
}).required()).required();

export default class PipelinedRepo extends ManagedRepo {
  /**
   * @param {object} params
   * @param {boolean} [params.isVersioned=true]
   * @param {function} [params.materializedPipelineBuilder]
   * @param {function} [params.onDelete]
   * @param {function} [params.onMaterialize]
   * @param {function} [params.onMaterializeError=console.error]
   * @param {function} [params.onPrepareDocForCreate]
   * @param {object} params.schema
   * @param {object} params.schema.create
   * @param {string} [params.softDeletePath=_deleted]
   * @param {object} [params.source]
   * @param {object} params.source.name
   * @param {object} params.source.v
   * @param {boolean} [params.usesSoftDelete=true]
   * @param {object[]} params.rest
   */
  constructor(params) {
    const {
      globalFindCriteria,
      isVersioned,
      materializedPipelineBuilder,
      onDelete,
      onMaterialize,
      onMaterializeError,
      onPrepareDocForCreate,
      schema,
      softDeletePath,
      source,
      usesShortId,
      usesSoftDelete,
      ...rest
    } = attempt(params, object({
      isVersioned: boolean().default(true),
      materializedPipelineBuilder: func(),
      onDelete: func(),
      onMaterialize: func(),
      onMaterializeError: func().default(logError),
      onPrepareDocForCreate: func(),
      schema: object({
        create: propTypeObject().required(),
      }),
      softDeletePath: string().default('_deleted'),
      source: object({
        name: string().required(),
        v: string().required(),
      }),
      usesShortId: boolean().default(false),
      usesSoftDelete: boolean().default(true),
    }).required().unknown());

    const indexes = isVersioned ? [
      { key: { '_touched.first.date': 1, _id: 1 } }, // allows a quasi "created date" sort
      { key: { '_touched.last.date': 1, _id: 1 } }, // allows a quasi "updated date" sort
      ...(rest.indexes || []),
    ] : (rest.indexes || []);

    if (usesShortId) indexes.push({ key: { _shortid: 1 }, unique: true });

    super({
      ...rest,
      // ensure unique indexes exclude soft-deleted items
      indexes: usesSoftDelete ? indexes.map((index) => {
        if (!index.unique) return index;
        if (get(index, 'key._shortid')) return index; // do not add to shortid
        return {
          ...index,
          partialFilterExpression: {
            ...index.partialFilterExpression,
            [softDeletePath]: false,
          },
        };
      }) : indexes,
      // ensure soft-deleted documents are excluded from all queries.
      globalFindCriteria: usesSoftDelete
        ? { ...globalFindCriteria, [softDeletePath]: false }
        : globalFindCriteria,
    });
    this.isVersioned = isVersioned;
    this.materializedPipelineBuilder = materializedPipelineBuilder;
    this.onDelete = onDelete;
    this.onMaterialize = onMaterialize;
    this.onMaterializeError = onMaterializeError;
    this.onPrepareDocForCreate = onPrepareDocForCreate;
    this.schema = schema;
    this.softDeletePath = softDeletePath;
    this.source = source;
    this.usesShortId = usesShortId;
    this.usesSoftDelete = usesSoftDelete;
  }

  /**
   * Creates multiple documents.
   *
   * @param {object} params
   * @param {object[]} params.docs
   * @param {object} [params.session]
   *
   * @param {object} params.context
   * @param {object} [params.context.userId]
   * @param {string} [params.context.ip]
   * @param {string} [params.context.ua]
   */
  async bulkCreate(params) {
    const { docs, session, context } = await validateAsync(object({
      docs: array().items(this.schema.create).required(),
      session: object(),
      context: contextSchema,
    }).required(), params);

    const { onPrepareDocForCreate: buildHook } = this;

    const objs = [];
    const { result } = await this.bulkUpdate({
      ops: docs.map((doc) => {
        const prepared = isFn(buildHook) ? buildHook(doc) : doc;
        const obj = CleanDocument.object({
          ...prepared,
          ...(this.usesSoftDelete && { [this.softDeletePath]: false }),
          ...(this.usesShortId && { _shortid: nanoid() }),
        });
        objs.push(obj);
        return {
          filter: { _id: { $lt: 0 } },
          update: [
            {
              $replaceRoot: { newRoot: new Expr({ $mergeObjects: [obj, '$$ROOT'] }) },
            },
          ],
          many: false,
          upsert: true,
        };
      }),
      session,
      context,
    });
    return result.upserted.map((u) => ({ ...u, obj: objs[u.index] }));
  }

  /**
   * Creates multiple documents and returns a cursor of the documents from the
   * database.
   *
   * @param {object} params
   * @param {object[]} params.docs
   * @param {object} [params.projection]
   * @param {object} [params.session]
   */
  async bulkCreateAndReturn(params) {
    const { projection, session, context } = await validateAsync(object({
      docs: array().items(this.schema.create).required(),
      projection: object(),
      session: object(),
      context: contextSchema,
    }).required(), params);
    const results = await this.bulkCreate({ docs: params.docs, session, context });
    const ids = await results.map(({ _id }) => _id);
    return this.find({
      query: { _id: { $in: ids } },
      options: { projection, session },
    });
  }

  /**
   * Performs multiple delete one or many operations. If the repo has soft delete enabled, the
   * deleted performs `bulkUpdate` operations that set the `this.softDeletePath` to `true`.
   *
   * @param {object} params
   * @param {object[]} params.ops
   * @param {object} params.ops.filter
   * @param {object} [params.ops.materializeFilter]
   * @param {boolean} params.ops.many
   * @param {object} [params.session]
   * @param {object} [params.context]
   */
  async bulkDelete(params) {
    const { ops, session, context } = await validateAsync(object({
      ops: array().items(object({
        filter: object().unknown().required(),
        materializeFilter: object().unknown(),
        many: boolean().required(),
      }).required()).required(),
      session: object(),
      context: contextSchema,
    }).required(), params);

    const { onDelete } = this;
    if (this.usesSoftDelete) {
      const updateParams = {
        ops: ops.map((op) => ({
          filter: op.filter,
          materializeFilter: op.materializeFilter,
          many: op.many,
          update: [{ $set: { [this.softDeletePath]: true } }],
        })),
        session,
        context,
      };
      if (isFn(onDelete)) {
        return runTransaction(async ({ session: s }) => {
          const r = await this.bulkUpdate({ ...updateParams, session: s });
          await onDelete({ session: s });
          return r;
        }, { client: this.client, currentSession: session });
      }
      return this.bulkUpdate(updateParams);
    }

    const operations = ops.map((op) => {
      const type = op.many ? 'deleteMany' : 'deleteOne';
      return { [type]: { filter: op.filter } };
    });
    if (isFn(onDelete)) {
      return runTransaction(async ({ session: s }) => {
        const r = await this.bulkWrite({ operations, options: { session: s } });
        await onDelete({ session: s });
        return r;
      }, { client: this.client, currentSession: session });
    }
    return this.bulkWrite({ operations, options: { session } });
  }

  /**
   * Performs multiple update one or many operations.
   *
   * @param {object} params
   * @param {object[]} params.ops
   * @param {object} params.ops.filter
   * @param {boolean} params.ops.many
   * @param {object[]} params.ops.update
   * @param {boolean} [params.ops.upsert=false]
   * @param {object} [params.ops.materializeFilter]
   * @param {object} [params.session]
   * @param {object} [params.context]
   * @param {boolean} [params.versioningEnabled=true]
   */
  async bulkUpdate(params) {
    const {
      ops,
      session,
      context,
      versioningEnabled,
    } = await validateAsync(object({
      ops: array().items(object({
        filter: object().unknown().required(),
        many: boolean().required(),
        update: array().items(object().unknown().required()),
        upsert: boolean().default(false),
        materializeFilter: object().unknown(),
      }).required()).required(),
      session: object(),
      context: contextSchema,
      versioningEnabled: boolean().default(true),
    }).required(), params);

    const touched = {
      date: '$$NOW',
      ip: context.ip,
      source: this.source,
      ua: context.ua,
      user: context.userId ? { _id: context.userId } : null,
    };

    const materializeFilters = [];
    const operations = ops.map((op) => {
      const type = op.many ? 'updateMany' : 'updateOne';
      const update = CleanDocument.value([
        ...op.update,
        ...(this.isVersioned && versioningEnabled ? [
          {
            $set: {
              '_touched.first': new Expr({
                $cond: {
                  if: { $eq: [{ $type: '$_touched.first' }, 'object'] },
                  then: '$_touched.first',
                  else: touched,
                },
              }),
              '_touched.last': touched,
              '_touched.n': $inc(new Expr({ $ifNull: ['$_touched.n', 0] }), 1),
            },
          },
        ] : []),
      ]);

      const materializeFilter = op.materializeFilter || op.filter;
      if (!PipelinedRepo.isCreateFilter(materializeFilter)) {
        materializeFilters.push(materializeFilter);
      }
      return {
        [type]: {
          filter: this.globalFindCriteria ? {
            $and: [op.filter, this.globalFindCriteria],
          } : op.filter,
          update,
          upsert: op.upsert,
        },
      };
    });

    const bulkWriteResult = await this.bulkWrite({ operations, options: { session } });
    if (this.materializedPipelineBuilder) {
      // @todo while this works in most cases, updates that require materializing _related_
      // need to be handled manually in code with the `onMaterialize` hook. This hook requires
      // additional trips to the database (to read the updated docs) and also can over query/update
      // when only portions of the bulkwrite _actually_ update docs. While this will "work" for now,
      // triggering the materialization calls within change streams would be preferred and more
      // efficient. this also passes the query overhead to the end user. transactions also cannot be
      // used with the `$merge` stage, so there's a possibility that some data may be materialized
      // even when the main document write fails (inside a transaction). change streams would avoid
      // this since the writes to the master documents are already committed. plus, any direct
      // changes made to the root documents in the db would also be picked up by the change stream.
      const toMaterializeFilter = materializeFilters.length > 1
        ? { $or: materializeFilters }
        : materializeFilters[0];

      // do not await the materialization
      Promise.all([
        // handle creates via upsert
        (async () => {
          const ids = bulkWriteResult.result.upserted.map(({ _id }) => _id);
          if (!ids.length) return;
          await this.materialize({ filter: { _id: { $in: ids } } });
        })(),
        // handle updates (including soft deletes)
        (async () => {
          if (!materializeFilters.length) return;
          await Promise.all([
            // materialize the root docs
            this.materializeWhenModified({
              filter: toMaterializeFilter,
              bulkWriteResult,
            }),
            // call the `onMaterialize` hook to handle any related operations
            (async () => {
              // bail when nothing was modified
              if (!bulkWriteResult.result.nModified) return;
              // bail when no hook has been registered
              if (!this.onMaterialize) return;
              // find the materialized IDs
              const materializedIds = await this.distinct({
                key: '_id',
                query: toMaterializeFilter,
                options: { useGlobalFindCriteria: false },
              });
              // bail when no materialized IDs were found
              if (!materializedIds.length) return;
              // load update operations from the hook
              const updates = await this.onMaterialize({ materializedIds });
              // execute the updates
              await Promise.all([...updates]
                .filter(([repoName, filter]) => repoName && filter)
                .map(async ([repoName, filter]) => this.manager.$(repoName).materialize({
                  filter,
                })));
            })(),
          ]);
        })(),
      ]).catch((e) => this.onMaterializeError(e));
    }
    return bulkWriteResult;
  }

  /**
   * Creates a single document.
   *
   * @param {object} params
   * @param {object} params.doc
   * @param {object} [params.session]
   */
  async create(params) {
    const { session, context } = await validateAsync(object({
      doc: this.schema.create,
      session: object(),
      context: contextSchema,
    }).required(), params);
    const [r] = await this.bulkCreate({ docs: [params.doc], session, context });
    return r;
  }

  /**
   * Creates a single document and returns it from the database.
   *
   * @param {object} params
   * @param {object} params.doc
   * @param {object} [params.projection]
   * @param {object} [params.session]
   */
  async createAndReturn(params) {
    const { projection, session, context } = await validateAsync(object({
      doc: this.schema.create,
      projection: object(),
      session: object(),
      context: contextSchema,
    }).required(), params);
    const { _id } = await this.create({ doc: params.doc, session, context });
    return this.findByObjectId({ id: _id, options: { projection, session } });
  }

  /**
   * Deletes one or more documents based on the provided filter.
   *
   * @param {object} params
   * @param {object} params.filter
   * @param {object} [params.materializeFilter]
   * @param {boolean} [params.many=false]
   * @param {object} [params.session]
   * @param {object} [params.context]
   */
  async delete(params) {
    const {
      filter,
      materializeFilter,
      many,
      session,
      context,
    } = await validateAsync(object({
      filter: object().unknown().required(),
      materializeFilter: object().unknown(),
      many: boolean().default(false),
      session: object(),
      context: contextSchema,
    }).required(), params);
    const op = {
      filter,
      materializeFilter,
      many,
    };
    return this.bulkDelete({ ops: [op], session, context });
  }

  /**
   * Deletes a single document for the provided ID.
   *
   * @param {object} params
   * @param {*} params.id
   * @param {object} params.session
   * @param {object} params.context
   * @returns {Promise<BulkWriteResult>}
   */
  async deleteForId(params) {
    const {
      id,
      session,
      context,
    } = await validateAsync(object({
      id: any().required(),
      session: object(),
      context: contextSchema,
    }).required(), params);
    return this.deleteForIds({
      ids: [id],
      session,
      context,
    });
  }

  /**
   * Deletes multiple documents for the provided IDs.
   *
   * @param {object} params
   * @param {array} params.ids
   * @param {object} params.session
   * @param {object} params.context
   * @returns {Promise<BulkWriteResult>}
   */
  async deleteForIds(params) {
    const {
      ids,
      session,
      context,
    } = await validateAsync(object({
      ids: array().items(any().required()).required(),
      session: object(),
      context: contextSchema,
    }).required(), params);
    return this.delete({
      filter: { _id: { $in: ids } },
      many: true,
      session,
      context,
    });
  }

  /**
   * Materializes data for the provided filter criteria.
   * Used by the read/denormalized database repos.
   *
   * @param {object} params
   * @param {object} [params.filter]
   * @returns {Promise<string>}
   */
  async materialize(params) {
    const { filter } = await validateAsync(object({
      filter: object().unknown().default({}),
    }).default(), params);
    const { materializedPipelineBuilder: builder } = this;
    if (!isFn(builder)) throw new Error(`No materialized pipeline builder function has been registered for the ${this.name} repo.`);

    const pipeline = builder({ $match: filter });
    const cursor = await this.aggregate({ pipeline, options: { useGlobalFindCriteria: false } });
    await cursor.toArray();
    return 'ok';
  }

  /**
   * Materializes data for the provided filter criteria when the bulk write result
   * detects a change.
   *
   * @param {object} params
   * @param {object} [params.filter]
   * @param {BulkWriteResult} params.bulkWriteResult
   * @returns {Promise<string>}
   */
  async materializeWhenModified(params) {
    const { filter, bulkWriteResult } = await validateAsync(object({
      filter: object().unknown().default({}),
      bulkWriteResult: object().unknown().required(),
    }).default(), params);
    const { nModified } = bulkWriteResult.result;
    if (nModified) return this.materialize({ filter });
    return null;
  }

  /**
   * Updates one or more documents based on the provided filter.
   *
   * @param {object} params
   * @param {object} params.filter
   * @param {boolean} [params.many=false]
   * @param {object|object[]} [params.update]
   * @param {boolean} [params.upsert=false]
   * @param {object} [params.session]
   * @param {object} [params.context]
   * @param {boolean} [params.versioningEnabled=true]
   * @param {object} [params.materializeFilter]
   */
  async update(params) {
    const {
      filter,
      many,
      update,
      upsert,
      session,
      context,
      versioningEnabled,
      materializeFilter,
    } = await validateAsync(object({
      filter: object().unknown().required(),
      many: boolean().default(false),
      update: array().items(object().unknown().required()),
      upsert: boolean().default(false),
      session: object(),
      context: contextSchema,
      versioningEnabled: boolean().default(true),
      materializeFilter: object().unknown(),
    }).required(), params);
    const op = {
      filter,
      many,
      update,
      upsert,
      materializeFilter,
    };
    return this.bulkUpdate({
      ops: [op],
      session,
      context,
      versioningEnabled,
    });
  }

  /**
   * Generically updates one or more properties on the document with the provided ID.
   * Does not directly validate any values, but will skip undefined values.
   *
   * @param {object} params
   * @param {*} params.id
   * @param {object} [params.props]
   * @param {object} [params.query] Additional query params to apply
   * @param {object} [params.materializeFilter]
   * @param {object} [params.session]
   * @param {object} [params.context]
   * @returns {Promise<BulkWriteResult|null>}
   */
  async updatePropsForId(params) {
    const {
      id,
      props,
      query,
      materializeFilter,
      session,
      context,
    } = await validateAsync(object({
      id: any().required(),
      props: propsSchema,
      query: object().unknown(),
      materializeFilter: object().unknown(),
      session: object(),
      context: contextSchema,
    }).required(), params);

    return this.updatePropsForIds({
      sets: [{
        id,
        props,
        query,
        materializeFilter,
      }],
      session,
      context,
    });
  }

  /**
   * Generically updates documents based on sets of IDs + properties. This method does not directly
   * validate the prop values, but will skip undefined values.
   *
   * @param {object} params
   * @param {object[]} params.sets
   * @param {*} params.sets.id
   * @param {object[]} params.sets.props
   * @param {object} [params.sets.materializeFilter]
   * @param {object} [params.sets.query] Additional query params to apply
   * @param {object} [params.session]
   * @param {object} [params.context]
   * @returns {Promise<BulkWriteResult|null>}
   */
  async updatePropsForIds(params) {
    const {
      sets,
      session,
      context,
    } = await validateAsync(object({
      sets: array().items(object({
        id: any().required(),
        props: propsSchema,
        query: object().unknown(),
        materializeFilter: object().unknown(),
      }).required()).required(),
      session: object(),
      context: contextSchema,
    }).required(), params);

    const ops = [];
    sets.forEach(({
      id,
      props,
      query,
      materializeFilter,
    }) => {
      const filtered = props.filter(({ value }) => typeof value !== 'undefined');
      if (!filtered.length) return; // noop
      const $set = filtered.reduce((o, { path, value }) => ({ ...o, [path]: value }), {});
      const filter = { ...query, _id: id };
      ops.push({
        filter,
        materializeFilter,
        update: [{ $set }],
        many: false,
      });
    });
    if (!ops.length) return null; // noop
    return this.bulkUpdate({ ops, session, context });
  }

  /**
   * Determines if the provided update filter is used for creating a new document via upsert.
   *
   * @param {object} filter
   * @returns {boolean}
   */
  static isCreateFilter(filter) {
    return get(filter, '_id.$lt') === 0;
  }
}
