const { Notification, Team } = require('../models')
const io = require('../helpers/socket.helper')
const { Op } = require('sequelize')
const { successResponse, notFoundError } = require('../utils/response.util')
const { MESSAGE, NOTIFICATION } = require('../constants')
const firebaseHelper = require('../helpers/firebase.helper')

exports.createNotification = async (req, res) => {
  const [notification, emails] = await Promise.all([
    Notification.create({
      ...req.body,
      teamId: req.user.id,
      companyId: req.user.companyId,
      senderType: NOTIFICATION.SENDER_TYPE.INDIVIDUAL,
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
  const { sent } = req.query
  const filterCondition = {}

  const currentPage = parseInt(req.query.page) || 1
  const size = parseInt(req.query.size) || 20

  if (sent === 'true') {
    filterCondition.teamId = req.user.id
    filterCondition.senderType = NOTIFICATION.SENDER_TYPE.INDIVIDUAL
  }

  const notifications = await Notification.findAndCountAll({
    attributes: {
      exclude: ['updatedAt', 'senderType', 'roleId'],
    },
    where: { ...filterCondition },
    order: [['id', 'DESC']],
    offset: (currentPage - 1) * size,
    limit: size,
  })

  if (notifications.length === 0) return notFoundError(res)

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, {
    totalPage: notifications.count,
    notifications: notifications.rows,
  })
}
