import {
  bool,
  num,
  cleanEnv,
} from 'envalid';

export const {
  FASTIFY_CLOSE_CONNECTION_TIMEOUT,
  FASTIFY_SILENT,
  FASTIFY_SHUTDOWN_DELAY,
} = cleanEnv(process.env, {
  FASTIFY_CLOSE_CONNECTION_TIMEOUT: num({ desc: 'Number of milliseconds before forcefully closing any active connections.', default: 2000 }),
  FASTIFY_SILENT: bool({ desc: 'Whether to run in silent mode.', default: false }),
  FASTIFY_SHUTDOWN_DELAY: num({ desc: 'Number of milliseconds before the HTTP server starts its shutdown.', default: 0 }),
});
