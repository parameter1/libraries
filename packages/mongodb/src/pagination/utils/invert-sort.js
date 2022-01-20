export default (sort) => Object.keys(sort).reduce((o, key) => ({
  ...o,
  [key]: sort[key] * -1,
}), {});
