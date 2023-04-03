const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Country = sequelize.define('country', {
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
  iso: {
    type: DataTypes.STRING,
  },
  nicename: {
    type: DataTypes.STRING,
  },
  iso3: {
    type: DataTypes.STRING,
  },
  numcode: {
    type: DataTypes.INTEGER,
  },
  phonecode: {
    type: DataTypes.INTEGER,
  },
})

module.exports = { Country }
