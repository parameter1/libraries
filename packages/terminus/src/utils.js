export const isFn = (v) => typeof v === 'function';
export const emitError = (e, handler) => {
  if (isFn(handler)) handler(e);
};
export const log = (message) => {
  const { log: emit } = console;
  emit(`> ${message}`);
};
export const wait = (ms) => new Promise((resolve) => {
  setTimeout(resolve, parseInt(ms, 10));
});
