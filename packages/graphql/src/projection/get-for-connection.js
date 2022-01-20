import { getAsArray } from '@parameter1/object-path';
import getProjection from './get.js';

export default ({
  returnType,
  fieldNodes,
  schema,
  fragments,
}) => {
  let projection;
  const type = returnType.ofType || returnType;
  const { $connectionProjectType } = type.astNode || {};
  if ($connectionProjectType) {
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
          schema.getType($connectionProjectType),
          node.selectionSet,
          fragments,
        ),
      };
    });
  }
  return projection;
};
