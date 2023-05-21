const Joi = require('joi')

exports.reportSchema = {
  productReport: Joi.object({
    body: Joi.object({
      period: Joi.string().required(),
      city_id: Joi.number(),
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

  customerReport: Joi.object({
    body: Joi.object({
      period: Joi.string().required(),
      clientId: Joi.number(),
      productIds: Joi.array(),
      dateFrom: Joi.string(),
      dateTo: Joi.string(),
    }).required(),
  }).unknown(),
}
