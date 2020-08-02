module.exports = (v) => {
  if (!v) return '';
  const trimmed = `${v}`.trim();
  if (!trimmed) return '';
  return trimmed.replace(/^\/+/, '').replace(/\/+$/, '');
};
