const {
  joiValidationMiddleware,
} = require('../middleware/joi-validaton.middleware')
const { authSchema } = require('../validators/auth.validator')
const authController = require('../controllers/auth.controller')

const express = require('express')
const authRouter = express.Router()

authRouter.post(
  '/login',
  joiValidationMiddleware(authSchema.login),
  authController.login,
)

authRouter.post(
  '/register',
  joiValidationMiddleware(authSchema.registrationForm),
  authController.register,
)

authRouter.post(
  '/otp',
  joiValidationMiddleware(authSchema.emailVerify),
  authController.sendVerificationEmail,
)

authRouter.post(
  '/verify',
  joiValidationMiddleware(authSchema.verifyEmailOtp),
  authController.verifyEmail,
)

authRouter.post(
  '/forgot-password',
  joiValidationMiddleware(authSchema.emailVerify),
  authController.forgotPassword,
)

authRouter.post(
  '/reset-password/:token',
  joiValidationMiddleware(authSchema.resetPassword),
  authController.resetPassword,
)

module.exports = authRouter
