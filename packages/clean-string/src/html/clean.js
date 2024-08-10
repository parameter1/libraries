import { trim } from '@parameter1/utils';
import { load } from 'cheerio';
import { decode } from 'html-entities';
import stripTags from './strip-tags.js';

const { isArray } = Array;

/**
 * The HTML value to clean
 *
 * @param {string} value The string value to clean
 * @param {object} options
 * @param {boolean|array} [options.allowedTags=true] If true, will preserve all html tags.
 *                        If false will strip all. If array, will preserve the provided tags.
 * @param {*} [options.defaultValue=null] The value to return when empty.
 * @param {boolean} [options.fragment=true] Whether to treat the HMTL as a fragment (not a document)
 */
export default (value, { allowedTags = true, defaultValue = null, fragment = true } = {}) => {
  if (!allowedTags || (isArray(allowedTags) && !allowedTags.length)) {
    const stripped = stripTags(value, { defaultValue });
    const r = stripped ? decode(stripped) : stripped;
    return r;
  }

  const html = isArray(allowedTags)
    ? stripTags(value, { allowedTags, defaultValue })
    : trim(value, defaultValue);
  if (!html) return html;
  const $ = load(html);
  const cleaned = fragment ? $('body').html() : $.html();
  return trim(cleaned, defaultValue);
};
