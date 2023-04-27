const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')
const { Client } = require('./client.model')
const { Team } = require('./team.model')

const Client_Stage_History = sequelize.define(
  'client_stage_history',
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
    clientId: {
      type: DataTypes.INTEGER,
      references: {
        model: Client,
        key: 'id',
      },
    },
    stage: {
      type: DataTypes.INTEGER,
      comment:
        '0=intiate,1=negative,2=no response,3=irrelevant,4=inter-mediate,5=confirm',
    },
  },
  { paranoid: true },
)

module.exports = { Client_Stage_History }
