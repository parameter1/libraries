/* eslint-disable no-param-reassign */
const { SchemaDirectiveVisitor } = require('apollo-server-express');
const { get, asArray } = require('@parameter1/utils');

class ProjectDirective extends SchemaDirectiveVisitor {
  /**
   *
   * @param {*} field
   */
  visitFieldDefinition(field) {
    const { field: localField, needs } = this.args;
    const name = localField || field.name;

    field.project = asArray(needs).reduce((o, key) => ({ ...o, [key]: 1 }), { [name]: 1 });

    if (!field.resolve && localField) {
      // Add field resolution when a local field is specified (and another resolver is not).
      field.resolve = (obj) => get(obj, name);
    }
  }
}

module.exports = ProjectDirective;
