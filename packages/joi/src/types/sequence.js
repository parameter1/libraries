export default (joi) => ({
  type: 'sequence',
  base: joi.integer().default(0),
});
