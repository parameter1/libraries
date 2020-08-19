# GraphQL ObjectID Type
A custom MongoDB ObjectID GraphQL scalar type.

## Installation
```
yarn add @parameter1/graphql-type-objectid
```

## Usage
Add the custom scalar to your resolvers and inject the `ObjectId` class.

```js
// resolvers.js
const GraphQLObjectID = require('@parameter1/graphql-type-objectid');
const { ObjectId } = require('mongodb');

module.exports = {
  ObjectID: GraphQLObjectID(ObjectId),

  // your resovlers here...
};
```

And to your GraphQL type definitions.
```graphql
scalar ObjectID
```
