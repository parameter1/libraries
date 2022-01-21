import { get, getAsArray } from '@parameter1/object-path';
import { mapSchema, MapperKind } from '@graphql-tools/utils';

export default function enumDefaultValuesTransformer(schema, enums) {
  const getValue = (path, throwOnNotFound = false) => {
    const value = get(enums, path);
    if (throwOnNotFound && !value) throw new Error(`Unable to find enum value for path ${path}`);
    return value;
  };

  return mapSchema(schema, {
    [MapperKind.ENUM_TYPE]: (config) => {
      getAsArray(config, '_values').forEach((valueObj) => {
        const path = `${config}.${valueObj.name}`;
        const defaultValue = getValue(path);
        if (defaultValue) valueObj.value = defaultValue; // eslint-disable-line no-param-reassign
      });
    },
  });
}
