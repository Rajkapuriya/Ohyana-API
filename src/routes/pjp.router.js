const {
  joiValidationMiddleware,
} = require('../middleware/joi-validaton.middleware')
const { authTokenMiddleware } = require('../middleware/auth-token.middleware')
const { pjpSchema } = require('../validators/pjp.validator')
const pjpController = require('../controllers/pjp.contorller')

const express = require('express')
const pjpRouter = express.Router()

// ------------------------------- PJP -------------------------------

pjpRouter.get(
  '/pjp',
  joiValidationMiddleware(pjpSchema.pjpList),
  authTokenMiddleware,
  pjpController.getAllPJP,
)

pjpRouter.get('/pjp/:id', authTokenMiddleware, pjpController.getPJPDetail)

pjpRouter.post(
  '/pjp',
  joiValidationMiddleware(pjpSchema.pjpForm),
  authTokenMiddleware,
  pjpController.createPJP,
)

pjpRouter.put(
  '/pjp',
  joiValidationMiddleware(pjpSchema.updatePjp),
  authTokenMiddleware,
  pjpController.updatePjp,
)

pjpRouter.post(
  '/status/pjp',
  joiValidationMiddleware(pjpSchema.pjpStatusForm),
  authTokenMiddleware,
  pjpController.addPJPStatus,
)

pjpRouter.get(
  '/status/pjp',
  authTokenMiddleware,
  joiValidationMiddleware(pjpSchema.pjpStatusList),
  pjpController.getClientPJPStatus,
)

pjpRouter.post(
  '/complete/pjp',
  joiValidationMiddleware(pjpSchema.pjpCompletionStatusForm),
  authTokenMiddleware,
  pjpController.completePJPStatus,
)

pjpRouter.delete('/pjp/:id', authTokenMiddleware, pjpController.deletePjp)

module.exports = pjpRouter
