const {
  Team,
  Role,
  Team_Expense,
  Attendance,
  Client,
  Client_Status,
  Target,
  Team_Location_History,
} = require('../models')
const sequelize = require('../database/mysql')
const { uploadFileToS3, deleteFileFromS3 } = require('../helpers/s3.helper')
const fs = require('fs')
const { Op, QueryTypes } = require('sequelize')
const {
  successResponse,
  forbiddenRequestError,
  notFoundError,
  badRequestError,
} = require('../utils/response.util')
const moment = require('moment')
const { ATTENDANCE, MESSAGE, EXPENSE, S3 } = require('../constants')
const { sendMail, generateToken } = require('../utils/common.util')
const { SERVER_CONFIG } = require('../config/server.config')
const { resetPasswordHTML } = require('../utils/email-template.util')
const { generateS3ConcatString } = require('../utils/s3.util')
const { YYYY_MM_DD } = require('../utils/moment.util')

exports.addTeamMember = async (req, res) => {
  const { email } = req.body
  let imgUrl
  const existedMember = await Team.findOne({
    where: { email, companyId: req.user.companyId },
  })
  if (existedMember) {
    if (req.file) {
      unlinkFile(req.file.path)
    }
    return forbiddenRequestError(res, MESSAGE.COMMON.RECORD_ALREADY_EXISTS)
  }

  if (req.file) {
    const result = await uploadFileToS3(req.file)
    unlinkFile(req.file.path)
    imgUrl = result.Key.split('/')[1]
  }

  const createdTeamMember = await Team.create({
    ...req.body,
    imgUrl: imgUrl,
    companyId: req.user.companyId,
  })

  if (createdTeamMember) {
    const token = generateToken(
      { id: createdTeamMember.id, email: createdTeamMember.email },
      SERVER_CONFIG.JWT_RESET_SECRET,
    )
    sendMail(
      createdTeamMember.email,
      'Create New Password',
      resetPasswordHTML(token),
    )
  }

  return successResponse(res, MESSAGE.COMMON.RECORD_CREATED_SUCCESSFULLY)
}

exports.getAllTeamMembers = async (req, res) => {
  const { roleId, admin, searchQuery, teamType, attendanceType } = req.query

  const getAdminRoleId = await Role.findOne({
    attributes: ['id'],
    where: { parentId: null },
  })

  const attributes = [
    'id',
    'name',
    'email',
    'contact_number',
    'points',
    generateS3ConcatString('imgUrl', S3.USERS),
  ]
  const filterCondition = {}
  const includeModels = []

  if (admin === 'true') {
    attributes.splice(attributes.length - 4, 4)
    filterCondition.roleId = { [Op.ne]: getAdminRoleId.id }
  } else {
    includeModels.push({ model: Role, paranoid: false, attributes: ['name'] })
    includeModels.push({
      model: Attendance,
      required: false,
      attributes: ['attendanceType'],
      where: { date: moment() },
    })

    filterCondition.roleId = { [Op.ne]: getAdminRoleId.id }
    filterCondition.id = { [Op.ne]: req.user.id }

    if (roleId && roleId !== 'null' && roleId !== getAdminRoleId.id) {
      filterCondition.roleId = roleId
    }

    if (searchQuery) filterCondition.name = { [Op.like]: `%${searchQuery}%` }

    if (teamType) filterCondition.jobType = teamType

    if (attendanceType) includeModels[1].where.attendanceType = attendanceType
  }

  const team = await Team.findAll({
    attributes: attributes,
    where: { companyId: req.user.companyId, ...filterCondition },
    include: includeModels,
  })

  if (team.length === 0) return notFoundError(res)

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, team)
}

