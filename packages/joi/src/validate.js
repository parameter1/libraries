export default (schema, params, options, statusCode = 422) => {
  const { value, error } = schema.validate(params, options);
  if (error) {
    error.statusCode = statusCode;
    throw error;
  }
  return value;
};
