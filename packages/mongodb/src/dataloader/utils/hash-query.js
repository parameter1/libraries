import objectHash from 'object-hash';
import { EJSON } from 'bson';

export default (query, options) => {
  if (!query) return null;
  return objectHash(EJSON.serialize(query), options);
};
