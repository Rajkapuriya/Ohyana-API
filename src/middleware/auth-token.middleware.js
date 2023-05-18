const { Team, Role } = require('../models')
const { SERVER_CONFIG } = require('../config/server.config')
const { verifyToken } = require('../utils/common.util')
const { unauthorisedRequestError } = require('../utils/response.util')

async function authTokenMiddleware(req, res, next) {
  const authHeader = req.get('Authorization')

  if (!authHeader) return unauthorisedRequestError(res)

  const token = authHeader.split(' ')[1]
  let decodedToken
  let user

  try {
    decodedToken = verifyToken(token, SERVER_CONFIG.JWT_SECRET)

    user = await Team.findOne({
      attributes: ['id', 'companyId', 'name', 'email'],
      where: { id: decodedToken.id },
      include: [
        {
          model: Role,
          attributes: ['id', 'name', 'clockIn', 'parentId'],
        },
      ],
    })
  } catch (err) {
    err.statusCode = 500
    throw err
  }
  if (!decodedToken || !user) return unauthorisedRequestError(res)

  req.user = user
  next()
}

module.exports = { authTokenMiddleware }
