const {
  joiValidationMiddleware,
} = require('../middleware/joi-validaton.middleware')
const { authTokenMiddleware } = require('../middleware/auth-token.middleware')
const { validateHoliday } = require('../models/holiday.model')
const { holidaySchema } = require('../validators/holiday.validator')
const holidayController = require('../controllers/holiday.controller')
const {
  permissionHandleMiddleware,
} = require('../middleware/permission-handler.middleware')
const { TEAM } = require('../constants')

const express = require('express')
const expenseRouter = express.Router()

// ------------------------------- Leave -------------------------------

expenseRouter.post(
  '/holiday',
  joiValidationMiddleware(holidaySchema.holidayForm),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.EDIT_HOLIDAY]),
  holidayController.createHoliday,
)

expenseRouter.get(
  '/holiday',
  joiValidationMiddleware(holidaySchema.holidayList),
  authTokenMiddleware,
  holidayController.getAllHolidays,
)

expenseRouter.put(
  '/holiday/:id',
  joiValidationMiddleware(holidaySchema.holidayForm),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.EDIT_HOLIDAY]),
  holidayController.updateHoliday,
)

expenseRouter.delete(
  '/holiday/:id',
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.DELETE_HOLIDAY]),
  holidayController.deleteHoliday,
)

module.exports = expenseRouter
