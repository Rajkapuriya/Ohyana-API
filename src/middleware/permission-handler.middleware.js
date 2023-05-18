const { checkUserPermission } = require('../utils/common.util')
const { forbiddenRequestError } = require('../utils/response.util')

function permissionHandleMiddleware(permissions) {
  return async (req, res, next) => {
    const isUserHasPermission = await checkUserPermission(req.user, permissions)
    if (isUserHasPermission) {
      next()
    } else {
      return forbiddenRequestError(res, 'Invalid Access')
    }
  }
}

module.exports = { permissionHandleMiddleware }
