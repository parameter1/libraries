/* eslint-disable no-param-reassign */
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';

export default function connectionProjectDirectiveTransformer(schema, directiveName = 'connectionProject') {
  return mapSchema(schema, {
    [MapperKind.OBJECT_TYPE]: (objConfig) => {
      const directive = getDirective(schema, objConfig, directiveName);
      const args = directive && directive[0] ? directive[0] : null;
      if (args && objConfig.astNode) objConfig.astNode.$connectionProjectType = args.type;
    },
  });
}
