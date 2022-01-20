export default (joi) => ({
  type: 'limitedHtml',
  base: joi.string().html({ tags: ['i', 'b', 'em', 'strong', 'del', 's'] }),
});
