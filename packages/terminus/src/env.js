import {
  bool,
  num,
  cleanEnv,
} from 'envalid';

export const {
  TERMINUS_SILENT,
  TERMINUS_SHUTDOWN_DELAY,
  TERMINUS_TIMEOUT,
} = cleanEnv(process.env, {
  TERMINUS_SILENT: bool({ desc: 'Whether to run in silent mode.', default: false }),
  TERMINUS_SHUTDOWN_DELAY: num({ desc: 'Number of milliseconds before the HTTP server starts its shutdown.', default: 0 }),
  TERMINUS_TIMEOUT: num({ desc: 'Number of milliseconds before forceful exiting.', default: 1000 }),
});
