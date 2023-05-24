const { Attendance, Leave, Team_Leave, Team } = require('../models')
const moment = require('moment')
const sequelize = require('../database/mysql')
const {
  successResponse,
  forbiddenRequestError,
  badRequestError,
  notFoundError,
} = require('../utils/response.util')
const { YYYY_MM_DD, HH_MM_SS } = require('../utils/moment.util')
const { Op } = require('sequelize')
const { updateTeamMemberPoint } = require('../utils/common.util')
const { ATTENDANCE, MESSAGE, POINTS } = require('../constants')

exports.updateAttendance = async (req, res) => {
  const { checkIn, checkOut, breakIn, breakOut } = req.query

  const currentTime = HH_MM_SS()
  const currentDate = YYYY_MM_DD()

  const existingPresentOfToday = await Attendance.findOne({
    where: {
      date: currentDate,
      teamId: req.user.id,
      attendanceType: {
        [Op.or]: [ATTENDANCE.TYPE.PRESENT, ATTENDANCE.TYPE.LATE],
      },
    },
  })

  if (checkIn && checkIn === 'true') {
    if (!existingPresentOfToday) {
      await Attendance.create({
        checkIn: currentTime,
        teamId: req.user.id,
        attendanceType:
          currentTime > req.user.role.clockIn
            ? ATTENDANCE.TYPE.LATE
            : ATTENDANCE.TYPE.PRESENT,
      })
      let pointId = POINTS.TYPE.PRESENT
      if (currentTime > req.user.role.clockIn) {
        pointId = POINTS.TYPE.LATE
      }
      await updateTeamMemberPoint(req.user.id, pointId)
      return successResponse(res, 'CheckIn Successfully', {
        checkIn: currentTime,
      })
    }
    return forbiddenRequestError(res, 'Already CheckIn')
  } else {
    let updateObject

    if (!existingPresentOfToday || !existingPresentOfToday.checkIn)
      return badRequestError(res)

    if (
      !existingPresentOfToday.breakIn &&
      !existingPresentOfToday.checkOut &&
      breakIn &&
      breakIn === 'true'
    ) {
      updateObject = { breakIn: currentTime }
    } else if (
      existingPresentOfToday.breakIn &&
      !existingPresentOfToday.breakOut &&
      !existingPresentOfToday.checkOut &&
      breakOut &&
      breakOut === 'true'
    ) {
      updateObject = { breakOut: currentTime }
    } else if (
      !existingPresentOfToday.checkOut &&
      checkOut &&
      checkOut === 'true'
    ) {
      const totalHourOfWork = moment(currentTime, 'HH:mm:ss').diff(
        moment(existingPresentOfToday.checkIn, 'HH:mm:ss'),
      )
      const totalHourOfBreake =
        moment(existingPresentOfToday.breakOut, 'HH:mm:ss').diff(
          moment(existingPresentOfToday.breakIn, 'HH:mm:ss'),
        ) || 0
      const hoursInSeconds =
        moment.duration(totalHourOfWork).asSeconds() -
        moment.duration(totalHourOfBreake).asSeconds()
      updateObject = { checkOut: currentTime, totalHours: hoursInSeconds }
    }

    if (updateObject) {
      await Attendance.update(updateObject, {
        where: { date: currentDate, teamId: req.user.id },
      })
      return successResponse(
        res,
        MESSAGE.COMMON.RECORD_UPDATED_SUCCESSFULLY,
        updateObject,
      )
    }

    return badRequestError(res)
  }
}

exports.getAttendanceOfAllUsers = async (req, res) => {
  const attendance = await Team.findAll({
    attributes: ['id', 'name'],
    where: {
      // roleId: {
      //     [Op.ne]: 1,
      // },
      // id: {
      //     [Op.ne]: req.user.id,
      // },
      companyId: req.user.companyId,
    },
    include: [
      {
        model: Attendance,
        attributes: ['id', 'attendanceType', 'date'],
        where: {
          [Op.and]: [
            // { date: date },
            sequelize.where(
              sequelize.fn('year', sequelize.col('date')),
              req.query.year,
            ),
            sequelize.where(
              sequelize.fn('month', sequelize.col('date')),
              req.query.month,
            ),
          ],
        },
      },
    ],
  })

  if (attendance.length === 0) return notFoundError(res)

  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY,
    attendance,
  )
}

