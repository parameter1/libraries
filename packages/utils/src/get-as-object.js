const get = require('./get');
const asObject = require('./as-object');

module.exports = (obj, path) => asObject(get(obj, path, {}));
