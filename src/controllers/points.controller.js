const { Points, Team, Team_Point } = require('../models')
const sequelize = require('../database/mysql')
const { Op, Sequelize, QueryTypes } = require('sequelize')
const { successResponse, notFoundError } = require('../utils/response.util')
const { MESSAGE, POINTS } = require('../constants')
const { updateTeamMemberPoint } = require('../utils/common.util')

exports.getAllTeamPoints = async (req, res) => {
  const currentPage = parseInt(req.query.page) || 1
  const size = parseInt(req.query.size) || 20
  const { month, year, teamId } = req.query
  const filterCondition = {}

  if (month && year && month != 0 && year != 0) {
    filterCondition[Op.and] = [
      // { date: date },
      sequelize.where(
        sequelize.fn('year', sequelize.col('team_point.createdAt')),
        year,
      ),
      sequelize.where(
        sequelize.fn('month', sequelize.col('team_point.createdAt')),
        month,
      ),
    ]
  }

  const [totalPoints, teamPoints] = await Promise.all([
    Team_Point.findOne({
      attributes: [
        'id',
        'createdAt',
        [sequelize.fn('SUM', sequelize.col('points')), 'total_points'],
      ],
      where: { teamId: teamId ?? req.user.id, ...filterCondition },
      include: [{ model: Points }],
    }),
    Team_Point.findAndCountAll({
      attributes: ['id', 'createdAt'],
      where: { teamId: teamId ?? req.user.id, ...filterCondition },
      include: [{ model: Points }],
      order: [['id', 'DESC']],
      offset: (currentPage - 1) * size,
      limit: size,
    }),
  ])

  const data = {
    totalPage: teamPoints.count,
    totalPoints: totalPoints.dataValues.total_points,
    points: teamPoints.rows,
  }

  if (data.totalPage === 0) return notFoundError(res)

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, data)
}

exports.getPointsRules = async (req, res) => {
  const points = await Points.findAll({
    attributes: ['id', 'name', 'points'],
    where: { companyId: req.user.companyId },
  })

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, points)
}

exports.giveAppreciationPoints = async (req, res) => {
  await updateTeamMemberPoint(req.params.id, POINTS.TYPE.APPRICIATION_POINT) // 11 for appreciation points

  return successResponse(res, 'Point Given Successfully')
}
