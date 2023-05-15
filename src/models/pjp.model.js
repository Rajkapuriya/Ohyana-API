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
      type: DataTypes.STRING(35),
    },
    business: {
      type: DataTypes.STRING(25),
    },
    contact_number: {
      type: DataTypes.STRING(15),
    },
    city: {
      type: DataTypes.STRING(20),
    },
    city_id: {
      type: DataTypes.INTEGER,
    },
    state: {
      type: DataTypes.STRING(20),
    },
    state_id: {
      type: DataTypes.INTEGER,
    },
    state_iso2: {
      type: DataTypes.STRING(5),
    },
    country_id: {
      type: DataTypes.INTEGER,
    },
    country_iso2: {
      type: DataTypes.STRING(5),
    },
    country: {
      type: DataTypes.STRING(20),
    },
    status: {
      type: DataTypes.STRING(15),
      comment: 'COMPLETED , TODAY , UPCOMING',
    },
    followUpType: {
      type: DataTypes.STRING(15),
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
  { paranoid: true },
)

module.exports = { Pjp }
