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

  updateDuedate: Joi.object({
    body: Joi.object({
      due_date: Joi.string().required(),
    }).required(),
  }).unknown(),

  taskCheckListItemForm: Joi.object({
    body: Joi.object({
      task: Joi.string().min(2).required(),
    }).required(),
  }).unknown(),

  taskList: Joi.object({
    query: Joi.object({
      searchQuery: Joi.string(),
      due_date: Joi.string(),
      teamId: Joi.number(),
    }).required(),
  }).unknown(),
}