exports.getSingleMember = async (req, res) => {
  const member = await Team.findOne({
    attributes: [
      'id',
      'name',
      'imgUrl',
      'email',
      'contact_number',
      'gender',
      'birthDay',
      'rating',
      'state_id',
      'state_iso2',
      'state',
      'jobType',
      generateS3ConcatString('imgUrl', S3.USERS),
    ],
    where: {
      id: req.params.id,
    },
    include: [
      {
        model: Role,
        paranoid: false,
        where: { parentId: { [Op.ne]: null } },
        attributes: ['id', 'name', 'parentId'],
      },
    ],
  })

  if (!member) return notFoundError(res)

  if (member && member.role.parentId) {
    const parentRole = await Role.findOne({
      attributes: ['id', 'name'],
      where: { id: member.role.parentId },
    })
    member.setDataValue('senior', parentRole)
  }

  delete member.dataValues.role.dataValues.parentId

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, member)
}

exports.getProfile = async (req, res) => {
  const member = await Team.findOne({
    attributes: [
      'id',
      'imgUrl',
      'name',
      'email',
      'contact_number',
      'state_id',
      'state_iso2',
      'city',
      'state',
      'pincode',
      'gender',
      'birthDay',
      generateS3ConcatString('imgUrl', S3.USERS),
    ],
    where: {
      id: req.user.id,
    },
    include: [
      {
        model: Role,
        attributes: ['name', 'parentId'],
      },
    ],
  })

  if (member.role.parentId) {
    const parentRole = await Role.findOne({
      attributes: ['name'],
      where: { id: member.role.parentId },
    })
    member.setDataValue('senior', parentRole)
  }

  delete member.dataValues.role.dataValues.parentId

  if (!member) return notFoundError(res)

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, member)
}

exports.updateTeamMemberDetails = async (req, res) => {
  const member = await Team.findOne({ where: { id: req.body.id } })
  let imgUrl

  if (req.file) {
    const result = await uploadFileToS3(req.file)
    imgUrl = result.Key.split('/')[1]
    await deleteFileFromS3(member.imgUrl)
    unlinkFile(req.file.path)
  }

  const updatedMember = await member.update({
    ...req.body,
    imgUrl,
  })
  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_UPDATED_SUCCESSFULLY,
    updatedMember,
  )
}

exports.updateProfile = async (req, res) => {
  const member = await Team.findOne({ where: { id: req.user.id } })
  let imgUrl

  if (req.file) {
    const result = await uploadFileToS3(req.file)
    imgUrl = result.Key.split('/')[1]
    await deleteFileFromS3(member.imgUrl)
    unlinkFile(req.file.path)
  }

  const updatedMember = await member.update({
    ...req.body,
    imgUrl,
  })
  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_UPDATED_SUCCESSFULLY,
    updatedMember,
  )
}

exports.verfifyAndUpdateFirebaseToken = async (req, res) => {
  const { deviceToken } = req.body

  const teamMember = await Team.findOne({
    attributes: ['id', 'deviceToken'],
    where: { id: req.user.id },
  })

  if (teamMember.deviceToken !== deviceToken) {
    await teamMember.update({ deviceToken })
  }
  return successResponse(res, MESSAGE.COMMON.RECORD_UPDATED_SUCCESSFULLY)
}

exports.saveLocation = async (req, res) => {
  const { latitude, longitude } = req.body

  await Team.update(
    { location: `${latitude},${longitude}` },
    { where: { id: req.user.id } },
  )

  await Team_Location_History.create({
    teamId: req.user.id,
    latitude,
    longitude,
    date: moment(),
  })

  return successResponse(res, MESSAGE.COMMON.RECORD_UPDATED_SUCCESSFULLY)
}

exports.getTeamMemberLocation = async (req, res) => {
  const memberLocations = await Team_Location_History.findAll({
    attributes: ['teamId', 'latitude', 'longitude'],
    where: {
      teamId: req.user.id,
      date: YYYY_MM_DD(),
    },
  })

  if (!memberLocations.length) return notFoundError(res)

  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY,
    memberLocations,
  )
}

exports.addExpense = async (req, res) => {
  let fileName

  if (req.file) {
    const result = await uploadFileToS3(req.file)
    fileName = result.Key.split('/')[1]
    unlinkFile(req.file.path)
  }

  await Team_Expense.create({
    ...req.body,
    payment_status: EXPENSE.PAYMENT_STATUS.PENDING,
    status: EXPENSE.APPROVAL_STATUS.PENDING,
    teamId: req.user.id,
    file: fileName,
  })

  return successResponse(res, 'Expense Added Successfully')
}

