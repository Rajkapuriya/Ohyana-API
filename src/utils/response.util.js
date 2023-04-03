function forbiddenRequestError(res, message) {
  return res.status(403).json({
    message: message ?? 'Request Forbidden',
    success: false,
  })
}

function badRequestError(res, message) {
  return res.status(400).json({
    message: message ?? 'Bad Request',
    success: false,
  })
}

function unauthorisedRequestError(res, message) {
  return res.status(401).json({
    message: message ?? 'Unauthorized',
    success: false,
  })
}

function unProcessableEntityRequestError(res, message) {
  return res.status(422).json({
    message: message ?? 'Unprocessable Entity',
    success: false,
  })
}

function notFoundError(res, message) {
  return res.status(404).json({
    message: message ?? 'Record Not Found',
    success: false,
  })
}

function requestTimeOutError(res, message) {
  return res.status(408).json({
    message: message ?? 'Request Timeout',
    success: false,
  })
}

function internalServerError(res, message) {
  return res.status(500).json({
    message: message ?? 'Internal Server Error',
    success: false,
  })
}

function successResponse(res, message, data) {
  return res.status(200).json({
    message: message ?? 'Record Found Successfully',
    success: true,
    data: data,
  })
}

module.exports = {
  forbiddenRequestError,
  badRequestError,
  unProcessableEntityRequestError,
  notFoundError,
  requestTimeOutError,
  internalServerError,
  successResponse,
  unauthorisedRequestError,
}
