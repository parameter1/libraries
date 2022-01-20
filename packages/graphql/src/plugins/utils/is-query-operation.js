/**
 * @param {GraphQLRequestContext} requestContext
 */
export default function isQueryOperation(requestContext) {
  const { operation } = requestContext;
  return operation && operation.operation === 'query';
}