exports.getExpense = async (req, res) => {
  const { month, year, teamId } = req.query

  let whereCondition = 'te.teamId = :teamId'

  if (month && month != 0 && year && year != 0) {
    whereCondition += ' AND MONTH(te.date) = :month AND YEAR(te.date) = :year'
  }

  const [expenses, expenseCount] = await Promise.all([
    sequelize.query(
      `
        SELECT 
            *,
            te.id as id
        FROM
            team_expenses AS te
        INNER JOIN 
            expenses AS e
        ON
            te.expenseId = e.id
        WHERE
            ${whereCondition}
        `,
      {
        replacements: {
          teamId: teamId ?? req.user.id,
          month: month,
          year: year,
        },
        type: QueryTypes.SELECT,
      },
    ),
    sequelize.query(
      `
        SELECT 
            *
        FROM
            team_expenses AS te
        INNER JOIN 
            expenses AS e
        ON
            te.expenseId = e.id
        WHERE
            te.teamId = :teamId
        `,
      {
        replacements: {
          teamId: teamId ?? req.user.id,
        },
        type: QueryTypes.SELECT,
      },
    ),
  ])

  if (expenses.length == 0) return notFoundError(res)

  const response = {
    approved: 0,
    rejected: 0,
    pending: 0,
    paymentDone: 0,
    expenses,
  }
  expenseCount.map(e => {
    if (e.payment_status == EXPENSE.PAYMENT_STATUS.DONE) {
      response.paymentDone += e.amount
    }
    if (e.status == EXPENSE.APPROVAL_STATUS.APPROVED) {
      response.approved += e.amount
    }
    if (e.status == EXPENSE.APPROVAL_STATUS.REJECTED) {
      response.rejected += e.amount
    }
    if (e.status == EXPENSE.APPROVAL_STATUS.PENDING) {
      response.pending += e.amount
    }
  })

  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY,
    response,
  )
}

exports.approveExpense = async (req, res) => {
  const { description, amount, teamExpenseid } = req.body

  const updateBody = {
    approvalAmount: amount,
    aprroval_description: description,
    status: EXPENSE.APPROVAL_STATUS.APPROVED,
    aprrovalBy: req.user.name,
  }

  const existedExpense = await Team_Expense.findOne({
    where: { id: teamExpenseid },
  })
  if (!existedExpense) return notFoundError(res)

  if (amount === 0) {
    updateBody.status = EXPENSE.APPROVAL_STATUS.REJECTED
  }

  const expenses = await existedExpense.update(updateBody)
  return successResponse(res, 'Expense Updated', expenses)
}

exports.approveExpensePayment = async (req, res) => {
  const updateBody = { payment_status: req.body.status }

  const existedExpense = await Team_Expense.findOne({
    where: { id: req.body.teamExpenseid },
  })
  if (!existedExpense) return notFoundError(res)

  if (existedExpense.status === EXPENSE.APPROVAL_STATUS.REJECTED)
    return badRequestError(res, 'This Expense is Rejected')

  const expenses = await existedExpense.update(updateBody)

  return successResponse(res, 'Expense Updated', expenses)
}

