const Joi = require('joi')

exports.targetSchema = {
  targetForm: Joi.object({
    body: Joi.object({
      type: Joi.number().valid(0, 1).required(),
      target: Joi.number().required(),
      startDate: Joi.string().required(),
      endDate: Joi.string().required(),
    }).required(),
  }).unknown(),

  targetList: Joi.object({
    body: Joi.object({
      month: Joi.number().greater(0),
      year: Joi.number().greater(0),
      page: Joi.number(),
      size: Joi.number(),
    }).required(),
  }).unknown(),
}
