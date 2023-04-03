const { unProcessableEntityRequestError } = require('../utils/response.util')

function joiValidationMiddleware(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req)
    if (error) return unProcessableEntityRequestError(res, error.message)
    next()
  }
}

module.exports = { joiValidationMiddleware }
