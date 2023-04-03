const Joi = require('joi')

exports.targetSchema = {
  targetForm: Joi.object({
    body: Joi.object({
      type: Joi.string().required(),
      period: Joi.number().required(),
      target: Joi.number().required(),
    }).required(),
  }).unknown(),
}
