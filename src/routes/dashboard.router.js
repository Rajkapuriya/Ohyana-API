const { authTokenMiddleware } = require('../middleware/auth-token.middleware')
const dashboardController = require('../controllers/dashboard.controller')

const express = require('express')
const dashboardRouter = express.Router()

dashboardRouter.get(
  '/dashboard/inquiry',
  authTokenMiddleware,
  dashboardController.getInquiryAnalytics,
)
dashboardRouter.get(
  '/dashboard/sales/inquiry',
  authTokenMiddleware,
  dashboardController.getSalesTeamInquiryAnalytics,
)

module.exports = dashboardRouter
