import slug from 'slug';
import { isFunction, isObject, trim } from '@parameter1/utils';

slug.extend({
  '/': '-',
  '\\': '-',
  _: '-',
  '-': '-',
  '&': 'and',
});

export default function sluggify(value, options) {
  if (Number.isNaN(value)) return null;

  let v = value;
  if (typeof v === 'number') v = `${v}`;

  if (isObject(v)) throw new Error('Object values cannot be sluggified');
  if (isFunction(v)) throw new Error('Function values cannot be sluggified');

  const trimmed = trim(v);
  if (!trimmed) return null;

  const sluggified = slug(trimmed, options);

  // remove repetitive dashes
  const repetitiveRemoved = sluggified.replace(/-{2,}/g, '-');
  // strip leading and trailing dashes
  const dashesTrimmed = repetitiveRemoved.replace(/^-+/, '').replace(/-+$/, '');
  // return null when empty
  return dashesTrimmed || null;
}
