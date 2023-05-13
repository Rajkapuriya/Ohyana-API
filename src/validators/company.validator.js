const Joi = require('joi')

exports.companySchema = {
  companyForm: Joi.object({
    body: Joi.object({
      name: Joi.string().required(),
      crmKey: Joi.string().allow(null),
      GSTIN: Joi.string().allow(null),
      email: Joi.string().email().allow(null),
      // state: Joi.string().required(),
      // city: Joi.string().required(),
      // city_id: Joi.number().required(),
      // state_id: Joi.number().required(),
      // state_iso2: Joi.string().required(),
      // country: Joi.string().required(),
      // country_id: Joi.number().required(),
      // country_iso2: Joi.string().required(),
      businessType: Joi.string().allow(null),
    }).required(),
  }).unknown(),
}
