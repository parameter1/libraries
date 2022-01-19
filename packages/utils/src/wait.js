/**
 * Waits (sleeps) for the specified number of milliseconds (via `setTimeout`).
 *
 * @param {number} ms
 * @returns {Promise}
 */
export default (ms) => {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
