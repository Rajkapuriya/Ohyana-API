const { Target } = require('../models')
const { Op } = require('sequelize')
const moment = require('moment')
const { successResponse, notFoundError } = require('../utils/response.util')
const { MESSAGE, TARGET } = require('../constants')
const sequelize = require('../database/mysql')

exports.setTarget = async (req, res) => {
  const target = await Target.findOne({
    where: { teamId: req.params.id, state: TARGET.STATE.UPCOMING },
  })

  // if (target) {
  //   await target.update(req.body)
  //   return successResponse(res, MESSAGE.COMMON.RECORD_UPDATED_SUCCESSFULLY)
  // }

  await Target.bulkCreate([
    {
      ...req.body,
      startDate: moment(),
      endDate: moment().add(req.body.period, 'days'),
      state: TARGET.STATE.CURRENT,
      teamId: req.params.id,
    },
    {
      ...req.body,
      state: TARGET.STATE.UPCOMING,
      teamId: req.params.id,
    },
  ])
  return successResponse(res, MESSAGE.COMMON.RECORD_CREATED_SUCCESSFULLY)
}

exports.getTargets = async (req, res) => {
  const { month, year } = req.query

  const filterCondition = {}

  if (month && year) {
    filterCondition[Op.and] = [
      // { date: date },
      sequelize.where(sequelize.fn('year', sequelize.col('startDate')), year),
      sequelize.where(sequelize.fn('month', sequelize.col('startDate')), month),
    ]
  }

  const target = await Target.findAll({
    where: {
      teamId: req.params.id,
      // state: { [Op.not]: TARGET.STATE.UPCOMING },
      ...filterCondition,
    },
  })

  if (target.length === 0) return notFoundError(res)

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, target)
}
