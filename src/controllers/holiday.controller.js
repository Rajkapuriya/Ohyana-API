const { Holiday } = require('../models')
const {
  unProcessableEntityRequestError,
  successResponse,
  forbiddenRequestError,
  notFoundError,
} = require('../utils/response.util')
const { MESSAGE } = require('../constants/message.contant')

exports.createHoliday = async (req, res) => {
  const { date, duration, occasion, regular } = req.body
  let createBody = {
    date,
    occasion,
    duration,
    type: 'OCCASIONAL',
    companyId: req.user.companyId,
  }

  if (regular) {
    createBody = { occasion, type: 'REGULAR', companyId: req.user.companyId }
  } else {
    if (!req.body.date)
      return unProcessableEntityRequestError(res, 'Please Select Date')
    if (!req.body.duration)
      return unProcessableEntityRequestError(res, 'Please Select Duration')
  }

  const [, created] = await Holiday.findOrCreate({
    where: { occasion, companyId: req.user.companyId },
    defaults: createBody,
  })
  if (!created) return forbiddenRequestError(res, MESSAGE.RECORD_ALREADY_EXISTS)

  return successResponse(res, MESSAGE.RECORD_CREATED_SUCCESSFULLY)
}

exports.getAllHolidays = async (req, res) => {
  const { type } = req.query

  const attributes =
    type === 'regular'
      ? ['id', 'occasion']
      : ['id', 'date', 'occasion', 'duration']

  const holidays = await Holiday.findAll({
    attributes,
    where: {
      companyId: req.user.companyId,
      type: type.toUpperCase(),
    },
    order: [['date', 'asc']],
  })

  if (holidays.length === 0) return notFoundError(res)

  return successResponse(res, MESSAGE.RECORD_FOUND_SUCCESSFULLY, holidays)
}

exports.updateHoliday = async (req, res) => {
  const { date, duration, occasion, regular } = req.body
  let createBody = { date, occasion, duration }

  if (regular) {
    createBody = { occasion }
  } else {
    if (!req.body.date)
      return unProcessableEntityRequestError(res, 'Please Select Date')
    if (!req.body.duration)
      return unProcessableEntityRequestError(res, 'Please Select Duration')
  }

  const existedHoliday = await Holiday.findOne({
    where: { occasion, companyId: req.user.companyId },
  })
  if (existedHoliday)
    return forbiddenRequestError(res, MESSAGE.RECORD_ALREADY_EXISTS)

  await Holiday.update(createBody, { where: { id: req.params.id } })
  return successResponse(res, MESSAGE.RECORD_UPDATED_SUCCESSFULLY)
}

exports.deleteLeaveType = async (req, res) => {
  await Holiday.destroy({ where: { id: req.params.id } })
  return successResponse(res, MESSAGE.RECORD_DELETED_SUCCESSFULLY)
}
