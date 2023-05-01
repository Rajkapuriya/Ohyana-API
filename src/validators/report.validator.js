const Joi = require('joi')

exports.reportSchema = {
  productReport: Joi.object({
    body: Joi.object({
      period: Joi.string().required(),
      cities: Joi.string(),
      dateFrom: Joi.string(),
      dateTo: Joi.string(),
      productIds: Joi.array(),
    }).required(),
  }).unknown(),

  productReportByCity: Joi.object({
    body: Joi.object({
      period: Joi.string().required(),
      cities: Joi.array(),
      dateFrom: Joi.string(),
      dateTo: Joi.string(),
      productId: Joi.number(),
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
