import { createTerminus } from '@godaddy/terminus';
import { TERMINUS_TIMEOUT, TERMINUS_SHUTDOWN_DELAY } from './env.js';
import {
  isFn,
  log,
  emitError,
  wait,
} from './utils.js';

/**
 *
 * @param {object} params
 * @param {string} params.name The server/microservice name
 * @param {string} params.version The server/microservice version
 * @param {http.Server} params.server The server to boot. Must implement a `http.Server`-like object
 * @param {number} params.port The internal port to run the server on.
 * @param {number} [params.exposedPort] The (optional) exposed port to display.
 *
 * @param {string} [params.host] The internal host to run the server on.
 * @param {string} [params.exposedHost] The (optional) exposed host to display.
 * @param {string} [params.exposedProtocol=http] The (optional) exposed protocol to display.
 *
 * @param {function} [params.onStart] An async function to run before starting.
 * @param {function} [params.onError] A function to run when an error is encountered.
 * @param {function} [params.onHealthCheck] An async function to run on health check.
 * @param {function} [params.onSignal] An async function to run when a signal is encountered.
 * @param {function} [params.beforeShutdown] An async function to run before shutdown.
 * @param {function} [params.onShutdown] An async function to run on shutdown.
 * @param {function} [params.onListen] A sync function to call when the server begins listening.
 *
 * @param {string[]} [params.signals] Signals to listen to.
 * @param {string} [params.healthCheckPath] The health check path to expose.
 */
export default async ({
  name,
  version,
  server,
  port,
  exposedPort,

  host,
  exposedHost,
  exposedProtocol = 'http',

  onStart,
  onError,
  onHealthCheck,
  onSignal,
  beforeShutdown,
  onShutdown,
  onListen,

  signals = ['SIGTERM', 'SIGINT'],
  healthCheckPath = '/_health',
} = {}) => {
  log(`Booting ${name} v${version}...`);

  // Do not try/catch here - fail boot if this fails.
  log('Awaiting required services...');
  if (isFn(onStart)) await onStart();
  log('Services loaded.');

  createTerminus(server, {
    timeout: TERMINUS_TIMEOUT,
    signals,
    healthChecks: {
      [healthCheckPath]: isFn(onHealthCheck) ? onHealthCheck : () => ({ ping: 'pong ' }),
    },
    onSignal: async () => {
      log('Running on-signal hook...');
      try {
        if (isFn(onSignal)) await onSignal();
      } catch (e) {
        log('ON-SIGNAL ERROR DETECTED!');
        emitError(e, onError);
      } finally {
        log('Signal complete.');
      }
    },
    beforeShutdown: async () => {
      log('Running before-shutdown hook...');
      try {
        if (isFn(beforeShutdown)) await beforeShutdown();
        if (TERMINUS_SHUTDOWN_DELAY) {
          log(`Delaying shutdown by ${TERMINUS_SHUTDOWN_DELAY}ms...`);
          await wait(TERMINUS_SHUTDOWN_DELAY);
        }
      } catch (e) {
        log('BEFORE-SHUTDOWN ERROR DETECTED!');
        emitError(e, onError);
      } finally {
        log('Before shutdown complete.');
      }
    },
    onShutdown: async () => {
      log('Running on-shutdown hook...');
      try {
        if (isFn(onShutdown)) await onShutdown();
      } catch (e) {
        log('ON-SHUTDOWN ERROR DETECTED!');
        emitError(e, onError);
      } finally {
        log('Shutdown complete.');
      }
    },
  });

  await new Promise((resolve, reject) => {
    server.listen({ host, port }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(server);
        if (isFn(onListen)) onListen();
      }
    });
  });
  log(`Ready on ${exposedProtocol}://${exposedHost || host}:${exposedPort || port}`);
};
