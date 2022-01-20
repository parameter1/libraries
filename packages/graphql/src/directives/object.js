/* eslint-disable no-param-reassign */
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { getAsObject } from '@parameter1/object-path';
import { asObject } from '@parameter1/utils';

export default function objectDirectiveTransformer(schema, directiveName = 'object') {
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
          return asObject(r);
        }
        return getAsObject(obj, name);
      };
    },
  });
}
