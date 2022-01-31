import { gql } from '../../tag.js';

export default gql`

enum RegexMatchPositionEnum {
  "Will match values that contain the provided phrase."
  CONTAINS
  "Will match values that end with the provided phrase."
  ENDS
  "Will only match values that exactly match the provided phrase."
  EXACT
  "Will match values that start with the provided phrase."
  STARTS
}

enum RegexMatchWordsEnum {
  "Matches any words from the provided phrase."
  ANY
  "Matches all words from the provided phrase."
  ALL
}

`;
