module.exports = (ObjectId) => (joi) => ({
  type: 'mongoId',
  base: joi.any(),
  messages: {
    'mongoId.base': '{{#label}} must be an ObjectId',
  },
  validate(value, helpers) {
    if (value instanceof ObjectId) return { value };
    if (/[0-9a-f]{24}/.test(value)) return { value: ObjectId.createFromHexString(value) };
    return { value, errors: helpers.error('mongoId.base') };
  },
});
