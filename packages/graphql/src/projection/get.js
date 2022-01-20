import { isObject } from '@parameter1/utils';

const { isArray } = Array;

const getFields = (schema, type, selectionSet, fragments, fields = []) => {
  if (!isObject(selectionSet)) return fields;
  const { selections = [] } = selectionSet;
  selections.forEach((set) => {
    const { kind, name, typeCondition } = set;
    switch (kind) {
      case 'Field':
        fields.push({ type, value: name.value });
        break;
      case 'InlineFragment':
        getFields(
          schema,
          schema.getType(typeCondition.name.value),
          set.selectionSet,
          fragments,
          fields,
        );
        break;
      case 'FragmentSpread':
        getFields(
          schema,
          schema.getType(fragments[name.value].typeCondition.name.value),
          fragments[name.value].selectionSet,
          fragments,
          fields,
        );
        break;
      default:
        break;
    }
  });
  return fields;
};

const getReturnType = (type) => {
  if (type.ofType) return getReturnType(type.ofType);
  return type;
};

export default (schema, returnType, selectionSet, fragments) => {
  // recursively find the type.
  const type = getReturnType(returnType);
  // An array of { type, value } objects.
  const selected = getFields(schema, type, selectionSet, fragments);
  const { requiresProject } = type;
  const fields = isArray(requiresProject)
    ? selected.concat(requiresProject.map((value) => ({ type, value })))
    : selected;
  return fields.reduce((o, field) => {
    const map = field.type.getFields();
    if (!map[field.value] || !map[field.value].astNode) return o;
    return ({ ...o, ...map[field.value].astNode.$project || {} });
  }, {});
};
