const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Company = sequelize.define('company', {
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
  email: {
    type: DataTypes.STRING,
  },
  city: {
    type: DataTypes.STRING,
  },
  state: {
    type: DataTypes.STRING,
  },
  businessType: {
    type: DataTypes.STRING,
  },
  logoUrl: {
    type: DataTypes.STRING,
  },
  GSTIN: {
    type: DataTypes.STRING,
  },
  crmKey: {
    type: DataTypes.STRING,
  },
})

module.exports = { Company }
