# GraphQL Date Type
A custom Date GraphQL scalar type.

## Installation
```
yarn add @parameter1/graphql-type-date
```

## Usage
Add the custom scalar to your resolvers.

```js
// resolvers.js
const GraphQLDate = require('@parameter1/graphql-type-date');

module.exports = {
  Date: GraphQLDate,

  // your resovlers here...
};
```

And to your GraphQL type definitions.
```graphql
scalar Date
```
