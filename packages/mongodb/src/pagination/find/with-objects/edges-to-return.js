import applyCursorsToEdges from './apply-cursors-to-edges.js';

export default ({
  allEdges,
  before,
  after,
  first,
  last,
} = {}) => {
  const edges = applyCursorsToEdges({ allEdges, before, after });
  if (first) return edges.slice(0, first);
  if (last) return edges.slice().reverse().slice(0, last).reverse(); // preserves the order
  return allEdges;
};
