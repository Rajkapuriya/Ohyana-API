const {
  joiValidationMiddleware,
} = require('../middleware/joi-validaton.middleware')
const { authTokenMiddleware } = require('../middleware/auth-token.middleware')
const { reportSchema } = require('../validators/report.validator')
const reportController = require('../controllers/report.controller')

const express = require('express')
const reportRouter = express.Router()

reportRouter.post(
  '/report/product',
  joiValidationMiddleware(reportSchema.reportData),
  authTokenMiddleware,
  reportController.getProductReport,
)

reportRouter.get(
  '/report/team',
  // joiValidationMiddleware(reportSchema.reportData),
  authTokenMiddleware,
  reportController.getTeamReport,
)

module.exports = reportRouter
