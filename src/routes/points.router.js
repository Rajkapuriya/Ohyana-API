const {
  joiValidationMiddleware,
} = require('../middleware/joi-validaton.middleware')
const { authTokenMiddleware } = require('../middleware/auth-token.middleware')
const {
  permissionHandleMiddleware,
} = require('../middleware/permission-handler.middleware')
const { pointSchema } = require('../validators/points.validator')
const pointsContorller = require('../controllers/points.controller')

const express = require('express')
const pointsRouter = express.Router()

// ------------------------------- PJP -------------------------------

pointsRouter.get(
  '/points',
  joiValidationMiddleware(pointSchema.pointList),
  authTokenMiddleware,
  pointsContorller.getAllTeamPoints,
)

pointsRouter.get(
  '/points/rules',
  authTokenMiddleware,
  pointsContorller.getPointsRules,
)

pointsRouter.post(
  '/appreciation/points/:id',
  authTokenMiddleware,
  pointsContorller.giveAppreciationPoints,
)

module.exports = pointsRouter
