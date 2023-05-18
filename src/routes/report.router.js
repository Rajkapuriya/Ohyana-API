const {
  joiValidationMiddleware,
} = require('../middleware/joi-validaton.middleware')
const { authTokenMiddleware } = require('../middleware/auth-token.middleware')
const { reportSchema } = require('../validators/report.validator')
const reportController = require('../controllers/report.controller')
const {
  permissionHandleMiddleware,
} = require('../middleware/permission-handler.middleware')
const { TEAM } = require('../constants')

const express = require('express')
const reportRouter = express.Router()

reportRouter.post(
  '/report/product',
  joiValidationMiddleware(reportSchema.productReport),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_REPORT]),
  reportController.getProductReport,
)

reportRouter.post(
  '/report/city',
  joiValidationMiddleware(reportSchema.productReportByCity),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_REPORT]),
  reportController.getProductReportByCity,
)

reportRouter.post(
  '/report/team',
  joiValidationMiddleware(reportSchema.teamReport),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.VIEW_REPORT]),
  reportController.getTeamReport,
)

module.exports = reportRouter
