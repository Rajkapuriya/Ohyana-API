const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Country = sequelize.define(
  'country',
  {
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
    iso: {
      type: DataTypes.STRING(5),
    },
    nicename: {
      type: DataTypes.STRING(15),
    },
    iso3: {
      type: DataTypes.STRING(5),
    },
    numcode: {
      type: DataTypes.INTEGER,
    },
    phonecode: {
      type: DataTypes.INTEGER,
    },
  },
  { paranoid: true },
)

module.exports = { Country }
