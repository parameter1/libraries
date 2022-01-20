export default (joi) => ({
  type: 'fullHtml',
  base: joi.string().html().multiline(),
});
