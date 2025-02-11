const {
  Team,
  Role,
  Permission,
  Company,
  Role_Permissions,
  EmailTemplate,
} = require('../models')
const bcrypt = require('bcryptjs')
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
const { MESSAGE, S3, CLIENT, EMAIL } = require('../constants')
const { badRequestError } = require('../utils/response.util')
const {
  sendMail,
  generateToken,
  verifyToken,
  emailSubjectAndContentFormatting,
} = require('../utils/common.util')
const { generateS3ConcatString } = require('../utils/s3.util')
const { URL_CONFIG } = require('../config/url.config')

let otpArray = []

exports.register = async (req, res) => {
  const { name, companyName, contact_number, email, password } = req.body

  const alreadyRegisteredUser = await Team.findOne({ where: { email } })
  if (alreadyRegisteredUser)
    throw badRequestError(MESSAGE.AUTH.ACCOUNT_ALREADY_EXISTS)

  const company = await Company.create({
    name: companyName,
  })

  const hashPassword = await bcrypt.hash(password, ENCRYP_CONFIG.HASH_SALT)

  const role = await Role.create({
    name: 'Admin',
    description: 'Can Manage All Things',
    companyId: company.id,
    clientStageAccess: CLIENT.STAGE.CLOSED,
  })

  await Team.create({
    name,
    email,
    password: hashPassword,
    contact_number,
    companyId: company.id,
    roleId: role.id,
    isEmailVerified: true,
  })

  successResponse(res, 'Registered Successfully')
}

exports.sendVerificationEmail = async (req, res) => {
  const { email } = req.body

  const teamMember = await Team.findOne({ email })

  if (teamMember)
    return badRequestError(res, MESSAGE.AUTH.ACCOUNT_ALREADY_EXISTS)

  // if (teamMember.isEmailVerified)
  //   return badRequestError(res, MESSAGE.AUTH.EMAIL_ALREADY_VERIFIED)

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

  const emailTemplate = await EmailTemplate.findOne({
    where: { id: EMAIL.TEMPLATES.OTP_VERIFICATION },
  })

  if (!emailTemplate) return internalServerError(res)

  const { subject, content } = emailSubjectAndContentFormatting(
    emailTemplate.subject,
    emailTemplate.content,
    { otp },
  )

  sendMail(email, subject, content)

  return successResponse(res, 'OTP Send Successfully To Mail')
}

exports.verifyEmail = async (req, res) => {
  const { email, otp } = req.body
  const currentDate = new Date()
  const numberWithOtp = otpArray.find(e => e.email === email)

  const teamMember = await Team.findOne({ email })

  if (teamMember)
    return badRequestError(res, MESSAGE.AUTH.ACCOUNT_ALREADY_EXISTS)

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
    // teamMember.update({ isEmailVerified: true })
    return successResponse(res, 'OTP Verified Successfully')
  } else {
    return unProcessableEntityRequestError(res, 'OTP Incorrect')
  }
}

exports.login = async (req, res) => {
  const { email, password } = req.body

  const teamMember = await Team.findOne({
    attributes: [
      'id',
      'password',
      'roleId',
      generateS3ConcatString('imgUrl', S3.USERS),
    ],
    where: { email },
    include: [
      {
        model: Role,
        attributes: ['name', 'id', 'parentId', 'clientStageAccess'],
        include: {
          model: Role_Permissions,
          attributes: ['permissions'],
        },
      },
    ],
  })

  if (!teamMember) return badRequestError(res, MESSAGE.AUTH.INVALID_USERNAME)

  const match = await bcrypt.compare(password, teamMember.password)

  if (!match) return badRequestError(res, MESSAGE.AUTH.INVALID_USERNAME)

  const token = generateToken(
    { id: teamMember.id, role: teamMember.roleId },
    SERVER_CONFIG.JWT_SECRET,
    true,
  )

  let permissionStringArray = []

  if (
    (teamMember.role.role_permission &&
      teamMember.role.role_permission.permissions) ||
    !teamMember.role.parentId
  ) {
    const rolePermissionStringArray = await Permission.findAll({
      attributes: ['name'],
      where: teamMember.role.parentId
        ? {
            id: teamMember.role.role_permission.permissions.split(','),
          }
        : {},
    })
    permissionStringArray = rolePermissionStringArray.map(e => e.name)
  }

  return successResponse(res, 'login successfully', {
    token,
    permissions: permissionStringArray,
    clientStageAccess: teamMember.role.clientStageAccess,
    userImageUrl: teamMember.imgUrl,
  })
}

exports.forgotPassword = async (req, res) => {
  const { email } = req.body

  const team = await Team.findOne({ where: { email } })

  if (!team) return badRequestError(res, MESSAGE.AUTH.INVALID_EMAIL)

  // if (!team.isEmailVerified)
  //   return badRequestError(res, MESSAGE.AUTH.EMAIL_NOT_VERIFIED)

  const token = generateToken(
    { id: team.id, email: team.email },
    SERVER_CONFIG.JWT_RESET_SECRET,
  )

  const emailTemplate = await EmailTemplate.findOne({
    where: { id: EMAIL.TEMPLATES.FOGOT_PASSWORD },
  })

  if (!emailTemplate) return internalServerError(res)

  const { subject, content } = emailSubjectAndContentFormatting(
    emailTemplate.subject,
    emailTemplate.content,
    { password_url: `${URL_CONFIG.FRONTED_URL}?rstPwd=${token}` },
  )

  sendMail(email, subject, content)

  return successResponse(res, 'Link sent Successfully to your Email')
}

exports.resetPassword = async (req, res) => {
  const { password } = req.body
  // eslint-disable-next-line no-useless-catch
  try {
    const decodedToken = verifyToken(
      req.params.token,
      SERVER_CONFIG.JWT_RESET_SECRET,
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
