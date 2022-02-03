import Joi from 'joi';
import orderBy from 'lodash.orderby';
import { sluggify } from '@parameter1/slug';
import { get } from '@parameter1/object-path';
import { isFunction as isFn } from '@parameter1/utils';
import sift from 'sift';
import validateAsync from '../utils/validate-async.js';
import { encodeCursor } from '../utils/index.js';
import schema from '../schema.js';

import edgesToReturn from './with-objects/edges-to-return.js';
import hasPreviousPage from './with-objects/has-previous-page.js';
import hasNextPage from './with-objects/has-next-page.js';

/**
 * @param {object[]|function} docs The documents to process, either as an array of objects or
 *                                 a function that returns an array of objects.
 * @param {object} options
 * @param {string} [options.idPath=node._id] The path that contains the unique identifier
 *                                           of each document.
 * @param {object} [options.query={}] A MongoDB-like query to filter the documents by (using sift).
 */
export default async (docs = [], params = {}) => {
  const {
    idPath,
    query,
    sort,
    limit,
    cursor,
    direction,
  } = await validateAsync(Joi.object({
    idPath: Joi.string().trim().default('node._id'),
    query: schema.query,
    sort: Joi.array().items(
      Joi.object({
        field: schema.sortField.required(),
        order: schema.sortOrder.required(),
      }),
    ).default([]),
    limit: schema.limit,
    cursor: schema.edgeCursor,
    direction: schema.cursorDirection,
  }), params);

  const sortFieldMap = sort.reduce((map, { field, order }) => {
    map.set(field, order === 1 ? 'asc' : 'desc');
    return map;
  }, new Map());
  if (!sortFieldMap.has(idPath)) sortFieldMap.set(idPath, 'asc');

  let allEdges = (isFn(docs) ? await docs() : docs)
    // filter based on the query
    .filter(sift(query))
    // then apply the cursor
    .map((edge) => {
      const id = get(edge, idPath);
      if (!id) throw new Error(`Unable to extract a node ID using path ${idPath} for edge ${JSON.stringify(edge)}`);
      return { ...edge, cursor: encodeCursor(id) };
    });

  allEdges = orderBy(
    allEdges,
    [...sortFieldMap.keys()].map((path) => (o) => {
      const v = get(o, path);
      if (typeof v === 'string') return sluggify(v);
      return v;
    }),
    [...sortFieldMap.values()],
  );

  const {
    first,
    after,
    last,
    before,
  } = {
    ...(direction === 'AFTER' && {
      first: limit,
      after: cursor,
    }),
    ...(direction === 'BEFORE' && {
      last: limit,
      before: cursor,
    }),
  };

  const toReturn = edgesToReturn({
    allEdges,
    before,
    after,
    first,
    last,
  });

  return {
    totalCount: allEdges.length,
    edges: toReturn,
    pageInfo: {
      hasPreviousPage: () => hasPreviousPage({
        allEdges,
        before,
        after,
        first,
        last,
      }),
      hasNextPage: () => hasNextPage({
        allEdges,
        before,
        after,
        first,
        last,
      }),
      endCursor: async () => {
        const lastEdge = toReturn[toReturn.length - 1];
        return lastEdge ? lastEdge.cursor : '';
      },
      startCursor: async () => {
        const [firstEdge] = toReturn;
        return firstEdge ? firstEdge.cursor : '';
      },
    },
  };
};
