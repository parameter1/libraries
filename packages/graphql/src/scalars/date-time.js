import { GraphQLScalarType } from 'graphql';
import dayjs from '../dayjs.js';

const createError = (value) => new TypeError(`The provided value "${value}" is not a valid date string.`);

const parseDate = (value) => {
  if (!value || typeof value !== 'string') throw createError(value);
  if (/^\d+$/.test(value)) throw createError(value);
  return dayjs.tz(value).toDate();
};

export default new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime type that serializes Date objects to ISO strings, and requires string input.',
  parseValue(value) {
    return parseDate(value);
  },
  serialize(value) {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string') {
      const date = dayjs.tz(value);
      return date.isValid() ? date.toDate() : null;
    }
    return null;
  },
  parseLiteral(ast) {
    return parseDate(ast.value);
  },
});
