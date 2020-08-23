const { gql } = require('apollo-server-express');

module.exports = gql`

directive @formatDate(field: String, inputArg: String = "input.date") on FIELD_DEFINITION

input FormatDateInput {
  format: String
  timezone: String
}

`;
