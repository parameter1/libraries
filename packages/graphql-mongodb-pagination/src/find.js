const { createResponse, createQuery } = require('./utils');
const Limit = require('./limit');
const Sort = require('./sort');

const { isArray } = Array;

/**
 * @param {object} collection The MongoDB collection
 * @param {object} params
 * @param {object} [params.query] Optional query criteria
 * @param {number} [params.limit=10] The number of results to return
 * @param {string} [params.after] The after cursor
 * @param {object} params.sort
 * @param {string} [params.sort.field=_id]
 * @param {number|string} [params.sort.order=1]
 * @param {object} [params.sort.options]
 * @param {object} [params.projection] Projection to apply to the returned documents
 * @param {boolean} [params.collated=false] Whether to apply collation to the sort
 * @param {object} [params.additionalData] Additional data to apply to paginated result
 */
module.exports = async (collection, {
  query,
  limit = 10,
  after,
  sort = { field: '_id', order: 1 },
  projection,
  excludeProjection,
  collate = false,
  additionalData,
}) => {
  const $limit = new Limit({ value: limit });
  const $sort = new Sort(sort);
  const $projection = projection && typeof projection === 'object' ? {
    ...projection,
    _id: 1,
  } : undefined;

  // project the sort field, only if its parent field isn't already selected.
  if ($projection) {
    const [sortPrefix] = $sort.field.split('.');
    if (!$projection[sortPrefix]) $projection[$sort.field] = 1;
  }

  if ($projection && isArray(excludeProjection)) {
    excludeProjection.forEach((key) => delete $projection[key]);
  }

  const params = {
    query,
    sort: $sort,
    limit: $limit,
    after,
  };

  const paginatedQuery = await createQuery(collection, params);
  const $query = { $and: [paginatedQuery, query] };

  const options = {
    sort: $sort.value,
    limit: $limit.value === 0 ? 0 : $limit.value + 1, // peek to see if there is another page.
    projection: $projection,
  };
  if (collate) options.collation = $sort.collation;

  const results = await collection.find($query, options);

  return createResponse(collection, results, params, additionalData);
};
