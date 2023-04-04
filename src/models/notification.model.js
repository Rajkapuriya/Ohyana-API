const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Notification = sequelize.define('notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  heading: {
    type: DataTypes.STRING(25),
    allowNull: false,
    required: true,
  },
  attechment: {
    type: DataTypes.STRING(80),
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
    required: true,
  },
  type: {
    type: DataTypes.STRING(20),
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
    type: DataTypes.STRING(15),
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
