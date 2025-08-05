const Joi = require('joi');

// UK-specific validation schemas
const ukValidation = {
  // UTR (Unique Taxpayer Reference) - 10 digits
  validateUTR: (utr) => {
    const utrRegex = /^\d{10}$/;
    return {
      isValid: utrRegex.test(utr),
      message: utrRegex.test(utr) ? '' : 'UTR must be exactly 10 digits'
    };
  },

  // VAT Number - GB format
  validateVATNumber: (vat) => {
    const vatRegex = /^GB\d{9}$/;
    return {
      isValid: vatRegex.test(vat),
      message: vatRegex.test(vat) ? '' : 'VAT number must be in format GB123456789'
    };
  },

  // Company Number - 8 characters
  validateCompanyNumber: (companyNum) => {
    const companyRegex = /^[A-Z0-9]{8}$/;
    return {
      isValid: companyRegex.test(companyNum),
      message: companyRegex.test(companyNum) ? '' : 'Company number must be 8 characters'
    };
  },

  // UK Postcode validation
  validatePostcode: (postcode) => {
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    return {
      isValid: postcodeRegex.test(postcode.toUpperCase()),
      message: postcodeRegex.test(postcode.toUpperCase()) ? '' : 'Invalid UK postcode format'
    };
  },

  // Email validation
  validateEmail: (email) => {
    const emailSchema = Joi.string().email().required();
    const { error } = emailSchema.validate(email);
    return {
      isValid: !error,
      message: error ? 'Invalid email format' : ''
    };
  },

  // Phone number validation (UK format)
  validatePhoneNumber: (phone) => {
    const phoneRegex = /^(\+44|0)[1-9]\d{8,9}$/;
    return {
      isValid: phoneRegex.test(phone.replace(/\s/g, '')),
      message: phoneRegex.test(phone.replace(/\s/g, '')) ? '' : 'Invalid UK phone number format'
    };
  }
};

// Joi schemas for request validation
const schemas = {
  createCompany: Joi.object({
    name: Joi.string().required().min(1).max(100),
    vatNumber: Joi.string().optional().custom((value, helpers) => {
      if (value && !ukValidation.validateVATNumber(value).isValid) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
    companyNumber: Joi.string().optional().custom((value, helpers) => {
      if (value && !ukValidation.validateCompanyNumber(value).isValid) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
    utr: Joi.string().optional().custom((value, helpers) => {
      if (value && !ukValidation.validateUTR(value).isValid) {
        return helpers.error('any.invalid');
      }
      return value;
    })
  }),

  createClient: Joi.object({
    companyId: Joi.string().uuid().required(),
    name: Joi.string().required().min(1).max(100),
    contactPerson: Joi.string().optional().max(100),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    vatNumber: Joi.string().optional().custom((value, helpers) => {
      if (value && !ukValidation.validateVATNumber(value).isValid) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
    notes: Joi.string().optional().allow('').max(500),
    status: Joi.string().valid('active', 'inactive').default('active')
  }),

  createInvoice: Joi.object({
    companyId: Joi.string().uuid().required(),
    clientId: Joi.string().uuid().required(),
    invoiceDate: Joi.date().required(),
    dueDate: Joi.date().required(),
    description: Joi.string().optional(),
    lineItems: Joi.array().items(Joi.object({
      description: Joi.string().required(),
      quantity: Joi.number().positive().required(),
      unitPrice: Joi.number().positive().required(),
      vatType: Joi.string().valid('STANDARD', 'REDUCED', 'ZERO', 'EXEMPT').required()
    })).min(1).required()
  }),

  createExpense: Joi.object({
    companyId: Joi.string().uuid().required(),
    date: Joi.date().required(),
    amount: Joi.number().positive().required(),
    category: Joi.string().required(),
    description: Joi.string().optional(),
    mileage: Joi.number().positive().optional(),
    vehicleType: Joi.string().valid('car', 'van', 'motorcycle', 'bike').optional()
  })
};

module.exports = { ukValidation, schemas }; 