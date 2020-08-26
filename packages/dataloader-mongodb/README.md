# MongoDB Dataloader
Provides a GraphQL dataloader for MongoDB with field projection support.

## Installation
```
yarn add @parameter1/dataloader-mongodb
```

## Usage
Dataloaders should only live per request. For example, using Express...

```js
const express = require('express');
const MongoDBLoader = require('@parameter1/dataloader-mongodb');
const db = require('./your-mongo-client');

const app = express();

app.get('/', (req, res, next) => {
  // get the user collection from mongo.
  const collection = db.collection('users');
  // create the loader during the request
  const userLoader = new MongoDBLoader({ collection });
  // return the user with an id of `1` and only project the `name` field.
  userLoader.load({ id: 1, projection: { name: 1 } }).then((user) => {
    res.send(user);
  }).catch(next);
});

app.listen(2112);
```

When using with GraphQL, context is usually the best bet...

```js
const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const schema = require('./your-schema');
const db = require('./your-mongo-client');

const app = express();

const server = new ApolloServer({
  context: () => {
    const loaders = {
      user: new MongoDBLoader({ collection: db.collection('users') });
    }
    // now `loaders.user` will be available in the resolver context
    return { loaders };
  },
  schema,
});
server.applyMiddleware({ app, path });

app.listen(2112);
```
