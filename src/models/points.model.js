const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Points = sequelize.define(
  'points',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(35),
    },
    points: {
      type: DataTypes.STRING(4),
      defaultValue: '0',
    },
  },
  { paranoid: true },
)

module.exports = { Points }
