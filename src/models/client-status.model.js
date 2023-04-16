const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Client_Status = sequelize.define('client_status', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATEONLY,
  },
  time: {
    type: DataTypes.TIME,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
    required: true,
  },
  followUpType: {
    type: DataTypes.STRING(15),
    comment: 'FIELD , CALL , WHATSAPP , EMAIL , OHTER',
  },
  audioUrl: {
    type: DataTypes.STRING(80),
  },
})

module.exports = { Client_Status }
