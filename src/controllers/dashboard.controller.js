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
const { MESSAGE } = require('../constants/message.contant')

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
      paymentStatus: 'CONFIRMED',
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
      paymentStatus: 'CONFIRMED',
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
          sequelize.fn('month', sequelize.col('createdAt')),
          currentMonth,
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
          sequelize.fn('month', sequelize.col('createdAt')),
          lastMonth,
        ),
      ],
    },
    include: {
      model: Points,
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
    const crtPoints = lstTeamMemeberPoint.find(ele => ele.teamId === e.id)
    const lstPoints = crtTeamMemberPoint.find(ele => ele.teamId === e.id)

    if (crtPoints && lstPoints) {
      pointPercentage =
        ((crtPoints.points - lstPoints.points) / lstPoints.points) * 100
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
      pointPercentage: pointPercentage || 0,
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
    if (e.reference === 'INDIAMART') {
      crtMonIndiaMart += 1
    } else if (e.reference === 'WEBSITE') {
      crtMonWeb += 1
    } else if (e.reference === 'OTHER') {
      crtMonOther += 1
    } else if (e.reference === 'PJP') {
      crtMonPJP += 1
    }

    if (e.stage === 5) {
      crtLead += 1
    } else if (e.stage === 4) {
      crtIrrelevant += 1
    } else if (e.stage === 3) {
      crtNoResponse += 1
    } else if (e.stage === 0) {
      crtPending += 1
    }
  })

  lastMonthInquiry.map(e => {
    if (e.reference === 'INDIAMART') {
      lstMonIndiaMart += 1
    } else if (e.reference === 'WEBSITE') {
      lstMonWeb += 1
    } else if (e.reference === 'OTHER') {
      lstMonOther += 1
    } else if (e.reference === 'PJP') {
      lstMonPJP += 1
    }

    if (e.stage === 5) {
      lstLead += 1
    } else if (e.stage === 4) {
      lstIrrelevant += 1
    } else if (e.stage === 3) {
      lstNoResponse += 1
    } else if (e.stage === 0) {
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
        percentageIndiaMart:
          ((crtMonIndiaMart - lstMonIndiaMart) / lstMonIndiaMart) * 100,
        percentageOther: ((crtMonOther - lstMonOther) / lstMonOther) * 100,
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
    attributes: ['checkIn', 'checkOut', 'breakIn', 'breakOut'],
    where: {
      teamId: req.user.id,
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
      teamId: 2,
      type: 'Generate Lead',
    },
    order: [['endDate', 'DESC']],
    limit: 2,
  })

  const attendance = await Attendance.findOne({
    attributes: { exclude: ['teamId', 'id'] },
    where: {
      date: moment(),
      teamId: req.user.id,
    },
  })

  const teamPoints = await Team_Point.findAll({
    attributes: ['id', 'createdAt'],
    where: { teamId: req.user.id },
    include: [{ model: Points, attributes: ['name', 'points'] }],
    order: [['id', 'DESC']],
    limit: 4,
  })

  const tasks = await Task.findOne({
    attributes: ['id', 'title', 'due_date', 'description', 'createdBy'],
    where: {
      teamId: req.user.id,
      due_date: {
        [Op.gte]: moment(),
      },
    },
    include: [
      {
        model: Checklist,
        attributes: ['id', 'task', 'done'],
      },
    ],
  })

  const starPerformerList = await Team.findAll({
    attributes: ['id', 'name', 'imgUrl'],
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
    if (e.reference_name === 'INDIAMART') {
      crtMonIndiaMart += 1
    } else if (e.reference_name === 'WEBSITE') {
      crtMonWeb += 1
    } else if (e.reference === 'OTHER') {
      crtMonOther += 1
    } else if (e.reference === 'PJP') {
      crtMonPJP += 1
    }

    if (e.stage === 5) {
      crtLead += 1
    } else if (e.stage === 4) {
      crtIrrelevant += 1
    } else if (e.stage === 3) {
      crtNoResponse += 1
    }
  })

  lastMonthInquiry.map(e => {
    if (e.reference_name === 'INDIAMART') {
      lstMonIndiaMart += 1
    } else if (e.reference_name === 'WEBSITE') {
      lstMonWeb += 1
    } else if (e.reference === 'OTHER') {
      lstMonOther += 1
    } else if (e.reference === 'PJP') {
      lstMonPJP += 1
    }

    if (e.stage === 5) {
      lstLead += 1
    } else if (e.stage === 4) {
      lstIrrelevant += 1
    } else if (e.stage === 3) {
      lstNoResponse += 1
    }
  })

  const currentTargetRecords = targets.find(t => t.state === 'CURRENT')
  const lastTargetRecords = targets.find(t => t.state === 'PAST')
  const start = moment(currentTargetRecords.endDate)
  const remainDays = start.diff(moment(), 'days')

  const total = crtMonIndiaMart + crtMonWeb + crtMonOther + crtMonPJP

  responseData = {
    userAttendance,
    performance: {
      total,
      targets: {
        target: currentTargetRecords.target,
        achieved: currentTargetRecords.achieve,
        precentageAchieved:
          (currentTargetRecords.achieve / currentTargetRecords.target -
            lastTargetRecords.achieve / currentTargetRecords.target) *
          100,
        remainDays: remainDays > 0 ? remainDays : 0,
      },
    },
    attendance,
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
