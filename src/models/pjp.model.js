const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Pjp = sequelize.define(
  'pjp',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: DataTypes.DATEONLY,
    },
    location: {
      type: DataTypes.GEOMETRY('POINT'),
    },
    name: {
      type: DataTypes.STRING,
    },
    business: {
      type: DataTypes.STRING,
    },
    contact_number: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
    },
    followUpType: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
    },
    finish_description: {
      type: DataTypes.STRING,
    },
    is_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { timestamps: false },
)

module.exports = { Pjp }
