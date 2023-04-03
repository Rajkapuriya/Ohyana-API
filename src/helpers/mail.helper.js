const { EMAIL_CONFIG } = require('../config/mail.config')
const nodemailer = require('nodemailer')

const mailHelper = nodemailer.createTransport({
  service: EMAIL_CONFIG.HOST,
  auth: {
    user: EMAIL_CONFIG.USERNAME,
    pass: EMAIL_CONFIG.PASSWORD,
  },
})

module.exports = { mailHelper }
