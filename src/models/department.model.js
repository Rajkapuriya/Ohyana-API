const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Department = sequelize.define('department', {
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
})

module.exports = { Department }