exports.getAllAttendancePerUser = async (req, res) => {
  const { month, year, attendanceType } = req.query
  const teamId = req.query.teamId ?? req.user.id
  const filterCondition = {}

  if (month && year) {
    filterCondition[Op.and] = [
      // { date: date },
      sequelize.where(sequelize.fn('year', sequelize.col('date')), year),
      sequelize.where(sequelize.fn('month', sequelize.col('date')), month),
    ]
  }

  if (attendanceType && attendanceType != 'ALL') {
    filterCondition.attendanceType = attendanceType
  }

  const [absentDayCount, lateDayCount, attendancePerUser] = await Promise.all([
    await Attendance.count({
      where: { teamId, attendanceType: ATTENDANCE.TYPE.ABSENT },
    }),
    await Attendance.count({
      where: { teamId, attendanceType: ATTENDANCE.TYPE.LATE },
    }),
    await Attendance.findAndCountAll({
      attributes: { exclude: ['createdAt', 'updatedAt', 'teamId'] },
      where: { teamId, ...filterCondition },
      order: [['date', 'DESC']],
      // include: [
      //     { model: Leave, attributes: ['type'] }
      // ]
    }),
  ])

  attendancePerUser.rows = attendancePerUser.rows.map(attendance => {
    return {
      ...attendance.dataValues,
      totalHours: Math.floor(attendance.totalHours / 60),
    }
  })

  const data = {
    totalDays: attendancePerUser.count,
    absentDays: absentDayCount,
    lateDays: lateDayCount,
    totalPage: attendancePerUser.count,
    attendancePerUser: attendancePerUser.rows,
  }

  if (data.totalPage === 0) return notFoundError(res)

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, data)
}

exports.applyLeave = async (req, res) => {
  const { duration, leavetypeId } = req.body

  const existedLeaveWithCurrentType = await Team_Leave.findOne({
    where: { date: duration, leaveId: leavetypeId },
  })

  if (existedLeaveWithCurrentType)
    return forbiddenRequestError(res, 'You Have Already Apply For This Leave')

  const [existedLeave, leaves] = await Promise.all([
    Team_Leave.findOne({
      where: { leaveId: leavetypeId, status: ATTENDANCE.LEAVE_TYPE.APPROVED },
      order: [['createdAt', 'DESC']],
    }),
    Leave.findOne({ where: { id: leavetypeId } }),
  ])

  if (existedLeave && existedLeave.remainDays === 0)
    return forbiddenRequestError(res, 'Your Leave is over')

  await Team_Leave.create({
    date: duration,
    teamId: req.user.id,
    leaveId: leavetypeId,
    takenDays: 1,
    remainDays: existedLeave
      ? existedLeave.remainDays - 1
      : leaves.duration - 1,
    status: ATTENDANCE.LEAVE_TYPE.PENDING,
  })

  return successResponse(res, 'Leave is Added To Queue')
}

exports.grantLeave = async (req, res) => {
  if (!req.user.role.parentId) {
    let message
    const updateObject = { status: ATTENDANCE.LEAVE_TYPE.PENDING }

    const teamLeave = await Team_Leave.findOne({
      where: { id: req.params.id, status: ATTENDANCE.LEAVE_TYPE.PENDING },
    })

    if (!teamLeave) return notFoundError(res, 'No Leave Found')

    if (req.query.isApproved === 'false') {
      updateObject.status = ATTENDANCE.LEAVE_TYPE.REJECTED
      updateObject.remainDays = teamLeave.remainDays + teamLeave.takenDays
      message = 'Leave Rejected'
    } else if (req.query.isApproved === 'true') {
      updateObject.status = ATTENDANCE.LEAVE_TYPE.APPROVED
      message = 'Leave Approved'
    }

    await teamLeave.update(updateObject)
    return successResponse(res, message)
  } else {
    return forbiddenRequestError(res)
  }
}

exports.getAllLeavePerUser = async (req, res) => {
  const { teamId, status, month, year } = req.query
  const filterCondition = {}

  if (status && status !== 'ALL') {
    filterCondition.status = status
  }

  if (month && month != 0 && year && year != 0) {
    filterCondition[Op.and] = [
      // { date: date },
      sequelize.where(sequelize.fn('month', sequelize.col('date')), month),
      sequelize.where(sequelize.fn('year', sequelize.col('date')), year),
    ]
  }

  const leavesPerUser = await Team_Leave.findAll({
    attributes: ['id', 'date', 'takenDays', 'remainDays', 'status'],
    where: { teamId: teamId ?? req.user.id, ...filterCondition },
    paranoid: false,
    order: [['date', 'DESC']],
    include: [{ model: Leave, attributes: ['type'] }],
  })

  if (leavesPerUser.length === 0) return notFoundError(res)

  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY,
    leavesPerUser,
  )
}
