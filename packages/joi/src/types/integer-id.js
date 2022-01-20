export default (joi) => ({
  type: 'integerId',
  base: joi.integer().min(1),
});
