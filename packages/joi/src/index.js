import Joi from 'joi';

import {
  email,
  htmlExpanded,
  htmlFull,
  htmlLimited,
  hostname,
  integer,
  integerId,
  objectId,
  sequence,
  slug,
  string,
  url,
} from './types/index.js';

export { default as validateAsync } from './validate-async.js';
export { default as validate } from './validate.js';

export default Joi
  .extend(integer)
  .extend(integerId)
  .extend(sequence)
  .extend(objectId)
  .extend(string)
  .extend(email)
  .extend(hostname)
  .extend(url)
  .extend(htmlExpanded)
  .extend(htmlFull)
  .extend(htmlLimited)
  .extend(slug);