exports.getTeamLeaderBoardDetails = async (req, res) => {
  const { id } = req.params

  const response = {
    currentMonthAttendance: {
      totalPresent: 0,
      totalLate: 0,
      totalAbsent: 0,
    },
    currentMonthExpense: {
      approvedExpense: 0,
      pendingExpense: 0,
      rejectedExpense: 0,
    },
    currentMonthClients: {
      total: 0,
      attend: 0,
      avgResponseTime: 0,
    },
    currentMonthTarget: {
      totalDays: 0,
      targetOrder: 0,
      achieved: 0,
    },
  }

  response.memberDetail = await Team.findOne({
    attributes: [
      'id',
      'name',
      'contact_number',
      'email',
      'jobType',
      generateS3ConcatString('imgUrl', S3.USERS),
    ],
    where: { id },
    include: {
      model: Role,
      attributes: ['name'],
      where: {
        parentId: {
          [Op.ne]: null,
        },
      },
    },
  })
  if (!response.memberDetail) return notFoundError(res)

  const currentMonth = moment().format('M')
  const teamMemberAttendance = await Attendance.findAll({
    attributes: ['id', 'date', 'attendanceType'],
    where: {
      teamId: id,
      attendanceType: {
        [Op.ne]: ATTENDANCE.TYPE.LEAVE,
      },
      [Op.and]: [
        sequelize.where(
          sequelize.fn('month', sequelize.col('date')),
          currentMonth,
        ),
      ],
    },
  })

  const teamMemberExpense = await Team_Expense.findAll({
    attributes: ['id', 'approvalAmount', 'amount', 'status'],
    where: {
      teamId: id,
      [Op.and]: [
        sequelize.where(
          sequelize.fn('month', sequelize.col('date')),
          currentMonth,
        ),
      ],
    },
  })

  const allClients = await Client.findAll({
    attributes: ['id', 'arrivalDate', 'teamId'],
    where: {
      [Op.and]: [
        sequelize.where(
          sequelize.fn('month', sequelize.col('arrivalDate')),
          currentMonth,
        ),
      ],
    },
  })

  const targets = await Target.findOne({
    attributes: ['id', 'period', 'target', 'achieve'],
    where: {
      type: 1, // 1 = take order
      teamId: id,
      [Op.and]: [
        sequelize.where(
          sequelize.fn('month', sequelize.col('endDate')),
          currentMonth,
        ),
      ],
    },
    order: [['endDate', 'DESC']],
  })

  response.currentMonthTarget.totalDays = (targets && targets.period) || 0
  response.currentMonthTarget.targetOrder =
    (targets && targets.targetOrder) || 0
  response.currentMonthTarget.achieved = (targets && targets.achieved) || 0

  response.currentMonthClients.total = allClients.length
  const handledClients = allClients.filter(e => e.teamId === id)
  response.currentMonthClients.attend = handledClients.length

  const clientsAllStatuses = await Client_Status.findAll({
    attributes: ['createdAt', 'clientId', 'teamId'],
    where: {
      clientId: handledClients.map(e => e.id),
      teamId: id,
    },
    group: ['clientId'],
  })

  let clientsResponseTime = 0

  handledClients.forEach(client => {
    const clientStatuses = clientsAllStatuses.find(
      e => e.clientId === client.id,
    )
    if (clientStatuses) {
      const timeDiff =
        moment(clientsAllStatuses.time, 'HH:mm:ss').diff(
          moment(client.arrivalTime, 'HH:mm:ss'),
        ) || 0
      clientsResponseTime += timeDiff
    }
  })

  response.currentMonthClients.avgResponseTime =
    clientsResponseTime / response.currentMonthClients.attend / 1000 / 60 || 0

  teamMemberAttendance.forEach(e => {
    if (e.attendanceType === ATTENDANCE.TYPE.LATE) {
      response.currentMonthAttendance.totalLate++
    } else if (e.attendanceType === ATTENDANCE.TYPE.ABSENT) {
      response.currentMonthAttendance.totalAbsent++
    } else if (e.attendanceType === ATTENDANCE.TYPE.PRESENT) {
      response.currentMonthAttendance.totalPresent++
    }
  })

  teamMemberExpense.forEach(e => {
    if (e.status === EXPENSE.APPROVAL_STATUS.REJECTED) {
      response.currentMonthExpense.rejectedExpense += e.amount
    } else if (e.status === EXPENSE.APPROVAL_STATUS.APPROVED) {
      response.currentMonthExpense.approvedExpense += e.approvalAmount
    } else if (e.status === EXPENSE.APPROVAL_STATUS.PENDING) {
      response.currentMonthExpense.pendingExpense += e.amount
    }
  })

  return successResponse(res, 'Expense Updated', response)
}

function unlinkFile(path) {
  fs.unlink(path, err => {
    console.log(err)
  })
}
