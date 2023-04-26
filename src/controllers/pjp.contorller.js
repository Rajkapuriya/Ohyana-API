const { Client_Status, Pjp, Client } = require('../models')
const moment = require('moment')
const { YYYY_MM_DD, YYYY_MM_DD_HHMMSS } = require('../utils/moment.util')
const {
  unProcessableEntityRequestError,
  successResponse,
  forbiddenRequestError,
  notFoundError,
  badRequestError,
} = require('../utils/response.util')
const { MESSAGE, PJP } = require('../constants')
const { Op } = require('sequelize')

exports.createPJP = async (req, res) => {
  const {
    date,
    latitude,
    longitude,
    name,
    contact_number,
    teamId,
    description,
    clientId,
  } = req.body
  let status

  if (YYYY_MM_DD(date) < YYYY_MM_DD())
    return unProcessableEntityRequestError(res, MESSAGE.COMMON.INVALID_TIME)

  if (YYYY_MM_DD(date) > YYYY_MM_DD()) {
    status = PJP.STATUS.UPCOMING
  } else {
    status = PJP.STATUS.TODAY
  }

  const clientDetail = await Client.findOne({
    attributes: ['id', 'state', 'city'],
    where: {
      id: clientId,
    },
  })

  if (!clientDetail) return notFoundError(res)

  await Pjp.create({
    date,
    status,
    description,
    teamId: teamId || req.user.id,
    clientId,
    state: clientDetail.state,
    city: clientDetail.city,
    companyId: req.user.companyId,
  })

  return successResponse(res, MESSAGE.COMMON.RECORD_CREATED_SUCCESSFULLY)
}

exports.addPJPStatus = async (req, res) => {
  const { description, followUpType, clientId } = req.body

  const newDate = YYYY_MM_DD_HHMMSS()
  await Client_Status.create({
    date: newDate.split(' ')[0],
    time: newDate.split(' ')[1],
    description,
    followUpType,
    teamId: req.user.id,
    clientId: clientId,
  })

  return successResponse(res, MESSAGE.COMMON.RECORD_CREATED_SUCCESSFULLY)
}

exports.getClientPJPStatus = async (req, res) => {
  const currentPage = parseInt(req.query.page) || 1
  const size = parseInt(req.query.size) || 20

  const { clientId, followUpType } = req.query
  const filterCondition = {}

  if (followUpType) {
    filterCondition.followUpType = followUpType
  }

  const status = await Client_Status.findAndCountAll({
    attributes: ['id', 'date', 'description', 'followUpType'],
    where: {
      clientId: clientId,
      teamId: req.user.id,
      ...filterCondition,
    },
    order: [['id', 'DESC']],
    offset: (currentPage - 1) * size,
    limit: size,
  })

  if (status.count === 0) return notFoundError(res)

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, {
    totalPage: status.count,
    statuses: status.rows,
  })
}

exports.completePJPStatus = async (req, res) => {
  const { description, latitude, longitude, pjpId } = req.body

  await Pjp.update(
    {
      finish_description: description,
      is_completed: true,
      location: {
        type: 'Point',
        coordinates: [latitude, longitude],
      },
    },
    { where: { id: pjpId } },
  )

  return successResponse(res, MESSAGE.COMMON.RECORD_UPDATED_SUCCESSFULLY)
}

exports.getAllPJP = async (req, res) => {
  const currentPage = parseInt(req.query.page) || 1
  const size = parseInt(req.query.size) || 20
  const { statusType, date, day, clientId, followUpType, teamId, city, state } =
    req.query

  const filterCondition = {}
  let attributes = ['id', 'date', 'status', 'is_completed']

  if (clientId) {
    filterCondition.clientId = clientId
    attributes = ['date', 'followUpType', 'description']
  } else {
    /*
     * whereCondition.include = [
     *     { model: Client, attributes: ['city', 'state', 'name', 'business', 'contact_number'] }
     * ]
     */
  }

  if (day == 'TODAY') filterCondition.date = YYYY_MM_DD()

  if (day == 'TOMORROW')
    filterCondition.date = YYYY_MM_DD(moment().add(1, 'days'))

  if (statusType) filterCondition.status = statusType

  if (followUpType) filterCondition.followUpType = followUpType

  if (date) filterCondition.date = date

  if (city) {
    filterCondition.city = {
      [Op.like]: `%${city}%`,
    }
  }

  if (state) {
    filterCondition.state = {
      [Op.like]: `%${state}%`,
    }
  }

  const pjp = await Pjp.findAndCountAll({
    attributes: attributes,
    where: {
      companyId: req.user.companyId,
      teamId: teamId ?? req.user.id,
      ...filterCondition,
    },
    order: [['id', 'DESC']],
    include: {
      model: Client,
      attributes: ['id', 'name', 'contact_number', 'city', 'state', 'business'],
    },
    offset: (currentPage - 1) * size,
    limit: size,
  })

  const response = {
    totalPage: pjp.count,
    pjps: pjp.rows,
  }

  response.completedPJP =
    day == 'TODAY'
      ? response.pjps.filter(e => e.status === PJP.STATUS.COMPLETED).length
      : 0

  if (response.totalPage === 0) return notFoundError(res)

  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY,
    response,
  )
}

exports.getPJPDetail = async (req, res) => {
  const pjp = await Pjp.findOne({
    attributes: [
      'id',
      'date',
      'status',
      'location',
      'description',
      'is_completed',
      'contact_number',
      'finish_description',
    ],
    where: { id: req.params.id },
    include: {
      model: Client,
      attributes: ['id', 'name', 'contact_number', 'city', 'business', 'state'],
    },
  })

  if (!pjp) return notFoundError(res)

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, pjp)
}

exports.updatePjp = async (req, res) => {
  const { date } = req.body
  if (date && moment(date) <= moment())
    return badRequestError(res, MESSAGE.COMMON.INVALID_TIME)

  await Pjp.update(req.body, { where: { id: req.body.pjpId } })
  return successResponse(res, MESSAGE.COMMON.RECORD_UPDATED_SUCCESSFULLY)
}

exports.deletePjp = async (req, res) => {
  const isPjpDeleted = await Pjp.destroy({
    where: { id: req.params.id, is_completed: false },
  })

  if (!isPjpDeleted) return badRequestError(res, 'PJP is not completed yet')

  return successResponse(res, MESSAGE.COMMON.RECORD_DELETED_SUCCESSFULLY)
}
