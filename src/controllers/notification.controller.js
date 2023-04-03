const { Notification, Team } = require('../models')
const io = require('../helpers/socket.helper')
const { Op } = require('sequelize')
const { successResponse, notFoundError } = require('../utils/response.util')
const { MESSAGE } = require('../constants/message.contant')
const firebaseHelper = require('../helpers/firebase.helper')

exports.createNotification = async (req, res) => {
  const [notification, emails] = await Promise.all([
    Notification.create({
      ...req.body,
      teamId: req.user.id,
      companyId: req.user.companyId,
      senderType: 'INDIVIDUAL',
    }),
    Team.findAll({
      where: {
        email: {
          [Op.ne]: req.user.email,
        },
      },
      attributes: ['email'],
    }),
  ])

  if (notification) {
    io.getIO()
      .to(emails.map(e => e.email))
      .emit('notification', {
        data: {
          heading: notification.heading,
          description: notification.description,
        },
      })
    return successResponse(res, 'Notification Set Successfully')
  }
}

exports.getAllNotification = async (req, res) => {
  let whereCondition = { companyId: req.user.companyId }

  if (req.user.roleId !== 1) {
    whereCondition.teamId = req.user.id
  }

  if (req.query.sent === 'true') {
    whereCondition = {
      teamId: req.user.id,
      senderType: 'INDIVIDUAL',
      companyId: req.user.companyId,
    }
  }

  let notifications = await Notification.findAll({
    attributes: {
      exclude: ['updatedAt', 'senderType', 'roleId', 'departmentId'],
    },
    where: whereCondition,
    order: [['id', 'DESC']],
  })

  notifications = notifications.map(e => {
    return {
      id: e.id,
      heading: e.heading,
      attechment: e.attechment,
      description: e.description,
      type: e.type,
      createdAt: e.createdAt,
      button: JSON.parse(e.button),
    }
  })

  if (notifications.length === 0) return notFoundError(res)

  return successResponse(res, MESSAGE.RECORD_FOUND_SUCCESSFULLY, notifications)
}
