/* eslint-disable no-param-reassign */
import { mapSchema, MapperKind } from '@graphql-tools/utils';
import getDirectiveArgs from './utils/get-directive-args.js';

export default function deprecatedDirectiveTransformer(schema, directiveName = 'deprecated') {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const args = getDirectiveArgs(schema, fieldConfig, directiveName);
      if (args) fieldConfig.deprecationReason = args.reason;
      return fieldConfig;
    },

    [MapperKind.ENUM_VALUE]: (enumValueConfig) => {
      const args = getDirectiveArgs(schema, enumValueConfig, directiveName);
      if (args) enumValueConfig.deprecationReason = args.reason;
      return enumValueConfig;
    },
  });
}
