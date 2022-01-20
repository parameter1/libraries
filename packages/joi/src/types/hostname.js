export default (joi) => ({
  type: 'hostname',
  base: joi.string().domain({ tlds: { allow: true } }),
});
