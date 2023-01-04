import { gql } from '../../tag.js';

export default gql`

enum CursorPaginationDirectionEnum {
  "Specifies that pagination should find the next results _after_ the provided cursor."
  AFTER
  "Specifies that pagination should find the previous results _before_ the provided cursor."
  BEFORE
}

enum PaginationMethodEnum {
  "Specifies that pagination should use the cursor method."
  CURSOR
  "Specifies that pagination should use the offset method."
  OFFSET
}

type PageInfo {
  "Whether another page of results exists."
  hasNextPage: Boolean!
  "Whether a previous page of results exists."
  hasPreviousPage: Boolean!
  "The final cursor of the page. Can be used as the \`CursorPaginationInput.cursor\` in \`AFTER\` mode for returning more results. Will be an empty string if no edges could be found."
  endCursor: String!
  "The first cursor of the page. Can be used as the \`CursorPaginationInput.cursor\` in \`BEFORE\` mode for returning previous results. Will be an empty string if no edges could be found."
  startCursor: String!
  "The final offset of the page. Can be used as the \`OffsetPaginationInput.offset\` for returning more results. Will always be \`null\` when paginating in \`CURSOR\` mode."
  endOffset: Int
  "The first offset of the page. Can be used as the \`OffsetPaginationInput.offset\` for returning previous results. Will always be \`null\` when paginating in \`CURSOR\` mode."
  startOffset: Int
}


input CursorPaginationInput {
  "The cursor direction: either \`AFTER\` (next) or \`BEFORE\` (previous). Defaults to \`AFTER\` (next) pagination."
  direction: CursorPaginationDirectionEnum! = AFTER
  "The cursor/pointer value to return results from. In \`AFTER\` mode, will return the next results after the provided cursor. In \`BEFORE\` mode, will return the previous results before the provided cursor."
  value: String
}

input OffsetPaginationInput {
  "A non-negative value to of results to skip (start from)."
  value: Int! = 0
}

input PaginationInput {
  "The pagination method to use. By default the API uses \`CURSOR\` pagination."
  using: PaginationMethodEnum! = CURSOR
  "A non-negative value that limits the number of results to return."
  limit: Int! = 10
  "The cursor pagination options. Will only be applied when using the \`CURSOR\` method."
  cursor: CursorPaginationInput! = {}
  "The offset pagination options. Will only be applied when using the \`OFFSET\` method."
  offset: OffsetPaginationInput! = {}
}

`;
