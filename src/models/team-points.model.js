const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')
const { Points } = require('./points.model')
const { Team } = require('./team.model')

const Team_Point = sequelize.define(
  'team_point',
  {
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
    // pointId: {
    //     type: DataTypes.INTEGER,
    //     references: {
    //         model: Points,
    //         key: 'id'
    //     }
    // },
  },
  { paranoid: true },
)

module.exports = { Team_Point }
