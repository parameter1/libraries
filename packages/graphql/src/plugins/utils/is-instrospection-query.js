/**
 * @param {GraphQLRequestContext} requestContext
 */
export default function isIntrospectionQuery(requestContext) {
  const { operation } = requestContext;
  if (!operation || !operation.selectionSet) return false;
  return operation.selectionSet.selections.every((selection) => {
    const fieldName = selection.name.value;
    return fieldName.startsWith('__');
  });
}
