import burners from 'burner-email-providers';

export const { emailBurnerList, isEmailBurner } = burners;
export const isBurnerDomain = (domain) => emailBurnerList.has(domain.toLowerCase());
