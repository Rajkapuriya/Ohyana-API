const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')
const { Expense } = require('./expense.model')
const { Team } = require('./team.model')

const Team_Expense = sequelize.define(
  'team_expense',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: DataTypes.DATEONLY,
    },
    amount: {
      type: DataTypes.INTEGER,
    },
    approvalAmount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    payment_status: {
      type: DataTypes.STRING(10),
      comment: 'PENDING , DONE',
      validate: {
        isIn: [['PENDING', 'DONE']],
      },
    },
    status: {
      type: DataTypes.STRING(15),
      comment: 'REJECTED, APPROVED, PENDING',
      validate: {
        isIn: [['REJECTED', 'APPROVED', 'PENDING']],
      },
    },
    aprroval_description: {
      type: DataTypes.STRING,
    },
    expense_description: {
      type: DataTypes.STRING,
    },
    aprrovalBy: {
      type: DataTypes.STRING(35),
    },
    file: {
      type: DataTypes.STRING(80),
    },
    teamId: {
      type: DataTypes.INTEGER,
      references: {
        model: Team,
        key: 'id',
      },
    },
    expenseId: {
      type: DataTypes.INTEGER,
      references: {
        model: Expense,
        key: 'id',
      },
    },
  },
  { paranoid: true },
)

Team_Expense.updateExpense = async function (body, id) {
  await this.update(body, { where: { id } })
  return this.findByPk(id)
}

module.exports = { Team_Expense }
