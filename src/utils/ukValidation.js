export const validateUTR = (utr) => {
  const utrRegex = /^\d{10}$/;
  return {
    isValid: utrRegex.test(utr),
    message: utrRegex.test(utr) ? '' : 'UTR must be exactly 10 digits'
  };
};

export const validateVATNumber = (vat) => {
  const vatRegex = /^GB\d{9}$/;
  return {
    isValid: vatRegex.test(vat),
    message: vatRegex.test(vat) ? '' : 'VAT number must be in format GB123456789'
  };
};

export const validateCompanyNumber = (companyNum) => {
  const companyRegex = /^[A-Z0-9]{8}$/;
  return {
    isValid: companyRegex.test(companyNum),
    message: companyRegex.test(companyNum) ? '' : 'Company number must be 8 characters'
  };
};

export const validatePostcode = (postcode) => {
  const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
  return {
    isValid: postcodeRegex.test(postcode.toUpperCase()),
    message: postcodeRegex.test(postcode.toUpperCase()) ? '' : 'Invalid UK postcode format'
  };
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    message: emailRegex.test(email) ? '' : 'Please enter a valid email address'
  };
};

export const validatePhoneNumber = (phone) => {
  // UK phone number validation (basic)
  const phoneRegex = /^(\+44|0)[1-9]\d{8,10}$/;
  return {
    isValid: phoneRegex.test(phone.replace(/\s/g, '')),
    message: phoneRegex.test(phone.replace(/\s/g, '')) ? '' : 'Please enter a valid UK phone number'
  };
}; 