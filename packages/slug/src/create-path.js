import sluggify from './sluggify.js';

export default function createPath(parts, sep = '/') {
  if (!Array.isArray(parts)) throw new Error('The path parts must be an array');
  return parts.map(sluggify).filter((v) => v).join(sep) || null;
}
