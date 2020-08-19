const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

const createError = (value) => new TypeError(`The provided value "${value}" is not a valid date.`);

const createDate = (value) => {
  const date = new Date(value);
  if (!date || !date.getTime()) throw createError(value);
  return date;
};

const parseDate = (value) => {
  if (value instanceof Date) return value;

  if (!value || (typeof value !== 'number' && typeof value !== 'string')) {
    throw createError(value);
  }
  // when a number is provided, assume timestamp and attempt to create the date
  if (typeof value === 'number') return createDate(value);

  // first try to parse the string as a timestamp.
  const timestamp = parseInt(value, 10);
  if (timestamp) return createDate(timestamp);

  // finally, attempt the parse as a date string.
  const date = Date.parse(value);
  if (!date) throw createError(value);
  return date;
};

module.exports = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type.',
  parseValue(value) {
    return parseDate(value);
  },
  serialize(value) {
    try {
      return parseDate(value).getTime();
    } catch (e) {
      return null;
    }
  },
  parseLiteral(ast) {
    const value = ast.kind === Kind.INT ? parseInt(ast.value, 10) : ast.value;
    return parseDate(value);
  },
});
