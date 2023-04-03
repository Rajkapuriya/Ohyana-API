const Joi = require('joi')

exports.taskSchema = {
  taskForm: Joi.object({
    body: Joi.object({
      title: Joi.string().min(2).required(),
      description: Joi.string().min(2).required(),
      due_date: Joi.string().required(),
    }).required(),
  }).unknown(),

  updateTitle: Joi.object({
    body: Joi.object({
      title: Joi.string().min(2).required(),
    }).required(),
  }).unknown(),

  updateDescription: Joi.object({
    body: Joi.object({
      description: Joi.string().min(2).required(),
    }).required(),
  }).unknown(),

  taskCheckListItemForm: Joi.object({
    body: Joi.object({
      task: Joi.string().min(2).required(),
    }).required(),
  }).unknown(),
}
