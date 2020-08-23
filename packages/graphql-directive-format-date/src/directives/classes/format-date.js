/* eslint-disable no-param-reassign */
const { SchemaDirectiveVisitor } = require('apollo-server-express');
const { get, getAsObject } = require('@parameter1/utils');
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

      const input = getAsObject(args, inputArg);
      const { format, timezone } = input;
      if (timezone) moment.tz(timezone);
      return format ? moment.format(format) : moment.toISOString();
    };
  }
}

module.exports = FormatDateDirective;
