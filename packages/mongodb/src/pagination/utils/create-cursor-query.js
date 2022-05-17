import { PropTypes } from '@parameter1/prop-types';
import { get } from '@parameter1/object-path';
import validateAsync from './validate-async.js';
import { decodeCursor } from './cursor.js';
import schema from '../schema.js';

const { object } = PropTypes;

const opMap = new Map([
  [1, '$gt'],
  [-1, '$lt'],
]);

const arrayIndexPattern = /(^.+)(\.)(\d)/;

/**
 * @param {Collection} collection The MongoDB collection to query.
 * @param {object} params
 * @param {string} [params.cursor]
 * @param {string} [params.direction=AFTER]
 * @param {object} params.sort
 * @param {string} [params.sort.field=_id]
 * @param {number} [params.sort.order=1]
 * @param {object} [params.dataloader] An (optional) dataloader to use to batch load the sort docs
 * @returns {Promise<Map>}
 */
export default async (collection, params = {}) => {
  const {
    cursor,
    direction,
    sort,
    dataloader,
  } = await validateAsync(object({
    cursor: schema.edgeCursor,
    direction: schema.cursorDirection,
    sort: schema.sort,
    dataloader: object(),
  }), params);

  // no cursor provided. no additional query criteria is needed.
  if (!cursor) return null;
  const dir = direction === 'AFTER' ? 1 : -1;
  const id = decodeCursor(cursor);
  const { field, order } = sort;
  const op = opMap.get(order * dir);

  if (field === '_id') {
    // simple sort by id.
    return { _id: { [op]: id } };
  }

  // Compound sort.
  // Need to get the document so we can extract the field.
  // If the field contains an array position using dot notation, must use slice.
  // @see https://jira.mongodb.org/browse/SERVER-1831
  const matches = arrayIndexPattern.exec(field);
  const projection = {};
  if (matches && matches[1] && matches[3]) {
    projection[matches[1]] = { $slice: [Number(matches[3]), 1] };
  } else {
    projection[field] = 1;
  }

  // find the sort document
  const doc = await (async () => {
    if (dataloader) return dataloader.load({ value: id, projection });
    return collection.findOne({ _id: id }, { projection });
  })();
  const value = get(doc, field);
  const $or = [
    { [field]: { [op]: value } },
    { [field]: { $eq: value }, _id: { [op]: id } },
  ];
  return { $or };
};
