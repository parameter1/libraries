import isObject from './is-object.js';
import isFunction from './is-function.js';

export default (value, def = null) => {
  if (Number.isNaN(value)) return def;
  if (Array.isArray(value)) return def;
  if (isObject(value)) return def;
  if (isFunction(value)) return def;
  if (value == null) return def;
  return `${value}`.trim() || def;
};
