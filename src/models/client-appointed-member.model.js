const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')
const { Client_Appointment } = require('./client-appointment.model')
const { Team } = require('./team.model')

const Client_Appointed_Member = sequelize.define(
  'client_appointed_member',
  {
    clientAppointmentId: {
      type: DataTypes.INTEGER,
      references: {
        model: Client_Appointment,
        key: 'id',
      },
    },
    teamId: {
      type: DataTypes.INTEGER,
      references: {
        model: Team,
        key: 'id',
      },
    },
  },
  { paranoid: true },
)

module.exports = { Client_Appointed_Member }
