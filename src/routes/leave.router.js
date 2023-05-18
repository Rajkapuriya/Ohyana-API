const {
  joiValidationMiddleware,
} = require('../middleware/joi-validaton.middleware')
const { authTokenMiddleware } = require('../middleware/auth-token.middleware')
const { attendanceSchema } = require('../validators/attendance.validator')
const leaveController = require('../controllers/leave.controller')

const express = require('express')
const {
  permissionHandleMiddleware,
} = require('../middleware/permission-handler.middleware')
const { TEAM } = require('../constants')
const leaveRouter = express.Router()

// ------------------------------- Leave -------------------------------

leaveRouter.post(
  '/leave',
  joiValidationMiddleware(attendanceSchema.leaveTypeForm),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.EDIT_LEAVE]),
  leaveController.createLeaveType,
)

leaveRouter.get('/leave', authTokenMiddleware, leaveController.getAllLeaveTypes)

leaveRouter.put(
  '/leave/:id',
  joiValidationMiddleware(attendanceSchema.leaveTypeForm),
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.EDIT_LEAVE]),
  leaveController.updateLeaveType,
)

leaveRouter.delete(
  '/leave/:id',
  authTokenMiddleware,
  permissionHandleMiddleware([TEAM.PERMISSIONS.DELETE_LEAVE]),
  leaveController.deleteLeaveType,
)

module.exports = leaveRouter
