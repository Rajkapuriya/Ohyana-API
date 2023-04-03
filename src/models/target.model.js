const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Target = sequelize.define('target', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  startDate: {
    type: DataTypes.DATEONLY,
  },
  endDate: {
    type: DataTypes.DATEONLY,
  },
  period: {
    type: DataTypes.INTEGER,
  },
  type: {
    type: DataTypes.INTEGER,
    comment: '0=generate lead,1=take order',
  },
  target: {
    type: DataTypes.INTEGER,
  },
  achieve: {
    type: DataTypes.INTEGER,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false,
    required: true,
    validate: {
      isIn: [['UPCOMING', 'CURRENT', 'PAST']],
    },
  },
})

module.exports = { Target }
