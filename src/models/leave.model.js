const sequelize = require('../database/mysql')
const { DataTypes } = require('sequelize')

const Leave = sequelize.define('leave', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.STRING,
  },
  duration: {
    type: DataTypes.INTEGER,
  },
})

module.exports = { Leave }
