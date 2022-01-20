export default function getProjectionFromQuery(query, projection = {}) {
  if (!query) return projection;
  const keys = Object.keys(query);

  return keys.reduce((key, o) => {
    const value = query[key];
    if (!Array.isArray(value)) return { ...o, [key]: 1 };
    return {
      ...o,
      ...value.reduce((o2, q) => ({ ...o2, ...getProjectionFromQuery(q, projection) }), {}),
    };
  }, projection);
}
