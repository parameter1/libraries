const { gql } = require('graphql-tag');

module.exports = gql`

enum SortOrderEnum {
  ASC
  DESC
}

type PageInfo {
  "Whether another page of results exists."
  hasNextPage: Boolean!
  "The final cursor of the page. Should be used as the \`PaginationInput.after\` cursor for returning more results. Will be \`null\` if no additional pages exist."
  endCursor: String
}

input PaginationInput {
  "The number of results to return. A value of \`0\` will return all results."
  limit: Int = 20
  "The number of results to skip. When null, no results are skipped."
  skip: Int
  "The cursor to start returning results after."
  after: String
}

`;
