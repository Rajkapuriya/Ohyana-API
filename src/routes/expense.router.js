const {
  joiValidationMiddleware,
} = require('../middleware/joi-validaton.middleware')
const { authTokenMiddleware } = require('../middleware/auth-token.middleware')
const { expenseSchema } = require('../validators/expense.validator')
const expenseController = require('../controllers/expense.controller')
const {
  permissionHandleMiddleware,
} = require('../middleware/permission-handler.middleware')
const { TEAM } = require('../constants')

const express = require('express')
const expenseRouter = express.Router()

// ------------------------------- Expense -------------------------------

expenseRouter.post(
  '/expense',
  authTokenMiddleware,
  joiValidationMiddleware(expenseSchema.expenseForm),
  permissionHandleMiddleware([TEAM.PERMISSIONS.EDIT_EXPENSE]),
  expenseController.createExpense,
)

expenseRouter.get(
  '/expense',
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_EXPENSE]),
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
  permissionHandleMiddleware([TEAM.PERMISSIONS.EDIT_EXPENSE]),
  expenseController.updateExpense,
)

expenseRouter.delete(
  '/expense/:id',
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.EDIT_EXPENSE]),
  expenseController.deleteExpense,
)

module.exports = expenseRouter
