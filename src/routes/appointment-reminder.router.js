const {
  joiValidationMiddleware,
} = require('../middleware/joi-validaton.middleware')
const { authTokenMiddleware } = require('../middleware/auth-token.middleware')
const {
  appointmentReminderSchema,
} = require('../validators/appointment-reminder.validator')
const appointmentReminderController = require('../controllers/appointment-reminder.controller')

const express = require('express')
const appointmentReminderRouter = express.Router()

// ------------------------------- Appointment or Reminder -------------------------------

appointmentReminderRouter.post(
  '/appointment-reminder',
  joiValidationMiddleware(appointmentReminderSchema.appointmentReminderForm),
  authTokenMiddleware,
  appointmentReminderController.createAppointmentReminder,
)

appointmentReminderRouter.get(
  '/appointment-reminder',
  joiValidationMiddleware(appointmentReminderSchema.appointmentReminderList),
  authTokenMiddleware,
  appointmentReminderController.getAllAppointmentReminder,
)

appointmentReminderRouter.put(
  '/appointment-reminder/:id',
  joiValidationMiddleware(appointmentReminderSchema.appointmentReminderForm),
  authTokenMiddleware,
  appointmentReminderController.updateAppointmentReminder,
)

appointmentReminderRouter.delete(
  '/appointment-reminder/:id',
  authTokenMiddleware,
  appointmentReminderController.deleteAppointmentReminder,
)

module.exports = appointmentReminderRouter
