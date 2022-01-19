import { inspect } from 'util';
import get from './get.js';
import getAsArray from './get-as-array.js';
import getAsObject from './get-as-object.js';

/**
 * Wraps an object with path getters.
 *
 * @param {object} obj
 * @returns {object} The wrapped object.
 */
export default (obj) => ({
  /**
   * Inspects the wrapped object.
   *
   * @param {object} opts
   */
  inspect: (opts = {}) => inspect(obj, { colors: true, depth: 5, ...opts }),

  /**
   * Gets a value from the object for the provided dot-notated path.
   *
   * @param {string} path The dot-notated path.
   * @param {*} def The default value if undefined.
   */
  get: (path, def) => get(obj, path, def),

  /**
   * Gets and forces an array value from the object for the provided dot-notated path.
   *
   * @param {string} path The dot-notated path.
   */
  getAsArray: (path) => getAsArray(obj, path),

  /**
   * Gets and forces an object value from the object for the provided dot-notated path.
   *
   * @param {string} path The dot-notated path.
   */
  getAsObject: (path) => getAsObject(obj, path),

  /**
   * Returns the original object as-is.
   */
  unwrap: () => obj,
});
