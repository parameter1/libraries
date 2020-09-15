/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
const { SchemaDirectiveVisitor } = require('apollo-server-express');

class InterfaceFieldsDirective extends SchemaDirectiveVisitor {
  /**
   *
   * @param {*} object
   */
  visitObject(object) {
    const current = object.getFields();
    object.getInterfaces().forEach((iface) => {
      const fields = iface.getFields();
      Object.keys(fields).forEach((name) => {
        if (!current[name]) {
          // eslint-disable-next-line no-underscore-dangle
          object._fields[name] = fields[name];
        }
      });
    });
  }
}

module.exports = InterfaceFieldsDirective;
