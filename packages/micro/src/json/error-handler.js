const { send } = require('micro');
const { isFunction: isFn } = require('@parameter1/utils');

const dev = process.env.NODE_ENV === 'development';
const { error: log } = console;

const defaultResponse = ({ name, error: e, status }) => {
  const { message, stack } = e;
  const obj = {
    error: true,
    name,
    status,
    message,
  };
  if (dev && stack) obj.stack = stack.split('\n');
  return obj;
};

module.exports = ({
  name,
  fn,
  onError,
  createResponse,
  logErrors = true,
}) => async (req, res) => {
  try {
    return await fn(req, res);
  } catch (e) {
    const { stack } = e;
    const status = e.statusCode || e.status || 500;
    const buildResponse = isFn(createResponse) ? createResponse : defaultResponse;
    const obj = buildResponse({ name, error: e, status });
    send(res, status, obj);
    if (e instanceof Error) {
      if (logErrors === true) log(`${status} ${stack}`);
      if (isFn(logErrors) && logErrors({ e, status })) log(`${status} ${stack}`);
    } else {
      log('Unknown Error instance.', e);
    }
    if (isFn(onError)) {
      try {
        await onError({ e, status });
      } catch (ex) {
        log('ON ERROR CALLBACK FAILED!', ex);
      }
    }
  }
  // must return undefined so micro.run doesn't send a 204
  return undefined;
};
