const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

const pattern = /^[0-9a-f]{24}$/i;

const createError = (value) => new TypeError(`The provided value "${value}" is not a valid ObjectID.`);

module.exports = (ObjectId) => {
  const createFromString = (value) => {
    if (typeof value !== 'string' || !pattern.test(value)) {
      throw createError(value);
    }
    return ObjectId.createFromHexString(value);
  };

  return new GraphQLScalarType({
    name: 'ObjectID',
    description: 'MongoDB ObjectID type.',
    parseValue(value) {
      return createFromString(value);
    },
    serialize(value) {
      if (value instanceof ObjectId) return value.toHexString();
      try {
        return createFromString(value);
      } catch (e) {
        return null;
      }
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) return createFromString(ast.value);
      throw createError(ast.value);
    },
  });
};
