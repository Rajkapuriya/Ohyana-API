const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Expense = sequelize.define('expense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    required: true,
  },
  description: {
    type: DataTypes.STRING,
  },
})

module.exports = { Expense }
