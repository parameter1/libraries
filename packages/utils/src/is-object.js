/**
 * Determines if a value is an object.
 *
 * @param {*} v The value to test
 * @returns {boolean}
 */
export default (v) => Boolean(v && typeof v === 'object');
