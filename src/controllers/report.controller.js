const {
  successResponse,
  forbiddenRequestError,
} = require('../utils/response.util')
const { Op, QueryTypes } = require('sequelize')
const sequelize = require('../database/mysql')
const { MESSAGE } = require('../constants')
const {
  Product,
  Order_Item,
  Team,
  Points,
  Team_Point,
  Team_Expense,
  Role,
} = require('../models')
const { YYYY_MM_DD, DD_MMM_YYYY } = require('../utils/moment.util')
const moment = require('moment')
const {
  getDateRageArray,
  getMonthDateRageArray,
  getYearDateRageArray,
  getCustomDateRangeArray,
} = require('../utils/common.util')

exports.getProductReport = async (req, res) => {
  const { cities, productIds, period, dateFrom, dateTo } = req.body

  const { filterCondition, dateRange } = generateProductReportFilterCondition(
    period,
    dateFrom,
    dateTo,
  )

  if (productIds && productIds.length) {
    filterCondition.productId = productIds
  }

  const orders = await Order_Item.findAll({
    where: { ...filterCondition },
  })

  const dateWiseProductOrderObject = getProductReportDataAndDateWiseOrderObject(
    orders,
    period,
  )

  const products = await Product.findAll({
    attributes: ['id', 'name'],
    where: { id: [...new Set(orders.map(o => o.productId))] },
  })

  const productReportData = getFinalProductReportObject(
    dateRange,
    dateWiseProductOrderObject,
    products,
  )

  const finalResponse = {
    label: products.map(data => {
      return { id: data.id, name: data.name }
    }),
    data: productReportData,
  }

  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY,
    finalResponse,
  )
}

exports.getProductReportByCity = async (req, res) => {
  const { cities, productId, period, dateFrom, dateTo } = req.body

  const { filterCondition, dateRange } = generateProductReportFilterCondition(
    period,
    dateFrom,
    dateTo,
  )

  if (productId) {
    filterCondition.productId = productId
  }

  const orders = await Order_Item.findAll({
    where: { ...filterCondition },
  })

  const dateWiseProductOrderObject = getProductReportDataAndDateWiseOrderObject(
    orders,
    period,
  )

  const products = await Product.findAll({
    attributes: ['id', 'name'],
    where: { id: [...new Set(orders.map(o => o.productId))] },
  })

  const productReportData = getFinalProductReportObject(
    dateRange,
    dateWiseProductOrderObject,
    products,
  )

  const finalResponse = {
    label: products.map(data => {
      return { id: data.id, name: data.name }
    }),
    data: productReportData,
  }

  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY,
    finalResponse,
  )
}

exports.getTeamReport = async (req, res) => {
  const { period, comparison, cities, roleId, teamIds, dateFrom, dateTo } =
    req.body
  const filterSubCondition = {}
  const filterCondition = {}
  let teamPoints
  let teams = []
  const teamPointObject = []
  let expenseWhereCondition = ''
  const whereParam = comparison == 'expense' ? 'date' : 'createdAt'

  if (period && period.includes('days')) {
    // days-7,days-30
    const days = parseInt(period.split('-')[1])
    filterSubCondition[whereParam] = {
      [Op.gte]: moment().subtract(days, 'days').format('YYYY-MM-DD'),
    }

    expenseWhereCondition += ` AND te.date >= ${moment()
      .subtract(days, 'days')
      .format('YYYY-MM-DD')} `
  } else if (period && period.includes('month')) {
    // month-sepetember
    const month = moment().month(period.split('-')[1]).format('M')
    filterSubCondition[Op.and] = [
      sequelize.where(
        sequelize.fn('month', sequelize.col(`team_point.${whereParam}`)),
        month,
      ),
    ]
    expenseWhereCondition += ` AND MONTH(te.date) >= ${month} `
  } else if (period && period.includes('year')) {
    // year-2023
    const year = period.split('-')[1]
    filterSubCondition[Op.and] = [
      sequelize.where(
        sequelize.fn('year', sequelize.col(`team_point.${whereParam}`)),
        year,
      ),
    ]
    expenseWhereCondition += ` AND YEAR(te.date) >= ${year} `
  } else if (period === 'custom') {
    filterSubCondition[whereParam] = {
      [Op.between]: [YYYY_MM_DD(dateFrom), YYYY_MM_DD(dateTo)],
    }
    expenseWhereCondition += ` AND DATE(te.date) BETWEEN ${dateFrom} AND ${dateTo} `
  }

  if (comparison && comparison == 'expense') {
    teams = await sequelize.query(
      `
      SELECT 
        t.id,
        t.name,
        te.approvalAmount,
        r.id as roleId,
        r.parentId 
      FROM 
        teams as t
      LEFT JOIN
        team_expenses te
      ON
        t.id = te.teamId
      LEFT JOIN
        roles as r
      ON
        r.id = t.roleId
      WHERE
        1=1
        ${expenseWhereCondition}  
    `,
      { type: QueryTypes.SELECT },
    )

    teams = teams.filter(e => e.parentId != null)
    const allTeamMembers = await Team.findAll({
      attributes: ['id', 'name'],
      where: {
        id: {
          [Op.notIn]: teams.map(e => e.id),
        },
      },
      include: {
        attributes: ['id'],
        model: Role,
        where: { parentId: { [Op.ne]: null } },
      },
    })
    allTeamMembers.forEach(e => {
      const index = teams.findIndex(el => el.id == e.id)
      if (index < 0) {
        teams.push({
          id: e.id,
          name: e.name,
          approvalAmount: 0,
        })
      }
    })

    // whereCondition.include = {
    //   model: Team_Expense,
    //   where: whereSubCondition.where,
    //   required: false,
    // }
  }

  if (roleId) {
    const getRoleDetail = await Role.findOne({
      attributes: ['id', 'parentId'],
      where: { id: roleId },
    })

    if (!getRoleDetail.parentId) return forbiddenRequestError(res)

    filterCondition.roleId = roleId
  }

  if (teamIds && teamIds.length > 0) {
    filterCondition.id = teamIds
  }

  if (comparison == 'points') {
    teams = await Team.findAll({
      attributes: ['id', 'name'],
      where: { companyId: req.user.companyId, ...filterCondition },
      include: {
        model: Role,
        attributes: ['id'],
        where: { parentId: { [Op.ne]: null } },
      },
    })
    teamPoints = await Team_Point.findAll({
      where: { teamId: teams.map(e => e.id), ...filterSubCondition },
      include: [{ model: Points, attributes: ['id', 'points'] }],
    })
    teamPoints.forEach(e => {
      if (teamPointObject.find(ele => ele.teamId == e.teamId)) {
        const index = teamPointObject.findIndex(ele => ele.teamId == e.teamId)
        teamPointObject[index].points.push(e.point.points)
      } else {
        teamPointObject.push({
          teamId: e.teamId,
          points: [e.point.points],
        })
      }
    })
  }

  const finalTeamReport = []
  teams.forEach(data => {
    if (comparison === 'expense') {
      // let totalAmount = 0
      // data.team_expenses.forEach(expense => {
      //   if (expense.status === 'APPROVED') {
      //     totalAmount += expense.amount
      //   }
      // })
      const index = finalTeamReport.findIndex(e => e.id === data.id)
      if (index > -1) {
        finalTeamReport[index].amount += data.approvalAmount
      } else {
        finalTeamReport.push({
          id: data.id,
          name: data.name,
          amount: data.approvalAmount || 0,
        })
      }
    } else {
      const teamObject = teamPointObject.find(e => e.teamId == data.id)
      let pointCount = 0
      if (teamObject) {
        teamObject.points.forEach(ele => {
          pointCount += parseInt(ele)
        })
      }
      finalTeamReport.push({
        id: data.id,
        name: data.name,
        points: pointCount,
      })
    }
  })

  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY,
    finalTeamReport,
  )
}

