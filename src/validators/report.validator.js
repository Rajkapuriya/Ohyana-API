const Joi = require('joi')

exports.reportSchema = {
  productReport: Joi.object({
    body: Joi.object({
      period: Joi.string().required(),
      comparison: Joi.string(),
      cities: Joi.array(),
      dateFrom: Joi.string(),
      dateTo: Joi.string(),
      productIds: Joi.array(),
    }).required(),
  }).unknown(),

  teamReport: Joi.object({
    body: Joi.object({
      period: Joi.string().required(),
      comparison: Joi.string(),
      cities: Joi.string(),
      roleId: Joi.number(),
      dateFrom: Joi.string(),
      dateTo: Joi.string(),
      teamIds: Joi.array(),
    }).required(),
  }).unknown(),
}
