const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Department = sequelize.define('department', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    required: true,
  },
})

module.exports = { Department }
