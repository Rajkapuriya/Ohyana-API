const { Team, Team_Point, Points, Target } = require('../models')
const { Sequelize, Op } = require('sequelize')
const { YYYY_MM_DD } = require('./moment.util')
const { TARGET } = require('../constants')
const { mailHelper } = require('../helpers/mail.helper')
const { EMAIL_CONFIG } = require('../config/mail.config')

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

module.exports = {
  updateTeamMemberPoint,
  updateTeamMemberTarget,
  sendMail,
}
