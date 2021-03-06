const {
  num,
  cleanEnv,
} = require('envalid');

module.exports = cleanEnv(process.env, {
  TERMINUS_TIMEOUT: num({ desc: 'Number of milliseconds before forceful exiting.', default: 1000 }),
  TERMINUS_SHUTDOWN_DELAY: num({ desc: 'Number of milliseconds before the HTTP server starts its shutdown.', default: 0 }),
});
