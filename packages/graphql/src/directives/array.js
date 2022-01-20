/* eslint-disable no-param-reassign */
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { getAsArray } from '@parameter1/object-path';
import { asArray } from '@parameter1/utils';

export default function arrayDirectiveTransformer(schema, directiveName = 'array') {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const directive = getDirective(schema, fieldConfig, directiveName);
      const args = directive && directive[0] ? directive[0] : null;
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
