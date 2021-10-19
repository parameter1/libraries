const {
  task,
  watch,
  parallel,
} = require('gulp');
const { spawn } = require('child_process');

const { log } = console;

// Common gulpfile factory. Should be used by individual services.

module.exports = ({
  entry,
  watchPaths,
  onMessage,
  onSpawn,
  onClose,

  beforeSpawn,

  watchOptions,
} = {}) => {
  let node;

  const serve = async () => {
    if (node) node.kill();

    if (beforeSpawn) await beforeSpawn();
    node = await spawn('node', [entry], { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] });
    if (onSpawn) await onSpawn({ node });

    node.on('message', (message) => {
      if (onMessage) onMessage({ serve, node, message });
    });
    node.on('close', (code, signal) => {
      const exited = [];
      if (code) exited.push(`code ${code}`);
      if (signal) exited.push(`signal ${signal}`);
      if (onClose) onClose({ code, signal });
      log(`Process exited with ${exited.join(' ')}`);
    });
  };

  task('default', () => {
    watch(
      watchPaths,
      { queue: false, ignoreInitial: false, ...watchOptions },
      parallel([serve]),
    );
  });
};
