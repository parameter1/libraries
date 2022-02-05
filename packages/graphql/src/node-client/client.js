import fetch from 'node-fetch';
import { get } from '@parameter1/object-path';
import pkg from '../../package.js';
import GraphQLError from './error.js';

/**
 * Creates a GraphQL client.
 *
 * @param {object} params
 * @param {string} params.url The GraphQL URL to connect to.
 * @param {string} [params.name] The client name.
 * @param {string} [params.version] The client version.
 * @param {object} [params.headers] Headers to send with all requests.
 * @returns {object}
 */
export default function NodeGraphQLClient({
  url,
  name,
  version,
  headers,
} = {}) {
  if (!url) throw new Error('The GraphQL URL is required.');
  const via = [name, version].filter((v) => v).join('/');

  return {
    /**
     * Queries the GraphQL server.
     *
     * @param {object} params
     * @param {string|object} params.query The query operation, either as a string or using gql
     * @param {object} [params.variables] Variables to send with the query.
     * @param {object} [params.headers] Additional headers to send with this request only.
     * @returns {Promise<object>}
     */
    query: async ({ query, variables, headers: reqHeaders } = {}) => {
      if (!query) throw new Error('A query operation must be provided.');
      const q = typeof query === 'string' ? query : get(query, 'loc.source.body');
      if (!q) throw new Error('Unable to extract an operation from the provided query value.');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
          ...reqHeaders,
          'content-type': 'application/json',
          'user-agent': `${pkg.name}/${pkg.version}${via ? ` (via ${via})` : ''}`,
        },
        body: JSON.stringify({
          query: q,
          variables,
        }),
      });
      const json = await res.json();
      if (!res.ok || json.errors) throw new GraphQLError(res, json);
      return json;
    },
  };
}
