const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Client_Appointment = sequelize.define('client_appointment', {
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
  description: {
    type: DataTypes.STRING,
    allowNull: false,
    required: true,
  },
  appointment_unit: {
    type: DataTypes.STRING(20),
  },
  isScheduled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  teamId: {
    type: DataTypes.INTEGER,
  },
  memberName: {
    type: DataTypes.STRING(35),
  },
  memberRole: {
    type: DataTypes.STRING(20),
  },
})

module.exports = { Client_Appointment }
