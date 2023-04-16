const { Team, Role, Permission, Company } = require('../models')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { forgotPasswordHTML } = require('../utils/email-template.util')
const { mailHelper } = require('../helpers/mail.helper')
const sequelize = require('../database/mysql')
const { ENCRYP_CONFIG } = require('../config/encryp.config')
const { SERVER_CONFIG } = require('../config/server.config')
const {
  unProcessableEntityRequestError,
  successResponse,
  internalServerError,
  requestTimeOutError,
  notFoundError,
} = require('../utils/response.util')
const { MESSAGE } = require('../constants')
const { badRequestError } = require('../utils/response.util')

let otpArray = []

exports.register = async (req, res) => {
  const { name, companyName, contact_number, email, password } = req.body
  await sequelize.transaction(async t => {
    const company = await Company.create(
      {
        name: companyName,
      },
      { transaction: t },
    )

    const hashPassword = await bcrypt.hash(password, ENCRYP_CONFIG.HASH_SALT)

    const team = await Team.create(
      {
        name,
        email,
        password: hashPassword,
        contact_number,
        companyId: company.id,
        roleId: 1,
      },
      { transaction: t },
    )

    await Permission.create({ teamId: team.id }, { transaction: t })

    return team
  })

  successResponse(res, 'Registered Successfully')
}

exports.sendVerificationEmail = async (req, res) => {
  const { email } = req.body

  const teamMember = await Team.findOne({ email })

  if (!teamMember) return badRequestError(res, MESSAGE.AUTH.INVALID_EMAIL)

  if (teamMember.isEmailVerified)
    return badRequestError(res, MESSAGE.AUTH.EMAIL_ALREADY_VERIFIED)

  let otp = generateOTP()
  const currentDate = new Date()
  const futureDate = new Date(currentDate.getTime() + 2 * 60000)

  if (otpArray.find(e => e.email == email) == undefined) {
    otp = generateOTP()
    otpArray.push({ email: email, otp: otp, time: futureDate })
  } else {
    otp = otpArray.find(e => e.email === email).otp
  }

  if (!otp) return internalServerError(res)

  mailHelper.sendMail({
    from: 'jenishshekhaliya@gmail.com',
    to: email,
    subject: 'Hello from Gmail',
    text: `Otp for Our Application : ${otp}`,
  })

  return successResponse(res, 'OTP Send Successfully To Mail')
}

exports.verifyEmail = async (req, res) => {
  const { email, otp } = req.body
  const currentDate = new Date()
  const numberWithOtp = otpArray.find(e => e.email === email)

  const teamMember = await Team.findOne({ email })

  if (!teamMember) return badRequestError(res, MESSAGE.AUTH.INVALID_EMAIL)

  if (numberWithOtp == undefined) return requestTimeOutError(res, 'OTP EXPIRED')

  if (
    new Date(numberWithOtp.time) <= currentDate.getTime() ||
    numberWithOtp.length <= 0
  ) {
    otpArray = otpArray.filter(e => e.email !== email)
    return requestTimeOutError(res, 'OTP EXPIRED')
  }

  if (email == numberWithOtp.email && otp == numberWithOtp.otp) {
    otpArray = otpArray.filter(e => e.email !== email)
    teamMember.update({ isEmailVerified: true })
    return successResponse(res, 'OTP Verified Successfully')
  } else {
    return unProcessableEntityRequestError(res, 'OTP Incorrect')
  }
}

exports.login = async (req, res) => {
  const { email, password } = req.body

  const teamMember = await Team.findOne({
    where: { email },
    include: [
      {
        model: Role,
        attributes: ['name', 'id'],
        include: {
          model: Permission,
          attributes: { exclude: ['createdAt', 'updatedAt', 'id', 'teamId'] },
        },
      },
    ],
  })

  if (!teamMember) return badRequestError(res, MESSAGE.AUTH.INVALID_USERNAME)

  const match = await bcrypt.compare(password, teamMember.password)

  if (!match) return badRequestError(res, MESSAGE.AUTH.INVALID_USERNAME)

  const token = jwt.sign(
    { id: teamMember.id, role: teamMember.roleId },
    SERVER_CONFIG.JWT_SECRET,
    { algorithm: SERVER_CONFIG.JWT_AlGORITHM },
  )
  return successResponse(res, 'login successfully', {
    token,
    permissions: teamMember.role.permission,
  })
}

exports.forgotPassword = async (req, res) => {
  const { email } = req.body

  const team = await Team.findOne({ where: { email } })

  if (!team) return badRequestError(res, MESSAGE.AUTH.INVALID_EMAIL)

  if (!team.isEmailVerified)
    return badRequestError(res, MESSAGE.AUTH.EMAIL_NOT_VERIFIED)

  const token = jwt.sign(
    { id: team.id, email: team.email },
    SERVER_CONFIG.JWT_RESET_SECRET,
    { algorithm: SERVER_CONFIG.JWT_AlGORITHM, expiresIn: '10m' },
  )

  mailHelper.sendMail({
    from: 'jenishshekhaliya@gmail.com',
    to: email,
    subject: 'Forgot Password',
    html: forgotPasswordHTML(token),
  })
  return successResponse(res, 'Link sent Successfully to your Email')
}

exports.resetPassword = async (req, res) => {
  const { password } = req.body
  // eslint-disable-next-line no-useless-catch
  try {
    const decodedToken = jwt.verify(
      req.params.token,
      SERVER_CONFIG.JWT_RESET_SECRET,
      { algorithm: SERVER_CONFIG.JWT_AlGORITHM },
    )

    const team = await Team.findOne({ where: { id: decodedToken.id } })
    if (!team) return notFoundError(res)

    const hashedPassword = await bcrypt.hash(password, ENCRYP_CONFIG.HASH_SALT)

    await team.update({
      password: hashedPassword,
    })

    return successResponse(res, 'Password Updated Successfully')
  } catch (error) {
    throw error
  }
}

function generateOTP() {
  const digits = '0123456789'
  let OTP = ''
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)]
  }
  return OTP
}