function getDateWiseProductArray(dateWiseArray, products) {
  const dateWiseProductArray = []
  products.forEach(product => {
    const productObject = dateWiseArray.find(e => e.productId == product.id)
    if (productObject) {
      dateWiseProductArray.push(productObject)
    } else {
      dateWiseProductArray.push({
        productId: product.id,
        quantity: 0,
      })
    }
  })
  return dateWiseProductArray
}

function generateProductReportFilterCondition(period, dateFrom, dateTo) {
  const filterCondition = {}
  let dateRange = []
  if (period && period.includes('day')) {
    // day-7,day-30
    const days = parseInt(period.split('-')[1])
    const date = moment().subtract(days, 'days')
    filterCondition.createdAt = {
      [Op.gte]: YYYY_MM_DD(date),
    }
    dateRange = getDateRageArray(days, date)
  } else if (period && period.includes('month')) {
    // month-sepetember
    const month = moment().month(period.split('-')[1]).format('M')
    filterCondition.createdAt = {
      [Op.and]: [
        sequelize.where(
          sequelize.fn('month', sequelize.col('createdAt')),
          month,
        ),
      ],
    }
    dateRange = getMonthDateRageArray(month)
  } else if (period && period.includes('year')) {
    // year-2023
    const year = period.split('-')[1]
    filterCondition.createdAt = {
      [Op.and]: [
        sequelize.where(sequelize.fn('year', sequelize.col('createdAt')), year),
      ],
    }
    dateRange = getYearDateRageArray(year)
  } else if (period === 'custom') {
    filterCondition.createdAt = {
      [Op.between]: [YYYY_MM_DD(dateFrom), YYYY_MM_DD(dateTo)],
    }
    dateRange = getCustomDateRangeArray(moment(dateFrom), moment(dateTo))
  }

  return {
    filterCondition,
    dateRange,
  }
}

function getProductReportDataAndDateWiseOrderObject(orders, period) {
  const dateWiseProductOrderObject = {}
  orders.forEach(orderItem => {
    const orderDate =
      period && period.includes('year')
        ? moment(orderItem.createdAt).format('MMM-YYYY')
        : YYYY_MM_DD(orderItem.createdAt)

    if (dateWiseProductOrderObject[orderDate]) {
      dateWiseProductOrderObject[orderDate].push({
        productId: orderItem.productId,
        quantity: orderItem.quantity,
      })
    } else {
      dateWiseProductOrderObject[orderDate] = [
        {
          productId: orderItem.productId,
          quantity: orderItem.quantity,
        },
      ]
    }
  })

  Object.keys(dateWiseProductOrderObject).forEach(date => {
    const productOrderArray = []
    dateWiseProductOrderObject[date].forEach(order => {
      const orderIndex = productOrderArray.findIndex(
        e => e.productId === order.productId,
      )
      if (orderIndex > -1) {
        productOrderArray[orderIndex].quantity += order.quantity
      } else {
        productOrderArray.push({
          productId: order.productId,
          quantity: order.quantity,
        })
      }
    })

    dateWiseProductOrderObject[date] = productOrderArray
  })

  return dateWiseProductOrderObject
}

function getFinalProductReportObject(
  dateRange,
  dateWiseProductOrderObject,
  products,
) {
  const productReportData = {}
  dateRange.forEach(date => {
    if (dateWiseProductOrderObject[date]) {
      productReportData[date] = getDateWiseProductArray(
        dateWiseProductOrderObject[date],
        products,
      )
    } else {
      productReportData[date] = products.map(data => {
        return { productId: data.id, quantity: 0 }
      })
    }
  })

  return productReportData
}
