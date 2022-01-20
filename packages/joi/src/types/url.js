export default (joi) => ({
  type: 'url',
  base: joi.string().uri({ scheme: ['http', 'https'], domain: { tlds: { allow: true } } }),
});
