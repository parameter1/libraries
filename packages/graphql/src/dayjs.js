import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

export default dayjs
  .extend(customParseFormat)
  .extend(utc)
  .extend(timezone);
