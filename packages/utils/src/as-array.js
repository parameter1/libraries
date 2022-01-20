/**
 * Forces a value to be returned as an array.
 *
 * @param {*} v The value to process.
 * @returns {array}
 */
export default (v) => (Array.isArray(v) ? v : []);
