const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Client_Reminder = sequelize.define('client_reminder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATEONLY,
  },
  time: {
    type: DataTypes.TIME,
  },
  isScheduled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
    required: true,
  },
})

module.exports = { Client_Reminder }
