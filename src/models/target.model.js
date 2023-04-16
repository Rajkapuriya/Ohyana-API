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
    defaultValue: 0,
  },
  achieve: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  state: {
    type: DataTypes.STRING(10),
    allowNull: false,
    required: true,
    comment: 'UPCOMING , CURRENT , PAST',
    validate: {
      isIn: [['UPCOMING', 'CURRENT', 'PAST']],
    },
  },
})

module.exports = { Target }
