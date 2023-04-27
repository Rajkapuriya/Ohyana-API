const Joi = require('joi')
const sequelize = require('../database/mysql')
const { DataTypes } = require('sequelize')

const Holiday = sequelize.define(
  'holiday',
  {
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
      type: DataTypes.STRING(25),
    },
    type: {
      type: DataTypes.STRING(15),
      validate: {
        isIn: [['REGULAR', 'OCCASIONAL']],
      },
    },
  },
  { paranoid: true },
)

module.exports = { Holiday }
