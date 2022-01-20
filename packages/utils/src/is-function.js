/**
 * Determines if a value is a function.
 *
 * @param {*} v The value to test
 * @returns {boolean}
 */
export default (v) => Boolean(v && typeof v === 'function');
