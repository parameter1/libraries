import stripTags from 'striptags';
import { trim } from '@parameter1/utils';

export default (value, { allowedTags = [], defaultValue = null } = {}) => {
  const trimmed = trim(value, defaultValue);
  if (!trimmed) return trimmed;
  const stripped = stripTags(value, allowedTags);
  return trim(stripped, defaultValue);
};
