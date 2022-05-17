import { ObjectId } from 'mongodb';
import mapObject, { mapObjectSkip } from 'map-obj';
import sortKeys from 'sort-keys';
import is from '@sindresorhus/is';

export { mapObjectSkip } from 'map-obj';

export class CleanDocument {
  static array(arr) {
    if (!is.array(arr)) return [];
    const cleaned = arr.map(CleanDocument.value).filter((v) => v != null);
    // sort when all array values are strings, numbers, or booleans.
    if (is.array(cleaned, is.number)
      || is.array(cleaned, is.string)
      || is.array(cleaned, is.boolean)
    ) {
      return cleaned.sort();
    }
    return cleaned;
  }

  static object(obj) {
    if (is.undefined(obj)) return undefined;
    if (!is.object(obj) || (is.plainObject(obj) && is.emptyObject(obj))) return null;

    if (is.directInstanceOf(obj, ObjectId)) return obj;
    if (is.function(obj.toObject)) return obj.toObject();
    if (is.date(obj)) return obj;

    const mapped = mapObject(obj, (key, value) => {
      const v = CleanDocument.value(value);
      if (is.undefined(v)) return mapObjectSkip;
      return [key, v];
    });
    const sorted = sortKeys(mapped);
    return is.emptyObject(sorted) ? null : sorted;
  }

  static value(value) {
    if (is.function(value)) return null;
    if (is.array(value)) return CleanDocument.array(value);
    if (is.object(value)) return CleanDocument.object(value);
    return value;
  }
}

export default function cleanDocument(doc, {
  mapper,
  preserveEmptyArrays = false,
  mapsAsArrays = false,
  objectArraySorter,
} = {}) {
  const hasMapper = is.function(mapper);
  const mapped = mapObject(doc, (key, value, source) => {
    // convert sets and maps first.
    let val = value;
    if (is.set(value)) val = [...value];
    if (is.map(value)) {
      if (mapsAsArrays) {
        val = [...value.values()];
      } else {
        val = [...value].reduce((o, [k, v]) => ({ ...o, [k]: v }), {});
      }
    }

    if (hasMapper) {
      const result = mapper(key, val, source);
      if (!is.undefined(result)) return result;
    }
    if (val == null) return mapObjectSkip;
    if (is.date(val)) return [key, val, { shouldRecurse: false }];
    if (is.string(val) || is.number(val) || is.boolean(val)) return [key, val];
    if (is.array(val)) {
      if (!val.length) {
        if (preserveEmptyArrays) return [key, val];
        return mapObjectSkip;
      }
      // filter null and undefined
      const filtered = val.filter((v) => {
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
        if (is.function(objectArraySorter)) {
          const sortedObjValue = objectArraySorter(key, filtered, source);
          if (sortedObjValue !== false) return sortedObjValue;
        }

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
    if (is.directInstanceOf(val, ObjectId)) return [key, val, { shouldRecurse: false }];
    if (is.plainObject(val)) {
      if (is.emptyObject(val)) return mapObjectSkip;
      return [key, val];
    }
    const error = new Error(`Unsupported ${is(val)} type encountered for key ${key}`);
    error.key = key;
    error.value = val;
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
}
