export default (joi) => ({
  type: 'slug',
  base: joi.string()
    .lowercase()
    .pattern(/^[a-z0-9-]+$/, 'lowercase alpha-numeric with dashes')
    .pattern(/--+/, { name: 'more than one consecutive dash', invert: true })
    .pattern(/^-/, { name: 'starting with a dash', invert: true })
    .pattern(/-$/, { name: 'ending with a dash', invert: true }),
});
