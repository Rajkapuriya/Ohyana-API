const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')
const { Expense } = require('./expense.model')
const { Role } = require('./role.model')

const Role_Expense_Permissions = sequelize.define('role_expense_permissions', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  expenseId: {
    type: DataTypes.INTEGER,
    references: {
      model: Expense,
      key: 'id',
    },
  },
  roleId: {
    type: DataTypes.INTEGER,
    references: {
      model: Role,
      key: 'id',
    },
  },
  amount: {
    type: DataTypes.INTEGER,
  },
  status: {
    type: DataTypes.STRING(10),
    comment: 'active,inactive',
  },
})

module.exports = { Role_Expense_Permissions }
