const { Op } = require('sequelize')
const sequelize = require('../database/mysql')
const { uploadFileToS3, getFileFromS3 } = require('../helpers/s3.helper')
const {
  YYYY_MM_DDHHMM,
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
const { MESSAGE, CLIENT, POINTS, TARGET, S3 } = require('../constants')
const {
  updateTeamMemberPoint,
  updateTeamMemberTarget,
  unlinkFile,
} = require('../utils/common.util')

const {
  Client,
  Client_Status,
  Client_Appointment,
  Client_Reminder,
  Client_Stage_History,
  Role,
  Team,
  Order,
} = require('../models')
const { generateS3ConcatString } = require('../utils/s3.util')

exports.addClient = async (req, res) => {
  const { email, contact_number } = req.body

  const clientFindOneCondition = [{ email }, { contact_number }]

  if (email === null || email === '' || email == undefined) {
    clientFindOneCondition.shift()
  }

  if (
    contact_number === null ||
    contact_number === '' ||
    contact_number == undefined
  ) {
    clientFindOneCondition.pop()
  }

  const newDate = YYYY_MM_DD_HHMMSS()

  let imageUrl

  if (req.file) {
    const result = await uploadFileToS3(req.file)
    unlinkFile(req.file.path)
    imageUrl = result.Key.split('/')[1]
  }

  const [, created] = await Client.findOrCreate({
    where: { [Op.or]: clientFindOneCondition },
    defaults: {
      ...req.body,
      arrivalDate: newDate.split(' ')[0],
      arrivalTime: newDate.split(' ')[1],
      stage: CLIENT.STAGE.INTIATE,
      imageUrl,
      companyId: req.user.companyId,
    },
  })

  if (!created)
    return badRequestError(res, MESSAGE.COMMON.RECORD_ALREADY_EXISTS)

  // if (client) {
  //   io.getIO().emit('client_list', {
  //     action: 'Get Client',
  //     client: [
  //       {
  //         id: client.id,
  //         name: client.name,
  //         business: client.business,
  //         contact_number: client.contact_number,
  //         state: client.state,
  //         city: client.city,
  //         arrivalDate: client.arrivalDate,
  //         time: client.arrivalTime,
  //       },
  //     ],
  //   })
  // }

  return successResponse(res, MESSAGE.COMMON.RECORD_CREATED_SUCCESSFULLY)
}

exports.getAllClients = async (req, res) => {
  const { stage, tabType, searchQuery, city_id, state_id, country_id } =
    req.query
  const currentPage = parseInt(req.query.page) || 1
  const size = parseInt(req.query.size) || 20

  let attributes = [
    'id',
    'name',
    'email',
    'business',
    'contact_number',
    generateS3ConcatString('imageUrl', S3.CUSTOMERS),
    'teamId',
    'state',
    'city',
    'createdAt',
  ]
  const filterCondition = {}

  if (tabType) {
    switch (tabType) {
      case 'digital':
        filterCondition.reference = CLIENT.REFERENCE_TYPE.DIGITAL
        break

      case 'prospective':
        filterCondition.reference = CLIENT.REFERENCE_TYPE.PROSPECTIVE
        break

      case 'existing':
        // eslint-disable-next-line no-case-declarations
        const orderOfClients = await Order.findAll({
          attributes: ['clientId'],
          group: ['clientId'],
          where: {
            clientId: {
              [Op.ne]: null,
            },
          },
        })
        filterCondition.id = orderOfClients.map(e => e.clientId)
        break

      case 'other':
        filterCondition.reference = CLIENT.REFERENCE_TYPE.OTHER
        filterCondition.reference_name = {
          [Op.ne]: CLIENT.REFERENCE_SUB_TYPE.BUSINESS_CARD,
        }
        break

      case 'business_card':
        attributes = [
          'id',
          'arrivalDate',
          generateS3ConcatString('imageUrl', S3.CUSTOMERS),
        ]
        filterCondition.reference = CLIENT.REFERENCE_TYPE.OTHER
        filterCondition.reference_name = CLIENT.REFERENCE_SUB_TYPE.BUSINESS_CARD
        break
    }
  }

  if (searchQuery) {
    filterCondition.name = {
      [Op.like]: `%${searchQuery}%`,
    }
  }

  if (city_id) filterCondition.city_id = city_id

  if (state_id) filterCondition.state_id = state_id

  if (country_id) filterCondition.country_id = country_id

  if (req.user.role.clientStageAccess !== null) {
    if (stage) {
      if (stage > req.user.role.clientStageAccess)
        return forbiddenRequestError(res, 'Invalid Stage Access')
      filterCondition.stage = stage
    } else {
      const array = []
      for (let i = 0; i < req.user.role.clientStageAccess + 1; i++) {
        array.push(i)
      }
      filterCondition.stage = {
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
        filterCondition.teamId = allEmployeeWithRole.map(e => e.id)
      } else {
        filterCondition.teamId = req.user.id
      }
    } else {
      filterCondition.teamId = req.user.id
    }
  }

  const client = await Client.findAndCountAll({
    attributes: attributes,
    where: {
      companyId: req.user.companyId,
      // email: { [Op.not]: null },
      // contact_number: { [Op.not]: null },
      ...filterCondition,
    },
    offset: (currentPage - 1) * size,
    order: [['id', 'DESC']],
    limit: size,
  })

  if (client.count == 0) return notFoundError(res)

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, {
    totalPage: client.count,
    client: client.rows,
  })
}

