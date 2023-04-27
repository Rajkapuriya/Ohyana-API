const { DataTypes } = require('sequelize')
const Sequelize = require('sequelize')
const sequelize = require('../database/mysql')
const { Team } = require('./team.model')

const Attendance = sequelize.define(
  'attendance',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    teamId: {
      type: DataTypes.INTEGER,
      references: {
        model: Team,
        key: 'id',
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      defaultValue: Sequelize.NOW,
      allowNull: false,
    },
    checkIn: {
      type: DataTypes.TIME,
    },
    checkOut: {
      type: DataTypes.TIME,
    },
    breakIn: {
      type: DataTypes.TIME,
    },
    breakOut: {
      type: DataTypes.TIME,
    },
    totalHours: {
      type: DataTypes.BIGINT,
    },
    attendanceType: {
      type: DataTypes.STRING(5),
      validate: {
        isIn: [['P', 'A', 'L', 'LT']],
      },
    },
  },
  { paranoid: true },
)

module.exports = { Attendance }
