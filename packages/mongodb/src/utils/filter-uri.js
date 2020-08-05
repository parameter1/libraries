module.exports = (client) => {
  const { url, options } = client.s;
  const { auth } = options;
  if (!auth) return url;
  const { username, password } = auth;
  if (username || password) return `${url}`.replace(username, '*****').replace(password, '*****');
  return url;
};