exports.getClientProfile = async (req, res) => {
  const client = await Client.findOne({
    attributes: {
      exclude: ['createdAt', 'updatedAt'],
      include: [generateS3ConcatString('imageUrl', S3.CUSTOMERS)],
    },
    where: { id: req.params.id },
    include: [
      {
        model: Team,
        attributes: ['id', 'name'],
      },
    ],
  })

  if (
    !client ||
    req.user.role.clientStageAccess === null ||
    client.stage > req.user.role.clientStageAccess
  )
    return forbiddenRequestError(res, 'Invalid Stage Access')

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, client)
}

exports.takeClient = async (req, res) => {
  let updatedClient

  const client = await Client.findOne({
    attributes: ['id'],
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
  const { email, contact_number, memberId } = req.body

  const clientFindOneCondition = [{ email }, { contact_number }]

  if (email === null || email === '') {
    clientFindOneCondition.shift()
  }

  if (contact_number === null || contact_number === '') {
    clientFindOneCondition.pop()
  }

  const existedClient = await Client.findOne({
    where: {
      [Op.or]: clientFindOneCondition,
      id: { [Op.ne]: req.params.id },
      companyId: req.user.companyId,
    },
  })

  if (existedClient)
    return badRequestError(res, MESSAGE.COMMON.RECORD_ALREADY_EXISTS)

  let imageUrl
  if (req.file) {
    const result = await uploadFileToS3(req.file)
    imageUrl = result.Key.split('/')[1]
    // if (member.imageUrl) {
    //   await deleteFileFromS3(member.imageUrl)
    // }
    unlinkFile(req.file.path)
  }

  await Client.update(
    {
      ...req.body,
      teamId: memberId,
      imageUrl,
    },
    { where: { id: req.params.id } },
  )

  return successResponse(res, MESSAGE.COMMON.RECORD_UPDATED_SUCCESSFULLY)
}

exports.deleteClient = async (req, res) => {
  await Client.destroy({ where: { id: req.params.id } })
  return successResponse(res, MESSAGE.COMMON.RECORD_DELETED_SUCCESSFULLY)
}

exports.addBusinessCard = async (req, res) => {
  let imageUrl

  if (req.file) {
    const result = await uploadFileToS3(req.file)
    unlinkFile(req.file.path)
    imageUrl = result.Key.split('/')[1]
  }
  const newDate = YYYY_MM_DD()

  await Client.create({
    arrivalDate: newDate,
    teamId: req.user.id,
    imageUrl,
    reference: CLIENT.REFERENCE_TYPE.OTHER,
    reference_name: CLIENT.REFERENCE_SUB_TYPE.BUSINESS_CARD,
    companyId: req.user.companyId,
  })

  return successResponse(res, MESSAGE.COMMON.RECORD_CREATED_SUCCESSFULLY)
}

exports.getBusinessCardDetail = async (req, res) => {
  const businessCardDetail = await Client.findOne({
    attributes: [
      'id',
      'arrivalDate',
      generateS3ConcatString('imageUrl', S3.CUSTOMERS),
    ],
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
    MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY,
    businessCardDetail,
  )
}

exports.deleteBusinessCard = async (req, res) => {
  await Client.destroy({ where: { id: req.params.id } })

  // if (
  //   !client ||
  //   req.user.role.clientStageAccess === null ||
  //   client.stage > req.user.role.clientStageAccess
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

  // 5 = client inquiry closed
  if (stage <= client.stage || client.stage === CLIENT.STAGE.CLOSED)
    return forbiddenRequestError(res)

  if (client.teamId !== req.user.id && req.user.role.parentId !== null)
    return unauthorisedRequestError(res)

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

  if (stage === CLIENT.STAGE.CONFIRM) {
    // 7 = point id
    updateTeamMemberPoint(req.user.id, POINTS.TYPE.LEAD_GENERATION)
    // 0 = generate lead
    updateTeamMemberTarget(req.user.id, TARGET.TYPE.GENERATE_LEAD)
  }

  return successResponse(res, 'Stage Updated Successfully')
}

exports.addClientStatus = async (req, res) => {
  const { description, clientId, callNotReceived, followUpType } = req.body
  let audioUrl = null

  if (!req.file && !callNotReceived) {
    return unProcessableEntityRequestError(res, 'Please Provide Audio File')
  }

  if (req.file) {
    const result = await uploadFileToS3(req.file)
    unlinkFile(req.file.path)
    audioUrl = result.Key.split('/')[1]
  }
  const newDate = YYYY_MM_DD_HHMMSS()

  await Client_Status.create({
    date: newDate.split(' ')[0],
    time: newDate.split(' ')[1],
    description,
    teamId: req.user.id,
    audioUrl,
    followUpType,
    clientId: clientId,
  })

  return successResponse(res, MESSAGE.COMMON.RECORD_CREATED_SUCCESSFULLY)
}

exports.getAllClientStatus = async (req, res) => {
  const clientStatus = await Client_Status.findAll({
    attributes: [
      'id',
      'description',
      'date',
      'time',
      generateS3ConcatString('audioUrl', S3.CUSTOMERS),
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

  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY,
    clientStatus,
  )
}

exports.updateStatus = async (req, res) => {
  const { description, statusId } = req.body

  await Client_Status.update({ description }, { where: { id: statusId } })

  return successResponse(res, MESSAGE.COMMON.RECORD_UPDATED_SUCCESSFULLY)
}

exports.closeClientInquery = async (req, res) => {
  const { description, clientId } = req.body

  // stage 5 for closed inquiry
  await Client.update(
    { stage: CLIENT.STAGE.CLOSED },
    { where: { id: clientId } },
  )
  await Client_Stage_History.create({
    stage: CLIENT.STAGE.CLOSED,
    clientId: clientId,
    teamId: req.user.id,
  })
  await Client_Status.create({ description, clientId, teamId: req.user.id })

  return successResponse(res, MESSAGE.COMMON.RECORD_UPDATED_SUCCESSFULLY)
}

exports.addClientReminder = async (req, res) => {
  const { description, date, time, clientId } = req.body

  if (YYYY_MM_DDHHMM(`${date} ${time}`) <= YYYY_MM_DDHHMM()) {
    return unProcessableEntityRequestError(res, MESSAGE.COMMON.INVALID_TIME)
  }

  await Client_Reminder.create({
    date,
    time,
    description,
    teamId: req.user.id,
    clientId: clientId,
  })

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
        paranoid: false,
        include: [
          {
            model: Role,
            paranoid: false,
            attributes: ['name'],
          },
        ],
      },
    ],
  })

  if (clientReminder.length === 0) return notFoundError(res)

  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY,
    clientReminder,
  )
}

