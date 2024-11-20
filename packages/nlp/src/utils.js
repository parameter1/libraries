/**
 *
 * @param {?string} value
 * @returns {string[]}
 */
export function splitSlug(value) {
  return value ? value.split('-').filter((v) => v) : [];
}
