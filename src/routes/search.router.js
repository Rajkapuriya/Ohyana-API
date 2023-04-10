const {
  joiValidationMiddleware,
} = require('../middleware/joi-validaton.middleware')
const { authTokenMiddleware } = require('../middleware/auth-token.middleware')
const { searchSchema } = require('../validators/search.validator')
const searchController = require('../controllers/search.controller')

const express = require('express')
const searchRouter = express.Router()

// ------------------------------- Country -------------------------------

searchRouter.get('/country', authTokenMiddleware, searchController.getCoutries)

searchRouter.get(
  '/city',
  joiValidationMiddleware(searchSchema.stateCitySearchList),
  authTokenMiddleware,
  searchController.getCities,
)

searchRouter.get(
  '/state',
  joiValidationMiddleware(searchSchema.stateCitySearchList),
  authTokenMiddleware,
  searchController.getStates,
)

module.exports = searchRouter
