export default (schema, params, options, statusCode = 422) => schema
  .validateAsync(params, options).catch((e) => {
    const err = new Error(e.message);
    err.statusCode = statusCode;
    throw err;
  });
