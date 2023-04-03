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
      type: DataTypes.STRING,
    },
    points: {
      type: DataTypes.STRING,
      defaultValue: '0',
    },
  },
  { timestamps: false },
)

module.exports = { Points }
