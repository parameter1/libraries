# GraphQL Month Type
A custom MongoDB Month GraphQL scalar type, which parses values in `YYYY-MM` format (e.g. `2021-03`)

## Installation
```
yarn add @parameter1/graphql-type-month
```

## Usage
Add the custom scalar to your resolvers and pass any desired options.

```js
// resolvers.js
const GraphQLMonth = require('@parameter1/graphql-type-month');

module.exports = {
  ObjectID: GraphQLMonth(),

  // your resovlers here...
};
```

And to your GraphQL type definitions.
```graphql
scalar Month
```

## Configuration
The default timezone is `UTC`. To change this, pass a `timezone` value as a resolver option. The value can be any timezone supported by the `dayjs` package.

```js
// resolvers.js
const GraphQLMonth = require('@parameter1/graphql-type-month');

module.exports = {
  ObjectID: GraphQLMonth({ timezone: 'America/Chicago' }),

  // your resovlers here...
};
```
