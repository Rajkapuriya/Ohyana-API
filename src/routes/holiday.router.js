const {
  joiValidationMiddleware,
} = require('../middleware/joi-validaton.middleware')
const { authTokenMiddleware } = require('../middleware/auth-token.middleware')
const { validateHoliday } = require('../models/holiday.model')
const { holidaySchema } = require('../validators/holiday.validator')
const holidayController = require('../controllers/holiday.controller')

const express = require('express')
const expenseRouter = express.Router()

// ------------------------------- Leave -------------------------------

expenseRouter.post(
  '/holiday',
  joiValidationMiddleware(holidaySchema.holidayForm),
  authTokenMiddleware,
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
  holidayController.updateHoliday,
)

expenseRouter.delete(
  '/holiday/:id',
  authTokenMiddleware,
  holidayController.deleteHoliday,
)

module.exports = expenseRouter
