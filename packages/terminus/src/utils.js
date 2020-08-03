const isFn = (v) => typeof v === 'function';

module.exports = {
  /**
   *
   */
  emitError: (e, handler) => {
    if (isFn(handler)) handler(e);
  },

  /**
   *
   */
  isFn,

  /**
   *
   */
  log: (message) => {
    const { log: emit } = console;
    emit(`> ${message}`);
  },

  /**
   *
   */
  wait: (ms) => new Promise((resolve) => setTimeout(resolve, parseInt(ms, 10))),
};
