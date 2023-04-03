const Joi = require('joi')

exports.holidaySchema = {
  holidayForm: Joi.object({
    body: Joi.object({
      date: Joi.string().allow(null, ''),
      occasion: Joi.string().min(2).required(),
      duration: Joi.number().allow(null, ''),
      regular: Joi.boolean().required(),
    }).required(),
  }).unknown(),

  holidayList: Joi.object({
    query: Joi.object({
      type: Joi.string().required(),
    }).required(),
  }).unknown(),
}
