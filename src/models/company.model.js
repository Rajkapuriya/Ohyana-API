const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Company = sequelize.define(
  'company',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(35),
      allowNull: false,
      required: true,
    },
    email: {
      type: DataTypes.STRING(50),
    },
    city: {
      type: DataTypes.STRING(20),
    },
    state: {
      type: DataTypes.STRING(20),
    },
    businessType: {
      type: DataTypes.STRING(20),
    },
    logoUrl: {
      type: DataTypes.STRING(80),
    },
    GSTIN: {
      type: DataTypes.STRING(15),
    },
    crmKey: {
      type: DataTypes.STRING,
    },
  },
  { paranoid: true },
)

module.exports = { Company }
