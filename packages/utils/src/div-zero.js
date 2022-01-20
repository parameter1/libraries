export default (dividend, divisor, def) => {
  if (!divisor) return def;
  return dividend / divisor;
};
