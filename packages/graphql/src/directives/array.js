/* eslint-disable no-param-reassign */
import { mapSchema, MapperKind } from '@graphql-tools/utils';
import { getAsArray } from '@parameter1/object-path';
import { asArray } from '@parameter1/utils';
import getDirectiveArgs from './utils/get-directive-args.js';

export default function arrayDirectiveTransformer(schema, directiveName = 'array') {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const args = getDirectiveArgs(schema, fieldConfig, directiveName);
      if (!args) return;

      const { astNode } = fieldConfig;
      const definedField = astNode ? astNode.name.value : null;
      const name = args.field || definedField;

      const { resolve: defaultFieldResolver } = fieldConfig;
      fieldConfig.resolve = async (obj, ...rest) => {
        if (defaultFieldResolver) {
          const r = await defaultFieldResolver(obj, ...rest);
          return asArray(r);
        }
        return getAsArray(obj, name);
      };
    },
  });
}
