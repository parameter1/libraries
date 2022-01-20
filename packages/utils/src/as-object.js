import isObject from './is-object.js';

/**
 * Forces a value to be returned as an object.
 *
 * @param {*} v The value to process.
 * @returns {array}
 */
export default (v) => (isObject(v) ? v : {});
