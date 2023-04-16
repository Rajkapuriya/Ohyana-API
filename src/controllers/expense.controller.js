const {
  Team,
  Expense,
  Role_Expense_Permissions,
  Team_Expense,
} = require('../models')
const { Op } = require('sequelize')
const sequelize = require('../database/mysql')
const {
  successResponse,
  notFoundError,
  forbiddenRequestError,
} = require('../utils/response.util')
const { MESSAGE } = require('../constants')

exports.createExpense = async (req, res) => {
  const [, created] = await Expense.findOrCreate({
    where: { name: req.body.name },
    defaults: req.body,
  })

  if (!created)
    return forbiddenRequestError(res, MESSAGE.COMMON.RECORD_ALREADY_EXISTS)

  return successResponse(res, MESSAGE.COMMON.RECORD_CREATED_SUCCESSFULLY)
}

exports.getAllExpense = async (req, res) => {
  const expenses = await Expense.findAll({
    attributes: ['id', 'name', 'description'],
  })
  if (expenses.length === 0) return notFoundError(res)
  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_CREATED_SUCCESSFULLY,
    expenses,
  )
}

exports.updateExpense = async (req, res) => {
  await Expense.update(req.body, { where: { id: req.body.expenseId } })
  return successResponse(res, MESSAGE.COMMON.RECORD_UPDATED_SUCCESSFULLY)
}

exports.deleteExpense = async (req, res) => {
  const assignedExpense = await Team_Expense.findOne({
    where: { expenseId: req.params.id },
  })

  if (!assignedExpense) {
    await Expense.destroy({ where: { id: req.params.id } })
    return successResponse(res, MESSAGE.COMMON.RECORD_DELETED_SUCCESSFULLY)
  } else {
    return forbiddenRequestError(res)
  }
}

exports.getExpenseByRole = async (req, res) => {
  const { roleId, expenseId } = req.query
  const expenseRule = await Role_Expense_Permissions.findOne({
    attributes: ['amount'],
    where: { roleId, expenseId, status: 'active' },
  })

  if (!expenseRule) return notFoundError(res)

  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_CREATED_SUCCESSFULLY,
    expenseRule,
  )
}
