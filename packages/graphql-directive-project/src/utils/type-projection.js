const getProjection = require('./get-projection');

module.exports = (info) => {
  const {
    returnType,
    fieldNodes,
    schema,
    fragments,
  } = info;
  return getProjection(schema, returnType, fieldNodes[0].selectionSet, fragments);
};
