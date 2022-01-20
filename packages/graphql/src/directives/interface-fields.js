/* eslint-disable no-param-reassign */
import { mapSchema, MapperKind } from '@graphql-tools/utils';
import getDirectiveArgs from './utils/get-directive-args.js';

export default function interfaceFieldsDirectiveTransformer(schema, directiveName = 'interfaceFields') {
  return mapSchema(schema, {
    [MapperKind.OBJECT_TYPE]: (objConfig) => {
      const args = getDirectiveArgs(schema, objConfig, directiveName);
      if (!args) return;

      const current = objConfig.getFields();
      objConfig.getInterfaces().forEach((iface) => {
        const fields = iface.getFields();
        Object.keys(fields).forEach((name) => {
          if (!current[name]) objConfig._fields[name] = fields[name];
        });
      });
    },
  });
}
