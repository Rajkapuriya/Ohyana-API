const {
  joiValidationMiddleware,
} = require('../middleware/joi-validaton.middleware')
const { authTokenMiddleware } = require('../middleware/auth-token.middleware')
const { notificationSchema } = require('../validators/notification.validator')
const notificationController = require('../controllers/notification.controller')

const express = require('express')
const notificationRouter = express.Router()

// ------------------------------- Notification -------------------------------

notificationRouter.post(
  '/notification',
  joiValidationMiddleware(notificationSchema.notificationForm),
  authTokenMiddleware,
  notificationController.createNotification,
)

notificationRouter.get(
  '/notification',
  joiValidationMiddleware(notificationSchema.notifications),
  authTokenMiddleware,
  notificationController.getAllNotification,
)

module.exports = notificationRouter
