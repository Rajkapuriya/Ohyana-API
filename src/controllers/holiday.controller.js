const { Holiday } = require('../models')
const {
  unProcessableEntityRequestError,
  successResponse,
  forbiddenRequestError,
  notFoundError,
} = require('../utils/response.util')
const { MESSAGE, HOLIDAY } = require('../constants')
const { Op } = require('sequelize')

exports.createHoliday = async (req, res) => {
  const { date, duration, occasion, regular } = req.body
  const body = {
    date,
    occasion,
    duration,
    type: HOLIDAY.TYPE.OCCASIONAL,
    companyId: req.user.companyId,
  }

  if (regular) {
    body.type = HOLIDAY.TYPE.REGULAR
    if (isNaN(parseInt(occasion)))
      return unProcessableEntityRequestError(res, 'Invalide Day')
    delete body.date
    delete body.duration
  } else {
    if (!date) return unProcessableEntityRequestError(res, 'Please Select Date')
    if (!duration)
      return unProcessableEntityRequestError(res, 'Please Select Duration')
  }

  const [, created] = await Holiday.findOrCreate({
    where: { occasion, companyId: req.user.companyId },
    defaults: body,
  })
  if (!created)
    return forbiddenRequestError(res, MESSAGE.COMMON.RECORD_ALREADY_EXISTS)

  return successResponse(res, MESSAGE.COMMON.RECORD_CREATED_SUCCESSFULLY)
}

exports.getAllHolidays = async (req, res) => {
  const { type } = req.query

  const attributes = ['id', 'occasion']

  if (type !== 'regular') {
    attributes.push('date')
    attributes.push('duration')
  }

  const holidays = await Holiday.findAll({
    attributes,
    where: {
      companyId: req.user.companyId,
      type: type.toUpperCase(),
    },
    order: [['date', 'asc']],
  })

  if (holidays.length === 0) return notFoundError(res)

  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY,
    holidays,
  )
}

exports.updateHoliday = async (req, res) => {
  const { date, duration, occasion, regular } = req.body
  const body = { date, occasion, duration }

  if (regular) {
    body.occasion = occasion
    delete body.date
    delete body.duration
  } else {
    if (!date) return unProcessableEntityRequestError(res, 'Please Select Date')
    if (!duration)
      return unProcessableEntityRequestError(res, 'Please Select Duration')
  }

  const existedHoliday = await Holiday.findOne({
    where: {
      occasion,
      companyId: req.user.companyId,
      id: { [Op.ne]: req.params.id },
    },
  })
  if (existedHoliday)
    return forbiddenRequestError(res, MESSAGE.COMMON.RECORD_ALREADY_EXISTS)

  await Holiday.update(body, { where: { id: req.params.id } })
  return successResponse(res, MESSAGE.COMMON.RECORD_UPDATED_SUCCESSFULLY)
}

exports.deleteHoliday = async (req, res) => {
  await Holiday.destroy({ where: { id: req.params.id } })
  return successResponse(res, MESSAGE.COMMON.RECORD_DELETED_SUCCESSFULLY)
}
