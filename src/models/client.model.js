const { DataTypes } = require('sequelize')
const sequelize = require('../database/mysql')

const Client = sequelize.define(
  'client',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(50),
    },
    name: {
      type: DataTypes.STRING(50),
    },
    arrivalDate: {
      type: DataTypes.DATEONLY,
    },
    arrivalTime: {
      type: DataTypes.TIME,
    },
    business: {
      type: DataTypes.STRING(100),
    },
    contact_number: {
      type: DataTypes.STRING(15),
    },
    imageUrl: {
      type: DataTypes.STRING(80),
    },
    address: {
      type: DataTypes.STRING,
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
    reference: {
      type: DataTypes.STRING(15),
      comment: 'DIGITAL , OFFICE , OTHER , PROSPECTIVE',
      validate: {
        isIn: [['DIGITAL', 'OFFICE', 'OTHER', 'PROSPECTIVE']],
      },
    },
    reference_name: {
      type: DataTypes.STRING(15),
    },
    stage: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment:
        '0=intiate,1=no response,2=irrelevant,3=inter-mediate,4=confirm,5=closed',
    },
    indiaMartProductName: {
      type: DataTypes.STRING,
    },
    indiaMartMessage: {
      type: DataTypes.STRING,
    },
    timer_status: {
      type: DataTypes.BOOLEAN,
    },
    min_invesment_amount: {
      type: DataTypes.INTEGER,
    },
    max_invesment_amount: {
      type: DataTypes.INTEGER,
    },
  },
  { paranoid: true },
)

module.exports = { Client }
