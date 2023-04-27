const { Leave, Team_Leave } = require('../models')
const sequelize = require('../database/mysql')
const { Sequelize, Op } = require('sequelize')
const {
  successResponse,
  forbiddenRequestError,
  notFoundError,
} = require('../utils/response.util')
const { MESSAGE } = require('../constants')

exports.createLeaveType = async (req, res) => {
  const { type, duration } = req.body

  const existetLeaveType = await Leave.findOne({
    where: { type, companyId: req.user.companyId },
  })
  if (existetLeaveType)
    return forbiddenRequestError(res, MESSAGE.COMMON.RECORD_ALREADY_EXISTS)

  await Leave.create({ type, duration, companyId: req.user.companyId })
  return successResponse(res, MESSAGE.COMMON.RECORD_CREATED_SUCCESSFULLY)
}

exports.getAllLeaveTypes = async (req, res) => {
  const leaves = await Leave.findAll({
    attributes: ['id', 'type', 'duration'],
    where: { companyId: req.user.companyId },
  })
  if (leaves.length === 0) return notFoundError(res)
  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, leaves)
}

exports.updateLeaveType = async (req, res) => {
  const { type, duration } = req.body

  const existetLeaveType = await Leave.findOne({
    where: {
      type,
      companyId: req.user.companyId,
      id: { [Op.ne]: req.params.id },
    },
  })
  if (existetLeaveType)
    return forbiddenRequestError(res, MESSAGE.COMMON.RECORD_ALREADY_EXISTS)

  const leave = await Leave.findOne({ where: { id: req.params.id } })

  await sequelize.transaction(async t => {
    const whereClause = { leaveId: req.params.id }

    const [oldLeaveData, updatedLeaveData] = await Promise.all([
      Leave.findOne({ where: { id: req.params.id }, transaction: t }),
      leave.update({ type, duration }),
    ])

    const rdc = updatedLeaveData.duration - oldLeaveData.duration // rdc = Calculation of updated days minus old remaining days

    if (rdc < 0) {
      whereClause.remainDays = { [Op.ne]: 0 }
    }

    if (updatedLeaveData) {
      await Team_Leave.update(
        {
          remainDays: Sequelize.literal(
            `case when remainDays + ${rdc} < 0 then 0 else remainDays + ${rdc} end`,
          ),
        },
        { where: whereClause, transaction: t },
      )
    }

    return updatedLeaveData
  })

  return successResponse(res, MESSAGE.COMMON.RECORD_UPDATED_SUCCESSFULLY)
}

exports.deleteLeaveType = async (req, res) => {
  await Leave.destroy({ where: { id: req.params.id } })
  return successResponse(res, MESSAGE.COMMON.RECORD_DELETED_SUCCESSFULLY)
}
