const { emailBurnerList, isEmailBurner } = require('burner-email-providers');

module.exports = {
  list: emailBurnerList,
  isBurnerEmail: isEmailBurner,
  isBurnerDomain: (domain) => emailBurnerList.has(domain.toLowerCase()),
};
