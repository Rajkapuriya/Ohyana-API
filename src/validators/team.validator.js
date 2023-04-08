const Joi = require('joi')

exports.teamSchema = {
  teamForm: Joi.object({
    body: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      roleId: Joi.number().required(),
      departmentId: Joi.number().required(),
      password: Joi.string().required(),
      contact_number: Joi.string().required(),
      gender: Joi.string().valid('Male', 'Female').required(),
      birthDay: Joi.string(),
      // location: Joi.string().required(),
      city: Joi.string(),
      state: Joi.string(),
      pincode: Joi.string(),
    }).required(),
  }).unknown(),

  updateProfile: Joi.object({
    body: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      contact_number: Joi.string().required(),
      gender: Joi.string().valid('Male', 'Female'),
      birthDay: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      pincode: Joi.string(),
    }).required(),
  }).unknown(),

  teamMemberList: Joi.object({
    query: Joi.object({
      roleId: Joi.number(),
      admin: Joi.boolean(),
      searchQuery: Joi.string(),
      attendanceType: Joi.string(),
      teamType: Joi.string().valid('FIELD', 'OFFICE'),
    }).required(),
  }).unknown(),

  savelocation: Joi.object({
    body: Joi.object({
      latitude: Joi.string(),
      longitude: Joi.string(),
    }).required(),
  }).unknown(),

  addExpense: Joi.object({
    body: Joi.object({
      date: Joi.string().required(),
      expenseId: Joi.number().required(),
      expense_description: Joi.string(),
      amount: Joi.number().required(),
    }).required(),
  }).unknown(),

  getExpense: Joi.object({
    query: Joi.object({
      month: Joi.number(),
      year: Joi.number(),
      teamId: Joi.number(),
    }).required(),
  }).unknown(),

  approveExpense: Joi.object({
    body: Joi.object({
      description: Joi.string().required(),
      amount: Joi.number().required().greater(-1),
      teamExpenseid: Joi.number().required(),
    }).required(),
  }).unknown(),

  approveExpensePayment: Joi.object({
    body: Joi.object({
      status: Joi.string().required(),
      teamExpenseid: Joi.number().required(),
    }).required(),
  }).unknown(),

  updateToken: Joi.object({
    body: Joi.object({
      deviceToken: Joi.string().required(),
    }).required(),
  }).unknown(),
}
