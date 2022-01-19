export default (value, { type = 'integer', defaultValue = null } = {}) => {
  if (type === 'integer') {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  }
  if (type === 'float') {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  }
  throw new Error(`The provided number type ${type} is not supported.`);
};
