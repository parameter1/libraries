import escapeRegex from 'escape-string-regexp';

/**
 * Assuming a phrase of `quick brown fox`...
 *
 * Position `starts`:
 *  - Match: `any`
 *    - Where a value starts with `quick`, `brown`, or `fox`
 *    - `/^quick|^brown|^fox/i`
 *  - Match: `all`
 *    - Where a value literally starts with `quick brown fox`
 *    - `/^quick brown fox/i`
 *
 * Position `ends`:
 *  - Match: `any`
 *    - Where a value ends with `quick`, `brown`, or `fox`
 *    - `/quick$|brown$|fox$/i`
 *  - Match: `all`
 *    - Where a value literally ends with `quick brown fox`
 *    - `/quick brown fox$/i`
 *
 * Position: `exact`:
 *  - Match: `any`
 *    - Where a value exactly matches `quick`, `brown`, or `fox`
 *    - `/^quick$|^brown$|^fox$/i`
 *  - Match: `all`
 *    - Where a value exactly matches `quick brown fox`
 *    - `/^quick brown fox$/i`
 *
 * Position `contains`:
 *  - Match: `any`
 *    - Where a value contains any partial matches of `quick`, `brown`, or `fox`
 *    - `/quick|brown|fox/i`
 *  - Match: `all`
 *    - Where a value contains all partial matches of `quick`, `brown`, and `fox`
 *    - `/(?=.*quick)(?=.*brown)(?=.*fox)/i`
 */
export default ({
  phrase,
  position,
  words,
  insensitive = true,
} = {}) => {
  const flags = insensitive ? 'i' : undefined;
  const tokens = escapeRegex(phrase).replace(/\s\s+/g, ' ').split(' ').filter((v) => v);

  if (position === 'starts') {
    // /^quick|^brown|^fox/i
    if (words === 'any') return new RegExp(`${tokens.map((t) => `^${t}`).join('|')}`, flags);
    // /^quick brown fox/i
    return new RegExp(`^${tokens.join(' ')}`, flags);
  }
  if (position === 'ends') {
    // /quick$|brown$|fox$/i
    if (words === 'any') return new RegExp(`${tokens.map((t) => `${t}$`).join('|')}`, flags);
    // /quick brown fox$/i
    return new RegExp(`${tokens.join(' ')}$`, flags);
  }
  if (position === 'exact') {
    // /^quick$|^brown$|^fox$/i
    if (words === 'any') return new RegExp(`${tokens.map((t) => `^${t}$`).join('|')}`, flags);
    // /^quick brown fox$/i
    return new RegExp(`^${tokens.join(' ')}$`, flags);
  }

  // Contains...
  // /quick|brown|fox/i
  if (words === 'any') return new RegExp(`${tokens.join('|')}`, flags);
  // /(?=.*quick)(?=.*brown)(?=.*fox)/i
  return new RegExp(`${tokens.map((t) => `(?=.*${t})`).join('')}`, flags);
};
