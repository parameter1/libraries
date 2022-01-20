import Joi from 'joi';

export default {
  query: Joi.object().unknown().default({}),
  limit: Joi.number().min(1).max(100).default(10),
  sort: Joi.object({
    field: Joi.string().trim().default('_id'),
    order: Joi.number().valid(1, -1).default(1),
  }).default({ field: '_id', order: 1 }),
  projection: Joi.object().unknown(),
  collate: Joi.boolean().default(false),
  edgeCursor: Joi.string().trim(),
  cursorDirection: Joi.string().allow('BEFORE', 'AFTER').default('AFTER'),
};
