const Joi = require('joi')

exports.attendanceSchema = {
  singleUserAttendance: Joi.object({
    query: Joi.object({
      teamId: Joi.number(),
      month: Joi.number().greater(0),
      year: Joi.number().greater(0),
      attendanceType: Joi.string(),
      page: Joi.number(),
      size: Joi.number(),
    }).required(),
  }).unknown(),

  allUserAttendance: Joi.object({
    query: Joi.object({
      year: Joi.number().required(),
      month: Joi.number().required(),
    }).required(),
  }).unknown(),

  attendance: Joi.object({
    query: Joi.object({
      checkIn: Joi.boolean(),
      checkOut: Joi.boolean(),
      breakIn: Joi.boolean(),
      breakOut: Joi.boolean(),
    }).required(),
  }).unknown(),

  singleUserLeaves: Joi.object({
    query: Joi.object({
      teamId: Joi.number(),
      status: Joi.string(),
      month: Joi.number(),
      year: Joi.number(),
    }).required(),
  }).unknown(),

  leaveTypeForm: Joi.object({
    body: Joi.object({
      type: Joi.string().min(2).required(),
      duration: Joi.number().required(),
    }).required(),
  }).unknown(),

  applyLeave: Joi.object({
    body: Joi.object({
      duration: Joi.string().required(),
      leavetypeId: Joi.number().required(),
    }).required(),
  }).unknown(),

  grantLeave: Joi.object({
    query: Joi.object({
      isApproved: Joi.boolean().required(),
    }).required(),
  }).unknown(),
}
