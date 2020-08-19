module.exports = (email) => {
  if (!email) return '';
  return `${email}`.trim().toLowerCase();
};
