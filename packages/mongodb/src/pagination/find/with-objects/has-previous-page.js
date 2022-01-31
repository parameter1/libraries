import applyCursorsToEdges from './apply-cursors-to-edges.js';

export default ({
  allEdges,
  before,
  after,
  last,
} = {}) => {
  if (last) {
    const edges = applyCursorsToEdges({ allEdges, before, after });
    return edges.length > last;
  }
  if (after) {
    const targetEdgeIndex = allEdges.findIndex((edge) => edge.cursor === after);
    return allEdges.length - 1 > targetEdgeIndex;
  }
  return false;
};
