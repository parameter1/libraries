/* eslint-disable no-param-reassign */
const { SchemaDirectiveVisitor } = require('apollo-server-express');

class ProjectUsingDirective extends SchemaDirectiveVisitor {
  visitObject(object) {
    const { type } = this.args;
    object.projectUsing = type;
  }
}

module.exports = ProjectUsingDirective;
