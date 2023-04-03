const Joi = require('joi')

exports.pointSchema = {
  pointList: Joi.object({
    query: Joi.object({
      page: Joi.number(),
      size: Joi.number(),
      teamId: Joi.number(),
      month: Joi.number(),
      year: Joi.number(),
    }).required(),
  }).unknown(),
}
