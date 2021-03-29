const { getAsArray } = require('@parameter1/utils');
const getProjection = require('./get-projection');

module.exports = ({
  returnType,
  fieldNodes,
  schema,
  fragments,
}) => {
  let projection;
  const { projectUsing } = returnType.ofType || returnType;
  if (projectUsing) {
    /**
     * Support multiple `edges` and `edges { node }` selection sets.
     *
     * For example, a query op could include the following selection:
     * ```
     *  edges {
     *    node {
     *      id
     *    }
     *    node {
     *      foo
     *    }
     *  }
     *  edges {
     *    node {
     *      bar
     *    }
     *  }
     * ```
     * This ensures that all the edges and node selections are merged when projecting.
     * As such the projection results would be `{ id: 1, foo: 1, bar: 1 }`
     */
    const nodeSelections = [];
    const edgeSelections = getAsArray(fieldNodes[0], 'selectionSet.selections').filter((s) => s.name.value === 'edges');

    edgeSelections.forEach((edges) => {
      nodeSelections.push(...getAsArray(edges, 'selectionSet.selections').filter((s) => s.name.value === 'node'));
    });

    projection = {};
    nodeSelections.forEach((node) => {
      projection = {
        ...projection,
        ...getProjection(
          schema,
          schema.getType(projectUsing),
          node.selectionSet,
          fragments,
        ),
      };
    });
  }
  return projection;
};
