/* eslint-disable no-param-reassign */
import { mapSchema, MapperKind } from '@graphql-tools/utils';
import getDirectiveArgs from './utils/get-directive-args.js';

export default function connectionProjectDirectiveTransformer(schema, directiveName = 'connectionProject') {
  return mapSchema(schema, {
    [MapperKind.OBJECT_TYPE]: (objConfig) => {
      const args = getDirectiveArgs(schema, objConfig, directiveName);
      if (args && objConfig.astNode) objConfig.astNode.$connectionProjectType = args.type;
    },
  });
}
