const { Op } = require('sequelize')
const sequelize = require('../database/mysql')
const moment = require('moment')
const superagent = require('superagent')
const io = require('../helpers/socket.helper')
const { uploadFileToS3, getFileFromS3 } = require('../helpers/s3.helper')
const fs = require('fs')
// const { setRedisData } = require("../database/redis");
const {
  YYYY_MM_DDHHMM,
  YYYY_MM_DD_HHMM,
  YYYY_MM_DD,
  YYYY_MM_DD_HHMMSS,
} = require('../utils/moment.util')
const {
  unProcessableEntityRequestError,
  successResponse,
  forbiddenRequestError,
  badRequestError,
  notFoundError,
  internalServerError,
  unauthorisedRequestError,
} = require('../utils/response.util')
const { MESSAGE } = require('../constants/message.contant')
const { SERVER_CONFIG } = require('../config/server.config')
const {
  updateTeamMemberPoint,
  updateTeamMemberTarget,
} = require('../utils/common.util')
const async = require('async')
let date

const {
  Client,
  Client_Status,
  Client_Appointment,
  Client_Reminder,
  Client_Appointed_Member,
  Client_Product,
  Client_Stage_History,
  Role,
  Product,
  Country,
  Company,
  PJP,
  Team,
  Order,
} = require('../models')

exports.addClient = async (req, res) => {
  const { email, contact_number, client_type } = req.body

  let clientFindOneCondition = [{ email }, { contact_number }]

  if (email === null || email === '' || email == undefined) {
    clientFindOneCondition = [{ contact_number }]
  }

  if (
    contact_number === null ||
    contact_number === '' ||
    contact_number == undefined
  ) {
    clientFindOneCondition = [{ email }]
  }

  const newDate = YYYY_MM_DD_HHMMSS()

  const [client, created] = await Client.findOrCreate({
    where: { [Op.or]: clientFindOneCondition },
    defaults: {
      ...req.body,
      isInternational: client_type,
      arrivalDate: newDate.split(' ')[0],
      arrivalTime: newDate.split(' ')[1],
      stage: 0,
      companyId: req.user.companyId,
    },
  })

  if (!created) return badRequestError(res, MESSAGE.RECORD_ALREADY_EXISTS)

  if (client) {
    io.getIO().emit('client_list', {
      action: 'Get Client',
      client: [
        {
          id: client.id,
          name: client.name,
          business: client.business,
          contact_number: client.contact_number,
          state: client.state,
          city: client.city,
          arrivalDate: client.arrivalDate,
          time: client.arrivalTime,
        },
      ],
    })
  }

  return successResponse(res, MESSAGE.RECORD_CREATED_SUCCESSFULLY)
}

exports.getAllClients = async (req, res) => {
  const { isInternational, stage, forMobile, tabType, searchQuery } = req.query
  const currentPage = parseInt(req.query.page) || 1
  const size = parseInt(req.query.size) || 20

  const whereCondition = {
    attributes: [
      'id',
      'name',
      'email',
      'business',
      'contact_number',
      'teamId',
      'state',
      'city',
      'createdAt',
    ],
    where: {
      companyId: req.user.companyId,
      email: { [Op.not]: null },
      contact_number: { [Op.not]: null },
    },
    offset: (currentPage - 1) * size,
    order: [['id', 'DESC']],
    limit: size,
    distinct: true,
  }

  if (isInternational) {
    whereCondition.where.isInternational =
      isInternational === 'true' ? true : false
  }

  if (tabType === 'digital') {
    whereCondition.where = {
      reference: 'DIGITAL',
    }
  }

  if (tabType === 'prospective') {
    whereCondition.where = {
      reference: 'PROSPECTIVE',
    }
  }

  if (tabType === 'existing') {
    const orderOfClients = await Order.findAll({
      attributes: ['clientId'],
      where: {
        clientId: {
          [Op.ne]: null,
        },
      },
    })
    whereCondition.where = {
      id: orderOfClients.map(e => e.clientId),
    }
  }

  if (tabType === 'other') {
    whereCondition.where = {
      reference: 'OTHER',
      reference_name: {
        [Op.ne]: 'BUSINESS_CARD',
      },
    }
  }

  if (tabType === 'business_card') {
    whereCondition.attributes = ['id', 'arrivalDate', 'imageUrl']
    whereCondition.where = {
      reference: 'OTHER',
      reference_name: 'BUSINESS_CARD',
      companyId: req.user.companyId,
    }
  }

  if (searchQuery) {
    whereCondition.where = {
      ...whereCondition.where,
      name: {
        [Op.like]: `%${searchQuery}%`,
      },
    }
  }

  if (req.user.role.permission.clientStageAccess !== null) {
    if (stage) {
      if (stage > req.user.role.permission.clientStageAccess)
        return forbiddenRequestError(res, 'Invalid Stage Access')
      whereCondition.where.stage = stage
    } else {
      const array = []
      for (let i = 0; i < req.user.role.permission.clientStageAccess + 1; i++) {
        array.push(i)
      }
      whereCondition.where.stage = {
        [Op.or]: array,
      }
    }
  }

  if (req.user.role.parentId) {
    const allRolePositions = await Role.findAll({
      attributes: ['id'],
      where: {
        parentId: req.user.role.id,
      },
    })

    if (allRolePositions.length > 0) {
      const allEmployeeWithRole = await Team.findAll({
        attributes: ['id'],
        where: {
          roleId: allRolePositions.map(e => e.id),
        },
      })
      if (allEmployeeWithRole.length > 0) {
        whereCondition.where.teamId = allEmployeeWithRole.map(e => e.id)
      } else {
        whereCondition.where.teamId = req.user.id
      }
    } else {
      whereCondition.where.teamId = req.user.id
    }
  }

  const client = await Promise.all([Client.findAndCountAll(whereCondition)])

  if (client[0].count == 0) return notFoundError(res)

  return successResponse(res, MESSAGE.RECORD_FOUND_SUCCESSFULLY, {
    totalPage: client[0].count,
    client: client[0].rows,
  })
}

