import Joi from 'joi';
import { EJSON } from 'bson';
import validateAsync from '../utils/validate-async.js';
import { createCursorQuery, encodeCursor, invertSort } from '../utils/index.js';
import schema from '../schema.js';

const prepareQueryOptions = ({
  direction,
  sort,
  limit,
  projection,
  collate,
} = {}) => {
  const $sort = {
    [sort.field]: sort.order,
    _id: sort.order, // always include id, last.
  };
  return {
    // invert the sort when doing before queries
    sort: direction === 'BEFORE' ? invertSort($sort) : $sort,
    limit: limit + 1, // peek for another record
    projection: { ...projection, _id: 1 },
    ...(collate && { collation: { locale: 'en_US' } }),
  };
};

const executeQuery = async (collection, {
  query,
  options,
  direction,
  limit,
} = {}) => {
  const results = await collection.find(query, options).toArray();
  if (direction === 'BEFORE') results.reverse();
  const hasMoreResults = results.length > limit;
  // Remove the extra model that was queried to peek for the next/previous page.
  const fnName = direction === 'BEFORE' ? 'shift' : 'pop';
  if (hasMoreResults) results[fnName]();
  return { hasMoreResults, results };
};

const buildEdges = async ({ runQuery }) => {
  const { results } = await runQuery();
  return results.map((node) => ({ node, cursor: () => encodeCursor(node._id) }));
};

export default async (collection, params = {}) => {
  const {
    query,
    sort,
    limit,
    cursor,
    direction,
    projection,
    collate,
    dataloader,
  } = await validateAsync(Joi.object({
    query: schema.query,
    sort: schema.sort,
    limit: schema.limit,
    cursor: schema.edgeCursor,
    direction: schema.cursorDirection,
    projection: schema.projection,
    collate: schema.collate,
    dataloader: Joi.object(),
  }), params);

  // prepare/format the query options.
  // this will adjust the limit to peek for additional records
  // and properly handle the sort direction.
  // projection will also be formatted accordingly.
  const queryOptions = prepareQueryOptions({
    direction,
    sort,
    limit,
    projection,
    collate,
  });

  // build the query criteria when a cursor value is present.
  const cursorQuery = await createCursorQuery(collection, {
    cursor,
    direction,
    sort,
    dataloader,
  });

  // build the final pagination query
  const paginationQuery = cursorQuery ? { $and: [cursorQuery, query] } : query;

  let promise;
  const runQuery = () => {
    if (promise) return promise;
    promise = executeQuery(collection, {
      query: paginationQuery,
      options: queryOptions,
      direction,
      limit,
    });
    return promise;
  };

  const hasAnotherPage = async (search, replace) => {
    if (!cursor) return false;
    const { results } = await runQuery();
    if (!results.length) return false;
    // cursor exists, check for previous document.
    const pageQuery = EJSON.parse(EJSON.stringify(cursorQuery)
      .replace(search, replace));
    const doc = await collection.findOne({ $and: [pageQuery, query] }, {
      projection: { _id: 1 },
      sort: queryOptions.sort, // must use prepared sort (handle inversion)
    });
    return Boolean(doc);
  };

  return {
    // use the base query, not the cursor query, to count all docs
    totalCount: () => collection.countDocuments(query),
    edges: () => buildEdges({ runQuery }),
    pageInfo: {
      hasNextPage: async () => {
        if (direction === 'AFTER') {
          const { hasMoreResults } = await runQuery();
          return hasMoreResults;
        }
        // in before mode, check for next page.
        return hasAnotherPage(/"\$lt":/g, '"$gte":');
      },
      hasPreviousPage: async () => {
        if (direction === 'BEFORE') {
          const { hasMoreResults } = await runQuery();
          return hasMoreResults;
        }
        // in after mode, check for previous page.
        return hasAnotherPage(/"\$gt":/g, '"$lte":');
      },
      startCursor: async () => {
        const { results } = await runQuery();
        const [firstNode] = results;
        return firstNode ? encodeCursor(firstNode._id) : '';
      },
      endCursor: async () => {
        const { results } = await runQuery();
        const lastNode = results[results.length - 1];
        return lastNode ? encodeCursor(lastNode._id) : '';
      },
    },
  };
};
