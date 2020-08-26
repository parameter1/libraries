const { getAsObject } = require('@parameter1/utils');
const depTypes = require('./dep-types');

const { keys } = Object;

module.exports = (pkg, pattern = /^@parameter1\//) => depTypes.reduce((set, depType) => {
  keys(getAsObject(pkg, depType))
    .filter((name) => pattern.test(name))
    .forEach((name) => set.add(name));
  return set;
}, new Set());
