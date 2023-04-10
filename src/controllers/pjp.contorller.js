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
const { MESSAGE } = require('../constants/message.contant')

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
    status = 'UPCOMING'
  } else {
    status = 'TODAY'
  }

  await Pjp.create({
    date,
    status,
    description,
    teamId: teamId || req.user.id,
    clientId,
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

  const whereCondition = {
    clientId: req.query.clientId,
    teamId: req.user.id,
  }

  if (req.query.followUpType) {
    whereCondition.followUpType = req.query.followUpType
  }

  const status = await Client_Status.findAndCountAll({
    attributes: ['id', 'date', 'description', 'followUpType'],
    where: whereCondition,
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
  const { statusType, date, day, clientId, followUpType, teamId } = req.query

  const whereCondition = {
    attributes: ['id', 'date', 'status', 'is_completed'],
    where: {
      companyId: req.user.companyId,
      teamId: teamId ?? req.user.id,
    },
    order: [['id', 'DESC']],
    include: {
      model: Client,
      attributes: ['id', 'name', 'contact_number', 'city', 'state', 'business'],
    },
    offset: (currentPage - 1) * size,
    limit: size,
  }

  if (clientId) {
    whereCondition.where.clientId = clientId
    whereCondition.attributes = ['date', 'followUpType', 'description']
  } else {
    /*
     * whereCondition.include = [
     *     { model: Client, attributes: ['city', 'state', 'name', 'business', 'contact_number'] }
     * ]
     */
  }

  if (day == 'TODAY') {
    whereCondition.where.date = YYYY_MM_DD()
  }

  if (day == 'TOMORROW') {
    whereCondition.where.date = YYYY_MM_DD(moment().add(1, 'days'))
  }

  if (statusType) {
    whereCondition.where.status = statusType
  }

  if (followUpType) {
    whereCondition.where.followUpType = followUpType
  }

  if (date) {
    whereCondition.where.date = date
  }

  let response = {}

  response = await Pjp.findAndCountAll(whereCondition)

  response = {
    totalPage: response.count,
    pjps: response.rows,
  }

  response.completedPJP =
    day == 'TODAY'
      ? response.pjps.filter(e => e.status === 'FINISHED').length
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
