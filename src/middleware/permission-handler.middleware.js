const { forbiddenRequestError } = require('../utils/response.util')

function permissionHandleMiddleware(condition) {
  return (req, res, next) => {
    const checkUserPermission = new Function('req', `return ${condition}`)
    if (checkUserPermission(req)) {
      next()
    } else {
      return forbiddenRequestError(res, 'Invalid Access')
    }
  }
}

module.exports = { permissionHandleMiddleware }