exports.getClientProfile = async (req, res) => {
  const client = await Client.findOne({
    attributes: { exclude: ['createdAt', 'updatedAt', 'countryId'] },
    where: { id: req.params.id },
    include: [
      {
        model: Country,
        attributes: ['id', 'name'],
      },
      {
        model: Team,
        attributes: ['id', 'name'],
      },
    ],
  })

  if (
    !client ||
    req.user.role.permission.clientStageAccess === null ||
    client.stage > req.user.role.permission.clientStageAccess
  )
    return forbiddenRequestError(res, 'Invalid Stage Access')

  return successResponse(res, MESSAGE.RECORD_FOUND_SUCCESSFULLY, client)
}

exports.takeClient = async (req, res) => {
  let updatedClient

  const client = await Client.findOne({
    attributes: { exclude: ['createdAt', 'updatedAt', 'countryId'] },
    where: { id: req.params.id },
  })

  if (!client) return notFoundError(res)

  if (!client.teamId) {
    updatedClient = await client.update({ teamId: req.user.id })
  }

  if (updatedClient) {
    return successResponse(res, 'Client Taken Successfully')
  } else {
    return forbiddenRequestError(res, 'Client Already Taken')
  }
}

exports.updateClient = async (req, res) => {
  const { email, contact_number, client_type, memberId } = req.body

  let clientFindOneCondition = [{ email }, { contact_number }]

  if (email === null || email === '') {
    clientFindOneCondition = [{ contact_number }]
  }

  if (contact_number === null || contact_number === '') {
    clientFindOneCondition = [{ email }]
  }

  const existedClient = await Client.findOne({
    where: {
      [Op.or]: clientFindOneCondition,
      id: { [Op.ne]: req.params.id },
      companyId: req.user.companyId,
    },
  })

  if (existedClient) return badRequestError(res, MESSAGE.RECORD_ALREADY_EXISTS)

  await Client.update(
    {
      ...req.body,
      isInternational: client_type,
      teamId: memberId,
    },
    { where: { id: req.params.id } },
  )

  return successResponse(res, MESSAGE.RECORD_UPDATED_SUCCESSFULLY)
}

exports.deleteClient = async (req, res) => {
  await Client.destroy({ where: { id: req.params.id } })
  return successResponse(res, MESSAGE.RECORD_DELETED_SUCCESSFULLY)
}

exports.addBusinessCard = async (req, res) => {
  let imageUrl

  if (req.file) {
    const result = await uploadFileToS3(req.file)
    unlinkFile(req.file.path)
    imageUrl = result.Key
  }
  const newDate = YYYY_MM_DD()

  await Client.create({
    arrivalDate: newDate,
    teamId: req.user.id,
    imageUrl,
    reference: 'OTHER',
    reference_name: 'BUSINESS_CARD',
    companyId: req.user.companyId,
  })

  return successResponse(res, MESSAGE.RECORD_CREATED_SUCCESSFULLY)
}

exports.getBusinessCardDetail = async (req, res) => {
  const businessCardDetail = await Client.findOne({
    attributes: ['id', 'arrivalDate', 'imageUrl'],
    where: { id: req.params.id },
    include: [
      {
        model: Team,
        attributes: ['name'],
      },
    ],
  })

  return successResponse(
    res,
    MESSAGE.RECORD_FOUND_SUCCESSFULLY,
    businessCardDetail,
  )
}

