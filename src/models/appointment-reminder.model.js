const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Appointment_Reminder = sequelize.define(
  'appointment_reminder',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    heading: {
      type: DataTypes.STRING(35),
      allowNull: false,
      required: true,
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
    isScheduled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    type: {
      type: DataTypes.STRING(18),
      allowNull: false,
      required: true,
      validate: {
        isIn: [['APPOINTMENT', 'REMINDER']],
      },
    },
  },
  { paranoid: true },
)

module.exports = { Appointment_Reminder }
