const { gql } = require('apollo-server-express');

module.exports = gql`

directive @auth on FIELD_DEFINITION
directive @project(field: String, needs: [String!] = []) on FIELD_DEFINITION

`;