exports.deleteBusinessCard = async (req, res) => {
  await Client.destroy({ where: { id: req.params.id } })

  // if (
  //   !client ||
  //   req.user.role.permission.clientStageAccess === null ||
  //   client.stage > req.user.role.permission.clientStageAccess
  // )
  //   return forbiddenRequestError(res, 'Invalid Stage Access')

  return successResponse(res, 'Card Deleted Successfully')
}

exports.updateClientStage = async (req, res) => {
  const { stage } = req.body

  const client = await Client.findOne({
    where: { id: req.params.id },
  })

  if (!client) return notFoundError(res)

  if (stage <= client.stage) return forbiddenRequestError(res)

  if (client.teamId !== req.user.id) return unauthorisedRequestError(res)

  await client.update({ stage })
  const clientWithStage = await Client_Stage_History.findOne({
    where: {
      stage: stage,
      clientId: req.params.id,
      teamId: client.teamId,
    },
  })

  if (!clientWithStage) {
    await Client_Stage_History.create({
      stage: stage,
      clientId: req.params.id,
      teamId: client.teamId,
    })
  }

  if (stage === 5) {
    // 7 = point id
    updateTeamMemberPoint(req.user.id, 7)
    // 0 = generate lead
    updateTeamMemberTarget(req.user.id, 0)
  }

  return successResponse(res, 'Stage Updated Successfully')
}

exports.addClientStatus = async (req, res) => {
  const { description, clientId, callNotReceived } = req.body
  let audioUrl = null

  if (!req.file && !callNotReceived) {
    return unProcessableEntityRequestError(res, 'Please Provide Audio File')
  }

  if (req.file) {
    const result = await uploadFileToS3(req.file)
    unlinkFile(req.file.path)
    audioUrl = result.Key
  }
  const newDate = YYYY_MM_DD_HHMMSS()

  await Client_Status.create({
    date: newDate.split(' ')[0],
    time: newDate.split(' ')[1],
    description,
    teamId: req.user.id,
    audioUrl,
    clientId: clientId,
  })

  return successResponse(res, MESSAGE.RECORD_CREATED_SUCCESSFULLY)
}

exports.getAllClientStatus = async (req, res) => {
  const clientStatus = await Client_Status.findAll({
    attributes: [
      'id',
      'description',
      'date',
      'time',
      'audioUrl',
      'followUpType',
    ],
    where: {
      clientId: req.params.id,
    },
    order: [['id', 'DESC']],
    include: [
      {
        model: Team,
        attributes: ['name'],
        include: [
          {
            model: Role,
            attributes: ['name'],
          },
        ],
      },
    ],
  })

  if (clientStatus.length === 0) return notFoundError(res)

  return successResponse(res, MESSAGE.RECORD_FOUND_SUCCESSFULLY, clientStatus)
}

exports.updateStatus = async (req, res) => {
  const { description, statusId } = req.body

  await Client_Status.update({ description }, { where: { id: statusId } })

  return successResponse(res, MESSAGE.RECORD_UPDATED_SUCCESSFULLY)
}

exports.addClientReminder = async (req, res) => {
  const { description, date, time, clientId } = req.body

  if (YYYY_MM_DDHHMM(`${date} ${time}`) <= YYYY_MM_DDHHMM()) {
    return unProcessableEntityRequestError(res, MESSAGE.INVALID_TIME)
  }

  await Client_Reminder.create({
    date,
    time,
    description,
    teamId: req.user.id,
    clientId: clientId,
  })

  /*
   *   if (clientReminder) {
   *     // const now = YYYY_MM_DD_HHMM(`${date} ${time}`)
   *     // await setRedisData(`${now}_ClientReminder`, clientReminder.id);
   *   }
   */
  return successResponse(res, 'Reminder Scheduled Successfully')
}

exports.getAllClientReminder = async (req, res) => {
  const clientReminder = await Client_Reminder.findAll({
    attributes: ['id', 'description', 'date', 'time', 'isScheduled'],
    where: {
      clientId: req.params.id,
    },
    order: [['id', 'DESC']],
    include: [
      {
        model: Team,
        attributes: ['name'],
        include: [
          {
            model: Role,
            attributes: ['name'],
          },
        ],
      },
    ],
  })

  if (clientReminder.length === 0) return notFoundError(res)

  return successResponse(res, MESSAGE.RECORD_FOUND_SUCCESSFULLY, clientReminder)
}

