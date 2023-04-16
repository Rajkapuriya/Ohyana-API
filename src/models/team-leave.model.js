const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')
const { Team } = require('./team.model')
const { Leave } = require('./leave.model')

const Team_Leave = sequelize.define('team_leave', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  teamId: {
    type: DataTypes.INTEGER,
    // references: {
    //     model: Team,
    //     key: 'id'
    // }
  },
  leaveId: {
    type: DataTypes.INTEGER,
    references: {
      model: Leave,
      key: 'id',
    },
  },
  date: {
    type: DataTypes.DATEONLY,
  },
  takenDays: {
    type: DataTypes.INTEGER,
  },
  remainDays: {
    type: DataTypes.INTEGER,
  },
  status: {
    type: DataTypes.STRING(15),
    comment: 'REJECTED , APPROVED , PENDING',
    validate: {
      isIn: [['REJECTED', 'APPROVED', 'PENDING']],
    },
  },
})

module.exports = { Team_Leave }
