const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Role = sequelize.define('role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(20),
    allowNull: false,
    required: true,
  },
  description: {
    type: DataTypes.STRING,
  },
  clockIn: {
    type: DataTypes.TIME,
  },
  clockOut: {
    type: DataTypes.TIME,
  },
})

module.exports = { Role }
