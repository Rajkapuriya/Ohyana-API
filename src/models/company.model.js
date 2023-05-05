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
    city_id: {
      type: DataTypes.NUMBER,
    },
    state: {
      type: DataTypes.STRING(20),
    },
    state_id: {
      type: DataTypes.NUMBER,
    },
    state_iso2: {
      type: DataTypes.STRING(5),
    },
    country_id: {
      type: DataTypes.NUMBER,
    },
    country_iso2: {
      type: DataTypes.STRING(5),
    },
    country: {
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
