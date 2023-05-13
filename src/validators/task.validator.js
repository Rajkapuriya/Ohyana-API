const Joi = require('joi')

exports.taskSchema = {
  taskForm: Joi.object({
    body: Joi.object({
      title: Joi.string().min(2).required(),
      description: Joi.string().min(2).required(),
      teamId: Joi.number(),
      due_date: Joi.string().required(),
    }).required(),
  }).unknown(),

  updateTaskDetails: Joi.object({
    body: Joi.object({
      title: Joi.string(),
      description: Joi.string(),
      taskId: Joi.number().required(),
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
