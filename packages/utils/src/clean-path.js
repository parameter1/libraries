import trim from './trim.js';

export default (v, def = null) => {
  const trimmed = trim(v, def);
  if (!trimmed) return def;
  return trimmed.replace(/^\/+/, '').replace(/\/+$/, '');
};
