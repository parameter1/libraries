/* eslint-disable no-param-reassign */
const { SchemaDirectiveVisitor } = require('apollo-server-express');
const { get, getAsObject, asObject } = require('@parameter1/utils');
const moment = require('moment-timezone');

class FormatDateDirective extends SchemaDirectiveVisitor {
  /**
   *
   * @param {*} field
   */
  visitFieldDefinition(field) {
    // eslint-disable-next-line no-param-reassign
    field.resolve = async (obj, args) => {
      const { field: fieldPath, inputArg } = this.args;

      const value = get(obj, fieldPath || field.name);
      const date = moment(value);
      if (!date.isValid()) return null;

      const input = inputArg ? getAsObject(args, inputArg) : asObject(args);
      const { format = 'YYYY-MM-DDTHH:mm:ss.SSSZ', timezone } = input;
      if (timezone) date.tz(timezone);
      return format ? date.format(format) : date.toISOString();
    };
  }
}

module.exports = FormatDateDirective;