exports.updateReminder = async (req, res) => {
  const { description, date, time, reminderId } = req.body

  if (YYYY_MM_DDHHMM(`${date} ${time}`) <= YYYY_MM_DDHHMM()) {
    return unProcessableEntityRequestError(res, MESSAGE.COMMON.INVALID_TIME)
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

  return successResponse(res, MESSAGE.COMMON.RECORD_UPDATED_SUCCESSFULLY)
}

exports.deleteClientReminder = async (req, res) => {
  await Client_Reminder.destroy({ where: { id: req.params.id } })
  return successResponse(res, MESSAGE.COMMON.RECORD_DELETED_SUCCESSFULLY)
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
    return unProcessableEntityRequestError(res, MESSAGE.COMMON.INVALID_TIME)
  }

  await Client_Appointment.create({
    date,
    time,
    description,
    appointment_unit,
    teamId: req.user.id,
    clientId: clientId,
    appointed_members_ids: appointed_member.toString(),
  })

  return successResponse(res, 'Appointment Scheduled Successfully')
}

exports.getAllClientAppointment = async (req, res) => {
  const clientAppointmentList = await Client_Appointment.findAll({
    attributes: [
      'id',
      'description',
      'date',
      'time',
      'appointment_unit',
      'isScheduled',
      'appointed_members_ids',
    ],
    where: {
      clientId: req.params.id,
    },
    order: [['id', 'DESC']],
    include: [
      {
        model: Team,
        attributes: ['id', 'name'],
        include: {
          model: Role,
          attributes: ['name'],
        },
      },
    ],
  })

  for (const clientAppointment of clientAppointmentList) {
    if (clientAppointment.appointed_members_ids) {
      const appointedMembers = await Team.findAll({
        attributes: ['id', 'name'],
        where: {
          id: clientAppointment.appointed_members_ids.split(','),
        },
      })
      clientAppointment.dataValues.appointedMembers = appointedMembers.map(
        e => {
          return { id: e.id, name: e.name }
        },
      )
    }

    delete clientAppointment.dataValues.appointed_members_ids
  }

  if (clientAppointmentList.length === 0) return notFoundError(res)

  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY,
    clientAppointmentList,
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
    return unProcessableEntityRequestError(res, MESSAGE.COMMON.INVALID_TIME)
  }

  const client_appointment = await Client_Appointment.findOne({
    where: { id: appointmentId },
  })

  if (client_appointment.isScheduled)
    return forbiddenRequestError(res, 'Appointment Is Already Scheduled')

  await client_appointment.update({
    description,
    date,
    time,
    appointment_unit,
    appointed_members_ids: appointed_member.toString(),
  })

  return successResponse(res, 'Appointment Updated Successfully')
}

exports.deleteClientAppointment = async (req, res) => {
  await Client_Appointment.destroy({ where: { id: req.params.id } })
  return successResponse(res, MESSAGE.COMMON.RECORD_DELETED_SUCCESSFULLY)
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
