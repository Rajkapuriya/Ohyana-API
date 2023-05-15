const { Op } = require('sequelize')
const sequelize = require('../database/mysql')
const moment = require('moment')
const {
  Client,
  Order,
  Team,
  Role,
  Target,
  Attendance,
  Team_Point,
  Points,
  Task,
  Checklist,
} = require('../models')
const { successResponse } = require('../utils/response.util')
const { MESSAGE, CLIENT, ORDERS, TARGET, S3 } = require('../constants')
const { YYYY_MM_DD } = require('../utils/moment.util')
const { generateS3ConcatString } = require('../utils/s3.util')

exports.getInquiryAnalytics = async (req, res) => {
  let response = {}
  const currentMonth = moment().format('MM')
  const lastMonth = moment().subtract(1, 'months').format('MM')

  const currentMonthInquiry = await Client.findAll({
    where: getWhereConditionPerMonth(req.user, currentMonth, 'arrivalDate'),
  })

  const lastMonthInquiry = await Client.findAll({
    where: getWhereConditionPerMonth(req.user, lastMonth, 'arrivalDate'),
  })

  const currentMonthOrders = await Order.findAndCountAll({
    where: {
      ...getWhereConditionPerMonth(req.user, currentMonth, 'date'),
      paymentStatus: ORDERS.PAYMENT_STATUS.CONFIRMED,
    },
    include: {
      model: Client,
      attributes: ['name'],
    },
    limit: 10,
    order: [['id', 'DESC']],
  })

  const lastMonthOrders = await Order.count({
    where: {
      ...getWhereConditionPerMonth(req.user, lastMonth, 'date'),
      paymentStatus: ORDERS.PAYMENT_STATUS.CONFIRMED,
    },
  })

  const userAttendance = await Attendance.findOne({
    attributes: ['checkIn', 'checkOut', 'breakIn', 'breakOut'],
    where: {
      teamId: req.user.id,
    },
  })

  const teams = await Team.findAll({
    attributes: ['id', 'name', 'points', 'jobType', 'imgUrl'],
    where: {
      companyId: req.user.companyId,
    },
    limit: 10,
    include: [
      {
        model: Role,
        attributes: ['name'],
        where: { parentId: { [Op.ne]: null } },
      },
      {
        model: Attendance,
        required: false,
        attributes: ['attendanceType'],
        where: { date: moment() },
      },
    ],
  })

  const crtMonthPoints = await Team_Point.findAll({
    where: {
      [Op.and]: [
        sequelize.where(
          sequelize.fn('month', sequelize.col('team_point.createdAt')),
          currentMonth,
        ),
        sequelize.where(
          sequelize.fn('year', sequelize.col('team_point.createdAt')),
          moment().format('YYYY'),
        ),
      ],
    },
    include: {
      model: Points,
    },
  })

  const lastMonthPoints = await Team_Point.findAll({
    where: {
      [Op.and]: [
        sequelize.where(
          sequelize.fn('month', sequelize.col('team_point.createdAt')),
          lastMonth,
        ),
        sequelize.where(
          sequelize.fn('year', sequelize.col('team_point.createdAt')),
          moment().format('YYYY'),
        ),
      ],
    },
    include: {
      model: Points,
    },
  })

  const starPerformerList = await Team.findAll({
    attributes: ['id', 'name', generateS3ConcatString('imgUrl', S3.USERS)],
    where: {
      isCurrentMonthStarPerformer: 1,
    },
    include: {
      model: Role,
      attributes: ['name'],
      where: { parentId: { [Op.ne]: null } },
    },
  })

  const lstTeamMemeberPoint = [],
    crtTeamMemberPoint = []
  crtMonthPoints.forEach(e => {
    const index = crtTeamMemberPoint.findIndex(ele => ele.teamId === e.teamId)
    if (index != -1) {
      crtTeamMemberPoint[index].points += parseInt(e.point.points)
    } else {
      crtTeamMemberPoint.push({
        teamId: e.teamId,
        points: parseInt(e.point.points),
      })
    }
  })

  lastMonthPoints.forEach(e => {
    const index = lstTeamMemeberPoint.findIndex(ele => ele.teamId === e.teamId)
    if (index != -1) {
      lstTeamMemeberPoint[index].points += parseInt(e.point.points)
    } else {
      lstTeamMemeberPoint.push({
        teamId: e.teamId,
        points: parseInt(e.point.points),
      })
    }
  })

  const teamWithPoints = []
  teams.forEach(e => {
    let pointPercentage = 0
    const lstPoints = lstTeamMemeberPoint.find(ele => ele.teamId === e.id)
    const crtPoints = crtTeamMemberPoint.find(ele => ele.teamId === e.id)

    if (crtPoints && lstPoints) {
      pointPercentage =
        ((crtPoints.points - lstPoints.points) / Math.abs(lstPoints.points)) *
        100
    }
    teamWithPoints.push({
      id: e.id,
      name: e.name,
      points: e.points,
      jobType: e.jobType,
      role: e.role.name,
      imgUrl: e.imgUrl,
      attendances:
        e.attendances.length > 0 ? e.attendances[0].attendanceType : '-',
      pointPercentage: parseFloat(pointPercentage).toFixed(2) || 0,
    })
  })

  let crtMonIndiaMart = 0,
    crtMonWeb = 0,
    crtMonPJP = 0,
    crtMonOther = 0,
    crtLead = 0,
    crtPending = 0,
    crtIrrelevant = 0,
    crtNoResponse = 0

  let lstMonIndiaMart = 0,
    lstMonWeb = 0,
    lstMonPJP = 0,
    lstMonOther = 0,
    lstLead = 0,
    lstIrrelevant = 0,
    lstNoResponse = 0,
    lstPending = 0

  currentMonthInquiry.map(e => {
    if (e.reference_name === CLIENT.REFERENCE_SUB_TYPE.INDIAMART) {
      crtMonIndiaMart += 1
    } else if (e.reference_name === CLIENT.REFERENCE_SUB_TYPE.WEBSITE) {
      crtMonWeb += 1
    } else if (e.reference === CLIENT.REFERENCE_TYPE.OTHER) {
      crtMonOther += 1
    } else if (e.reference_name === CLIENT.REFERENCE_SUB_TYPE.PJP) {
      crtMonPJP += 1
    }

    if (e.stage === CLIENT.STAGE.CONFIRM) {
      crtLead += 1
    } else if (e.stage === CLIENT.STAGE.IRRELEVANT) {
      crtIrrelevant += 1
    } else if (e.stage === CLIENT.STAGE.NO_RESPONSE) {
      crtNoResponse += 1
    } else if (e.stage === CLIENT.STAGE.INTIATE) {
      crtPending += 1
    }
  })

  lastMonthInquiry.map(e => {
    if (e.reference_name === CLIENT.REFERENCE_SUB_TYPE.INDIAMART) {
      lstMonIndiaMart += 1
    } else if (e.reference_name === CLIENT.REFERENCE_SUB_TYPE.WEBSITE) {
      lstMonWeb += 1
    } else if (e.reference === CLIENT.REFERENCE_TYPE.OTHER) {
      lstMonOther += 1
    } else if (e.reference_name === CLIENT.REFERENCE_SUB_TYPE.PJP) {
      lstMonPJP += 1
    }

    if (e.stage === CLIENT.STAGE.CONFIRM) {
      lstLead += 1
    } else if (e.stage === CLIENT.STAGE.IRRELEVANT) {
      lstIrrelevant += 1
    } else if (e.stage === CLIENT.STAGE.NO_RESPONSE) {
      lstNoResponse += 1
    } else if (e.stage === CLIENT.STAGE.INTIATE) {
      lstPending += 1
    }
  })

  const total = crtMonIndiaMart + crtMonWeb + crtMonOther + crtMonPJP
  const leadPercentage = ((crtLead - lstLead) / lstLead) * 100
  const orderPercentage =
    ((currentMonthOrders.count - lastMonthOrders) / lastMonthOrders) * 100
  const noRepsoneInquiryPercentage =
    ((crtNoResponse - lstNoResponse) / lstNoResponse) * 100
  const pendingInquiryPercentage =
    ((crtPending - lstPending) / lstPending) * 100
  const irrelevantInquiryPercentage =
    ((crtIrrelevant - lstIrrelevant) / lstIrrelevant) * 100

  const percentageIndiaMart =
    ((crtMonIndiaMart - lstMonIndiaMart) / lstMonIndiaMart) * 100
  const percentageOther = ((crtMonOther - lstMonOther) / lstMonOther) * 100

  response = {
    data: {
      userAttendance,
      inquiry: {
        total,
        crtMonIndiaMart,
        crtMonWeb,
        crtMonOther,
        lstMonIndiaMart,
        lstMonWeb,
        lstMonOther,
        percentageIndiaMart: isFinite(percentageIndiaMart)
          ? percentageIndiaMart
          : 0,
        percentageOther: isFinite(percentageOther) ? percentageOther : 0,
      },
      sales: {
        total,
        totalPercentage:
          (leadPercentage +
            orderPercentage +
            noRepsoneInquiryPercentage +
            pendingInquiryPercentage +
            irrelevantInquiryPercentage) /
          5,
        crtIrrelevant,
        crtLead,
        leadPercentage,
        orderPercentage,
        noRepsoneInquiryPercentage,
        pendingInquiryPercentage,
        irrelevantInquiryPercentage,
        crtNoResponse,
        crtPending,
        lstLead,
        lstIrrelevant,
        lstNoResponse,
        lstPending,
        crtOrders: currentMonthOrders.count,
      },
      orderData: currentMonthOrders.rows,
      // teams,
      starPerformerList,
      teamWithPoints,
    },
  }
  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY,
    response,
  )
}

