const Joi = require('joi')
const sequelize = require('../database/mysql')
const { DataTypes } = require('sequelize')

const Holiday = sequelize.define('holiday', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATEONLY,
  },
  duration: {
    type: DataTypes.INTEGER,
  },
  occasion: {
    type: DataTypes.STRING,
  },
  type: {
    type: DataTypes.STRING,
    validate: {
      isIn: [['REGULAR', 'OCCASIONAL']],
    },
  },
})

module.exports = { Holiday }
