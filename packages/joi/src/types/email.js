export default (joi) => ({
  type: 'email',
  base: joi.string().email({ tlds: { allow: true } }),
});
