const { Team, Team_Point, Points, Target } = require('../models')
const { Sequelize, Op } = require('sequelize')
const { YYYY_MM_DD, DD_MMM_YYYY } = require('./moment.util')
const { TARGET } = require('../constants')
const moment = require('moment')
const { mailHelper } = require('../helpers/mail.helper')
const { EMAIL_CONFIG } = require('../config/mail.config')
const jwt = require('jsonwebtoken')
const { SERVER_CONFIG } = require('../config/server.config')
const fs = require('fs')

async function updateTeamMemberPoint(teamId, pointId) {
  const point = await Points.findOne({ where: { id: pointId } })
  await Team_Point.create({ teamId, pointId: point.id })
  await Team.update(
    {
      points: Sequelize.literal(`points + ${parseInt(point.points)}`),
    },
    { where: { id: teamId } },
  )
}

async function updateTeamMemberTarget(teamId, type) {
  const currentDate = YYYY_MM_DD()
  const target = await Target.findOne({
    where: {
      teamId: teamId,
      type: type,
      state: TARGET.STATE.CURRENT,
      [Op.and]: [
        { startDate: { [Op.lte]: currentDate } },
        { endDate: { [Op.gte]: currentDate } },
      ],
    },
  })

  if (target) {
    await target.update({
      achieve: Sequelize.literal('achieve + 1'),
    })
  }
}

function sendMail(to, subject, html) {
  mailHelper.sendMail({
    from: {
      name: EMAIL_CONFIG.SENDER_NAME,
      address: EMAIL_CONFIG.SENDER_EMAIL,
    },
    to,
    subject,
    html,
  })
}

function generateToken(payload, privateKey, isLoginToken) {
  const jwtOption = {}
  if (!isLoginToken) {
    jwtOption.expiresIn = '10m'
  }
  return jwt.sign(payload, privateKey, {
    algorithm: SERVER_CONFIG.JWT_AlGORITHM,
    ...jwtOption,
  })
}

function verifyToken(token, privateKey) {
  return jwt.verify(token, privateKey, {
    algorithm: SERVER_CONFIG.JWT_AlGORITHM,
  })
}

function unlinkFile(path) {
  fs.unlink(path, err => {
    console.log(err)
  })
}

function getDateRageArray(days, startDate) {
  const dateRangeArray = [DD_MMM_YYYY(startDate)]
  for (let i = 0; i < days - 1; i++) {
    dateRangeArray.push(DD_MMM_YYYY(moment(dateRangeArray[i]).add(1, 'days')))
  }

  return dateRangeArray
}

function getMonthDateRageArray(month) {
  const monthDateStartDate = moment(month, 'MM').startOf('month')
  const dateRangeArray = [DD_MMM_YYYY(monthDateStartDate)]
  for (let i = 0; i < monthDateStartDate.daysInMonth() - 1; i++) {
    dateRangeArray.push(DD_MMM_YYYY(moment(dateRangeArray[i]).add(1, 'days')))
  }

  return dateRangeArray
}

function getYearDateRageArray(year) {
  const dateRangeArray = []

  const monthArray = moment.monthsShort()
  if (moment().format('YYYY') === year) {
    const monthIndex = monthArray.findIndex(e => e === moment().format('MMM'))
    monthArray.splice(monthIndex + 1)
  }

  for (let i = 0; i < monthArray.length; i++) {
    dateRangeArray.push(
      moment(`${monthArray[i]}-${year}`, 'MMM-YYYY').format('MMM-YYYY'),
    )
  }
  return dateRangeArray
}

function getCustomDateRangeArray(startDate, endDate) {
  const dateRangeArray = []

  while (moment(startDate) <= moment(endDate)) {
    dateRangeArray.push(startDate)
    startDate = DD_MMM_YYYY(moment(startDate).add(1, 'days'))
  }
  return dateRangeArray
}

module.exports = {
  updateTeamMemberPoint,
  updateTeamMemberTarget,
  sendMail,
  generateToken,
  verifyToken,
  unlinkFile,
  getDateRageArray,
  getMonthDateRageArray,
  getYearDateRageArray,
  getCustomDateRangeArray,
}
