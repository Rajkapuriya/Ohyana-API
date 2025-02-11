const { Target } = require('../models')
const { Op } = require('sequelize')
const moment = require('moment')
const {
  successResponse,
  notFoundError,
  badRequestError,
} = require('../utils/response.util')
const { MESSAGE, TARGET } = require('../constants')
const sequelize = require('../database/mysql')

exports.setTarget = async (req, res) => {
  const { startDate, endDate } = req.body

  // if (target) {
  //   await target.update(req.body)
  //   return successResponse(res, MESSAGE.COMMON.RECORD_UPDATED_SUCCESSFULLY)
  // }

  // await Target.bulkCreate([
  //   {
  //     ...req.body,
  //     startDate: moment(),
  //     endDate: moment().add(req.body.period, 'days'),
  //     state: TARGET.STATE.CURRENT,
  //     teamId: req.params.id,
  //   },
  //   {
  //     ...req.body,
  //     state: TARGET.STATE.UPCOMING,
  //     teamId: req.params.id,
  //   },
  // ])

  const existedTarget = await Target.findOne({
    where: {
      teamId: req.params.id,
      [Op.or]: [
        { startDate: { [Op.between]: [startDate, endDate] } },
        { endDate: { [Op.between]: [startDate, endDate] } },
      ],
    },
  })

  if (existedTarget)
    return badRequestError(res, 'Target Already Assigned for this time period')

  const currentTargetCount = await Target.count({
    where: { state: TARGET.STATE.CURRENT },
  })

  await Target.create({
    ...req.body,
    state:
      currentTargetCount.count > 0
        ? TARGET.STATE.UPCOMING
        : TARGET.STATE.CURRENT,
    teamId: req.params.id,
  })

  return successResponse(res, MESSAGE.COMMON.RECORD_CREATED_SUCCESSFULLY)
}

exports.getTargets = async (req, res) => {
  const { month, year } = req.query
  const currentPage = parseInt(req.query.page) || 1
  const size = parseInt(req.query.size) || 20

  const filterCondition = {}

  if (month && year) {
    filterCondition[Op.and] = [
      // { date: date },
      sequelize.where(sequelize.fn('year', sequelize.col('startDate')), year),
      sequelize.where(sequelize.fn('month', sequelize.col('startDate')), month),
    ]
  }

  const { count: totalPage, rows: targets } = await Target.findAndCountAll({
    where: {
      teamId: req.params.id,
      // state: { [Op.not]: TARGET.STATE.UPCOMING },
      ...filterCondition,
    },
    offset: (currentPage - 1) * size,
    limit: size,
  })

  if (totalPage === 0) return notFoundError(res)

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, {
    totalPage,
    targets,
  })
}
