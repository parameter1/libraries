const get = require('./get');
const asArray = require('./as-array');

module.exports = (obj, path) => asArray(get(obj, path, []));
