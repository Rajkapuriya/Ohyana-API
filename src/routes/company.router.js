const {
  joiValidationMiddleware,
} = require('../middleware/joi-validaton.middleware')
const { authTokenMiddleware } = require('../middleware/auth-token.middleware')
const { companySchema } = require('../validators/company.validator')
const companyController = require('../controllers/company.controller')
const { upload } = require('../middleware/multer.middleware')

const express = require('express')
const companyRouter = express.Router()

companyRouter.get(
  '/company',
  authTokenMiddleware,
  companyController.getCompanyProfile,
)

companyRouter.put(
  '/company',
  upload.single('logo_image'),
  joiValidationMiddleware(companySchema.companyForm),
  authTokenMiddleware,
  companyController.updateCompanyProfile,
)

module.exports = companyRouter
