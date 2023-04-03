const {
  joiValidationMiddleware,
} = require('../middleware/joi-validaton.middleware')
const { loginSchema } = require('../validators/login.validator')
const loginController = require('../controllers/login.controller')

const express = require('express')
const loginRouter = express.Router()

loginRouter.post(
  '/login',
  joiValidationMiddleware(loginSchema.login),
  loginController.login,
)

loginRouter.post(
  '/register',
  joiValidationMiddleware(loginSchema.registrationForm),
  loginController.register,
)

loginRouter.post(
  '/otp',
  joiValidationMiddleware(loginSchema.emailVerify),
  loginController.generateOtp,
)

loginRouter.post(
  '/verify',
  joiValidationMiddleware(loginSchema.verifyOtp),
  loginController.verifyOtp,
)

loginRouter.post(
  '/forgot-password',
  joiValidationMiddleware(loginSchema.emailVerify),
  loginController.forgotPassword,
)

loginRouter.post(
  '/reset-password/:token',
  joiValidationMiddleware(loginSchema.passwordVerify),
  loginController.resetPassword,
)

module.exports = loginRouter
