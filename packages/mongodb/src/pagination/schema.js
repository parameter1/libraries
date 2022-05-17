import { PropTypes } from '@parameter1/prop-types';

const {
  boolean,
  object,
  number,
  string,
} = PropTypes;

const cursorDirections = ['BEFORE', 'AFTER', 'before', 'after'];

export default {
  query: object().unknown().default({}),
  limit: number().min(1).max(100).default(10),
  sort: object({
    field: string().trim().default('_id'),
    order: number().valid(1, -1).default(1),
  }).default({ field: '_id', order: 1 }),
  projection: object().unknown(),
  collate: boolean().default(false),
  edgeCursor: string().trim(),
  cursorDirection: string().uppercase().allow(...cursorDirections).default('AFTER'),
  sortField: string().trim(),
  sortOrder: number().valid(1, -1),
};
