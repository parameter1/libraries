import { asObject } from '@parameter1/utils';
import get from './get.js';

/**
 * Gets an object path value (via dot-notation) as an object.
 *
 * @param {object} obj
 * @param {string} path
 * @returns {object}
 */
export default (obj, path) => asObject(get(obj, path, {}));