exports.getSalesTeamInquiryAnalytics = async (req, res) => {
  let responseData = {}
  const currentMonth = moment().format('MM')
  const lastMonth = moment().subtract(1, 'months').format('MM')

  const userAttendance = await Attendance.findOne({
    attributes: ['checkIn', 'checkOut', 'breakIn', 'breakOut', 'totalHours'],
    where: {
      teamId: req.user.id,
      date: moment(),
    },
  })

  const currentMonthInquiry = await Client.findAll({
    where: getWhereConditionPerMonth(req.user, currentMonth, 'arrivalDate'),
  })

  const lastMonthInquiry = await Client.findAll({
    where: getWhereConditionPerMonth(req.user, lastMonth, 'arrivalDate'),
  })

  const targets = await Target.findAll({
    where: {
      teamId: req.user.id,
      type: TARGET.TYPE.GENERATE_LEAD,
    },
    order: [['endDate', 'DESC']],
    limit: 2,
  })

  const teamPoints = await Team_Point.findAll({
    attributes: ['id', 'createdAt'],
    where: { teamId: req.user.id },
    include: [{ model: Points, attributes: ['name', 'points'] }],
    order: [['id', 'DESC']],
    limit: 4,
  })

  const crtMonthTotalPoints = await Team_Point.findOne({
    attributes: [
      'id',
      'createdAt',
      [sequelize.fn('SUM', sequelize.col('points')), 'total_points'],
    ],
    where: {
      teamId: req.user.id,
      ...getWhereConditionPerMonth(
        req.user,
        currentMonth,
        'team_point.createdAt',
      ),
    },
    include: [{ model: Points }],
  })

  const lstMonthTotalPoints = await Team_Point.findOne({
    attributes: [
      'id',
      'createdAt',
      [sequelize.fn('SUM', sequelize.col('points')), 'total_points'],
    ],
    where: {
      teamId: req.user.id,
      ...getWhereConditionPerMonth(req.user, lastMonth, 'team_point.createdAt'),
    },
    include: [{ model: Points }],
  })

  const tasks = await Task.findAll({
    attributes: ['id', 'title', 'due_date', 'createdBy'],
    where: {
      teamId: req.user.id,
    },
    order: [['id', 'DESC']],
    limit: 4,
    include: [
      {
        model: Checklist,
        attributes: ['id', 'task', 'done'],
      },
    ],
  })

  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].checklists.length > 0) {
      const completed = tasks[i].checklists.filter(c => c.done == true).length
      const total = tasks[i].checklists.length
      tasks[i].dataValues.completed = completed
      tasks[i].dataValues.total = total
    } else {
      tasks[i].dataValues.completed = 0
      tasks[i].dataValues.total = 0
    }

    delete tasks[i].dataValues.checklists
  }

  const starPerformerList = await Team.findAll({
    attributes: ['id', 'name', generateS3ConcatString('imgUrl', S3.USERS)],
    where: {
      isCurrentMonthStarPerformer: 1,
    },
    include: {
      model: Role,
      attributes: ['name'],
      where: { parentId: { [Op.ne]: null } },
    },
  })

  let crtMonIndiaMart = 0,
    crtMonWeb = 0,
    crtMonPJP = 0,
    crtMonOther = 0,
    crtLead = 0,
    crtIrrelevant = 0,
    crtNoResponse = 0

  let lstMonIndiaMart = 0,
    lstMonWeb = 0,
    lstMonPJP = 0,
    lstMonOther = 0,
    lstLead = 0,
    lstIrrelevant = 0,
    lstNoResponse = 0

  currentMonthInquiry.map(e => {
    if (e.reference_name === CLIENT.REFERENCE_SUB_TYPE.INDIAMART) {
      crtMonIndiaMart += 1
    } else if (e.reference_name === CLIENT.REFERENCE_SUB_TYPE.WEBSITE) {
      crtMonWeb += 1
    } else if (e.reference === CLIENT.REFERENCE_TYPE.OTHER) {
      crtMonOther += 1
    } else if (e.reference_name === CLIENT.REFERENCE_SUB_TYPE.PJP) {
      crtMonPJP += 1
    }

    if (e.stage === CLIENT.STAGE.CONFIRM) {
      crtLead += 1
    } else if (e.stage === CLIENT.STAGE.IRRELEVANT) {
      crtIrrelevant += 1
    } else if (e.stage === CLIENT.STAGE.INTIATE) {
      crtNoResponse += 1
    }
  })

  lastMonthInquiry.map(e => {
    if (e.reference_name === CLIENT.REFERENCE_SUB_TYPE.INDIAMART) {
      lstMonIndiaMart += 1
    } else if (e.reference_name === CLIENT.REFERENCE_SUB_TYPE.WEBSITE) {
      lstMonWeb += 1
    } else if (e.reference === CLIENT.REFERENCE_TYPE.OTHER) {
      lstMonOther += 1
    } else if (e.reference_name === CLIENT.REFERENCE_SUB_TYPE.PJP) {
      lstMonPJP += 1
    }

    if (e.stage === CLIENT.STAGE.CONFIRM) {
      lstLead += 1
    } else if (e.stage === CLIENT.STAGE.IRRELEVANT) {
      lstIrrelevant += 1
    } else if (e.stage === CLIENT.STAGE.NO_RESPONSE) {
      lstNoResponse += 1
    }
  })

  const currentTargetRecords = targets.find(
    t => t.state === TARGET.STATE.CURRENT,
  )
  const lastTargetRecords = targets.find(t => t.state === TARGET.STATE.PAST)
  const start = moment(currentTargetRecords.endDate)
  const remainDays = start.diff(moment(), 'days')

  const total = crtMonIndiaMart + crtMonWeb + crtMonOther + crtMonPJP
  const lstTotal = lstMonIndiaMart + lstMonWeb + lstMonOther + lstMonPJP

  const crtLeads = crtLead + crtIrrelevant + crtNoResponse
  const lstLeads = lstLead + lstIrrelevant + lstNoResponse
  const pointPercentage =
    ((crtMonthTotalPoints.dataValues.total_points -
      lstMonthTotalPoints.dataValues.total_points) /
      lstMonthTotalPoints.dataValues.total_points) *
    100

  responseData = {
    userAttendance,
    performance: {
      total,
      totalInquiryPercentage: ((total - lstTotal) / lstTotal) * 100 || 0,
      targets: {
        target: currentTargetRecords.target,
        achieved: currentTargetRecords.achieve,
        percentageAchieved:
          (currentTargetRecords.achieve / currentTargetRecords.target -
            lastTargetRecords.achieve / currentTargetRecords.target) *
          100,
        remainDays: remainDays > 0 ? remainDays : 0,
      },
      lead: crtLeads,
      leadPercentage: ((crtLeads - lstLeads) / lstLeads) * 100 || 0,
      points: crtMonthTotalPoints.dataValues.total_points,
      pointsPercentage: isFinite(pointPercentage) ? pointPercentage : 0,
    },
    teamPoints,
    starPerformerList,
    tasks,
  }

  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY,
    responseData,
  )
}

function getWhereConditionPerMonth(user, month, dateColumn) {
  return {
    // companyId: user.companyId,
    [Op.and]: [
      sequelize.where(sequelize.fn('month', sequelize.col(dateColumn)), month),
    ],
  }
}
