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
} = {}) => {
  let node;

  const serve = async () => {
    if (node) node.kill();
    node = await spawn('node', [entry], { stdio: 'inherit' });
    node.on('close', (code, signal) => {
      const exited = [];
      if (code) exited.push(`code ${code}`);
      if (signal) exited.push(`signal ${signal}`);
      log(`Process exited with ${exited.join(' ')}`);
    });
  };

  task('default', () => {
    watch(
      watchPaths,
      { queue: false, ignoreInitial: false },
      parallel([serve]),
    );
  });
};
