import getProjection from './get.js';

export default (info) => {
  const {
    returnType,
    fieldNodes,
    schema,
    fragments,
  } = info;
  return getProjection(schema, returnType, fieldNodes[0].selectionSet, fragments);
};
