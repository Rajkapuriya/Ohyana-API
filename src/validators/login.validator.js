const Joi = require('joi')

exports.loginSchema = {
  login: Joi.object({
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }).required(),
  }).unknown(),

  registrationForm: Joi.object({
    body: Joi.object({
      name: Joi.string().min(3).required(),
      companyName: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      contact_number: Joi.string().required(),
    }).required(),
  }).unknown(),

  emailVerify: Joi.object({
    body: Joi.object({
      email: Joi.string().email().required(),
    }).required(),
  }).unknown(),

  passwordVerify: Joi.object({
    body: Joi.object({
      password: Joi.string().required(),
    }).required(),
  }).unknown(),

  verifyOtp: Joi.object({
    body: Joi.object({
      email: Joi.string().email().required(),
      otp: Joi.number().required(),
    }).required(),
  }).unknown(),
}
