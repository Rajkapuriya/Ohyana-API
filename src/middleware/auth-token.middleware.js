const jwt = require('jsonwebtoken')
const { Team, Role, Permission } = require('../models')
const { SERVER_CONFIG } = require('../config/server.config')

async function authTokenMiddleware(req, res, next) {
  const authHeader = req.get('Authorization')

  if (!authHeader) {
    const error = new Error('Not authenticated.')
    error.statusCode = 401
    throw error
  }
  const token = authHeader.split(' ')[1]
  let decodedToken
  let user

  try {
    decodedToken = jwt.verify(token, SERVER_CONFIG.JWT_SECRET, {
      algorithm: SERVER_CONFIG.JWT_AlGORITHM,
    })
    user = await Team.findOne({
      attributes: ['id', 'companyId', 'name', 'email'],
      where: { id: decodedToken.id },
      include: [
        {
          model: Role,
          attributes: ['id', 'name', 'clockIn', 'parentId'],
          include: {
            model: Permission,
            attributes: { exclude: ['createdAt', 'updatedAt', 'id', 'teamId'] },
          },
        },
      ],
    })
  } catch (err) {
    err.statusCode = 500
    throw err
  }
  if (!decodedToken || !user) {
    const error = new Error('Not authenticated.')
    error.statusCode = 401
    throw error
  }
  req.user = user
  next()
}

module.exports = { authTokenMiddleware }
