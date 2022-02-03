export default class GraphQLError extends Error {
  constructor(res, json) {
    const message = json && json.errors && json.errors[0]
      ? json.errors[0].message : res.statusText;
    super(message);

    Error.captureStackTrace(this, GraphQLError);

    this.name = 'GraphQLError';
    this.status = res.status;
    this.statusCode = res.status;
    this.json = json;
    this.res = res;
  }
}
