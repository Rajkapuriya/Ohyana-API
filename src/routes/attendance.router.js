const {
  joiValidationMiddleware,
} = require('../middleware/joi-validaton.middleware')
const { authTokenMiddleware } = require('../middleware/auth-token.middleware')
const { attendanceSchema } = require('../validators/attendance.validator')
const attendanceController = require('../controllers/attendance.controller')

const express = require('express')
const attendanceRouter = express.Router()

// ------------------------------- Attendance -------------------------------

attendanceRouter.get(
  '/attendance',
  joiValidationMiddleware(attendanceSchema.singleUserAttendance),
  authTokenMiddleware,
  attendanceController.getAllAttendancePerUser,
)

attendanceRouter.get(
  '/attendance-all',
  joiValidationMiddleware(attendanceSchema.allUserAttendance),
  authTokenMiddleware,
  attendanceController.getAttendanceOfAllUsers,
)

attendanceRouter.put(
  '/attendance',
  joiValidationMiddleware(attendanceSchema.attendance),
  authTokenMiddleware,
  attendanceController.updateAttendance,
)

// ------------------------------- Leave -------------------------------

attendanceRouter.get(
  '/user/leave',
  joiValidationMiddleware(attendanceSchema.singleUserLeaves),
  authTokenMiddleware,
  attendanceController.getAllLeavePerUser,
)

attendanceRouter.post(
  '/apply/leave',
  joiValidationMiddleware(attendanceSchema.applyLeave),
  authTokenMiddleware,
  attendanceController.applyLeave,
)

attendanceRouter.put(
  '/grant/leave/:id',
  joiValidationMiddleware(attendanceSchema.grantLeave),
  authTokenMiddleware,
  attendanceController.grantLeave,
)

module.exports = attendanceRouter
