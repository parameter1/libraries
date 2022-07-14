import slug from 'slug';
import { isFunction, isObject } from '@parameter1/utils';
import cleanString from '@parameter1/clean-string';

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

  const cleaned = cleanString(v, {
    trim: true,
    stripHtmlTags: true,
    decodeEntities: true,
    defaultValue: null,
  });
  if (!cleaned) return null;

  const sluggified = slug(cleaned, options);

  // remove repetitive dashes
  const repetitiveRemoved = sluggified.replace(/-{2,}/g, '-');
  // strip leading and trailing dashes
  const dashesTrimmed = repetitiveRemoved.replace(/^-+/, '').replace(/-+$/, '');
  // return null when empty
  return dashesTrimmed || null;
}
