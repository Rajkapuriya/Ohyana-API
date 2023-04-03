const {
  joiValidationMiddleware,
} = require('../middleware/joi-validaton.middleware')
const { authTokenMiddleware } = require('../middleware/auth-token.middleware')
const { attendanceSchema } = require('../validators/attendance.validator')
const leaveController = require('../controllers/leave.controller')

const express = require('express')
const leaveRouter = express.Router()

// ------------------------------- Leave -------------------------------

leaveRouter.post(
  '/leave',
  joiValidationMiddleware(attendanceSchema.leaveTypeForm),
  authTokenMiddleware,
  leaveController.createLeaveType,
)

leaveRouter.get('/leave', authTokenMiddleware, leaveController.getAllLeaveTypes)

leaveRouter.put(
  '/leave/:id',
  joiValidationMiddleware(attendanceSchema.leaveTypeForm),
  authTokenMiddleware,
  leaveController.updateLeaveType,
)

leaveRouter.delete(
  '/leave/:id',
  authTokenMiddleware,
  leaveController.deleteLeaveType,
)

module.exports = leaveRouter