exports.updateReminder = async (req, res) => {
  const { description, date, time, reminderId } = req.body

  if (YYYY_MM_DDHHMM(`${date} ${time}`) <= YYYY_MM_DDHHMM()) {
    return unProcessableEntityRequestError(res, MESSAGE.INVALID_TIME)
  }

  const client_reminder = await Client_Reminder.findOne({
    where: { id: reminderId },
  })

  if (client_reminder.isScheduled)
    return forbiddenRequestError(res, 'Reminder Is Already Scheduled')

  await client_reminder.update({
    description,
    date,
    time,
  })

  /*
   * if (updatedReminder) {
   *     const now = YYYY_MM_DD_HHMM(
   *         `${updatedReminder.date} ${updatedReminder.time}`,
   *     )
   *     // await setRedisData(`${now}_ClientReminder`, updatedReminder.id);
   * }
   */

  return successResponse(res, MESSAGE.RECORD_UPDATED_SUCCESSFULLY)
}

exports.addClientAppointment = async (req, res) => {
  const {
    description,
    date,
    time,
    appointment_unit,
    appointed_member,
    clientId,
  } = req.body

  if (YYYY_MM_DDHHMM(`${date} ${time}`) <= YYYY_MM_DDHHMM()) {
    return unProcessableEntityRequestError(res, MESSAGE.INVALID_TIME)
  }

  await sequelize.transaction(async t => {
    const clientAppointment = await Client_Appointment.create(
      {
        date,
        time,
        description,
        appointment_unit,
        teamId: req.user.id,
        memberName: req.user.name,
        memberRole: req.user.role.name,
        clientId: clientId,
      },
      { transaction: t },
    )

    await clientAppointment.addTeams(appointed_member, { transaction: t })

    return clientAppointment
  })

  /*
   * if (result) {
   *     const now = YYYY_MM_DDHHMM(`${date} ${time}`)
   *     // await setRedisData(`${now}_ClientAppointment`, result.id);
   * }
   */

  return successResponse(res, 'Appointment Scheduled Successfully')
}

exports.getAllClientAppointment = async (req, res) => {
  const clientAppointment = await Client_Appointment.findAll({
    attributes: [
      'id',
      'memberName',
      'memberRole',
      'description',
      'date',
      'time',
      'appointment_unit',
      'isScheduled',
    ],
    where: {
      clientId: req.params.id,
    },
    order: [['id', 'DESC']],
    include: [
      {
        model: Team,
        attributes: ['id', 'name'],
        through: {
          attributes: [],
        },
      },
    ],
  })

  if (clientAppointment.length === 0) return notFoundError(res)

  return successResponse(
    res,
    MESSAGE.RECORD_FOUND_SUCCESSFULLY,
    clientAppointment,
  )
}

exports.updateAppointment = async (req, res) => {
  const {
    description,
    date,
    time,
    appointment_unit,
    appointed_member,
    appointmentId,
  } = req.body

  if (YYYY_MM_DDHHMM(`${date} ${time}`) <= YYYY_MM_DDHHMM()) {
    return unProcessableEntityRequestError(res, MESSAGE.INVALID_TIME)
  }

  const client_appointment = await Client_Appointment.findOne({
    where: { id: appointmentId },
  })

  if (client_appointment.isScheduled)
    return forbiddenRequestError(res, 'Appointment Is Already Scheduled')

  await sequelize.transaction(async t => {
    const updatedAppointment = await client_appointment.update(
      { description, date, time, appointment_unit },
      { transaction: t },
    )

    if (appointed_member.length > 0) {
      await Promise.all([
        Client_Appointed_Member.destroy({
          where: { clientAppointmentId: updatedAppointment.id },
          transaction: t,
        }),
        updatedAppointment.addTeams(appointed_member, { transaction: t }),
      ])
    }

    return updatedAppointment
  })

  /*
   * if (result) {
   *     const now = YYYY_MM_DD_HHMM(`${result.date} ${result.time}`)
   *     // await setRedisData(`${now}_ClientAppointment`, result.id);
   * }
   */

  return successResponse(res, 'Appointment Updated Successfully')
}

exports.getFileForResponse = async (req, res) => {
  const { path } = req.params
  const readStream = getFileFromS3(path)
  readStream
    .on('error', e => {
      console.log(e)
      return internalServerError(res, 'Error Reading File')
    })
    .pipe(res)
}

// Get All Country
exports.getCoutries = async (req, res) => {
  const country = await Country.findAll({ attributes: ['id', 'name'] })
  return successResponse(res, MESSAGE.RECORD_FOUND_SUCCESSFULLY, country)
}

function unlinkFile(path) {
  fs.unlink(path, err => {
    console.log(err)
  })
}
