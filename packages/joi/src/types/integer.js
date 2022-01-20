export default (joi) => ({
  type: 'integer',
  base: joi.number().integer(),
});
