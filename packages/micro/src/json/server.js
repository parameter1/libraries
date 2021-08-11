const micro = require('micro');
const { isFunction: isFn, get } = require('@parameter1/utils');
const errorHandler = require('./error-handler');

const { json, createError } = micro;

module.exports = ({
  name,
  actions = {},
  context,
  limit = '1mb',

  onActionStart,
  onActionEnd,

  onError,
  errorResponseFn,
  logErrors,
} = {}) => {
  if (!name) throw new Error('No service name was provided.');
  /**
   *
   */
  const actionHandler = async (req, res) => {
    const input = await json(req, { limit });
    const { action: path, params = {}, meta = {} } = input;
    if (!path) throw createError(400, 'No action provided.');

    const fn = get(actions, path);
    if (!isFn(fn)) throw createError(400, `No action found for ${path}`);

    const contextInput = { action: path, params, meta };
    const contextData = isFn(context) ? await context({ req, res, input: contextInput }) : context;

    if (isFn(onActionStart)) await onActionStart(contextData);
    const data = await fn(params || {}, {
      req,
      res,
      meta: meta || {},
      context: contextData || {},
    });
    if (isFn(onActionEnd)) await onActionEnd(contextData);
    return { data };
  };

  /**
   * Returns the wrapped micro server.
   */
  return micro(errorHandler({
    name,
    fn: actionHandler,
    onError,
    createResponse: errorResponseFn,
    logErrors,
  }));
};
