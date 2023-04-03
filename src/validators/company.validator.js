const Joi = require('joi')

exports.companySchema = {
  companyForm: Joi.object({
    body: Joi.object({
      name: Joi.string().required(),
      crmKey: Joi.string().allow(null),
      GSTIN: Joi.string().allow(null),
      email: Joi.string().email().allow(null),
      city: Joi.string().allow(null),
      state: Joi.string().allow(null),
      businessType: Joi.string().allow(null),
      countryId: Joi.number().allow(null),
    }).required(),
  }).unknown(),
}
