/* eslint-disable no-param-reassign */
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';

export default function interfaceFieldsDirectiveTransformer(schema, directiveName = 'interfaceFields') {
  return mapSchema(schema, {
    [MapperKind.OBJECT_TYPE]: (objConfig) => {
      const directive = getDirective(schema, objConfig, directiveName);
      const args = directive && directive[0] ? directive[0] : null;
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
