import cleanString from '@parameter1/clean-string';
import { sluggify } from '@parameter1/slug';
import escapeRegex from 'escape-string-regexp';
import { trigram } from './ngram.js';
import { splitSlug } from './utils.js';

/**
 *
 * @param {string} value
 * @param {object} options
 * @param {boolean|("regex")} [options.allowBigrams]
 * @returns {string[]}
 */
export function trigramsFromSlug(value, { allowBigrams = false } = {}) {
  const tokens = splitSlug(value);
  const all = trigram(value.replace(/-/g, ' ')).map((v) => v.trim()).filter((v) => v);
  const trigrams = tokens.reduce((arr, token) => {
    const grams = trigram(token);
    if (!grams.length && allowBigrams && token.length === 2) {
      arr.push(allowBigrams === 'regex' ? new RegExp(`^${escapeRegex(token)}`) : token);
    }
    arr.push(...grams);
    return arr;
  }, []);
  return trigrams.length ? trigrams : all;
}

/**
 *
 * @param {string} value
 * @param {object} options
 * @param {boolean|("regex")} [options.allowBigrams]
 * @returns {string[]}
 */
export function sluggifiedTrigrams(value, { allowBigrams = false } = {}) {
  const cleaned = cleanString(value);
  const slug = sluggify(cleaned);
  return trigramsFromSlug(slug, { allowBigrams });
}
