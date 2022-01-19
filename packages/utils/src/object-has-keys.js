/**
 * Determines if a value is an object with keys.
 *
 * @param {*} v The value to test
 * @returns {boolean}
 */
export default (v) => Boolean(v && Object.keys(v).length);
