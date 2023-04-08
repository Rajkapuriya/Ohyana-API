const { successResponse } = require('../utils/response.util')
const { Op, QueryTypes } = require('sequelize')
const sequelize = require('../database/mysql')
const { MESSAGE } = require('../constants/message.contant')
const {
  Product,
  Order_Item,
  Team,
  Points,
  Team_Point,
  Team_Expense,
} = require('../models')
const { YYYY_MM_DD } = require('../utils/moment.util')
const moment = require('moment')

exports.getProductReport = async (req, res) => {
  const { period, comparison } = req.query
  const { cities, productIds } = req.body
  let whereCondition, whereProductCondition

  if (period && period.includes('day')) {
    // day-7,day-30
    const days = parseInt(period.split('-')[1])
    whereCondition = {
      where: {
        createdAt: {
          [Op.gte]: YYYY_MM_DD(moment().subtract(days, 'days')),
        },
      },
    }
  } else if (period && period.includes('month')) {
    // month-sepetember
    const month = moment().month(period.split('-')[1]).format('M')
    whereCondition = {
      where: {
        createdAt: {
          [Op.and]: [
            sequelize.where(
              sequelize.fn('month', sequelize.col('order_items.createdAt')),
              month,
            ),
          ],
        },
      },
    }
  } else if (period && period.includes('year')) {
    // year-2023
    const year = period.split('-')[1]
    whereCondition = {
      where: {
        createdAt: {
          [Op.and]: [
            sequelize.where(
              sequelize.fn('year', sequelize.col('order_items.createdAt')),
              year,
            ),
          ],
        },
      },
    }
  }

  if (comparison && comparison == 'city') {
    whereCondition = {
      where: {
        ...whereCondition.where,
        // city: cities
      },
    }
  } else if (comparison && comparison == 'product') {
    whereProductCondition = {
      id: productIds,
    }
  }

  const products = await Product.findAll({
    where: whereProductCondition,
    include: {
      model: Order_Item,
      ...whereCondition,
    },
  })

  const finalProductReport = []
  products.forEach(product => {
    const orders = []
    product.order_items.forEach(orderItem => {
      const orderDate = YYYY_MM_DD(orderItem.createdAt)
      if (orders.find(item => item.date === orderDate)) {
        const dateIndex = orders.findIndex(item => item.date === orderDate)
        orders[dateIndex].quantity += orderItem.quantity
      } else {
        orders.push({
          id: orderItem.id,
          date: orderDate,
          quantity: orderItem.quantity,
        })
      }
    })
    const temp = {
      id: product.id,
      name: product.name,
      orders: orders,
    }
    finalProductReport.push(temp)
  })

  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY,
    finalProductReport,
  )
}

exports.getTeamReport = async (req, res) => {
  const { period, comparison, cities, roleId, teamIds } = req.query
  const whereCondition = {
    attributes: ['id', 'name'],
    where: { companyId: req.user.companyId },
  }
  const whereSubCondition = { where: {} }
  let teamPoints
  let teams
  const teamPointObject = []
  let expenseWhereCondition = ''
  const whereParam = comparison == 'expense' ? 'date' : 'createdAt'

  if (period && period.includes('days')) {
    // days-7,days-30
    const days = parseInt(period.split('-')[1])
    whereSubCondition.where = {
      [whereParam]: {
        [Op.gte]: moment().subtract(days, 'days').format('YYYY-MM-DD'),
      },
    }
    expenseWhereCondition += ` AND te.date >= ${moment()
      .subtract(days, 'days')
      .format('YYYY-MM-DD')} `
  } else if (period && period.includes('month')) {
    // month-sepetember
    const month = moment().month(period.split('-')[1]).format('M')
    whereSubCondition.where = {
      [Op.and]: [
        sequelize.where(
          sequelize.fn('month', sequelize.col(whereParam)),
          month,
        ),
      ],
    }
    expenseWhereCondition += ` AND MONTH(te.date) >= ${month} `
  } else if (period && period.includes('year')) {
    // year-2023
    const year = period.split('-')[1]
    whereSubCondition.where = {
      [Op.and]: [
        sequelize.where(sequelize.fn('year', sequelize.col(whereParam)), year),
      ],
    }
    expenseWhereCondition += ` AND YEAR(te.date) >= ${year} `
  }

  if (comparison && comparison == 'expense') {
    teams = await sequelize.query(
      `
      SELECT 
        t.id,
        t.name,
        te.approvalAmount
      FROM 
        teams as t
      LEFT JOIN
        team_expenses te
      ON
        t.id = te.teamId
      WHERE
        1=1
        ${expenseWhereCondition}  
    `,
      { type: QueryTypes.SELECT },
    )

    const allTeamMembers = await Team.findAll({
      attributes: ['id', 'name'],
      where: {
        id: {
          [Op.notIn]: teams.map(e => e.id),
        },
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

    whereCondition.include = {
      model: Team_Expense,
      where: whereSubCondition.where,
      required: false,
    }
  }

  if (roleId && roleId != 1) {
    whereCondition.where = {
      ...whereCondition.where,
      roleId: roleId,
    }
  }

  if (teamIds && teamIds.length > 0) {
    whereCondition.where = {
      ...whereCondition.where,
      id: teamIds,
    }
  }

  if (comparison == 'points') {
    teams = await Team.findAll(whereCondition)
    teamPoints = await Team_Point.findAll({
      where: {
        teamId: teams.map(e => e.id),
        ...whereSubCondition.where,
      },
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
