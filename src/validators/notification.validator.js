const Joi = require('joi')

exports.notificationSchema = {
  notificationForm: Joi.object({
    body: Joi.object({
      description: Joi.string().min(5).required(),
      heading: Joi.string().min(3).required(),
      type: Joi.string().valid('NOTICE', 'ACHIEVEMENT', 'INFORMATION'),
      roleId: Joi.number().required(),
      departmentId: Joi.number().required(),
    }).required(),
  }).unknown(),

  notifications: Joi.object({
    query: Joi.object({
      sent: Joi.boolean(),
      page: Joi.number(),
      size: Joi.number(),
    }).required(),
  }).unknown(),
}
