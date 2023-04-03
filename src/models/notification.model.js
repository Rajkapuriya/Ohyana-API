const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Notification = sequelize.define('notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  heading: {
    type: DataTypes.STRING,
    allowNull: false,
    required: true,
  },
  attechment: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
    required: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    required: true,
    validate: {
      isIn: [['NOTICE', 'ACHIEVEMENT', 'INFORMATION']],
    },
  },
  roleId: {
    type: DataTypes.INTEGER,
  },
  departmentId: {
    type: DataTypes.INTEGER,
  },
  senderType: {
    type: DataTypes.STRING,
    allowNull: false,
    required: true,
    validate: {
      isIn: [['SYSTEM', 'INDIVIDUAL']],
    },
  },
  button: {
    type: DataTypes.JSON,
  },
})

module.exports = { Notification }
