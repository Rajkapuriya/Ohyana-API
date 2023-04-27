const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')
const { Team } = require('./team.model')

const Team_Location_History = sequelize.define(
  'team_location_history',
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
      type: DataTypes.DATE,
    },
    latitude: {
      type: DataTypes.STRING(25),
    },
    longitude: {
      type: DataTypes.STRING(25),
    },
  },
  { paranoid: true },
)

module.exports = { Team_Location_History }
