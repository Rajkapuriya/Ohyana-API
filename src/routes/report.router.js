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
  joiValidationMiddleware(reportSchema.productReport),
  authTokenMiddleware,
  reportController.getProductReport,
)

reportRouter.post(
  '/report/city',
  joiValidationMiddleware(reportSchema.productReportByCity),
  authTokenMiddleware,
  reportController.getProductReportByCity,
)

reportRouter.post(
  '/report/team',
  joiValidationMiddleware(reportSchema.teamReport),
  authTokenMiddleware,
  reportController.getTeamReport,
)

module.exports = reportRouter
