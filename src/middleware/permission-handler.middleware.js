const { forbiddenRequestError } = require('../utils/response.util')

function permissionHandleMiddleware(condition) {
  return (req, res, next) => {
    if (eval(condition)) {
      next()
    } else {
      return forbiddenRequestError(res, 'Invalid Access')
    }
  }
}

module.exports = { permissionHandleMiddleware }
