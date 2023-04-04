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

  const [
    currentMonthInquiry,
    lastMonthInquiry,
    currentMonthOrders,
    lastMonthOrders,
    teams,
    crtMonthPoints,
    lastMonthPoints,
  ] = await Promise.all([
    Client.findAll({
      where: getWhereConditionPerMonth(req.user, currentMonth, 'arrivalDate'),
    }),
    Client.findAll({
      where: getWhereConditionPerMonth(req.user, lastMonth, 'arrivalDate'),
    }),
    Order.findAndCountAll({
      where: {
        ...getWhereConditionPerMonth(req.user, currentMonth, 'date'),
        paymentStatus: 'CONFIRMED',
      },
      limit: 10,
      order: [['id', 'DESC']],
    }),
    Order.count({
      where: {
        ...getWhereConditionPerMonth(req.user, lastMonth, 'date'),
        paymentStatus: 'CONFIRMED',
      },
    }),
    Team.findAll({
      attributes: ['id', 'points', 'location'],
      where: {
        companyId: req.user.companyId,
        roleId: {
          [Op.ne]: 1,
        },
      },
      limit: 10,
      include: [
        { model: Role, attributes: ['name'] },
        {
          model: Attendance,
          required: false,
          attributes: ['attendanceType'],
          where: { date: moment() },
        },
      ],
    }),
    Team_Point.findAll({
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
    }),
    Team_Point.findAll({
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
    }),
  ])

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

  lstTeamMemeberPoint.forEach(e => {
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
      location: e.location,
      role: e.role.name,
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
  response = {
    data: {
      inquiry: {
        total,
        crtMonIndiaMart,
        crtMonWeb,
        crtMonOther,
        lstMonIndiaMart,
        lstMonWeb,
        lstMonOther,
        percentageIndiaMart:
          (crtMonIndiaMart / 100 - lstMonIndiaMart / 100) * 100,
        percentageOther: (crtMonOther / 100 - lstMonOther / 100) * 100,
      },
      sales: {
        crtIrrelevant,
        crtLead,
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
  return successResponse(res, MESSAGE.RECORD_FOUND_SUCCESSFULLY, response)
}

exports.getSalesTeamInquiryAnalytics = async (req, res) => {
  let responseData = {}
  const currentMonth = moment().format('MM')
  const lastMonth = moment().subtract(1, 'months').format('MM')

  const [
    currentMonthInquiry,
    lastMonthInquiry,
    teams,
    targets,
    attendance,
    teamPoints,
    tasks,
  ] = await Promise.all([
    Client.findAll({
      where: getWhereConditionPerMonth(req.user, currentMonth, 'arrivalDate'),
    }),
    Client.findAll({
      where: getWhereConditionPerMonth(req.user, lastMonth, 'arrivalDate'),
    }),
    Team.findAll({
      attributes: ['id', 'points', 'location'],
      where: {
        id: req.user.id,
      },
      limit: 10,
      include: [
        { model: Role, attributes: ['name'] },
        // { model : Attendance ,attributes: ['attendanceType'], where : {date : moment()}}
      ],
    }),
    Target.findAll({
      where: {
        teamId: 2,
        type: 'Generate Lead',
      },
      order: [['endDate', 'DESC']],
      limit: 2,
    }),
    Attendance.findOne({
      attributes: { exclude: ['teamId', 'id'] },
      where: {
        date: moment(),
        teamId: req.user.id,
      },
    }),
    Team_Point.findAll({
      attributes: ['id', 'createdAt'],
      where: { teamId: req.user.id },
      include: [{ model: Points, attributes: ['name', 'points'] }],
      order: [['id', 'DESC']],
      limit: 4,
    }),
    Task.findOne({
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
    }),
  ])

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
    performance: {
      total,
      targets: {
        target: currentTargetRecords.target,
        achieved: currentTargetRecords.achieve,
        precentageAchieved:
          (currentTargetRecords.achieve / currentTargetRecords.target -
            lastTargetRecords.achieve / currentTargetRecords.target) *
          100,
        remainDays,
      },
    },
    attendance,
    teams,
    teamPoints,
    tasks,
  }

  return successResponse(res, MESSAGE.RECORD_FOUND_SUCCESSFULLY, responseData)
}

function getWhereConditionPerMonth(user, month, dateColumn) {
  return {
    companyId: user.companyId,
    [Op.and]: [
      sequelize.where(sequelize.fn('month', sequelize.col(dateColumn)), month),
    ],
  }
}
