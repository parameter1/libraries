export default (joi) => ({
  type: 'expandedHtml',
  base: joi.string().html({ tags: ['br', 'a', 'i', 'b', 'em', 'strong', 'del', 's'] }),
});
