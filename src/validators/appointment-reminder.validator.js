const Joi = require('joi')

exports.appointmentReminderSchema = {
  appointmentReminderForm: Joi.object({
    body: Joi.object({
      description: Joi.string().min(5).required(),
      heading: Joi.string().min(3).required(),
      date: Joi.string(),
      time: Joi.string(),
      type: Joi.string().valid('APPOINTMENT', 'REMINDER').required(),
    }).required(),
  }).unknown(),

  appointmentReminderList: Joi.object({
    query: Joi.object({
      type: Joi.string().valid('APPOINTMENT', 'REMINDER').required(),
    }).required(),
  }).unknown(),
}
