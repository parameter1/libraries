import { covertActionError, jsonClient } from '@parameter1/micro';
import { EJSON } from 'bson';

export default class EJSONClient {
  /**
   * @typedef EJSONClientConstructorParams
   * @property {string} url The server URL to make requests to.
   * @property {object} [headers={}] Global headers to append to _all_ requests.
   *
   * @param {EJSONClientConstructorParams} params
   */
  constructor({ url, headers = {} }) {
    this.client = jsonClient({
      parse: EJSON.parse,
      stringify: EJSON.stringify,
      url,
      headers,
    });
  }

  /**
   * @typedef EJSONClientRequestOptions
   * @property {boolean} [convertErrors=false] Whether to convert errors to 500s.
   * @property {number[]} [allowedStatusCodes=[401, 403, 404, 409]] Status codes that will not
   *                                                                be converted
   * @property {object} [meta={}] An optional meta object to send to the server action.
   * @property {object} [headers={}] Optional headers to send with this request only.
   * @property {object} [fetchOptions={}] Options to send to the `node-fetch` request.
   *
   * @param {string} action The action to run.
   * @param {object} [params={}] The action input parameters.
   * @param {EJSONClientRequestOptions} [options] Additional request options.
   */
  async request(action, params = {}, options = {}) {
    const { allowedStatusCodes, convertErrors, ...opts } = options;

    if (convertErrors) {
      return covertActionError(
        () => this.client.request(action, params, opts),
        new Set(allowedStatusCodes),
      );
    }
    return this.client.request(action, params, opts);
  }
}
