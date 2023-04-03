const Joi = require('joi')

exports.expenseSchema = {
  expenseForm: Joi.object({
    body: Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
    }).required(),
  }).unknown(),

  updateExpenseForm: Joi.object({
    body: Joi.object({
      expenseId: Joi.number().required(),
      name: Joi.string().required(),
      description: Joi.string().required(),
    }).required(),
  }).unknown(),

  expensePreRole: Joi.object({
    query: Joi.object({
      roleId: Joi.number(),
      expenseId: Joi.number(),
    }).required(),
  }).unknown(),
}
