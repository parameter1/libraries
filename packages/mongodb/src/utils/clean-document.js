import { ObjectId } from 'mongodb';
import mapObject, { mapObjectSkip } from 'map-obj';
import sortKeys from 'sort-keys';
import is from '@sindresorhus/is';

export default (doc, { mapper, preserveEmptyArrays = false } = {}) => {
  const hasMapper = is.function(mapper);
  const mapped = mapObject(doc, (key, value, source) => {
    if (hasMapper) {
      const result = mapper(key, value, source);
      if (!is.undefined(result)) return result;
    }
    if (value == null) return mapObjectSkip;
    if (is.date(value)) return [key, value, { shouldRecurse: false }];
    if (is.string(value) || is.number(value) || is.boolean(value)) return [key, value];
    if (is.array(value)) {
      if (!value.length) {
        if (preserveEmptyArrays) return [key, value];
        return mapObjectSkip;
      }
      // filter null and undefined
      const filtered = value.filter((v) => {
        if (v == null) return false;
        if (is.plainObject(v) && is.emptyObject(v)) return false;
        return true;
      });
      if (!filtered.length) {
        if (preserveEmptyArrays) return [key, filtered];
        return mapObjectSkip;
      }
      if (is.array(filtered, is.number)
        || is.array(filtered, is.string)
        || is.array(filtered, is.boolean)
      ) {
        return [key, filtered.sort()];
      }
      if (is.array(filtered, is.plainObject)) {
        return [key, filtered.sort((a, b) => {
          const jsonA = JSON.stringify(sortKeys(a));
          const jsonB = JSON.stringify(sortKeys(b));
          if (jsonA > jsonB) return 1;
          if (jsonA < jsonB) return -1;
          return 0;
        })];
      }
      throw new Error('Sorting non-scalar, non-plain object or mixed typed arrays is not supported');
    }
    if (is.directInstanceOf(value, ObjectId)) return [key, value, { shouldRecurse: false }];
    if (is.plainObject(value)) {
      if (is.emptyObject(value)) return mapObjectSkip;
      return [key, value];
    }
    const error = new Error(`Unsupported ${is(value)} type encountered for key ${key}`);
    error.key = key;
    error.value = value;
    error.source = source;
    throw error;
  }, { deep: true });

  // need to run map again to clear any empty objects
  return sortKeys(mapObject(mapped, (key, value) => {
    if (is.directInstanceOf(value, ObjectId)) return [key, value, { shouldRecurse: false }];
    if (is.plainObject(value) && is.emptyObject(value)) return mapObjectSkip;
    if (is.array(value, is.plainObject)) {
      // remove any remaining empty objects.
      return [key, value.filter((v) => !is.emptyObject(v))];
    }
    return [key, value];
  }, { deep: true }), { deep: true });
};
