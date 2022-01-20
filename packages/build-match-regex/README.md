# Build Match Regex
Builds regular expressions for matching parts of a phrase to a value. Useful for autocompleters, typeaheads, or quasi-search functions.

## Installation
```
yarn add @parameter1/build-match-regex
```

## Usage
```js
import buildMatchRegex from '@parameter1/build-match-regex';

const phrase = 'quick brown fox';
const regex = buildMatchRegex({
  phrase,
  // can be one of 'starts', 'ends', 'exact', or 'contains'
  position: 'contains', // default
  // can be either 'all' or 'any'
  words: 'all', // default
  insensitive: true, // default, set to false to force case-sensitivity
});

regex.test('brown fox'); // false
regex.test('brown fox quick'); // true
regex.test('Quickest Brownest Fox!'); // true
```

### Options

Assuming a phrase of `quick brown fox`...

Position `starts`:
 - Words: `any`
   - Where a value starts with `quick`, `brown`, or `fox`
   - `/^quick|^brown|^fox/i`
 - Words: `all`
   - Where a value literally starts with `quick brown fox`
   - `/^quick brown fox/i`

Position `ends`:
 - Words: `any`
   - Where a value ends with `quick`, `brown`, or `fox`
   - `/quick$|brown$|fox$/i`
 - Words: `all`
   - Where a value literally ends with `quick brown fox`
   - `/quick brown fox$/i`

Position: `exact`:
 - Words: `any`
   - Where a value exactly matches `quick`, `brown`, or `fox`
   - `/^quick$|^brown$|^fox$/i`
 - Words: `all`
   - Where a value exactly matches `quick brown fox`
   - `/^quick brown fox$/i`

Position `contains`:
 - Words: `any`
   - Where a value contains any partial matches of `quick`, `brown`, or `fox`
   - `/quick|brown|fox/i`
 - Words: `all`
   - Where a value contains all partial matches of `quick`, `brown`, and `fox`
   - `/(?=.*quick)(?=.*brown)(?=.*fox)/i`
