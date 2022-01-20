import { ObjectId } from '@parameter1/mongodb';

const pattern = /[0-9a-f]{24}/i;

export default (joi) => ({
  type: 'objectId',
  base: joi.any(),
  messages: {
    'objectId.base': '{{#label}} must be an ObjectId',
  },
  coerce(value) {
    if (value instanceof ObjectId) return { value };
    if (pattern.test(`${value}`)) return { value: ObjectId.createFromHexString(`${value}`) };
    if (value == null) return { value: null };
    return { value: false };
  },
  validate(value, helpers) {
    return {
      value,
      ...(!value && { errors: helpers.error('objectId.base') }),
    };
  },
});
