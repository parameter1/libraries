import micro from 'micro';
import { isFunction as isFn } from '@parameter1/utils';
import { get } from '@parameter1/object-path';
import errorHandler from './error-handler.js';

const { text, createError } = micro;

export default ({
  name,
  actions = {},
  context,
  limit = '1mb',

  onActionStart,
  onActionEnd,

  onError,
  errorResponseFn,
  logErrors,

  parse = JSON.parse,
  stringify = JSON.stringify,
} = {}) => {
  if (!name) throw new Error('No service name was provided.');
  /**
   *
   */
  const actionHandler = async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const body = await text(req, { limit });
    const input = parse(body);
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
    return stringify({ data });
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
    stringify,
  }));
};
