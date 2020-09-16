const dayjs = require('dayjs');
const advancedFormat = require('dayjs/plugin/advancedFormat');
const relativeTime = require('dayjs/plugin/relativeTime');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');

module.exports = dayjs
  .extend(utc)
  .extend(timezone)
  .extend(advancedFormat)
  .extend(relativeTime);
