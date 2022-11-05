import { jsonServer } from '@parameter1/micro';
import { EJSON } from 'bson';

/**
 * @typedef CreateEJSONServerParams
 * @property {string} name The name of the server
 * @property {object} actions A function hash containing the actions to run.
 * @property {object|function} [context] An optional context object or function to generate a
 *                                       context object that will be sent to all actions
 * @property {string} [limit=1mb] The request body size limit.
 * @property {function} [onActionStart] A function to await before running the action.
 * @property {function} [onActionEnd] A function to await after running the action.
 * @property {function} [onError] A fucntion to run when an error is encountered.
 * @property {function} [errorResponseFn] A function to format the error response.
 * @property {function|boolean} [logErrors] Whether to log errors, or a function to determine if an
 *                                          error should be logged.
 *
 * @param {CreateEJSONServerParams} params
 */
export default function ejsonServer(params) {
  return jsonServer({
    parse: EJSON.parse,
    stringify: EJSON.stringify,
    ...params,
  });
}
