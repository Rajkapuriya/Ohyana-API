const {
  joiValidationMiddleware,
} = require('../middleware/joi-validaton.middleware')
const { authTokenMiddleware } = require('../middleware/auth-token.middleware')
const { targetSchema } = require('../validators/target.validator')
const targetController = require('../controllers/target.controller')

const express = require('express')
const targetRouter = express.Router()

// ------------------------------- Targets -------------------------------

targetRouter.post(
  '/target/:id',
  joiValidationMiddleware(targetSchema.targetForm),
  authTokenMiddleware,
  targetController.setTarget,
)

targetRouter.get(
  '/targets/:id',
  joiValidationMiddleware(targetSchema.targetList),
  authTokenMiddleware,
  targetController.getTargets,
)

module.exports = targetRouter
