/* eslint-disable no-param-reassign */
import { mapSchema, MapperKind } from '@graphql-tools/utils';
import { asArray } from '@parameter1/utils';
import { get } from '@parameter1/object-path';
import getDirectiveArgs from './utils/get-directive-args.js';

export default function projectDirectiveTransformer(schema, directiveName = 'project') {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const args = getDirectiveArgs(schema, fieldConfig, directiveName);
      if (!args) return;

      const { astNode } = fieldConfig;
      const definedField = astNode ? astNode.name.value : null;
      const name = args.field || definedField;
      if (astNode) {
        astNode.$dbFieldName = name;
        astNode.$project = asArray(args.needs).reduce((o, key) => ({
          ...o,
          [key]: 1,
        }), { [name]: 1 });
        if (!fieldConfig.resolve) fieldConfig.resolve = (obj) => get(obj, name);
      }
    },
  });
}
