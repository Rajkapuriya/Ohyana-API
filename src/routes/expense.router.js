const {
  joiValidationMiddleware,
} = require('../middleware/joi-validaton.middleware')
const { authTokenMiddleware } = require('../middleware/auth-token.middleware')
const { expenseSchema } = require('../validators/expense.validator')
const expenseController = require('../controllers/expense.controller')

const express = require('express')
const expenseRouter = express.Router()

// ------------------------------- Expense -------------------------------

expenseRouter.post(
  '/expense',
  authTokenMiddleware,
  joiValidationMiddleware(expenseSchema.expenseForm),
  expenseController.createExpense,
)

expenseRouter.get(
  '/expense',
  authTokenMiddleware,
  expenseController.getAllExpense,
)

expenseRouter.get(
  '/expense/role',
  authTokenMiddleware,
  joiValidationMiddleware(expenseSchema.expensePreRole),
  expenseController.getExpenseByRole,
)

expenseRouter.put(
  '/expense',
  authTokenMiddleware,
  joiValidationMiddleware(expenseSchema.updateExpenseForm),
  expenseController.updateExpense,
)

expenseRouter.delete(
  '/expense/:id',
  authTokenMiddleware,
  expenseController.deleteExpense,
)

module.exports = expenseRouter
