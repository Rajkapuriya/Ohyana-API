const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Expense = sequelize.define(
  'expense',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(25),
      allowNull: false,
      required: true,
    },
    description: {
      type: DataTypes.STRING,
    },
  },
  { paranoid: true },
)

module.exports = { Expense }
