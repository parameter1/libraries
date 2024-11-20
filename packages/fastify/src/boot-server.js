import process from 'process';
import { FASTIFY_CLOSE_CONNECTION_TIMEOUT, FASTIFY_SHUTDOWN_DELAY, FASTIFY_SILENT } from './env.js';
import { ServiceRegistry } from './service-registry.js';

const createLogger = (silent) => {
  if (silent) return () => {};
  const { log } = console;
  return log;
};

/**
 * @callback HookFunction
 * @param {HookFunctionParams} params
 * @returns {Promise}
 *
 * @typedef HookFunctionParams
 * @prop {console.log} log
 *
 * @typedef ServerHealthProbeOptions
 * @prop {string[]} [paths] Paths to run the health check function on. If an empty array is
 * provided, no probe routes will be registered. Defaults to an empty array.
 * @prop {Function} fn The health check function to run. Can be async.
 */

/**
 * @param {import("fastify").FastifyInstance} fastify
 *
 * @param {object} options
 * @param {HookFunction} [options.beforeShutdown] An async function to run when before the server
 * shutdown process starts.
 * @param {number} [options.closeConnectionTimeout] The number of milliseconds to wait until force
 * closing all connections. Defaults to the value of `process.env.FASTIFY_CLOSE_CONNECTION_TIMEOUT`
 * which defaults to `2000`.
 * @param {string} [options.exposedHost] The exposed host to display. Defaults to the `host` option.
 * @param {number} [options.exposedPort] The exposed port to display. Defaults to the `port` option.
 * @param {string} [options.exposedProtocol=http] The exposed protocol to display. Defaults to
 * `http`.
 * @param {boolean} [options.forceExit=false] Whether to force exit the process using `process.exit`
 * @param {ServerHealthProbeOptions} [options.healthProbe]
 * @param {string} [options.host=localhost] Defaults to `localhost`.
 * @param {string} options.name The server name.
 * @param {HookFunction} [options.onClose] An async function to run when the server has been closed.
 * @param {HookFunction} [options.onListen] An async function to run after the server is listening.
 * @param {HookFunction} [options.onShutdown] An async function to run on shutdown.
 * @param {HookFunction} [options.onStart] An async function to run before the server listens.
 * @param {number} [options.port=0] Defaults to `0` (picks the first available open port).
 * @param {import("./service.js").FastifyService[]} [options.services] Registered services to handle
 * @param {number} [options.shutdownDelay] The number of milliseconds to delay the shutdown.
 * Defaults to the value of `process.env.FASTIFY_SHUTDOWN_DELAY` which defaults to `0`.
 * @param {string[]} [options.signals=[SIGINT,SIGTERM]] An array of signals to listen to. Defaults
 * to `SIGINT` and `SIGTERM`.
 * @param {boolean} [options.silent] Whether to run in silent mode. Defaults to the value of
 * `process.env.FASTIFY_SILENT` with defaults to `false`.
 * @param {string} options.version The server version
 */
export async function bootServer(fastify, {
  beforeShutdown,
  closeConnectionTimeout = FASTIFY_CLOSE_CONNECTION_TIMEOUT,
  exposedHost,
  exposedPort,
  exposedProtocol = 'http',
  forceExit = false,
  healthProbe = { paths: [] },
  host = 'localhost',
  name,
  onClose,
  onListen,
  onShutdown,
  onStart,
  port = 0,
  services = [],
  shutdownDelay = FASTIFY_SHUTDOWN_DELAY,
  signals = ['SIGINT', 'SIGTERM'],
  silent = FASTIFY_SILENT,
  version,
}) {
  let isShuttingDown = false;
  if (fastify.server.listening) throw new Error('The Fastify server instance is already listening.');
  if (!name || !version) throw new Error('The Fastify server name and version options are required.');
  const log = createLogger(silent);
  const registry = new ServiceRegistry({ log, services });

  log(`booting ${name} v${version}...`);

  healthProbe?.paths?.forEach((path) => {
    log(`registering health probe route on path "${path}"`);
    fastify.route({
      url: path,
      method: ['HEAD', 'GET'],
      handler: async (_, reply) => {
        if (typeof healthProbe?.fn === 'function') await healthProbe.fn();
        const results = await registry.probeHealth();
        reply.send({ ok: true, registry: results });
      },
    });
  });

  if (typeof onStart === 'function') {
    fastify.addHook('onReady', async () => {
      log('running on start hooks...');
      await onStart({ log });
    });
  }
  fastify.addHook('onReady', async () => {
    await registry.run('start');
  });

  const stopServer = async () => {
    log('closing idle connnections...');
    fastify.server.closeIdleConnections();
    const timeout = setTimeout(() => {
      log('force closing all connections...');
      fastify.server.closeAllConnections();
    }, closeConnectionTimeout);
    log('closing fastify...');
    await fastify.close();
    clearTimeout(timeout);
  };

  const cleanup = async (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    try {
      // before shutdown hooks / delay
      await Promise.all([
        new Promise((resolve, reject) => {
          if (typeof beforeShutdown === 'function') {
            log('running before shutdown hooks...');
            (async () => {
              await beforeShutdown({ log });
              resolve();
            })().catch(reject);
          } else {
            resolve();
          }
        }),
        //  ? beforeShutdown({ log }) : Promise.resolve(),
        new Promise((resolve) => {
          if (shutdownDelay) {
            log(`delaying shutdown by ${shutdownDelay}ms...`);
            setTimeout(resolve, shutdownDelay);
          } else {
            resolve();
          }
        }),
      ]);
      // stop server
      await stopServer();

      // on shutdown hook
      if (typeof onShutdown === 'function') {
        log('running on shutdown hooks...');
        await onShutdown({ log });
      }
      if (forceExit) {
        log('force exiting the process...');
        process.exit(0);
      } else {
        log('detaching listeners and resending kill signal...');
        // resend signal but remove listeners beforehand
        signals.forEach((sig) => process.removeListener(sig, cleanup));
        process.kill(process.pid, signal);
      }
    } catch (e) {
      log('An error was encountered on shutdown', e);
      process.exit(1);
    }
  };
  signals.forEach((signal) => process.on(signal, cleanup));

  if (typeof onClose === 'function') {
    fastify.addHook('onClose', async () => {
      log('running on close hooks...');
      await onClose({ log });
    });
  }
  fastify.addHook('onClose', async () => {
    await registry.run('stop');
  });

  await fastify.listen({ host, port });
  log(`ready on ${exposedProtocol}://${exposedHost || host}:${exposedPort || port}`);
  if (typeof onListen === 'function') {
    await onListen({ log });
  }
  registry.logInitData();
}
