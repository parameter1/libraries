import { hash } from 'object-code';
import is from '@sindresorhus/is';
import mapObj from 'map-obj';

/**
 * @param {Record<string, any>} obj
 * @returns {Record<string, any>}
 */
export function sortObject(obj) {
  return mapObj(obj, (key, value) => {
    if (is.array(value)) {
      return [
        key,
        [...value].sort().map((item) => {
          if (is.plainObject(item)) return sortObject(item);
          return item;
        }),
        { shouldRecurse: false },
      ];
    }
    if (is.object(value) && !is.plainObject(value)) {
      return [key, value, { shouldRecurse: false }];
    }
    return [key, value];
  }, { deep: true });
}

/**
 * @param {Record<string, any>} obj
 * @returns {number}
 */
export function hashObject(obj) {
  return hash(sortObject(obj));
}
