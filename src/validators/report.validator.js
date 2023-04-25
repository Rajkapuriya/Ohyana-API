const Joi = require('joi')

exports.reportSchema = {
  reportData: Joi.object({
    body: Joi.object({
      period: Joi.string().required(),
      comparison: Joi.string(),
      cities: Joi.array(),
      productIds: Joi.array(),
    }).required(),
  }).unknown(),
}
