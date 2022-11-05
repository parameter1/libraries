import micro from 'micro';

export const { createError } = micro;

/**
 *
 * @param {function} fn
 * @param {Set} [allowedCodes=401, 403, 404, 409]
 * @returns {Promise<any>}
 */
export async function covertActionError(fn, allowedCodes = new Set([401, 403, 404, 409])) {
  try {
    const result = await fn();
    return result;
  } catch (e) {
    if (allowedCodes.has(e.statusCode)) throw e;
    e.statusCode = 500;
    throw e;
  }
}
