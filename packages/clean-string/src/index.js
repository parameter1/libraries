import stripTags from 'striptags';
import { decode, encode } from 'html-entities';
import { trim as trimUtil } from '@parameter1/utils';

const { isArray } = Array;

/**
 *
 * @param {string} value The string value to clean
 * @param {object} options
 * @param {boolean} [options.trim=true] Whether to trim the string.
 * @param {boolean|array} [options.stripHtmlTags=true] If true, will strip all html tags.
 *                        If false will strip none. If array, will preserve the provided tags.
 * @param {boolean} [options.decodeEntities=true] Whether to decode HTML entities.
 */
export default function clean(value, {
  trim = true,
  stripHtmlTags = true,
  decodeEntities = true,
  defaultValue = null,
} = {}) {
  if (!value) return defaultValue;
  const str = `${value}`;
  const trimmed = trim ? trimUtil(str, defaultValue) : str;
  if (!trimmed) return defaultValue;
  const preserveTags = isArray(stripHtmlTags) ? stripHtmlTags : [];
  const stripped = stripHtmlTags ? stripTags(trimmed, preserveTags) : trimmed;
  const decoded = decodeEntities ? decode(stripped) : stripped;
  return decoded;
}

export const encodeHtmlEntities = (value) => {
  if (!value) return value;
  return encode(value);
};

const relativeProtoPattern = /^(\/\/)([^/])/i;

export const cleanWebsite = (value, { forceSSL = false, nullOnMissingProto = false } = {}) => {
  const cleaned = clean(value);
  if (!cleaned) return null;
  let lowered = cleaned.toLowerCase();
  if (relativeProtoPattern.test(lowered)) lowered = lowered.replace(relativeProtoPattern, 'https://$2');
  if (/^http[s]?:\/\//.test(lowered)) {
    if (!forceSSL) return lowered;
    return /^http:\/\//.test(lowered)
      ? lowered.replace(/^http:\/\//, 'https://')
      : lowered;
  }
  if (/^www\./.test(lowered)) return `https://${lowered}`;
  if (nullOnMissingProto) return null;
  return `https://${lowered}`;
};
