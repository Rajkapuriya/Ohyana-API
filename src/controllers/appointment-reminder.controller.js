const { Appointment_Reminder } = require('../models')
const {
  unProcessableEntityRequestError,
  successResponse,
  forbiddenRequestError,
  notFoundError,
} = require('../utils/response.util')
const { MESSAGE } = require('../constants')
const { YYYY_MM_DDHHMM, YYYY_MM_DD_HHMM } = require('../utils/moment.util')

exports.createAppointmentReminder = async (req, res) => {
  if (YYYY_MM_DDHHMM(`${req.body.date} ${req.body.time}`) <= YYYY_MM_DDHHMM()) {
    return unProcessableEntityRequestError(res, MESSAGE.COMMON.INVALID_TIME)
  }

  await Appointment_Reminder.create({
    ...req.body,
    teamId: req.user.id,
    companyId: req.user.companyId,
  })
  return successResponse(res, MESSAGE.COMMON.RECORD_CREATED_SUCCESSFULLY)
}

exports.getAllAppointmentReminder = async (req, res) => {
  const appointed_reminder = await Appointment_Reminder.findAll({
    attributes: { exclude: ['createdAt', 'updatedAt'] },
    where: {
      type: req.query.type,
      teamId: req.user.id,
      companyId: req.user.companyId,
    },
    order: [['id', 'DESC']],
  })

  if (appointed_reminder.length === 0) notFoundError(res)

  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY,
    appointed_reminder,
  )
}

exports.updateAppointmentReminder = async (req, res) => {
  const { description, heading, date, time, type } = req.body

  if (YYYY_MM_DDHHMM(`${date} ${time}`) <= YYYY_MM_DDHHMM()) {
    return unProcessableEntityRequestError(res, MESSAGE.COMMON.INVALID_TIME)
  }

  const appointed_reminder = await Appointment_Reminder.findOne({
    where: { id: req.params.id, type },
  })

  if (appointed_reminder.isScheduled)
    return forbiddenRequestError(
      res,
      `${
        type === 'APPOINTMENT' ? 'Appointment' : 'Reminder'
      } Is Already Scheduled`,
    )
  const updatedAppointmentReminder = await appointed_reminder.update({
    description,
    heading,
    date,
    time,
  })

  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_UPDATED_SUCCESSFULLY,
    updatedAppointmentReminder,
  )
}

exports.deleteAppointmentReminder = async (req, res) => {
  await Appointment_Reminder.destroy({ where: { id: req.params.id } })
  return successResponse(res, MESSAGE.COMMON.RECORD_DELETED_SUCCESSFULLY)
}
