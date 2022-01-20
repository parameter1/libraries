export default (email) => {
  if (!email) return '';
  return `${email}`.trim().toLowerCase();
};
