# Terminus Bootstrapper
A terminus bootstrapper for running servers/microservices.

## Installation
```
yarn add @parameter1/terminus
```

## Usage
To boot a service, import the `@parameter1/terminus/boot-service` file and execute it in the entrypoint of your project. You must provide an `http.Server`-like object that contains the server you wish to run. For example (using Express):

```js
import http from 'http';
import express from 'express';
import { bootService } from '@parameter1/terminus';

const app = express();
app.get('/', (req, res) => {
  res.json({ ping: 'pong' });
});

const server = http.createServer(app);

bootService({
  name: 'foo',
  version: '1.0.0',
  server,
  port: 1000,

  // advanced hooks (see the `packages/terminus/boot-service.js` file for more)
  // in these cases, `someService` is pseudo-code :)
  onStart: async () => {
    // ensure services are awaited before booting the server
    await someService.start();
  },
  onSignal: async () => {
    // stop services when a signal is received.
    await someService.stop();
  },
  onHealthCheck: async () => {
    // ensure services are still healthy.
    // by default, health can be checked on `/_health`
    await someService.ping();
  },

  // log a different exposed port when the server boots. useful with docker
  exposedPort: 1200,
}).catch((e) => setImmediate(() => {
  throw e;
}));
```
This will boot an Express server (wrapped with `http`) on port 1000.

## Configuration
The following environment variables can be used to adjust the timeout and shutdown delay of terminus (with defaults shown):

```
TERMINUS_TIMEOUT=1000
TERMINUS_SHUTDOWN_DELAY=0
```
