export default ({ allEdges, before, after } = {}) => {
  if (after) {
    const afterEdgeIndex = allEdges.findIndex((edge) => edge.cursor === after);
    if (afterEdgeIndex === -1) return [];
    return allEdges.filter((_, index) => index > afterEdgeIndex);
  }
  if (before) {
    const beforeEdgeIndex = allEdges.findIndex((edge) => edge.cursor === before);
    if (beforeEdgeIndex === -1) return [];
    return allEdges.filter((_, index) => index < beforeEdgeIndex);
  }
  return allEdges;
};
