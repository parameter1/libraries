import applyCursorsToEdges from './apply-cursors-to-edges.js';

export default ({
  allEdges,
  before,
  after,
  first,
}) => {
  if (first) {
    const edges = applyCursorsToEdges({ allEdges, before, after });
    return edges.length > first;
  }
  if (before) {
    const targetEdgeIndex = allEdges.findIndex((edge) => edge.cursor === before);
    if (!targetEdgeIndex) return false;
    return allEdges.length > targetEdgeIndex;
  }
  return false;
};
