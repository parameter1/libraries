const { gql } = require('apollo-server-express');

module.exports = gql`

directive @project(field: String, needs: [String!] = []) on FIELD_DEFINITION
directive @projectUsing(type: String!) on OBJECT

`;
